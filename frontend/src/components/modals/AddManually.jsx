import React, { useState } from 'react';
import { Modal, Box, Button, Input } from "@mui/material";

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

// Заглушка для поиска товаров
const searchProducts = async (query) => {
    const mockProducts = [
        { id: 1, name: 'Конфета "Три медвежонка"', price: '10 руб.' },
        { id: 2, name: 'Зеленый чай', price: '250 руб.' },
        { id: 3, name: 'Кофе "Эспрессо"', price: '350 руб.' },
    ];

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockProducts.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase())
            ));
        }, 300);
    });
};

const AddManually = ({ open, onClose, onAddProduct }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const results = await searchProducts(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToOrder = (product) => {
        onAddProduct(product);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="add-manually-modal"
        >
            <Box sx={style}>
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

                {loading ? (
                    <div>Загрузка...</div>
                ) : searchResults.length > 0 ? (
                    <ul className="search-results">
                        {searchResults.map(product => (
                            <li key={product.id} className="search-result-item">
                                <span>{product.name} - {product.price}</span>
                                <Button
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

                <div className="modal-actions">
                    <Button onClick={onClose}>Закрыть</Button>
                </div>
            </Box>
        </Modal>
    );
};

export default AddManually;