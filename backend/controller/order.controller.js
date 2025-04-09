const db = require('../db');

/*
Админ

1) Создание заказа
2) Отмена заказа
3) Простотр статуса заказа статуса заказа 
4) Добавление (1шт) Товара в заказ
5) Удаление товара (1шт) из заказа 
6) Удаление полностью товара из заказа

*/

class orderController {

    async createOrderSyte (req, res){
        try{
            const {customer_id, product, qunity, status, total} = req.body
            const newOrder = await db.query(`INSERT INTO Order (ccustomer_id, product, qunity, status, total)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`, [customer_id, product, qunity, status, total])
            res.status(201).json(newOrder.rows[0])
        }
        catch(e){
            console.error('Ошибка:', e); // Логирование ошибки для отладки
            res.status(500).send("Ошибка добавления пользователя")
        }
    }
    
    createOrderQrCode(req, res){
        try{
            
        }
        catch(e){

        }

    }


}

module.exports = new orderController();