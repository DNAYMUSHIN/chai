import React, { useState, useEffect } from 'react';
import { Button, Input } from "@mui/material";
import "./Orders.css";
import CreateOrder from "./modals/CreateOrder.jsx";

// Заглушка для имитации API заказов
const fetchOrders = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        id: 1,
                        number: '№56738',
                        status: 'Оформлен',
                        date: '01.03.2023',
                        total: '1500 руб.',
                        items: [
                            { id: 1, name: 'Конфета "Три медвежонка"', price: '10 руб.', quantity: 5, total: '50 руб.' },
                            { id: 2, name: 'Зеленый чай', price: '250 руб.', quantity: 2, total: '500 руб.' }
                        ]
                    }
                ]
            });
        }, 500);
    });
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [actionType, setActionType] = useState('create');

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const response = await fetchOrders();
                if (response.success) {
                    setOrders(response.data);
                } else {
                    setError("Не удалось загрузить заказы");
                }
            } catch (err) {
                setError("Ошибка при загрузке заказов");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const handleOpenCreate = () => {
        setActionType('create');
        setCurrentOrder(null);
        setOpenOrderModal(true);
    };

    const handleOpenEdit = (order) => {
        setActionType('edit');
        setCurrentOrder(order);
        setOpenOrderModal(true);
    };

    const handleAddOrder = (newOrder) => {
        // В реальном приложении здесь будет вызов API
        setOrders(prev => [...prev, {
            ...newOrder,
            id: Date.now(),
            number: `№${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleDateString('ru-RU'),
            status: 'Оформлен'
        }]);
    };

    const handleUpdateOrder = (updatedOrder) => {
        // В реальном приложении здесь будет вызов API
        setOrders(prev =>
            prev.map(order =>
                order.id === updatedOrder.id ? updatedOrder : order
            )
        );
    };

    const filteredOrders = orders.filter(order =>
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="workspace products orders">
            <CreateOrder
                open={openOrderModal}
                type={actionType}
                handleClose={() => setOpenOrderModal(false)}
                order={currentOrder}
                onAdd={handleAddOrder}
                onUpdate={handleUpdateOrder}
            />

            <div className="workspace__header">
                <Button
                    onClick={handleOpenCreate}
                    className="workspace__add-product"
                >
                    Создать заказ
                </Button>
                <Input
                    type="text"
                    placeholder="Поиск"
                    className="workspace__search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ul className="workspace__features">
                    <li className="workspace__feature">Номер</li>
                    <li className="workspace__feature">Статус</li>
                    <li className="workspace__feature">Дата</li>
                    <li className="workspace__feature">Цена</li>
                    <li className="workspace__feature">Подробности и редактирование</li>
                </ul>
            </div>
            <div className="workspace__main">
                {loading ? (
                    <div className="workspace__loading">Загрузка заказов...</div>
                ) : error ? (
                    <div className="workspace__error">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="workspace__empty">
                        {searchTerm ? 'Заказы не найдены' : 'Нет заказов'}
                    </div>
                ) : (
                    <ul className="workspace__list orders-list">
                        {filteredOrders.map((order) => (
                            <li key={order.id} className="workspace__item order orders-list__item">
                                <p className="order__number">{order.number}</p>
                                <p className="status">{order.status}</p>
                                <p className="price-piece">{order.date}</p>
                                <p className="unit">{order.total}</p>
                                <Button
                                    onClick={() => handleOpenEdit(order)}
                                    className="change button"
                                >
                                    Открыть
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default Orders;