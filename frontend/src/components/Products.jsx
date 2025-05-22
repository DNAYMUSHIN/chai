import React, { useState, useEffect } from 'react';
import { Button, Input } from "@mui/material";
import "./Products.css";
import Excel from "./modals/Excel.jsx";
import AddProduct from "./modals/AddProduct.jsx";

const API_URL = '/api/product'; // Ваш API endpoint

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openExcel, setOpenExcel] = useState(false);
    const [openAddProduct, setOpenAddProduct] = useState(false);
    const [productActionType, setProductActionType] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Загрузка товаров
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error("Не удалось загрузить товары");
            }
            const data = await response.json();

            // Преобразуем данные из бэкенда в нужный формат
            const formattedProducts = data.map(product => ({
                id: product.product_id,
                name: product.product_name,
                status: product.product_status === 1 ? 'В наличии' : 'Нет в наличии',
                price: `${product.price_unit} руб.${product.product_type === 2 ? ' за 100г' : ''}`,
                unit: product.product_type === 1 ? '1 шт.' : `${product.quantity} г`,
                amount: `${product.quantity} ${product.product_type === 1 ? 'шт.' : 'г'}`,
                category: product.category_name || 'Без категории'
            }));

            setProducts(formattedProducts);
        } catch (err) {
            setError(err.message || "Ошибка при загрузке товаров");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Фильтрация товаров по поисковому запросу
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setProductActionType('add');
        setSelectedProduct(null);
        setOpenAddProduct(true);
    };

    const handleOpenEdit = (product) => {
        setProductActionType('change');
        setSelectedProduct(product);
        setOpenAddProduct(true);
    };

    const handleAddProduct = async (backendData, frontendData) => {
        try {
            const response = await fetch(`${API_URL}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) {
                throw new Error("Ошибка при добавлении товара");
            }

            const data = await response.json();
            setProducts(prev => [...prev, {
                ...frontendData,
                id: data.product.product_id
            }]);
        } catch (err) {
            console.error('Ошибка при добавлении товара:', err);
        }
    };

    const handleUpdateProduct = async (updatedProduct) => {
        try {
            const response = await fetch(`${API_URL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: updatedProduct.id,
                    field: 'product_name',
                    value: updatedProduct.name
                })
            });

            if (!response.ok) {
                throw new Error("Ошибка при обновлении товара");
            }

            setProducts(prev =>
                prev.map(product =>
                    product.id === updatedProduct.id ? updatedProduct : product
                )
            );
        } catch (err) {
            console.error('Ошибка при обновлении товара:', err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId })
            });

            if (!response.ok) {
                throw new Error("Ошибка при удалении товара");
            }

            setProducts(prev => prev.filter(product => product.id !== productId));
        } catch (err) {
            console.error('Ошибка при удалении товара:', err);
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
                onUpdate={handleUpdateProduct}
            />

            {/* Остальная часть JSX остается без изменений */}
            <div className="workspace__header">
                <Button onClick={() => setOpenExcel(true)} className="excel">
                    Выгрузить в Excel
                </Button>
                <Button
                    onClick={handleOpenAdd}
                    className="workspace__add-product"
                >
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
                                    <Button
                                        onClick={() => handleOpenEdit(product)}
                                        className="change button"
                                    >
                                        Изменить
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="delete button"
                                    >
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