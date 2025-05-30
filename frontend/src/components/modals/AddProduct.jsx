import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    Input,
    Modal,
    Radio,
    RadioGroup,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import "./AddProduct.css";

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
        quantity: '0',
        price_for_grams: '100',
        product_count_min: '0',
        product_price_min: '0',
        product_code: ''
    });

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Загрузка категорий
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await fetch('/api/categories');
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
                product_price_unit: product.price_unit?.toString() || '0',
                quantity: product.quantity?.toString() || '0',
                price_for_grams: product.price_for_grams?.toString() || '100',
                product_count_min: product.product_count_min?.toString() || '0',
                product_price_min: product.product_price_min?.toString() || '0',
                product_code: product.product_code?.toString() || ''
            });
        } else {
            setFormData({
                product_name: '',
                product_category_id: '',
                product_type: 'шт',
                product_price_unit: '0',
                quantity: '0',
                price_for_grams: '100',
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
            'quantity',
            'price_for_grams',
            'product_count_min',
            'product_price_min',
            'product_code'
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
            product_price_unit: '0',
            ...(type === 'шт' ? {} : { price_for_grams: '100' })
        }));
    };

    const handleFocus = (e) => {
        const { name, value } = e.target;

        const defaultValues = {
            product_price_unit: '0',
            quantity: '0',
            price_for_grams: '100',
            product_count_min: '0',
            product_price_min: '0',
            product_code: '0'
        };

        if (defaultValues[name] && value === defaultValues[name]) {
            setFormData(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        const defaultValues = {
            product_price_unit: '0',
            quantity: '0',
            price_for_grams: '100',
            product_count_min: '0',
            product_price_min: '0',
            product_code: '0'
        };

        if (defaultValues[name] && value === '') {
            setFormData(prev => ({ ...prev, [name]: defaultValues[name] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const selectedCategory = categories.find(c => c.category_id.toString() === formData.product_category_id);
        const categoryName = selectedCategory?.category_name || '';

        const submissionData = {
            product_name: formData.product_name,
            product_category: categoryName,
            product_type: formData.product_type === 'шт' ? 1 : 2,
            product_price_unit: parseFloat(formData.product_price_unit) || 0,
            quantity: parseFloat(formData.quantity) || 0,
            price_for_grams: formData.product_type === 'гр' ? parseInt(formData.price_for_grams) || 100 : null,
            product_count_min: parseFloat(formData.product_count_min) || 0,
            product_price_min: parseFloat(formData.product_price_min) || 0,
            product_code: parseInt(formData.product_code) || null
        };

        if (props.type === 'add') {
            props.onAdd(submissionData);
        } else {
            const originalProduct = props.product.rawData;
            const updates = {};

            if (formData.product_name !== originalProduct.product_name)
                updates.product_name = formData.product_name;

            if (formData.product_category_id !== originalProduct.product_category_id?.toString())
                updates.product_category = categoryName;

            const newType = formData.product_type === 'шт' ? 1 : 2;
            if (newType !== originalProduct.product_type)
                updates.product_type = newType;

            if (parseFloat(formData.product_price_unit) !== originalProduct.price_unit)
                updates.price_unit = parseFloat(formData.product_price_unit) || 0;

            if (parseFloat(formData.quantity) !== originalProduct.quantity)
                updates.quantity = parseFloat(formData.quantity) || 0;

            if (formData.product_type === 'гр') {
                const newPriceForGrams = parseInt(formData.price_for_grams);
                if (!isNaN(newPriceForGrams) && newPriceForGrams !== originalProduct.price_for_grams) {
                    updates.price_for_grams = newPriceForGrams;
                }
            } else {
                // Если тип шт — явно ставим price_for_grams = null
                if (originalProduct.price_for_grams !== null) {
                    updates.price_for_grams = null;
                }
            }

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
            <Box sx={{...style}} className="popup__create-add">
                <div className="popup__header">
                    <h2 className="popup__title">
                        {props.type === "add" ? (
                            <span className="create__item">Создание</span>
                        ) : (
                            <span className="change__item">Редактирование</span>
                        )} товара
                    </h2>
                    <div className="create-order__button-wrapper">
                        <Button onClick={props.handleClose} className="create-order__button button create-order__button-reject">
                            Отменить&nbsp;
                            {props.type === "add" ? (
                                <span className="create__item">создание</span>
                            ) : (
                                <span className="change__item">редактирование</span>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="popup__main">
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
                                        <MenuItem key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="create__form-gram-inner-wrapper">
                            <h3 className="create__title">В чем измеряется:</h3>
                            <RadioGroup
                                row
                                name="product_type"
                                value={formData.product_type}
                                onChange={handleTypeChange}
                            >
                                <FormControlLabel value="шт" control={<Radio />} label="Штука" />
                                <FormControlLabel value="гр" control={<Radio />} label="Граммы" />
                            </RadioGroup>

                            <div className="create__gramm-price">
                                <div className="create__gramm-text">
                                    {formData.product_type === 'шт' ? (
                                        <>
                                            <Input
                                                placeholder="0"
                                                type="text"
                                                name="product_price_unit"
                                                className="price-gramm"
                                                value={formData.product_price_unit}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                                required
                                            />&nbsp;рублей за штуку
                                        </>
                                    ) : (
                                        <>
                                            <Input
                                                placeholder="0"
                                                type="text"
                                                name="product_price_unit"
                                                className="price-gramm"
                                                value={formData.product_price_unit}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                                required
                                            />&nbsp;рублей за&nbsp;
                                            <Input
                                                placeholder="100"
                                                type="text"
                                                name="price_for_grams"
                                                className="price-gramm"
                                                value={formData.price_for_grams}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                            />&nbsp;грамм
                                        </>
                                    )}
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
                                        name="quantity"
                                        className="price-gramm"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        required
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                                    />
                                    &nbsp;
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
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                            />
                        </div>

                        <div className="create__form-inner-wrapper">
                            <h3 className="create__title">Цена к закупке:</h3>
                            <Input
                                placeholder="0"
                                type="text"
                                name="product_price_min"
                                className="search"
                                value={formData.product_price_min}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9.]*' }}
                            />
                        </div>

                        <div className="button-create-wrapper">
                            <Button type="submit" className="create-order__button button button-create">
                                {props.type === "add" ? (
                                    <span className="create__item">Создать товар</span>
                                ) : (
                                    <span className="change__item">Подтвердить редактирование</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Box>
        </Modal>
    );
};

export default AddProduct;