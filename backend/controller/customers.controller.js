const db = require('../db');
const bcrypt = require('bcrypt');


/*
1) Регистрация
2) Вход
3) Удаление аккаунта
4) Обновление данных 

*/
/*
- Регистрация (или отдельно в профиле, или при оформлении заказа перекидывает)
– Авторизация (с проверкой хешированного пароля)
– Просмотр и редактирование личных данных
– Оформление и отмена заказов
– Просмотр статусов заказов
*/ 


class CustomerController{


    async createCustomer(req, res){
        try{
        const {customer_name, password} = req.body;
        const tmp_customer = await db.query(`SELECT * FROM customers
            WHERE customer_name = $1
            `, [customer_name])
        // Проверка есть ли уже пользователь с таким логином и паролем
        if (tmp_customer.rows.length > 0)
        {
             return res.status(409).send("Такой пользователь уже существует")
        }

        const customer_password = await bcrypt.hash(password, 10);

        const newCustomer = await db.query(
            `INSERT INTO customers (customer_name, customer_password)
            VALUES ($1, $2)
            RETURNING *`,
            [customer_name, customer_password]
        );

        res.status(201).json(newCustomer.rows[0])
        }
        catch(e){
            console.error('Ошибка:', e); // Логирование ошибки для отладки
            res.status(500).send("Ошибка добавления пользователя")
        }
    }

    async enterCustomer(req, res){
        try{
            // Получаем запрос, в котором будет имя пользователся, пароль
            const {customer_name, password} = req.body;

            //Подтягиваем захешированных пароль из БД по имени и номеру
            const tmp_user = await db.query(`SELECT * FROM customers
                WHERE customer_name = $1`, [customer_name])
            
            if (tmp_user.rows[0] == undefined){
                return res.status(500).send('Нет такого пользователя')
            }
            // Проверяем введенный пароль и пароль, который лежит в БД
 
            const password_with_table = tmp_user.rows[0].customer_password
            
            const check = await bcrypt.compare(password, password_with_table)
            if(check){
                res.status(200).send('ВСЁ ОКЕЙ. Вы вошли в аккаунт');
            }
            else{
                res.status(500).send('Неправильный логин или пароль');
            }
        }
        catch(e){
            console.error("Error", e);
            res.status(500).send("Ошибка с авторизацией")
        }
    }




    async scanCustomer (req, res){
        try{
            /*
            const {customer_name} = req.body;
            const customer = await db.query(`SELECT * FROM customers
                WHERE customer_name = $1 AND phonenumber = $2`, [customer_name])
            
            if (customer.rows.length != 0){
                res.status(201).json({
                    "customer_id": customer.rows[0].customer_id,
                    "customer_name": customer.rows[0].customer_name,
                    "phonenumber": customer.rows[0].phonenumber,
                    "customer_order": customer.rows[0].customer_order
                })
            }*/
            const {customer_id} = req.body;
            const customer = await db.query(`SELECT * FROM customers
                WHERE customer_id = $1`, [customer_id])
            if (customer.rows.length != 0){
                res.status(201).json({
                    "customer_id": customer.rows[0].customer_id,
                    "customer_name": customer.rows[0].customer_name,
                    "phonenumber": customer.rows[0].phonenumber,
                    "customer_order": customer.rows[0].customer_order
            })
            }
            else{
                res.status(400).send('Нет такого пользователя')
            }
        }
        catch(e){
            console.error('Ошибка', e)
            req.status(500).send('Ошибка просмотра данных пользователся')
        }
    }

    async upDateCustomer(req, res){
        const {customer_id, field, value} = req.body

        if (!customer_id || !field || value == undefined){
            return res.status(400).json({error: 'Неправильные данные'})
        }
        console.log(customer_id, field, value)
        let update; 
        try {
            switch (field) {
                case "customer_name":
                    update = await db.query(`UPDATE customers SET customer_name = $1 WHERE customer_id = $2 RETURNING *`, [value, customer_id]);
                    break;
                case "customer_password":
                    const hashedPassword = await bcrypt.hash(value, 10); // 10 — число "солей"
                    update = await db.query(`UPDATE customers SET customer_password = $1 WHERE customer_id = $2 RETURNING *`, [hashedPassword, customer_id]);
                    break;
                case "phonenumber":
                    update = await db.query(`UPDATE customers SET phonenumber = $1 WHERE customer_id = $2 RETURNING *`, [value, customer_id]);
                    break;
                default:
                    return res.status(400).send('Неправильное поле для обновления');
            }

            if (update.rows.length > 0){
                res.status(200).send('Всё окей')
            }
            else{
                res.status(400).send('Проблема')
            }
        }
        catch (e){
            console.error("Ошибка", e);
        }
    }
    // Перенести в Order.constroller
    async createOrder(req, res){
        // нам придет с запрос
        const {customer_id, products, quantity, total} = req.body()
        if (!customer_id || !products || !quanity || total === undefined){
            return res.status(400).send('Некорректные данные')
        }
        try{
            const createdAt = new Date();
            const status = 1; // 1 - Заказ активный

            const newOrder = await db.query(
                `INSERT INTO "Order" (product, customer_id, qunity, createdAt, status, total) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [products, customer_id, quantity, createdAt, status, total]
            );
        }
        catch(e){
            console.error('Ошибка', e)
            res.status(400).json({error: "Error"})
        }
    }
    // Перенести в файл Order.constroller
    async cancelOrder(req, res){
        const {order_id} = req.body;

        if (!order_id) {
            return res.status(400).json({ error: 'Некорректные данные' });
        }

        try {
            // Проверяем, существует ли заказ
            const order = await db.query(`SELECT * FROM "Order" WHERE order_id = $1`, [order_id]);

            if (order.rows.length === 0) {
                return res.status(404).json({ error: 'Заказ не найден' });
            }

            // Обновляем статус заказа на "отменён"
            await db.query(`UPDATE "Order" SET status = -1 WHERE order_id = $1`, [order_id]);
        }
        catch (err) {
            console.error('Ошибка отмены заказа:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async checkStatus(req, res){
        const {customer_id} = res.body();
        try{
            const orders = db.query(`SELECT status from "Order" where customers_id = $1`, [customer_id])
        }
        catch(e){

        }


    }
}

module.exports = new CustomerController();