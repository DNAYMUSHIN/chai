/* Таблица Product */
CREATE TABLE Product (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_category_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_type INTEGER NOT NULL CHECK (product_type IN (1, 2)), -- 1 = шт., 2 = гр.
    price_unit NUMERIC(10, 2) NOT NULL, -- цена за единицу (шт./грамм)
    price_for_grams INTEGER CHECK (price_for_grams > 0), -- X рублей за price_for_grams грамм (только для product_type = 2)
    quantity INTEGER CHECK (quantity >= 0),
    product_count_min INTEGER NOT NULL CHECK (product_count_min >= 0),
    product_price_min NUMERIC(10, 2) NOT NULL,
    product_status INTEGER NOT NULL CHECK (product_status IN (0, 1, 2)), -- 0 = неактивен, 1 = активен
    product_code INTEGER UNIQUE,
    CONSTRAINT fk_product_category FOREIGN KEY (product_category_id) REFERENCES Category (category_id) ON DELETE CASCADE
);