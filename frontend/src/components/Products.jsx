import React, { useState, useEffect } from 'react';
import { Button, Input } from "@mui/material";
import "./Products.css";
import Excel from "./modals/Excel.jsx";
import AddProduct from "./modals/AddProduct.jsx";

const API_URL_MAIN = "/api/product/";
const API_CATEGORIES = "/api/categories";

const API_URL = {
    getAll: `${API_URL_MAIN}get`,
    getByStatus: `${API_URL_MAIN}status`,
    add: `${API_URL_MAIN}add`,
    update: `${API_URL_MAIN}update`,
    delete: `${API_URL_MAIN}delete`,
    search: `${API_URL_MAIN}p`
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openExcel, setOpenExcel] = useState(false);
    const [openAddProduct, setOpenAddProduct] = useState(false);
    const [productActionType, setProductActionType] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Загрузка категорий
    const fetchCategories = async () => {
        try {
            const response = await fetch(API_CATEGORIES);
            if (!response.ok) throw new Error('Ошибка загрузки категорий');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("Ошибка при загрузке категорий:", err);
        }
    };


    // Загрузка товаров
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Загружаем категории, если еще не загружены
           /* if (categories.length === 0) {
                await fetchCategories();
            }*/

            const response = await fetch(API_URL.getAll);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const formattedProducts = data.map(product => {
                // Находим название категории по ID
                const category = categories.find(c => c.category_id === product.product_category_id);


                return {
                    id: product.product_id,
                    name: product.product_name,
                    status: product.product_status === 1 ? 'В наличии' : 'Нет в наличии',
                    price: `${product.price_unit} руб.${product.product_type === 2 ? ' за 100г' : ''}`,
                    unit: product.product_type === 1 ? '1 шт.' : `${product.quantity} г`,
                    amount: `${product.quantity} ${product.product_type === 1 ? 'шт.' : 'г'}`,
                    category: category ? category.category_name : 'Без категории',
                    rawData: product
                };
            });

            setProducts(formattedProducts);
        } catch (err) {
            console.error("Ошибка при загрузке товаров:", err);
            setError("Не удалось загрузить товары. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

   /* useEffect(() => {
        fetchCategories().then(() => {
                console.log(categories);
                fetchProducts();
            }
        );
    }, []);*/



    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Сначала загружаем категории
                const categoriesResponse = await fetch(API_CATEGORIES);
                if (!categoriesResponse.ok) throw new Error('Ошибка загрузки категорий');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Затем загружаем товары
                const productsResponse = await fetch(API_URL.getAll);
                if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status}`);
                const productsData = await productsResponse.json();

                // Форматируем товары с учетом загруженных категорий
                const formattedProducts = productsData.map(product => {
                    const category = categoriesData.find(c => c.category_id === product.product_category_id);
                    return {
                        id: product.product_id,
                        name: product.product_name,
                        status: product.product_status === 1 ? 'В наличии' : 'Нет в наличии',
                        price: `${product.price_unit} руб.${product.product_type === 2 ? ' за 100г' : ''}`,
                        unit: product.product_type === 1 ? '1 шт.' : `${product.quantity} г`,
                        amount: `${product.quantity} ${product.product_type === 1 ? 'шт.' : 'г'}`,
                        category: category ? category.category_name : 'Без категории',
                        rawData: product
                    };
                });

                setProducts(formattedProducts);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError("Не удалось загрузить данные. Попробуйте позже.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);



    // Обновляем товары при изменении категорий
    useEffect(() => {
        if (categories.length > 0 && products.length > 0) {
            const updatedProducts = products.map(product => {
                const category = categories.find(c => c.category_id === product.rawData.product_category_id);
                return {
                    ...product,
                    category: category ? category.category_name : 'Без категории'
                };
            });
            setProducts(updatedProducts);
        }
    }, [categories]);

    // Фильтрация товаров
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Остальные методы остаются без изменений
    const handleOpenAdd = () => {
        setProductActionType('add');
        setSelectedProduct(null);
        setOpenAddProduct(true);
    };

    const handleOpenEdit = (product) => {
        setProductActionType('edit');
        setSelectedProduct(product);
        setOpenAddProduct(true);
    };

    const handleAddProduct = async (productData) => {
        try {
            setLoading(true);
            const response = await fetch(API_URL.add, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            await fetchProducts();
            return true;
        } catch (err) {
            console.error("Ошибка при добавлении товара:", err);
            setError("Не удалось добавить товар. Попробуйте позже.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (productId, updates) => {
        try {
            setLoading(true);
            for (const [field, value] of Object.entries(updates)) {
                const response = await fetch(API_URL.update, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productId, field, value })
                });
                if (!response.ok) throw new Error(`Error updating ${field}`);
            }
            await fetchProducts();
            return true;
        } catch (err) {
            console.error("Ошибка при обновлении товара:", err);
            setError("Не удалось обновить товар. Попробуйте позже.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            setLoading(true);
            const response = await fetch(API_URL.delete, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error("Ошибка при удалении товара:", err);
            setError("Не удалось удалить товар. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="workspace products">
            <Excel open={openExcel} handleClose={() => setOpenExcel(false)} />
            <AddProduct
                open={openAddProduct}
                type={productActionType}
                handleClose={() => setOpenAddProduct(false)}
                product={selectedProduct}
                onAdd={handleAddProduct}
                onUpdate={(data) => handleUpdateProduct(selectedProduct.id, data)}
            />

            <div className="workspace__header">
                <Button onClick={() => setOpenExcel(true)} className="excel">
                    Выгрузить в Excel
                </Button>
                <Button onClick={handleOpenAdd} className="workspace__add-product">
                    Добавить товар
                </Button>
                <Input
                    type="text"
                    placeholder="Поиск"
                    className="workspace__search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ul className="workspace__features">
                    <li className="workspace__feature">Наименование</li>
                    <li className="workspace__feature">Статус</li>
                    <li className="workspace__feature">Цена за ед.</li>
                    <li className="workspace__feature">Измерительная еденица</li>
                    <li className="workspace__feature">Общее кол-во</li>
                    <li className="workspace__feature">Категория</li>
                    <li className="workspace__feature">Изменить</li>
                </ul>
            </div>

            <div className="workspace__main">
                {loading ? (
                    <div className="workspace__loading">Загрузка товаров...</div>
                ) : error ? (
                    <div className="workspace__error">{error}</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="workspace__empty">
                        {searchTerm ? 'Ничего не найдено' : 'Нет товаров'}
                    </div>
                ) : (
                    <ul className="workspace__list orders-list">
                        {filteredProducts.map((product) => (
                            <li key={product.id} className="workspace__item order orders-list__item">
                                <p className="order__number">{product.name}</p>
                                <p className="status">{product.status}</p>
                                <p className="price-piece">{product.price}</p>
                                <p className="unit">{product.unit}</p>
                                <p className="amount">{product.amount}</p>
                                <p className="category">{product.category}</p>
                                <div className="actions">
                                    <Button onClick={() => handleOpenEdit(product)} className="change button">
                                        Изменить
                                    </Button>
                                    <Button onClick={() => handleDeleteProduct(product.id)} className="delete button">
                                        Удалить
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default Products;