/*Таблица Category*/
CREATE TABLE Category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL UNIQUE

);