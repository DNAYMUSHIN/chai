// Maks was here

const db = require('../db');
const reportHelpers = require('./utils')
const bcrypt = require('bcryptjs');
const {ProductType} = require('../constants')
const {time, error} = require('console');
const {ADDRGETNETWORKPARAMS} = require('dns');

class adminController {
    /*
    Управление товарами
        o Добавление
        o Редактирование
        o Удаление
    – Управление заказами
        o Изменение статусов
        o Создание заказов
            § Создание заказа через платформу
            § Создание заказа через сканирование штрих-кода. Для отладки
            сканирования можно использовать простую операцию (CTRL + V) на сайте
    – Генерация отчетов по продажам и состоянию товарных запасов (отчет может быть
    приведен в следующем формате):
        o Отчет за день (выручка и тд)
        o Отчет за неделю o Отчет за период
        o Выгрузить отчет в CSV (выбирается период)
        o Выгрузить товары в CSV
            § Все товары (имеющиеся, законченные, отключенные и тд)
            § Необходимый товар к следующей покупке (у каждого товара должна быть дельта и при достижении этой дельты он попадает в этой списке.
                Например, кофе «Арабская ночь», дельта: 150 грамм. Сейчас кофе 250 грамм, как только цифра отпускается до 150 включительно, она
                попадает в эту категорию. К этой категории относится также товар, который закончился)
        § Имеющиеся товар
    – Доступа к CRM-платформе: есть
    */

async createAdmin(req, res) {
    try {
        const {admin_email, password} = req.body;

        const admin_password = await bcrypt.hash(password, 10)

        const newAdmin = await db.query(
            `INSERT INTO admin (admin_email, admin_password)
        VALUES ($1, $2)
        RETURNING *`,
            [admin_email, admin_password]
        );

        res.status(201).json(newAdmin.rows[0])
    } catch (e) {
        res.status(401).send("Ошибка добавления пользователя")
    }
}

async enterAdmin(req, res) {
    const {admin_email, password} = req.body;
    console.log(admin_email, password)
    try {
        const tmp_admin = await db.query(`select * from admin where admin_email = $1`, [admin_email]);

        if (!tmp_admin.rows[0]) {
            return res.status(400).json({message: "Администратор с такой почтой отсутствует"});
        }

        const password_with_table = tmp_admin.rows[0].admin_password;
        const check = await bcrypt.compare(password, password_with_table);

        if (check) {
            return res.status(200).json({
                success: true,
                admin_id: tmp_admin.rows[0].admin_id, // Оставляем в корне
                message: "Авторизация успешна" // Добавляем для фронта
            });
        } else {
            return res.status(401).json({message: "Неправильный пароль"});
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        return res.status(500).json({message: "Внутренняя ошибка сервера"});
    }
}

/*------------------КАТЕГОРИИ--------------------*/
async createCategory(req, res) {
    try {
        const {category_name} = req.body;

        // Проверяем, что название категории передано
        if (!category_name) {
            return res.status(400).json({message: "Название категории обязательно"});
        }

        // Вставляем новую категорию в БД
        const newCategory = await db.query(
            `INSERT INTO category (category_name)
        VALUES ($1)
        RETURNING *`,
            [category_name]
        );

        // Возвращаем созданную категорию
        res.status(201).json(newCategory.rows[0]);
    } catch (e) {
        console.error("Ошибка при создании категории:", e);
        res.status(500).json({message: "Ошибка при создании категории"});
    }
}

async getAllCategories(req, res) {
    try {
        // Получаем все категории из БД
        const categories = await db.query(
            `SELECT * FROM category ORDER BY category_name ASC`
        );

        // Возвращаем список категорий
        res.status(200).json(categories.rows);
    } catch (e) {
        console.error("Ошибка при получении категорий:", e);
        res.status(500).json({message: "Ошибка при получении списка категорий"});
    }
}

async deleteCategory(req, res) {
    try {
        const {id} = req.params; // Получаем ID категории из URL

        // Проверяем существование категории
        const categoryExists = await db.query(
            `SELECT * FROM category WHERE category_id = $1`,
            [id]
        );

        if (categoryExists.rows.length === 0) {
            return res.status(404).json({message: "Категория не найдена"});
        }

        // Удаляем категорию
        await db.query(
            `DELETE FROM category WHERE category_id = $1`,
            [id]
        );

        res.status(200).json({success: true, message: "Категория успешно удалена"});
    } catch (e) {
        console.error("Ошибка при удалении категории:", e);
        res.status(500).json({message: "Ошибка при удалении категории"});
    }
}
/*------------------КАТЕГОРИИ (КОНЕЦ)--------------------*/

// Все товары
async getAllProduct(req, res) {
    try {
        const products = await db.query(`SELECT * FROM Product`)
        res.status(200).json(products.rows)
    } catch (err) {
        console.log("Ошибка при выводе товаров:", err)
        res.status(500).json({message: "Ошибка на сервере при выводе товаров"})
    }
}

async getProductsByStatus(req, res) {
    const {status} = req.body
    try {
        const products = await db.query(`SELECT * FROM Product WHERE product_status = $1`, [status])
        res.status(200).json(products.rows)
    } catch (err) {
        console.log("Ошибка при выводе товаров:", err)
        res.status(500).json({message: "Ошибка на сервере при выводе товаров"})
    }
}

async addProduct(req, res) {
    const {
        product_category,
        product_name,
        product_type,
        product_price_unit,
        quantity,
        price_for_grams,
        product_count_min,
        product_price_min,
        product_code
    } = req.body;
    let type = product_type === ProductType.PIECE ? 1 : 2

    if (!product_name || !product_category || product_price_unit == undefined || quantity == undefined) {
        return res.status(400).json({error: 'Некорректные данные'});
    }

    try {
        // Проверяем наличие товара в  категории
        let category_from_DB = await db.query(`SELECT * from category where category_name = $1`, [product_category])
        if (!category_from_DB.rows[0]) {
            category_from_DB = await db.query(`INSERT INTO category (category_name) VALUES ($1) RETURNING *`, [product_category])
        }
        const category_id = category_from_DB.rows[0].category_id

        // Добавления товара в определенную категорию
        const productFromCategory = await db.query(`SELECT * from categoryitems where item_category_id = $1 and item_name = $2`, [category_id, product_name])
        // Если нет товара в категории
        if (!productFromCategory.rows[0]) {
            await db.query(`INSERT INTO categoryitems (item_category_id, item_name) VALUES ($1, $2)`, [category_id, product_name])
        }

        const checkproduct = await db.query(`SELECT * from product where product_name = $1 and product_category_id = $2`, [product_name, category_id])

        // Если нет товара в БД
        if (!checkproduct.rows[0]) {
            let product_status = 1;
            if (product_count_min > quantity) {
                product_status = 0
            }
            // Запрос для добавление товара в БД product
            const newProduct = await db.query(
                `INSERT INTO Product (product_category_id, product_name, product_type, price_unit, quantity, product_count_min, product_price_min, product_code, product_status, price_for_grams)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [category_id, product_name, type, product_price_unit, quantity, product_count_min, product_price_min, product_code, product_status, price_for_grams]);
            res.status(201).json({message: 'Товар добавлен', product: newProduct.rows[0]});
        } else {
            await db.query(`UPDATE product set quantity = $1 where product_id = $2`, [quantity + checkproduct.rows[0].quantity, checkproduct.rows[0].product_id])
            res.status(200).json({message: "Количество товара было изменено"})
        }

    } catch (err) {

        res.status(500).json({error: 'Ошибка сервера'});
    }
}

async updateProduct(req, res) {
    const {product_id, field, value} = req.body;

    try {
        // Если обновляется категория - сначала находим её ID
        if (field === 'product_category') {
            const categoryQuery = 'SELECT category_id FROM category WHERE category_name = $1';
            const categoryResult = await db.query(categoryQuery, [value]);

            if (categoryResult.rows.length === 0) {
                return res.status(400).json({error: 'Категория не найдена'});
            }

            const updateQuery = `UPDATE Product SET product_category_id = $1 WHERE product_id = $2 RETURNING *`;
            const updatedProduct = await db.query(updateQuery, [categoryResult.rows[0].category_id, product_id]);
            return res.status(200).json({message: 'Товар обновлен', product: updatedProduct.rows[0]});
        }
        if (field == 'quantity'){
            const productResult = await db.query(`SELECT quantity, product_count_min, status FROM Product WHERE product_id = $1`, [product_id]);


            if (productResult.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            const currentProduct = productResult.rows[0];
            const newQuantity = value;

            // Обновляем количество
            const updatedProduct = await db.query(`UPDATE Product SET quantity = $1 WHERE product_id = $2 RETURNING *`, [newQuantity, product_id]);

            // Проверяем и обновляем статус
            let newStatus = currentProduct.status;

            if (newQuantity <= currentProduct.product_count_min) {
                newStatus = 0;
            } else {
                newStatus = 1;
            }

            // Если статус изменился - обновляем
            if (newStatus !== currentProduct.status) {
                await db.query(`UPDATE Product SET status = $1 WHERE product_id = $2`, [newStatus, product_id]);
                updatedProduct.rows[0].status = newStatus; // Обновляем данные в ответе
            }

            return res.status(200).json({message: 'Количество и статус товара обновлены', product: updatedProduct.rows[0]});
        
        }
        // Для остальных полей
        const updateQuery = `UPDATE Product SET ${field} = $1 WHERE product_id = $2 RETURNING *`;
        const updatedProduct = await db.query(updateQuery, [value, product_id]);
        res.status(200).json({message: 'Товар обновлен', product: updatedProduct.rows[0]});
    } catch (err) {
        console.error('Ошибка обновления товара:', err);
        res.status(500).json({error: 'Ошибка сервера'});
    }
}

// Удаление товара из БД
async deleteProduct(req, res) {
    const {product_id} = req.body;

    console.log('Запрос на удаление получен', req.body); // Добавьте это

    if (!product_id) {
        return res.status(400).json({error: 'Некорректные данные'});
    }

    try {
        await db.query(`DELETE FROM Product WHERE product_id = $1`, [product_id]);
        res.status(200).json({message: 'Товар удален'});
    } catch (err) {

        res.status(500).json({error: 'Ошибка сервера'});
    }
}


// Функция поиска по названию
async searchProduct(req, res) {
    const {query} = req.body; // или req.query если GET запрос

    try {
        if (!query) {
            return res.status(400).json({error: "Search query is required"});
        }

        const result = await db.query(
            `SELECT * FROM product WHERE product_name ILIKE $1`,
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({error: "Internal server error"});
    }
}

// Создание заказа через платформу
async createOrder(req, res) {
    const {admin_id, product} = req.body
    let total = 0

    product.forEach(element => {
        total += element.price * element.quantity

    })

    let time = new Date()
    const newOrder = await db.query(`INSERT INTO orders (admin_id, createdat, status, total)
            VALUES ($1, $2, $3, $4) RETURNING *`, [admin_id, time, 0, total])

    try {
        for (const element of product) {
            await db.query(
                `INSERT INTO orderitems (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)`,
                [newOrder.rows[0].order_id, element.product_id, element.quantity, element.price]
            );

            const information = await db.query(
                `SELECT * FROM PRODUCT WHERE product_id = $1`,
                [element.product_id]
            );

            const updateproduct = await db.query(
                `UPDATE Product SET quantity = $1 WHERE product_id = $2 RETURNING *`,
                [information.rows[0].quantity - element.quantity, element.product_id]
            );

            if (updateproduct.rows[0].quantity < element.rows[0].product_count_min) {
                await db.query(
                    `UPDATE Product SET product_status = $1 WHERE product_id = $2`,
                    [0, element.product_id]
                );
            }
        }
        res.status(201).json({message: "Заказ создан"})
    } catch (err) {
        res.status(500)
    }
}


async deleteOrder(req, res) {
    const {order_id} = req.body;
    if (!order_id) {
        return res.status(400).json({ error: "Не указан order_id" });
    }

    const client = await db.connect(); // Подключаемся к клиенту для транзакций

    try {

        await client.query('BEGIN'); // Начало транзакции
        const orderProducts = await client.query(`SELECT * FROM orderitems WHERE order_id = $1`, [order_id]);

        await Promise.all(
            orderProducts.rows.map(async (item) => {
                await client.query(
                    `UPDATE product SET quantity = quantity + $1 WHERE product_id = $2`,
                    [item.quantity, item.product_id]
                );
            })
        );

        // Удалите сначала OrderItems, чтобы не нарушать внешние ключи
        await client.query('DELETE FROM orderitems WHERE order_id = $1', [order_id]);


        // Затем удалите сам заказ
        const result = await client.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [order_id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK'); // Откат, если заказа нет
            return res.status(404).json({ error: "Заказ не найден" });
        }
        await client.query('COMMIT'); // Фиксация изменений
        res.json({ message: "Заказ успешно удален", order: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK'); // Откат при ошибке
        console.error("Ошибка при удалении заказа:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
    finally{
        client.release(); // Освобождаем клиент

    }
}

// Изменение статуса заказа
async updateOrderStatus(req, res) {
    const {order_id, status} = req.body;

    if (!order_id || status === undefined) {
        return res.status(400).json({error: 'Некорректные данные'});
    }

    try {
        const updatedOrder = await db.query(`UPDATE "orders" SET status = $1 WHERE order_id = $2 RETURNING *`, [status, order_id]);
        res.status(200).json({message: 'Статус заказа обновлен', order: updatedOrder.rows[0]});
    } catch (err) {

        res.status(500).json({error: 'Ошибка сервера'});
    }
}

async getAllOrders(req, res) {
    try {
        const ordersResult = await db.query(`
        SELECT o.*, 
                json_agg(json_build_object(
                    'product_id', p.product_id,
                    'product_name', p.product_name,
                    'quantity', oi.quantity,
                    'price', oi.price,

                    -- Добавляем нужные поля:
                    'product_type', p.product_type,
                    'price_for_grams', p.price_for_grams,
                    'quantityInStock', p.quantity,
                    'product_count_min', p.product_count_min
                )) AS products
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
        LEFT JOIN Product p ON oi.product_id = p.product_id
        GROUP BY o.order_id
        ORDER BY o.createdat DESC
    `);

        res.status(200).json(ordersResult.rows);
    } catch (err) {
        console.error(`Error fetching all orders: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

    /*async getAllOrders(req, res) {
        try {
            const ordersResult = await db.query(`
    SELECT o.*, 
           json_agg(json_build_object(
               'product_id', p.product_id,
               'product_name', p.product_name,
               'quantity', oi.quantity,
               'price', oi.price
           )) as products
    FROM Orders o
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN Product p ON oi.product_id = p.product_id
    GROUP BY o.order_id
    ORDER BY o.createdat DESC
`);
            res.status(200).json(ordersResult.rows);
        } catch (err) {
            console.error(`Error: ${err}`);
            res.status(500).send("Internal Server Error");
        }
    }*/

async getOrdersbyStatus(req, res) {
    const {status} = req.query;
    try {
        const ordersResult = await db.query(`
    SELECT o.*, 
            json_agg(json_build_object(
                'product_id', p.product_id,  
                'product_name', p.product_name,
                'quantity', oi.quantity,
                'price', oi.price
            )) as products
    FROM Orders o
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN Product p ON oi.product_id = p.product_id
    WHERE o.status = $1
    GROUP BY o.order_id
    ORDER BY o.createdat DESC
    `, [status]);
        res.status(200).json(ordersResult.rows);
    } catch (err) {
        console.error(`Error: ${err}`);
        res.status(500).send("Internal Server Error");
    }
}

// Редактирование заказа (состава и статуса)
async updateOrder(req, res) {
    const {order_id, status, products} = req.body;

    if (!order_id) {
        return res.status(400).json({error: 'ID заказа обязательно'});
    }

    try {
        // Начинаем транзакцию
        await db.query('BEGIN');

        // 1. Обновляем статус заказа, если он передан
        if (status !== undefined) {
            await db.query(
                `UPDATE orders SET status = $1 WHERE order_id = $2`,
                [status, order_id]
            );
        }

        // 2. Если передан новый состав заказа
        if (products && Array.isArray(products)) {
            // Удаляем старые позиции заказа
            await db.query(
                `DELETE FROM orderitems WHERE order_id = $1`,
                [order_id]
            );

            // Восстанавливаем остатки по старым позициям
            const oldItems = await db.query(
                `SELECT product_id, quantity FROM orderitems WHERE order_id = $1`,
                [order_id]
            );

            for (const item of oldItems.rows) {
                await db.query(
                    `UPDATE product SET quantity = quantity + $1 
                WHERE product_id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            // Добавляем новые позиции и обновляем остатки
            let total = 0;
            for (const product of products) {
                // Добавляем позицию в заказ
                await db.query(
                    `INSERT INTO orderitems 
                (order_id, product_id, quantity, price) 
                VALUES ($1, $2, $3, $4)`,
                    [order_id, product.product_id, product.quantity, product.price]
                );

                // Обновляем остатки товара
                await db.query(
                    `UPDATE product SET quantity = quantity - $1 
                WHERE product_id = $2`,
                    [product.quantity, product.product_id]
                );

                total += product.price * product.quantity;
            }

            // Обновляем общую сумму заказа
            await db.query(
                `UPDATE orders SET total = $1 WHERE order_id = $2`,
                [total, order_id]
            );
        }

        // Получаем обновленный заказ с товарами
        const updatedOrder = await db.query(`
    SELECT o.*, 
            json_agg(json_build_object(
                'product_name', p.product_name,
                'quantity', oi.quantity,
                'price', oi.price,
                'product_id', p.product_id
            )) as products
    FROM Orders o
    LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
    LEFT JOIN Product p ON oi.product_id = p.product_id
    WHERE o.order_id = $1
    GROUP BY o.order_id
`, [order_id]);

        // Завершаем транзакцию
        await db.query('COMMIT');

        res.status(200).json({
            message: 'Заказ успешно обновлен',
            order: updatedOrder.rows[0]
        });
    } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await db.query('ROLLBACK');
        console.error('Ошибка при обновлении заказа:', err);
        res.status(500).json({error: 'Ошибка сервера при обновлении заказа'});
    }
}

// Поиск товара по штрих-коду
async getProductByBarcode(req, res) {
    const {code} = req.params;
    try {
        const result = await db.query(
            `SELECT * FROM Product WHERE product_id = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({message: "Товар не найден"});
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Ошибка поиска по штрих-коду:", err);
        res.status(500).json({error: "Ошибка сервера"});
    }
}


// Генерация отчета за день.
async generateDailyReport(req, res) {
    const day = req.body
    const daily = day["day"].split('.').reverse().join('-')
    const Orders = await db.query(`SELECT * FROM orders WHERE createdat::date = $1`, [daily])


    res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
            'Content-Disposition',
            'attachment; filename="reportDaily.xlsx"'
    );


    await reportHelpers.foo([Orders.rows[0]], "Чайная Лавка", daily)
}

async generateProductReport(req, res) {
    const {status} = req.body;
    try {
        const Products = await db.query(`SELECT * FROM Product WHERE status = $1`, status);

        // Настраиваем заголовки ответа перед генерацией файла
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="report.xlsx"'
        );

        // Генерируем и отправляем файл
        await reportHelpers.generateProduct(Products.rows, res);

        
    } catch (err) {
        console.log("Ошибка - ", err);
        res.status(500).json({message: "Ошибка на сервере"});
    }
}

async generateReport(req, res){
    const {startDate, endDate} = req.body
    const start = startDate.split('.').reverse().join('-')
    const end = endDate.split('.').reverse().join('-')
    let itemsorders = []
    try{
        // Получаем все необходимые данные одним запросом с JOIN
        const reportData = await db.query(`
            SELECT 
                Orders.order_id AS "order_id",
                Orders.createdat AS "order_date",
                Orders.total AS "order_total",
                Product.product_name AS "product_name",
                CASE 
                    WHEN Product.product_type = 1 THEN 'штук'
                    WHEN Product.product_type = 2 THEN 'грамм'
                END AS "product_type",
                OrderItems.quantity AS "quantity",
                OrderItems.price AS "item_price"
            FROM Orders
            JOIN OrderItems ON Orders.order_id = OrderItems.order_id
            JOIN Product ON OrderItems.product_id = Product.product_id
            WHERE Orders.createdat::date BETWEEN $1 AND $2
            ORDER BY Orders.order_id, Orders.createdat
        `, [start, end]);

        if (reportData.rows.length === 0) {
            return res.status(404).json({message: "Нет данных за указанный период"});
        }

        // Формируем структуры данных для отчета
        const summary = []; // Сводка по заказам
        const details = []; // Детализация по товарам
        const ordersMap = new Map(); // Для группировки по заказам

        reportData.rows.forEach(row => {
            const orderId = row.order_id;
            
            // Добавляем в сводный отчет (если заказ еще не добавлен)
            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, true);
                summary.push({
                    "Номер заказа": orderId,
                    "Дата заказа": new Date(row.order_date).toLocaleDateString('ru-RU'),
                    "Сумма заказа": row.order_total
                });
            }
            
            // Добавляем в детализацию
            details.push({
                "Номер заказа": orderId,
                "Название товара": row.product_name,
                "Тип товара": row.product_type,
                "Количество": row.quantity,
                "Цена за единицу": row.item_price,
                "Сумма": row.quantity * row.item_price
            });
        });

        // Настройка заголовков для скачивания
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="revenue_report_${startDate}_${endDate}.xlsx"`
        );

        // Генерация отчета
        await reportHelpers.generateReportRevenueForPeriod(summary, details, start, end, res);
    }
    catch(err){
        console.error("Ошибка при генерации отчёта:", err);
        res.status(500).json({message: "Ошибка на сервере"});
    }

}

}

module.exports = new adminController();