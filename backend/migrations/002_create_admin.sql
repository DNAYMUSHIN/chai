/*Таблица Admin*/
CREATE TABLE Admin (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(50) NOT NULL,
    admin_password TEXT NOT NULL
);
