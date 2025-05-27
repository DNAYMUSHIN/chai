import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Input } from "@mui/material";
import "./AddManually.css"

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60vw',
    bgcolor: 'background.paper',
    borderRadius: '2rem',
    boxShadow: 24,
    p: 4,
};

const AddManually = ({ open, onClose, onAddProduct }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔁 Автоматический поиск при изменении строки поиска
    useEffect(() => {
        if (searchQuery.trim()) {
            const timer = setTimeout(() => {
                handleSearch();
            }, 500); // Дебанс на 500 мс
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/product/p', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ query: searchQuery })
            });

            if (!response.ok) {
                throw new Error(response.status === 400
                    ? 'Введите поисковый запрос'
                    : 'Ошибка поиска товаров');
            }

            const results = await response.json();
            setSearchResults(results);
        } catch (error) {
            console.error('Ошибка поиска:', error.message);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToOrder = (product) => {
        if (!product.id && !product.product_id) {
            console.error("Невозможно добавить товар без ID", product);
            alert("Выбранный товар не имеет корректного ID");
            return;
        }

        onAddProduct({
            product_id: product.product_id || product.id,
            id: product.id || product.product_id,
            name: product.product_name || product.name || 'Неизвестный товар',
            price: parseFloat(product.price_unit),
            quantity: 1,
            total: parseFloat(product.price_unit)
        });
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="add-manually-modal"
        >
            <Box sx={style} className="add-manually-modal">
                <h2>Добавить товар вручную</h2>

                <div className="search-container">
                    <Input
                        type="text"
                        placeholder="Поиск товаров..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                    >
                        Поиск
                    </Button>
                </div>

                <div className="search-results-wrapper">

                    {loading ? (
                        <div>Загрузка...</div>
                    ) : searchResults.length > 0 ? (
                        <ul className="search-results">
                            {searchResults.map(product => (
                                <li key={product.product_id} className="search-result-item">
                                    <span>{product.product_name} - {product.quantity} руб.</span>
                                    <Button variant="contained"
                                            onClick={() => handleAddToOrder(product)}
                                    >
                                        Добавить
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : searchQuery ? (
                        <div>Товары не найдены</div>
                    ) : null}
                </div>

                <div className="modal-actions">
                    <Button onClick={onClose}>Закрыть</Button>
                </div>
            </Box>
        </Modal>
    );
};

export default AddManually;