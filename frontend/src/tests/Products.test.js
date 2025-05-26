// fakeFetchApi.js

// Инициализация тестовых данных
let products = [
    {
        product_id: 1,
        product_name: "Тестовый продукт 1",
        product_category_id: 1,
        product_type: 1,
        price_unit: 100,
        quantity: 10,
        product_status: 1,
        product_count_min: 2,
        product_price_min: 80,
        product_code: "12345"
    },
    {
        product_id: 1,
        product_name: "Тестовый продукт с длинным названием",
        product_category_id: 1,
        product_type: 1,
        price_unit: 100,
        quantity: 10,
        product_status: 1,
        product_count_min: 2,
        product_price_min: 80,
        product_code: "12345"
    },
    {
        product_id: 2,
        product_name: "Тестовый продукт 2",
        product_category_id: 2,
        product_type: 2,
        price_unit: 250,
        quantity: 500,
        product_status: 1,
        product_count_min: 100,
        product_price_min: 200,
        product_code: "54321"
    }
];

let categories = [
    { category_id: 1, category_name: "Категория 1" },
    { category_id: 2, category_name: "Категория 2" },
    { category_id: 3, category_name: "Категория 3" }
];

let nextProductId = 3;

// Имитация API
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

    // GET /api/product/get - получение всех продуктов
    if (url === '/api/product/get' && !options.method) {
        return {
            ok: true,
            json: async () => [...products],
        };
    }

    // POST /api/product/add - добавление нового продукта
    if (url === '/api/product/add' && options.method === 'POST') {
        const body = JSON.parse(options.body);

        // Находим ID категории по названию
        const category = categories.find(c => c.category_name === body.product_category);

        const newProduct = {
            product_id: nextProductId++,
            product_name: body.product_name,
            product_category_id: category ? category.category_id : null,
            product_type: body.product_type,
            price_unit: body.product_price_unit,
            quantity: body.quinity,
            product_status: 1,
            product_count_min: body.product_count_min,
            product_price_min: body.product_price_min,
            product_code: body.product_code?.toString() || ""
        };

        products.push(newProduct);

        return {
            ok: true,
            json: async () => newProduct,
        };
    }

    // PUT /api/product/update - обновление продукта
    if (url === '/api/product/update' && options.method === 'PUT') {
        const body = JSON.parse(options.body);
        const productIndex = products.findIndex(p => p.product_id === body.product_id);

        if (productIndex === -1) {
            return {
                ok: false,
                status: 404,
                json: async () => ({ message: "Продукт не найден" }),
            };
        }

        // Обновляем только указанные поля
        if (body.field === 'product_name') products[productIndex].product_name = body.value;
        if (body.field === 'product_category') {
            products[productIndex].product_category_id = categories.find(c => c.category_name === body.value)?.category_id || null;
        }
        if (body.field === 'product_type') products[productIndex].product_type = body.value;
        if (body.field === 'price_unit') products[productIndex].price_unit = parseFloat(body.value);
        if (body.field === 'quantity') products[productIndex].quantity = parseFloat(body.value);

        return {
            ok: true,
            json: async () => ({ message: "Продукт успешно обновлен" }),
        };
    }

    // DELETE /api/product/delete - удаление продукта
    if (url === '/api/product/delete' && options.method === 'DELETE') {
        const body = JSON.parse(options.body);
        const initialLength = products.length;

        products = products.filter(p => p.product_id !== body.product_id);

        if (products.length === initialLength) {
            return {
                ok: false,
                status: 404,
                json: async () => ({ message: "Продукт не найден" }),
            };
        }

        return {
            ok: true,
            json: async () => ({ message: "Продукт успешно удален" }),
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