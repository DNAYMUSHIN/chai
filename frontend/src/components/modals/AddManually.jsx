import React, { useState } from 'react';
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
        onAddProduct({
            product_id: product.product_id, // ← Это обязательно
            id: product.product_id,        // ← Для совместимости с CreateOrder
            name: product.product_name,
            price: product.price || product.quantity // Исправлено: price вместо quantity
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
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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