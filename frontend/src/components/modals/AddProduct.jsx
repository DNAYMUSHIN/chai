import React, { useState, useEffect } from 'react';
import { Box, Button, FormControlLabel, Input, Modal, Radio, RadioGroup, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./AddProduct.css";
import fakeFetchApi from "../../tests/Products.test.js";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    borderRadius: '2rem',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    overflowY: 'auto',
};

const AddProduct = (props) => {
    const [formData, setFormData] = useState({
        product_name: '',
        product_category_id: '',
        product_type: 'шт',
        product_price_unit: '0',
        quinity: '0',
        product_count_min: '0',
        product_price_min: '0',
        product_code: ''
    });

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Загрузка категорий при монтировании
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await fakeFetchApi('/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Ошибка загрузки категорий:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Инициализация формы при редактировании
    useEffect(() => {
        if (props.product && props.type === 'edit') {
            const product = props.product.rawData;
            setFormData({
                product_name: product.product_name,
                product_category_id: product.product_category_id?.toString() || '',
                product_type: product.product_type === 1 ? 'шт' : 'гр',
                product_price_unit: product.price_unit.toString(),
                quinity: product.quantity.toString(),
                product_count_min: product.product_count_min?.toString() || '0',
                product_price_min: product.product_price_min?.toString() || '0',
                product_code: product.product_code || ''
            });
        } else {
            setFormData({
                product_name: '',
                product_category_id: '',
                product_type: 'шт',
                product_price_unit: '0',
                quinity: '0',
                product_count_min: '0',
                product_price_min: '0',
                product_code: ''
            });
        }
    }, [props.product, props.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericFields = [
            'product_price_unit',
            'quinity',
            'product_count_min',
            'product_price_min'
        ];

        if (numericFields.includes(name)) {
            const validatedValue = value === '' ? '' : value.replace(/[^0-9.]/g, '');
            setFormData(prev => ({ ...prev, [name]: validatedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            product_type: type,
            product_price_unit: '0'
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Находим название категории по ID
        const selectedCategory = categories.find(c => c.category_id.toString() === formData.product_category_id);
        const categoryName = selectedCategory ? selectedCategory.category_name : '';

        if (props.type === 'add') {
            // Логика для добавления (оставляем как есть)
            const submissionData = {
                product_name: formData.product_name,
                product_category: categoryName,
                product_type: formData.product_type === 'шт' ? 1 : 2,
                product_price_unit: parseFloat(formData.product_price_unit) || 0,
                quinity: parseFloat(formData.quinity) || 0,
                product_count_min: parseFloat(formData.product_count_min) || 0,
                product_price_min: parseFloat(formData.product_price_min) || 0,
                product_code: parseInt(formData.product_code || '')
            };
            props.onAdd(submissionData);
        } else {
            // Логика для редактирования
            const originalProduct = props.product.rawData;
            const updates = {};

            // Проверяем каждое поле на изменения
            if (formData.product_name !== originalProduct.product_name)
                updates.product_name = formData.product_name;

            if (formData.product_category_id !== originalProduct.product_category_id?.toString())
                updates.product_category = categoryName; // Отправляем название категории

            if ((formData.product_type === 'шт' ? 1 : 2) !== originalProduct.product_type)
                updates.product_type = formData.product_type === 'шт' ? 1 : 2;

            if (parseFloat(formData.product_price_unit) !== originalProduct.price_unit)
                updates.price_unit = parseFloat(formData.product_price_unit) || 0;

            if (parseFloat(formData.quinity) !== originalProduct.quantity)
                updates.quantity = parseFloat(formData.quinity) || 0;

            props.onUpdate(updates);
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
            <Box sx={{ ...style }} className="popup__create-add">
                <div className="popup__header">
                    <h2 className="popup__title">
                        {props.type === "add" ?
                            <span className="create__item">Создание</span> :
                            <span className="change__item">Редактирование</span>} товара
                    </h2>
                    <div className="create-order__button-wrapper">
                        <Button onClick={props.handleClose} className="create-order__button button create-order__button-reject">
                            Отменить&#160;
                            {props.type === "add" ?
                                <span className="create__item">создание</span> :
                                <span className="change__item">редактирование</span>}
                        </Button>
                    </div>
                </div>{/*maxHeight: 'calc(90vh - 120px)', */}
                <div className="popup__main" style={{ overflowY: 'auto' }}>
                    <form className="create__form" onSubmit={handleSubmit}>
                        <div className="create__form-inner-wrapper">
                            <h3 className="create__title">Наименование:</h3>
                            <Input
                                placeholder="Название товара"
                                type="text"
                                name="product_name"
                                className="name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="create__form-inner-wrapper">
                            <h3 className="create__title">Категория:</h3>
                            <FormControl fullWidth>
                                <InputLabel id="category-select-label">Категория</InputLabel>
                                <Select
                                    labelId="category-select-label"
                                    name="product_category_id"
                                    value={formData.product_category_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingCategories}
                                >
                                    <MenuItem value="">Выберите категорию</MenuItem>
                                    {categories.map(category => (
                                        <MenuItem
                                            key={category.category_id}
                                            value={category.category_id}
                                        >
                                            {category.category_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="create__form-gram-inner-wrapper">
                            <h3 className="create__title">В чем измеряется:</h3>
                            <div className="create__radio-wrapper">
                                <RadioGroup
                                    aria-labelledby="unit-type-group"
                                    name="product_type"
                                    value={formData.product_type}
                                    onChange={handleTypeChange}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}
                                >
                                    <FormControlLabel value="шт" control={<Radio/>} label="Штука"/>
                                    <FormControlLabel value="гр" control={<Radio/>} label="Граммы"/>
                                </RadioGroup>
                            </div>

                            <div className="create__gramm-price">
                                <div className="create__gramm-text">
                                    Цена за {formData.product_type === 'шт' ? 'штуку' : '100 грамм'}&#160;
                                    <Input
                                        placeholder="0"
                                        type="text"
                                        name="product_price_unit"
                                        className="price-gramm"
                                        value={formData.product_price_unit}
                                        onChange={handleChange}
                                        inputProps={{inputMode: 'numeric', pattern: '[0-9.]*'}}
                                        required
                                    />&#160;
                                    рублей
                                </div>
                            </div>
                        </div>

                        <div className="create__form-gram-inner-wrapper">
                            <h3 className="create__title">Общее количество товара:</h3>
                            <div className="create__gramm-price">
                                <div className="create__gramm-text">
                                    <Input
                                        placeholder="0"
                                        type="text"
                                        name="quinity"
                                        className="price-gramm"
                                        value={formData.quinity}
                                        onChange={handleChange}
                                        required
                                        inputProps={{inputMode: 'numeric', pattern: '[0-9.]*'}}
                                    />
                                    {formData.product_type === 'шт' ? 'штук' : 'грамм'}
                                </div>
                            </div>
                        </div>

                        <div className="create__form-inner-wrapper">
                            <h3 className="create__title">Минимальное количество:</h3>
                            <Input
                                placeholder="0"
                                type="text"
                                name="product_count_min"
                                className="search"
                                value={formData.product_count_min}
                                onChange={handleChange}
                                inputProps={{inputMode: 'numeric', pattern: '[0-9.]*'}}
                            />
                        </div>

                        <div className="create__form-inner-wrapper">
                            <h3 className="create__title">Минимальная цена:</h3>
                            <Input
                                placeholder="0"
                                type="text"
                                name="product_price_min"
                                className="search"
                                value={formData.product_price_min}
                                onChange={handleChange}
                                inputProps={{inputMode: 'numeric', pattern: '[0-9.]*'}}
                            />
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