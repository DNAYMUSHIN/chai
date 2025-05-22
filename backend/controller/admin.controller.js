// Maks was here

const db = require('../db');
const reportHelpers = require('./utils')
const bcrypt = require('bcryptjs');
const {ProductType} = require('../constants')
const { time, error } = require('console');
class adminController{
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

// Добавление товара 

async createAdmin(req, res){
    try{
        const {admin_email, password} = req.body;

        const admin_password = await bcrypt.hash(password, 10)

        const newAdmin = await db.query(
            `INSERT INTO admin (admin_email, admin_password)
            VALUES ($1, $2)
            RETURNING *`,
            [admin_email, admin_password]
        );

        res.status(201).json(newAdmin.rows[0])
    }
    catch(e){
        res.status(401).send("Ошибка добавления пользователя")
    }
}

async enterAdmin(req, res) {
    const {admin_email, password} = req.body;
    console.log(admin_email, password)

    try{
        const admin = await db.query(`SELECT * FROM admin 
            WHERE admin_email = $1 and admin_password = $2`,
        [admin_email, password])
        if (admin.rows.length > 0) {  
            console.log(admin.rows[0])
            res.status(201).send(admin.rows[0])
        }
        else{
            res.status(401).json({message: "Неправильный логин и пароль"})
        }
    }
    catch(err){
        console.log(err)
        res.status(501).json({message: "Ошибка сервера"})
    }
    /*try {
        const tmp_admin = await db.query(`select * from admin where admin_email = $1`, [admin_email]);
        
        if (!tmp_admin.rows[0]) {
            return res.status(400).json({message:"Администратор с такой почтой отсутствует"});
        }
        
        const password_with_table = tmp_admin.rows[0].admin_password;
        const check = await bcrypt.compare(password, password_with_table);
        
        if(check) {
            return res.status(200).json({ message: "Вы вошли"});
        } else {
            return res.status(401).json({message: "Неправильный пароль"});
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        return res.status(500).json({message:"Внутренняя ошибка сервера"});
    }*/
}

/*------------------КАТЕГОРИИ--------------------*/
async createCategory(req, res) {
    try {
        const { category_name } = req.body;

        // Проверяем, что название категории передано
        if (!category_name) {
            return res.status(400).json({ message: "Название категории обязательно" });
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
        res.status(500).json({ message: "Ошибка при создании категории" });
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
        res.status(500).json({ message: "Ошибка при получении списка категорий" });
    }
}

    async deleteCategory(req, res) {
        try {
            const { id } = req.params; // Получаем ID категории из URL

            // Проверяем существование категории
            const categoryExists = await db.query(
                `SELECT * FROM category WHERE category_id = $1`,
                [id]
            );

            if (categoryExists.rows.length === 0) {
                return res.status(404).json({ message: "Категория не найдена" });
            }

            // Удаляем категорию
            await db.query(
                `DELETE FROM category WHERE category_id = $1`,
                [id]
            );

            res.status(200).json({ success: true, message: "Категория успешно удалена" });
        } catch (e) {
            console.error("Ошибка при удалении категории:", e);
            res.status(500).json({ message: "Ошибка при удалении категории" });
        }
    }


    /*------------------КАТЕГОРИИ (КОНЕЦ)--------------------*/



async addProduct(req, res){
    const {product_category, product_name, product_type, product_price_unit, quinity, product_count_min, product_price_min, product_code} = req.body;
    let type = product_type === ProductType.PIECE ? 1 : 2
    
    if (!product_name || !product_category || product_price_unit == undefined || quinity == undefined)
    {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    try 
    {
        // Проверяем наличие товара в  категории
        let category_from_DB = await db.query(`SELECT * from category where category_name = $1`, [product_category])
        if (!category_from_DB.rows[0])
        {
            category_from_DB = await db.query(`INSERT INTO category (category_name) VALUES ($1) RETURNING *`, [product_category])
        }
        const category_id = category_from_DB.rows[0].category_id
    
        // Добавления товара в определенную категорию
        const productFromCategory = await db.query(`SELECT * from categoryitems where item_category_id = $1 and item_name = $2`, [category_id, product_name])
        // Если нет товара в категории
        if (!productFromCategory.rows[0])
        {
            await db.query(`INSERT INTO categoryitems (item_category_id, item_name) VALUES ($1, $2)`, [category_id, product_name])
        }

        const checkproduct = await db.query(`SELECT * from product where product_name = $1 and product_category_id = $2`, [product_name, category_id])
        
        // Если нет товара в БД
        if (!checkproduct.rows[0])
        {
            let product_status = 1;
            if (product_count_min > quinity){
                product_status = 0
            }
            // Запрос для добавление товара в БД product
            const newProduct = await db.query(
            `INSERT INTO Product (product_category_id, product_name, product_type, price_unit, quantity, product_count_min, product_price_min, product_code, product_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [category_id, product_name, type, product_price_unit, quinity, product_count_min, product_price_min, product_code, product_status]);
            res.status(201).json({ message: 'Товар добавлен', product: newProduct.rows[0]});
        }
        else{
            await db.query(`UPDATE product set quantity = $1 where product_id = $2`, [quinity + checkproduct.rows[0].quantity, checkproduct.rows[0].product_id])
            res.status(200).json({message: "Количество товара было изменено"})
        }

    } catch (err) {
        
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

// Изменение
async updateProduct(req, res){

    const {product_id, field, value} = req.body();
    if (!product_id || !field || value === undefined) {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    try {
        const updateQuery = `UPDATE Product SET ${field} = $1 WHERE product_id = $2 RETURNING *`;
        const updatedProduct = await db.query(updateQuery, [value, product_id]);

        res.status(200).json({ message: 'Товар обновлен', product: updatedProduct.rows[0] });
    } catch (err) {
        console.error('Ошибка обновления товара:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

// Удаление товара из БД
async deleteProduct(req, res) {
    const {product_id} = req.body;

    if (!product_id) {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    try {
        await db.query(`DELETE FROM Product WHERE product_id = $1`, [product_id]);
        res.status(200).json({ message: 'Товар удален' });
    } catch (err) {
        
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}


// Функция поиска по названию
async searchProduct(req, res)
{
    const {value} = req.body;
    
    try{
        
        const result = await db.query(`SELECT * FROM product WHERE LIKE product_name = $1`, [`%${value}%`])
        res.send(result.rows[0])
    }
    catch(err){
        res.status(305).json({"error": err})
    }
    
}
// Создание заказа через платформум 


async createOrder(req, res){
    const {admin_id, product} = req.body
    let total = 0
    
    product.forEach(element => {
        total += element.price*element.quantity
        
    })
    
    let time = new Date()
    const newOrder  = await db.query(`INSERT INTO orders (admin_id, createdat, status, total)
             VALUES ($1, $2, $3, $4) RETURNING *`, [admin_id, time, 0, total])

    try{
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

            if (updateproduct.rows[0].quantity < 20) {
                await db.query(
                    `UPDATE Product SET product_status = $1 WHERE product_id = $2`,
                    [0, element.product_id]
                );
            }
        }
        res.status(201)
    }
    catch(err){
        res.status(500)
    }
}

// Изменение статуса заказа
async updateOrderStatus(req, res) {
    const {order_id, status } = req.body;

    if (!order_id || status === undefined) {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    try {
        const updatedOrder = await db.query(`UPDATE "Order" SET status = $1 WHERE order_id = $2 RETURNING *`, [status, order_id]);
        res.status(200).json({ message: 'Статус заказа обновлен', order: updatedOrder.rows[0] });
    } catch (err) {
        
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}


// Генерация отчета за день. Показывает, 
async generateDailyReport(req, res){
    const day = req.body
    const daily = day["day"].split('.').reverse().join('-')
    console.log(daily)
    const Orders = await db.query(`SELECT * FROM orders WHERE createdat::date = $1`, [daily])
    console.log(Orders.rows[0], "A")

    await reportHelpers.foo([Orders.rows[0]], "Чайная Лавка",daily)
    res.status(200).send("OOOO")
}



 


}

module.exports = new adminController();