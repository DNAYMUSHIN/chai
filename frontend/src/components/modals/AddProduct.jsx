import React, { useState, useEffect } from 'react';
import {Box, Button, FormControlLabel, Input, Modal, Radio, RadioGroup} from "@mui/material";
import "./AddProduct.css"

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
        grams: '',
        pricePer100g: '',
        totalAmount: '',
        price: '',
        category: ''
    });

    // Если передан товар для редактирования, заполняем форму его данными
    useEffect(() => {
        if (props.product && props.type === 'change') {
            setFormData({
                name: props.product.name,
                unitType: props.product.unit.includes('г') ? 'gramm' : 'piece',
                grams: props.product.unit.replace(/\D/g, '') || '',
                pricePer100g: props.product.price.replace(/\D/g, '') || '',
                totalAmount: props.product.amount.replace(/\D/g, '') || '',
                price: props.product.price,
                category: props.product.category
            });
        } else {
            // Сброс формы при открытии для создания нового товара
            setFormData({
                name: '',
                unitType: 'piece',
                grams: '',
                pricePer100g: '',
                totalAmount: '',
                price: '',
                category: ''
            });
        }
    }, [props.product, props.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Форматируем данные перед отправкой
        const productData = {
            name: formData.name,
            status: 'В наличии', // Можно сделать выбор статуса в форме
            price: formData.unitType === 'piece'
                ? `${formData.price} руб.`
                : `${formData.pricePer100g} руб. за 100г`,
            unit: formData.unitType === 'piece'
                ? '1 шт.'
                : `${formData.grams} г`,
            amount: formData.unitType === 'piece'
                ? `${formData.totalAmount} шт.`
                : `${formData.totalAmount} г`,
            category: formData.category
        };

        if (props.type === 'add') {
            props.onAdd(productData);
        } else {
            props.onUpdate({ ...productData, id: props.product.id });
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
            <Box sx={{...style, width: "80vw"}} className="popup__create-add">
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
                                                type="number"
                                                name="grams"
                                                id="grams"
                                                className="gramm"
                                                value={formData.grams}
                                                onChange={handleChange}
                                            />
                                        </p>
                                    </div>
                                    <div className="create__gramm-price">
                                        <p className="create__gramm-text">
                                            Цена за <span className="price-gramm">100</span> грамм
                                            <Input
                                                placeholder="0"
                                                type="number"
                                                name="pricePer100g"
                                                id="pricePer100g"
                                                className="price-gramm"
                                                value={formData.pricePer100g}
                                                onChange={handleChange}
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
                                            type="number"
                                            name="price"
                                            id="price"
                                            className="price-gramm"
                                            value={formData.price}
                                            onChange={handleChange}
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
                                        type="number"
                                        name="totalAmount"
                                        id="totalAmount"
                                        className="price-gramm"
                                        value={formData.totalAmount}
                                        onChange={handleChange}
                                        required
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