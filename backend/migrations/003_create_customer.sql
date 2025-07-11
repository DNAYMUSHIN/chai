/*Таблица Customers*/
CREATE TABLE Customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(50) NOT NULL,
    phoneNumber TEXT UNIQUE,
    customer_password TEXT NOT NULL
);