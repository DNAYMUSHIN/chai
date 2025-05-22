import React, { useState, useEffect } from 'react';
import { Box, Button, FormControlLabel, Input, Modal, Radio, RadioGroup } from "@mui/material";
import "./AddProduct.css";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '2rem',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

const AddProduct = (props) => {
    const [formData, setFormData] = useState({
        name: '',
        unitType: 'piece',
        grams: '100',
        pricePer100g: '0',
        totalAmount: '0',
        price: '0',
        category: '',
        countMin: '0',
        priceMin: '0',
        code: ''
    });

    useEffect(() => {
        if (props.product && props.type === 'change') {
            // Парсим данные из продукта для формы
            const isGramm = props.product.unit.includes('г');
            const priceValue = props.product.price.replace(/[^\d.]/g, '');
            const amountValue = props.product.amount.replace(/[^\d.]/g, '');

            setFormData({
                name: props.product.name,
                unitType: isGramm ? 'gramm' : 'piece',
                grams: isGramm ? props.product.unit.replace(/[^\d.]/g, '') : '100',
                pricePer100g: isGramm ? priceValue : '0',
                price: !isGramm ? priceValue : '0',
                totalAmount: amountValue || '0',
                category: props.product.category,
                countMin: '0',
                priceMin: '0',
                code: ''
            });
        } else {
            setFormData({
                name: '',
                unitType: 'piece',
                grams: '100',
                pricePer100g: '0',
                totalAmount: '0',
                price: '0',
                category: '',
                countMin: '0',
                priceMin: '0',
                code: ''
            });
        }
    }, [props.product, props.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Для числовых полей проверяем, что значение - число или пустая строка
        const numericFields = ['grams', 'pricePer100g', 'totalAmount', 'price', 'countMin', 'priceMin'];

        if (numericFields.includes(name)) {
            // Разрешаем только числа и точку для десятичных
            const validatedValue = value === '' ? '' : value.replace(/[^0-9.]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: validatedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Преобразуем все числовые значения
        const numericData = {
            grams: parseFloat(formData.grams) || 0,
            pricePer100g: parseFloat(formData.pricePer100g) || 0,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            price: parseFloat(formData.price) || 0,
            countMin: parseInt(formData.countMin) || 0,
            priceMin: parseFloat(formData.priceMin) || 0
        };

        // Формируем данные для бэкенда
        const backendData = {
            product_name: formData.name,
            product_category: formData.category,
            product_type: formData.unitType === 'piece' ? "шт" : "гр",
            product_price_unit: formData.unitType === 'piece' ? numericData.price : numericData.pricePer100g,
            quinity: numericData.totalAmount,
            product_count_min: numericData.countMin,
            product_price_min: numericData.priceMin,
            product_code: formData.code || null, // Отправляем null если код пустой
        };

        // Формируем данные для отображения на фронтенде
        const frontendData = {
            name: formData.name,
            status: 'В наличии',
            price: formData.unitType === 'piece'
                ? `${numericData.price} руб.`
                : `${numericData.pricePer100g} руб. за 100г`,
            unit: formData.unitType === 'piece'
                ? '1 шт.'
                : `${numericData.grams} г`,
            amount: formData.unitType === 'piece'
                ? `${numericData.totalAmount} шт.`
                : `${numericData.totalAmount} г`,
            category: formData.category,
            countMin: numericData.countMin,
            priceMin: numericData.priceMin,
            code: formData.code
        };

        if (props.type === 'add') {
            props.onAdd(backendData, frontendData);
        } else {
            props.onUpdate({
                ...backendData,
                id: props.product.id
            }, {
                ...frontendData,
                id: props.product.id
            });
        }

        props.handleClose();
    };

    return (
        <Modal
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
        >
            <Box sx={{ ...style, width: "80vw" }} className="popup__create-add">
                <div className="popup__header">
                    <div className="popup__title">
                        {props.type === "add" ?
                            <span className="create__item">Создание</span> :
                            <span className="change__item">Редактирование</span>} товара
                    </div>
                    <div className="create-order__button-wrapper">
                        <Button onClick={props.handleClose} className="create-order__button button create-order__button-reject">
                            Отменить&#160;
                            {props.type === "add" ?
                                <span className="create__item">создание</span> :
                                <span className="change__item">редактирование</span>}
                        </Button>
                    </div>
                </div>
                <div className="popup__main">
                    <form className="create__form" onSubmit={handleSubmit}>
                        <h2 className="create__title">Наименование:</h2>
                        <div className="create__form-inner-wrapper">
                            <div className="search-wrapper">
                                <Input
                                    placeholder="Название товара"
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="search"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <h2 className="create__title">Категория:</h2>
                        <div className="create__form-inner-wrapper">
                            <div className="search-wrapper">
                                <Input
                                    placeholder="Категория товара"
                                    type="text"
                                    name="category"
                                    id="category"
                                    className="search"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <h2 className="create__title">В чем измеряется:</h2>
                        <div className="create__form-gram-inner-wrapper">
                            <div className="create__radio-wrapper">
                                <RadioGroup
                                    aria-labelledby="unit-type-group"
                                    name="unitType"
                                    value={formData.unitType}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="piece" control={<Radio />} label="Штука" />
                                    <FormControlLabel value="gramm" control={<Radio />} label="Граммы" />
                                </RadioGroup>
                            </div>

                            {formData.unitType === 'gramm' && (
                                <>
                                    <div className="create__gramm">
                                        <p className="create__gramm-text">
                                            Количество грамм
                                            <Input
                                                placeholder="100"
                                                type="text"
                                                name="grams"
                                                id="grams"
                                                className="gramm"
                                                value={formData.grams}
                                                onChange={handleChange}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                            />
                                        </p>
                                    </div>
                                    <div className="create__gramm-price">
                                        <p className="create__gramm-text">
                                            Цена за <span className="price-gramm">100</span> грамм
                                            <Input
                                                placeholder="0"
                                                type="text"
                                                name="pricePer100g"
                                                id="pricePer100g"
                                                className="price-gramm"
                                                value={formData.pricePer100g}
                                                onChange={handleChange}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                            />
                                            рублей
                                        </p>
                                    </div>
                                </>
                            )}

                            {formData.unitType === 'piece' && (
                                <div className="create__gramm-price">
                                    <p className="create__gramm-text">
                                        Цена за штуку
                                        <Input
                                            placeholder="0"
                                            type="text"
                                            name="price"
                                            id="price"
                                            className="price-gramm"
                                            value={formData.price}
                                            onChange={handleChange}
                                            inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                        />
                                        рублей
                                    </p>
                                </div>
                            )}
                        </div>

                        <h2 className="create__title">Общее количество товара:</h2>
                        <div className="create__form-gram-inner-wrapper">
                            <div className="create__gramm-price">
                                <p className="create__gramm-text">
                                    <Input
                                        placeholder="0"
                                        type="text"
                                        name="totalAmount"
                                        id="totalAmount"
                                        className="price-gramm"
                                        value={formData.totalAmount}
                                        onChange={handleChange}
                                        required
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                    />
                                    {formData.unitType === 'piece' ? 'штук' : 'грамм'}
                                </p>
                            </div>
                        </div>


                        <div className="button-create-wrapper">
                            <Button
                                type="submit"
                                className="create-order__button button button-create"
                            >
                                {props.type === "add" ?
                                    <span className="create__item">Создать товар</span> :
                                    <span className="change__item">Подтвердить редактирование</span>}
                            </Button>
                        </div>
                    </form>
                </div>
            </Box>
        </Modal>
    );
};

export default AddProduct;