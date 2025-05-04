/*Таблица Customers*/
CREATE TABLE Customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(50) NOT NULL,
    phoneNumber TEXT UNIQUE,
    customer_password TEXT NOT NULL
);

/*Таблица Admin*/
CREATE TABLE Admin (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(50) NOT NULL,
    admin_password TEXT NOT NULL
);

/*Таблица Category*/
CREATE TABLE Category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL UNIQUE

);

CREATE TABLE CategoryItems (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    item_category_id UUID,
    item_name TEXT NOT NULL,
    FOREIGN KEY (item_category_id) REFERENCES Category (category_id)
);


/* Таблица Product */

CREATE TABLE Product (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_category_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_type INTEGER NOT NULL CHECK (product_type IN (1, 2)), -- 1 = шт., 2 = гр.
    price_unit NUMERIC(10, 2) NOT NULL,
    quantity INTEGER CHECK (quantity >= 0),
    product_count_min INTEGER NOT NULL CHECK (product_count_min >= 0),
    product_price_min NUMERIC(10, 2) NOT NULL,
    product_status INTEGER NOT NULL CHECK (product_status IN (0, 1)), -- 0 = неактивен, 1 = активен
    product_code INTEGER UNIQUE,
    CONSTRAINT fk_product_category FOREIGN KEY (product_category_id) REFERENCES Category (category_id) ON DELETE CASCADE
);

/* Таблица Orders */
CREATE TABLE Orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    customer_id UUID, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL CHECK (status IN (0, 1, 2)), 
    total NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES Admin (admin_id) ON DELETE SET NULL,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES Customers (customer_id) ON DELETE CASCADE
);


/* Таблица OrderItems */
CREATE TABLE OrderItems (
    order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,      -- Цена на момент покупки
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES Orders (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES Product (product_id) ON DELETE CASCADE
);


/* Таблица OrderHistory */
CREATE TABLE OrderHistory (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    phoneNumber TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL CHECK (status IN (0, 1, 2)), -- 0 = новый, 1 = в обработке, 2 = завершён
    total NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_history_customer FOREIGN KEY (customer_id) REFERENCES Customers (customer_id) ON DELETE CASCADE
);

