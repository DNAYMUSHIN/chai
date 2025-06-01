import React, { useState, useEffect } from 'react';
import { Button, Input, Select, MenuItem } from "@mui/material";
import "./Orders.css";
import CreateOrder from "./modals/CreateOrder.jsx";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [actionType, setActionType] = useState('create');


    const loadOrders = async () => {
        setLoading(true);
        try {
            // Загружаем только заказы со статусом 0 (активные)
            /*const response = await fetch('/api/orders/?status=0');*/
            const response = await fetch('/api/orders/all');
            if (!response.ok) throw new Error('Ошибка загрузки заказов');
            const data = await response.json();

            setOrders(data);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleOpenCreate = () => {
        setActionType('create');
        setCurrentOrder(null);
        setOpenOrderModal(true);
    };

    const handleOpenEdit = (order) => {
        setActionType('edit');
        setCurrentOrder({
            ...order,
            items: order.products ? order.products.map(product => {
                const productId = product.product_id || product.id;
                if (!productId) {
                    console.warn("Пропущен товар без product_id", product);
                    return null;
                }
                console.log(product)
                return {
                    product_id: productId,
                    id: productId,
                    name: product.product_name || product.name || 'Без названия',
                    price: parseFloat(product.price) || 0,
                    quantity: product.quantity || 1,
                    total: parseFloat(product.price) * (product.quantity || 1),
                    quantityInStock: product.quantityInStock,
                    product_type: product.product_type,
                    price_for_grams: product.price_for_grams,
                    product_count_min: product.product_count_min
                };
            }).filter(Boolean) : []
        });
        setOpenOrderModal(true);
    };
    /*const handleOpenEdit = (order) => {
        setActionType('edit');
        setCurrentOrder(order);
        setOpenOrderModal(true);
    };*/

    const handleAddOrder = async (newOrder) => {
        try {
            const response = await fetch('/api/order/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    admin_id: localStorage.getItem('admin_id'),
                    product: newOrder.items.map(item => ({
                        product_id: item.product_id, // ← Используем product_id напрямую
                        quantity: item.quantity,
                        price: parseInt(item.price)
                    }))
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка создания заказа');
            }

           /* const createdOrder = await response.json();
            setOrders(prev => [...prev, createdOrder]);
*/
            loadOrders();

            // Закрываем модальное окно после успешного создания
            setOpenOrderModal(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleUpdateOrder = async (updatedOrder) => {
        try {
            const response = await fetch('/api/order/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    order_id: updatedOrder.order_id,
                    status: updatedOrder.status || 0,
                    products: updatedOrder.items.map(item => ({
                        product_id: item.product_id,
                        quantity: parseInt(item.quantity, 10),
                        price: parseFloat(item.price)
                    }))
                })
            });
            if (!response.ok) throw new Error('Ошибка обновления заказа');
            loadOrders();
            setOpenOrderModal(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch('/api/order/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    order_id: orderId,
                    status: newStatus
                })
            });

            if (!response.ok) throw new Error('Ошибка обновления статуса');



            loadOrders();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 0: return 'Оформлен';
            case 1: return 'Готов к выдаче';
            case 2: return 'Выдан';
            default: return 'Неизвестно';
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!order) return false; // Защита от undefined

        // Берем последние 6 символов order_id или всю строку, если она короче
        const orderIdLast6 = order.order_id
            ? order.order_id.toString().slice(-6)
            : '';
        const statusText = getStatusText(order.status || 0).toLowerCase();
        const search = searchTerm.toLowerCase();

        return orderIdLast6.includes(search) || statusText.includes(search);
    });

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить этот заказ?");
        if (!confirmDelete) return;

        try {
            const response = await fetch('/api/order/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ order_id: orderId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка удаления заказа');
            }

            const result = await response.json();
            console.log("Заказ удален:", result);

            // Обновляем список заказов
            loadOrders();

        } catch (err) {
            console.error(err);
            alert(err.message || 'Не удалось удалить заказ');
        }
    };

    return (
        <section className="workspace orders">
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
                    placeholder="Поиск по номеру или статусу"
                    className="workspace__search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ul className="workspace__features">
                    <li className="workspace__feature">Номер</li>
                    <li className="workspace__feature">Статус</li>
                    <li className="workspace__feature">Дата</li>
                    <li className="workspace__feature">Цена</li>
                    <li className="workspace__feature">Действия</li>
                </ul>
            </div>
            <div className="workspace__main">
                {loading ? (
                    <div className="workspace__loading">Загрузка заказов...</div>
                ) : error ? (
                    <div className="workspace__error">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="workspace__empty">
                        {searchTerm ? 'Активные заказы не найдены' : 'Нет активных заказов'}
                    </div>
                ) : (
                    <ul className="workspace__list orders-list">
                        {filteredOrders.map((order) => (
                            <li key={order.order_id} className="workspace__item order orders-list__item">
                                <p className="order__number order__info">#{order.order_id.slice(-6)}</p>
                                <Select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                    className="status-select order__info"
                                >
                                    <MenuItem value={0}>Оформлен</MenuItem>
                                    <MenuItem value={1}>Готов к выдаче</MenuItem>
                                    <MenuItem value={2}>Выдан</MenuItem>
                                </Select>
                                <p className="order__date order__info">{new Date(order.createdat).toLocaleString('ru-RU')}</p>
                                <p className="order__total order__info">{order.total} руб.</p>
                               <div className="button-wrapper">

                                   <Button
                                       onClick={() => handleOpenEdit(order)}
                                       className="change button order__info"
                                   >
                                       Подробности
                                   </Button>

                                   <Button
                                       onClick={() => handleDeleteOrder(order.order_id)}
                                       className="button button_remove order__info"
                                       style={{ marginLeft: '1rem' }}
                                   >
                                       Удалить
                                   </Button>
                               </div>
                                {/*<div className="order-products">
                                    {order.products && order.products.map((product, index) => (
                                        <div key={index} className="product-item">
                                            <span>{product.product_name}</span>
                                            <span>{product.quantity} × {product.price} руб.</span>
                                        </div>
                                    ))}
                                </div>*/}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default Orders;