// fakeFetchApi.js

let categories = [
    { category_id: 1, category_name: "Первая категория" },
    { category_id: 2, category_name: "Вторая категория" },
    { category_id: 3, category_name: "Третья категория" },
];

let nextId = 4;

const fakeFetchApi = async (url, options = {}) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    // GET /api/categories - получение списка категорий
    if (url === '/api/categories' && !options.method) {
        return {
            ok: true,
            json: async () => [...categories],
        };
    }

    // POST /api/categories - создание новой категории
    if (url === '/api/categories' && options.method === 'POST') {
        const body = JSON.parse(options.body);
        if (!body.category_name) {
            return {
                ok: false,
                status: 400,
                json: async () => ({ message: "Не указано название категории" }),
            };
        }

        const newCategory = {
            category_id: nextId++,
            category_name: body.category_name,
        };

        categories.push(newCategory);

        return {
            ok: true,
            json: async () => newCategory,
        };
    }

    // DELETE /api/categories/:id - удаление категории
    if (url.startsWith('/api/categories/') && options.method === 'DELETE') {
        const categoryId = parseInt(url.split('/').pop(), 10);
        const initialLength = categories.length;

        categories = categories.filter(cat => cat.category_id !== categoryId);

        if (categories.length === initialLength) {
            return {
                ok: false,
                status: 404,
                json: async () => ({ message: "Категория не найдена" }),
            };
        }

        return {
            ok: true,
            json: async () => ({ message: "Категория успешно удалена" }),
        };
    }

    // Если URL не распознан
    return {
        ok: false,
        status: 404,
        json: async () => ({ message: "Неизвестный endpoint" }),
    };
};

export default fakeFetchApi;