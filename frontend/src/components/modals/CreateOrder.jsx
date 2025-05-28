import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Modal, Input } from "@mui/material";
import "./CreateOrder.css";
import AddManually from "./AddManually.jsx";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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
    const [scanning, setScanning] = useState(false);
    const barcodeInputRef = useRef(null);

    useEffect(() => {
        if (props.order && props.type === 'edit') {
            const items = props.order.items ||
                (props.order.products ? props.order.products.map(p => ({
                    product_id: p.product_id,
                    id: p.product_id,
                    name: p.product_name,
                    price: p.price,
                    quantity: p.quantity,
                    total: p.price * p.quantity
                })) : []);
            setOrderItems(items);
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
                            total: parseInt(item.price) * (item.quantity + 1)
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
                    total: parseInt(product.price) || 0
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

    const handleSubmit = async () => {
        const orderData = {
            order_id: props.order?.order_id,
            status: props.order?.status || 0,
            items: orderItems.map(item => {
                const productId = item.product_id || item.id;
                if (!productId) {
                    console.error("Ошибка: product_id не найден у товара", item);
                    throw new Error("Нельзя отправить товар без product_id");
                }
                return {
                    product_id: productId,
                    quantity: item.quantity,
                    price: parseFloat(item.price) || 0
                };
            }),
            total: calculateTotal()
        };

        try {
            if (props.type === 'create') {
                await props.onAdd(orderData);
            } else {
                await props.onUpdate(orderData);
            }
            setOrderItems([]);
        } catch (error) {
            console.error("Ошибка при обработке заказа:", error);
        }
    };

    // Сканер штрих-кодов

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Активируем сканирование только при нажатии определённой клавиши (например, Ctrl)
            if (props.open /*&& !scanning && e.ctrlKey*/) {
                setScanning(true);
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [props.open, scanning]);

        const handleBarcodeChange = async (e) => {
            const code = e.target.value.trim();
            if (code.length < 6) return;

            try {
                const response = await fetch(`/api/product/barcode/${code}`);
                if (!response.ok) {
                    throw new Error("Товар не найден");
                }

                const product = await response.json();

                // Добавляем проверку на существование продукта и его свойств
                if (!product || !product.product_id) {
                    throw new Error("Неверный формат данных товара");
                }

                handleAddItem({
                    product_id: product.product_id,
                    id: product.product_id,
                    name: product.product_name || "Неизвестный товар",
                    price: product.price_unit || 0,
                    quantity: 1,
                    total: product.price_unit || 0
                });

                e.target.value = '';
            } catch (err) {
                console.error("Ошибка сканирования:", err.message);
                alert(err.message || "Произошла ошибка при сканировании");
            } finally {
                // Добавляем небольшую задержку перед сбросом состояния сканирования
                setTimeout(() => setScanning(false), 500);
            }
        };



    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
            sx={{zIndex: 5}}
        >
            <Box sx={style} className="popup__create-add-order">
                {/*Проблемы с инпутом*/}
                <input
                    type="text"
                    ref={barcodeInputRef}
                    onChange={handleBarcodeChange}
                    autoComplete="off"
                    style={{position: 'absolute', top: "0", width: '100px', height: '100px'}}
                />


                <AddManually
                    open={openManualAdd}
                    onClose={() => setOpenManualAdd(false)}
                    onAddProduct={handleAddItem}
                />

                <div className="popup__header">
                    <h1 className="popup__title">
                        {props.type === "create" ?
                            <span className="create__item">Создание</span> :
                            <span className="change__item">Редактирование</span>} заказа
                    </h1>

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
                        <li className="titles__title">Добавить</li>
                    </ul>
                </div>

                <div className="popup__main">
                    {orderItems.length === 0 ? (
                        <div className="empty-order">Добавьте товары в заказ</div>
                    ) : (
                        <ol className="create-order__main-list">
                            {orderItems.map((item) => (
                                <li key={item.product_id} className="create-order__main-item">
                                    <p className="item__title item__info">{item.name}</p>
                                    <p className="detail__price item__info">{item.price} руб.</p>
                                    <p className="detail__amount item__info">
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
                                    <p className="detail__total item__info">{item.total} руб.</p>
                                    <Button
                                        className="button button_remove item__info"
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