import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Input } from "@mui/material";
import "./CreateOrder.css";
import AddManually from "./AddManually.jsx";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    bgcolor: 'background.paper',
    borderRadius: '2rem',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    maxHeight: '90vh',
    overflowY: 'auto'
};

const CreateOrder = (props) => {
    const [orderItems, setOrderItems] = useState([]);
    const [openManualAdd, setOpenManualAdd] = useState(false);

    useEffect(() => {
        if (props.order && props.type === 'edit') {
            setOrderItems(props.order.items || []);
        } else {
            setOrderItems([]);
        }
    }, [props.order, props.type]);

    const handleAddItem = (product) => {
        const existingItem = orderItems.find(item => item.product_id === product.product_id);

        if (existingItem) {
            setOrderItems(prev =>
                prev.map(item =>
                    item.product_id === product.product_id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                            total: (parseInt(item.price) * (item.quantity + 1))
                        }
                        : item
                )
            );
        } else {
            setOrderItems(prev => [
                ...prev,
                {
                    ...product,
                    quantity: 1,
                    total: parseInt(product.price)
                }
            ]);
        }
    };

    const handleRemoveItem = (itemId) => {
        setOrderItems(prev => prev.filter(item => item.product_id !== itemId));
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setOrderItems(prev =>
            prev.map(item => {
                if (item.product_id === itemId) {
                    const pricePerUnit = parseInt(item.price);
                    return {
                        ...item,
                        quantity: newQuantity,
                        total: pricePerUnit * newQuantity
                    };
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = () => {
        const orderData = {
            items: orderItems,
            total: calculateTotal()
        };

        if (props.type === 'create') {
            props.onAdd(orderData);
        } else {
            props.onUpdate({
                ...props.order,
                ...orderData
            });
        }
    };

    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
            sx={{ zIndex: 5 }}
        >
            <Box sx={style} className="popup__create-add-order">
                <AddManually
                    open={openManualAdd}
                    onClose={() => setOpenManualAdd(false)}
                    onAddProduct={handleAddItem}
                />

                <div className="popup__header">
                    <div className="popup__title">
                        {props.type === "create" ?
                            <span className="create__item">Создание</span> :
                            <span className="change__item">Редактирование</span>} заказа
                    </div>
                    <div className="create-order__button-wrapper">
                        <Button
                            onClick={props.handleClose}
                            className="create-order__button button create-order__button-reject"
                        >
                            Отменить&#160;
                            {props.type === "create" ?
                                <span className="create__item">создание</span> :
                                <span className="change__item">редактирование</span>}
                        </Button>
                        <Button
                            onClick={() => setOpenManualAdd(true)}
                            className="create-order__button button create-order__button-add-manually"
                        >
                            Добавить вручную
                        </Button>
                    </div>
                    <ul className="features">
                        <li className="titles__title">Наименование</li>
                        <li className="titles__title">Цена за ед.</li>
                        <li className="titles__title">Количество</li>
                        <li className="titles__title">Общая стоимость</li>
                    </ul>
                </div>

                <div className="popup__main">
                    {orderItems.length === 0 ? (
                        <div className="empty-order">Добавьте товары в заказ</div>
                    ) : (
                        <ol className="create-order__main-list">
                            {orderItems.map((item) => (
                                <li key={item.product_id} className="create-order__main-item">
                                    <p className="item__title">{item.name}</p>
                                    <p className="detail__price">{item.price} руб.</p>
                                    <p className="detail__amount">
                                        {item.quantity} шт.
                                        <Button
                                            className="button button_add"
                                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                        >
                                            +
                                        </Button>
                                        <Button
                                            className="button button_remove"
                                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                        >
                                            -
                                        </Button>
                                    </p>
                                    <p className="detail__total">{item.total} руб.</p>
                                    <Button
                                        className="button button_remove"
                                        onClick={() => handleRemoveItem(item.product_id)}
                                    >
                                        Удалить
                                    </Button>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                {orderItems.length > 0 && (
                    <div className="order-total">
                        Итого: {calculateTotal()} руб.
                    </div>
                )}

                <div className="button-create-wrapper">
                    <Button
                        className="create-order__button button button-create"
                        onClick={handleSubmit}
                        disabled={orderItems.length === 0}
                    >
                        {props.type === "create" ?
                            <span className="create__item">Оформить заказ</span> :
                            <span className="change__item">Подтвердить редактирование</span>}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default CreateOrder;