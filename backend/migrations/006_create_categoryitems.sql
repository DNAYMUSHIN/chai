CREATE TABLE CategoryItems (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    item_category_id UUID,
    item_name TEXT NOT NULL,
    FOREIGN KEY (item_category_id) REFERENCES Category (category_id)
);