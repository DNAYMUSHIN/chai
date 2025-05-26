import React, { useState, useEffect } from 'react';
import { Button, Input } from "@mui/material";
import "./Categories.css";
import CategoriesWarning from "./modals/CategoriesWarning.jsx";

const Categories = () => {
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Реальная функция получения категорий
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error("Не удалось загрузить категории");
            }
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err.message || "Ошибка при загрузке категорий");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async () => {
        if (!category.trim()) return;

        try {
            setLoading(true);

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category_name: category })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Ошибка при создании категории");
            }

            setCategories(prev => [...prev, data]);
            setCategory("");
            setError(null);
        } catch (err) {
            setError(err.message || "Ошибка при создании категории");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (categoryId) => {
        setCategoryToDelete(categoryId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setLoading(true);
            setDeleteModalOpen(false);

            const response = await fetch(`/api/categories/${categoryToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error("Не удалось удалить категорию");
            }

            setCategories(prev => prev.filter(cat => cat.category_id !== categoryToDelete));
            setCategoryToDelete(null);
        } catch (err) {
            setError(err.message || "Ошибка при удалении категории");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    return (
        <section className="workspace">
            <CategoriesWarning
                open={deleteModalOpen}
                handleClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
            />
            <div className="workspace__header">
                <Input
                    type="text"
                    placeholder="Название категории"
                    className="workspace__create-input"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                    disabled={loading}
                />
                <Button
                    className="workspace__create-submit"
                    onClick={handleCreateCategory}
                    disabled={!category.trim() || loading}
                >
                    {loading ? "Создание..." : "Создать категорию"}
                </Button>
            </div>

            <div className="workspace__main">
                {loading && !categories.length ? (
                    <div className="workspace__loading">Загрузка...</div>
                ) : error ? (
                    <div className="workspace__error">{error}</div>
                ) : (
                    <ul className="workspace__list">
                        {categories.map((cat) => (
                            <li key={cat.category_id} className="workspace__item">
                                <p className="workspace__category-name">{cat.category_name}</p>
                                <Button
                                    className="workspace__category-delete"
                                    onClick={() => handleDeleteClick(cat.category_id)}
                                    disabled={loading}
                                >
                                    {loading ? "Удаление..." : "Удалить"}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default Categories;