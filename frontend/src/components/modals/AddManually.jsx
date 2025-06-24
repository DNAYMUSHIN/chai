import React, {useState, useEffect, useRef} from 'react';
import {Modal, Box, Button, Input} from "@mui/material";
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

const AddManually = ({open, onClose, onAddProduct}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);


    useEffect(() => {
        if (open) {
            // Добавляем небольшую задержку для гарантии рендера модального окна
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [open]);

    // Автоматический поиск при изменении строки поиска
    useEffect(() => {
        if (searchQuery.trim()) {
            const timer = setTimeout(() => {
                handleSearch();
            }, 200);
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
                body: JSON.stringify({query: searchQuery})
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
        if (!product.product_id) {
            console.error("Невозможно добавить товар без ID", product);
            alert("Выбранный товар не имеет корректного ID");
            return;
        }

        onAddProduct({
            product_id: product.product_id,
            name: product.product_name || 'Неизвестный товар',
            price: product.price_unit || 0,
            quantity: 1,
            total: 0,
            quantityInStock: product.quantity,
            product_type: product.product_type,
            price_for_grams: product.price_for_grams,
            product_count_min: product.product_count_min
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
                        inputRef={inputRef}
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
                                    <span style={{marginRight: "1rem"}}>{product.product_name}</span>
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