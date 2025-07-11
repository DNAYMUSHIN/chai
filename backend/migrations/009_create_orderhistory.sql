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