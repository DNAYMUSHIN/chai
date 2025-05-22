import React, { useState, useEffect } from 'react';
import { Button, Input } from "@mui/material";
import "./Products.css";
import Excel from "./modals/Excel.jsx";
import AddProduct from "./modals/AddProduct.jsx";

// Заглушка для имитации API товаров
const fetchProducts = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Конфета "Три медвежонка в сосновом бору"',
                        status: 'В работе',
                        price: '10 руб.',
                        unit: '1 шт.',
                        amount: '1 шт.',
                        category: 'Конфеты'
                    },
                    {
                        id: 2,
                        name: 'Зеленый чай "Жасминовый"',
                        status: 'В наличии',
                        price: '250 руб.',
                        unit: '100 г',
                        amount: '15 упак.',
                        category: 'Зеленый чай'
                    },
                    {
                        id: 3,
                        name: 'Кофе "Эспрессо Премиум"',
                        status: 'Нет в наличии',
                        price: '350 руб.',
                        unit: '250 г',
                        amount: '0 упак.',
                        category: 'Кофе'
                    }
                ]
            });
        }, 500);
    });
};

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
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await fetchProducts();
                if (response.success) {
                    setProducts(response.data);
                } else {
                    setError("Не удалось загрузить товары");
                }
            } catch (err) {
                setError("Ошибка при загрузке товаров");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
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

    const handleAddProduct = (newProduct) => {
        // В реальном приложении здесь будет вызов API
        setProducts(prev => [...prev, {
            ...newProduct,
            id: Date.now(),
            status: 'В наличии' // Добавляем статус по умолчанию
        }]);
    };

    const handleUpdateProduct = (updatedProduct) => {
        // В реальном приложении здесь будет вызов API
        setProducts(prev =>
            prev.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        );
    };

    const handleDeleteProduct = (productId) => {
        // В реальном приложении здесь будет вызов API
        setProducts(prev => prev.filter(product => product.id !== productId));
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