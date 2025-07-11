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