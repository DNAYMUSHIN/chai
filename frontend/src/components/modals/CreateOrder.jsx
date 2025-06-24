import React, {useState, useEffect, useRef} from 'react';
import {Box, Button, Modal, Input} from "@mui/material";
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
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);

    useEffect(() => {
        if (props.order && props.type === 'edit') {
            const items = props.order.items ||
                (props.order.products ? props.order.products.map(p => ({
                    product_id: p.product_id,
                    name: p.product_name,
                    price: p.price,
                    quantity: p.quantity,

                    total: p.total,
                    /*total: calculateItemTotal(p.price, p.quantity, p.price_for_grams),*/

                    quantityInStock: p.quantityInStock,
                    product_type: p.product_type,
                    price_for_grams: p.price_for_grams,
                    product_count_min: p.product_count_min
                })) : []);
            setOrderItems(items);
        } else {
            setOrderItems([]);
        }
    }, [props.order, props.type]);

    const calculateItemTotal = (price, quantity, priceForGrams) => {
        if (!priceForGrams || priceForGrams <= 0) {
            return price * quantity;
        }
        return (price * quantity) / priceForGrams;
    };


    const handleAddItem = (product) => {
        const productId = product.product_id;
        const existingItem = orderItems.find(item => item.product_id === productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + 1;

            // Для редактирования: доступное = остаток на складе + исходное количество в заказе
            const availableQuantity = props.type === 'edit'
                ? product.quantityInStock + (props.order?.items?.find(i => i.product_id === productId)?.quantity || 0)
                : product.quantityInStock;

            if (availableQuantity !== null && newQuantity > availableQuantity) {
                const availableForUser = availableQuantity - (props.type === 'edit' ? (props.order?.items?.find(i => i.product_id === productId)?.quantity || 0) : 0);
                alert(`Недостаточно товара на складе. Доступно: ${availableForUser}`);
                return;
            }

            setOrderItems(prev =>
                prev.map(item =>
                    item.product_id === productId
                        ? {...item, quantity: newQuantity, total: calculateItemTotal(item.price, newQuantity, item.price_for_grams)}
                        : item
                )
            );
        } else {
            // Для редактирования: доступное = остаток на складе + исходное количество в заказе
            const availableQuantity = props.type === 'edit'
                ? product.quantityInStock + (props.order?.items?.find(i => i.product_id === productId)?.quantity || 0)
                : product.quantityInStock;

            if (availableQuantity !== null && 1 > availableQuantity) {
                const availableForUser = availableQuantity - (props.type === 'edit' ? (props.order?.items?.find(i => i.product_id === productId)?.quantity || 0) : 0);
                alert(`Недостаточно товара на складе. Доступно: ${availableForUser}`);
                return;
            }

            setOrderItems(prev => [
                ...prev,
                {
                    ...product,
                    product_id: productId,
                    quantity: 1,
                    total: calculateItemTotal(product.price, 1, product.price_for_grams)
                }
            ]);
        }
    };


    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const item = orderItems.find(i => i.product_id === itemId);

        // Для редактирования: доступное = остаток на складе + исходное количество в заказе
        const availableQuantity = props.type === 'edit'
            ? item.quantityInStock + (props.order?.items?.find(i => i.product_id === itemId)?.quantity || 0)
            : item.quantityInStock;

        // Проверка наличия на складе
        if (availableQuantity !== null && newQuantity > availableQuantity) {
            alert(`Недостаточно товара на складе. Доступно: ${availableQuantity - (props.type === 'edit' ? (props.order?.items?.find(i => i.product_id === itemId)?.quantity || 0) : 0)}`);
            return;
        }

        // Обновляем количество
        setOrderItems(prev =>
            prev.map(item =>
                item.product_id === itemId
                    ? {...item, quantity: newQuantity, total: calculateItemTotal(item.price, newQuantity, item.price_for_grams)}
                    : item
            )
        );
    };

    const formatPrice = (product) => {
        if (product.product_type === 1) { // штуки
            return `${product.price} руб. за шт.`;
        } else if (product.product_type === 2 && product.price_for_grams) { // граммы
            return `${product.price} руб. за ${product.price_for_grams} гр.`;
        }
        return `${product.price} руб.`;
    };

    const handleRemoveItem = (itemId) => {
        setOrderItems(prev => prev.filter(item => item.product_id !== itemId));
    };


    const calculateTotal = () => {

        return orderItems.reduce((sum, item) => sum + item.total, 0);
        /*return orderItems.reduce((sum, item) => sum + calculateItemTotal(item.price, item.quantity, item.price_for_grams), 0);*/
    };

    const sumTotal = () => {
        return orderItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = async () => {
        const orderData = {
            order_id: props.order?.order_id,
            status: props.order?.status || 0,
            items: orderItems.map(item => {
                const productId = item.product_id;
                if (!productId) {
                    console.error("Ошибка: product_id не найден у товара", item);
                    throw new Error("Нельзя отправить товар без product_id");
                }
                return {
                    product_id: productId,
                    quantity: item.quantity,
                    price: item.price || 0,
                    price_for_grams: item.price_for_grams,
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
        const handleKeyDown = () => {
            if (props.open && !openManualAdd && !isEditingQuantity) {
                setScanning(true);
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [props.open, openManualAdd, isEditingQuantity]); // Убрали scanning из зависимостей



    const handleBarcodeChange = async (e) => {
        if (isEditingQuantity) return;

        const code = e.target.value.trim();
        if (code.length !== 36) return;

        try {
            const response = await fetch(`/api/product/barcode/${code}`);
            if (!response.ok) {
                throw new Error("Товар не найден");
            }

            const product = await response.json();

            if (!product || !product.product_id) {
                throw new Error("Неверный формат данных товара");
            }

            handleAddItem({
                ...product,
                product_id: product.product_id,
                name: product.product_name || "Неизвестный товар",
                price: product.price_unit || 0,
                quantity: 1,
                total: 0,
                quantityInStock: product.quantity,
                product_type: product.product_type,
                price_for_grams: product.price_for_grams,
                product_count_min: product.product_count_min
            });

            e.target.value = '';
            setScanning(false); // Сбрасываем состояние сканирования сразу после успешного добавления
        } catch (err) {
            console.error("Ошибка сканирования:", err.message);
            alert(err.message || "Произошла ошибка при сканировании");
            e.target.value = '';
            setOpenManualAdd(true);
            setScanning(false); // Сбрасываем состояние при ошибке
        }
    };


    const handleQuantityInputChange = (itemId, e) => {
        const value = e.target.value;

        // Разрешаем ввод только чисел и пустой строки
        if (/^\d*$/.test(value)) {
            setOrderItems(prev =>
                prev.map(item =>
                    item.product_id === itemId
                        ? {
                            ...item,
                            quantity: value, // Сохраняем как строку, чтобы позволить пустое значение
                            total: value === '' || isNaN(value)
                                ? 0
                                : calculateItemTotal(item.price, parseInt(value, 10), item.price_for_grams)
                        }
                        : item
                )
            );
        }
    };

    const handleQuantityInputBlur = (itemId) => {
        const item = orderItems.find(i => i.product_id === itemId);
        if (!item) return;

        const inputValue = item.quantity;
        const parsedValue = parseInt(inputValue, 10);

        let newQuantity;
        if (isNaN(parsedValue) || parsedValue < 1) {
            newQuantity = 1;
        } else {
            newQuantity = parsedValue;
        }

        // Для редактирования: доступное = остаток на складе + исходное количество в заказе
        const availableQuantity = props.type === 'edit'
            ? item.quantityInStock + (props.order?.items?.find(i => i.product_id === itemId)?.quantity || 0)
            : item.quantityInStock;

        // Проверка наличия на складе
        if (availableQuantity !== null && newQuantity > availableQuantity) {
            const availableForUser = availableQuantity - (props.type === 'edit' ? (props.order?.items?.find(i => i.product_id === itemId)?.quantity || 0) : 0);
            alert(`Недостаточно товара на складе. Доступно: ${availableForUser}`);
            newQuantity = availableForUser;
        }

        setOrderItems(prev =>
            prev.map(i =>
                i.product_id === itemId
                    ? {...i, quantity: newQuantity, total: calculateItemTotal(i.price, newQuantity, i.price_for_grams)}
                    : i
            )
        );

        setIsEditingQuantity(false);
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
                <input
                    type="text"
                    ref={barcodeInputRef}
                    onChange={handleBarcodeChange}
                    autoComplete="off"
                    style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 0,
                        height: 0,
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        overflow: 'hidden',
                        pointerEvents: scanning ? 'auto' : 'none' // Будет доступен только при сканировании
                    }}
                />

                <AddManually
                    open={openManualAdd}
                    onClose={() => {
                        setOpenManualAdd(false);/*
                        barcodeInputRef.current.value = "";*/
                        setScanning(true);
                        }
                    }

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

                                    <p className="item__title item__info">
                                        {item.name}
                                        {item.quantityInStock !== null &&
                                            <span className="stock-info">
                                                {props.type === 'edit'
                                                    ? ` (Доступно: ${item.quantityInStock + (props.order?.items?.find(i => i.product_id === item.product_id)?.quantity || 0)} ${item.product_type === 1 ? 'шт.' : 'гр.'})`
                                                    : ` (Всего: ${item.quantityInStock} ${item.product_type === 1 ? 'шт.' : 'гр.'})`
                                                }
                                            </span>
                                        }
                                    </p>


                                    <p className="detail__price item__info">
                                        {formatPrice(item)}
                                    </p>
                                    <p className="detail__amount item__info">

                                        <Input
                                            type="text" // Меняем на text, чтобы можно было стирать полностью
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityInputChange(item.product_id, e)}
                                            onBlur={() => handleQuantityInputBlur(item.product_id)} // При выходе фиксируем min=1
                                            onFocus={() => setIsEditingQuantity(true)}
                                            className="quantity-input"
                                        />


                                        {item.product_type === 1 ? "шт." : "гр."}
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
                        Итого:&#160;
                        {props.type === "create" ?
                            calculateTotal().toFixed(2) :
                            sumTotal().toFixed(2)
                        }&#160;руб.

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