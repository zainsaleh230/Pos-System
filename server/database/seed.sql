USE grocery_store_db;

-- DISABLE FOREIGN KEY CHECKS
-- This allows us to truncate tables without worrying about constraints initially.
-- We will re-enable them at the end of the script.
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. ROLES SCHEMA
-- =============================================
-- Roles define the access level of a user.
TRUNCATE TABLE roles;
INSERT INTO roles (role_name) VALUES 
('Admin'),  -- Has full access
('Staff'),  -- Restricted access (POS, Orders)
('DBA');    -- Maintenance access

-- =============================================
-- 2. USERS SCHEMA
-- =============================================
-- Users table stores authentication details. 
-- 'role_id' is a FOREIGN KEY referencing 'roles(role_id)'.
TRUNCATE TABLE users;
TRUNCATE TABLE admin;
TRUNCATE TABLE staff;
TRUNCATE TABLE dba;

-- Admin User (ID: 1)
INSERT INTO users (user_id, password, role_id) VALUES (1, 'admin123', 1);
INSERT INTO admin (user_id, admin_level) VALUES (1, 'SuperAdmin'); 
-- 'admin' table has a 1:1 relationship with 'users' (ISA hierarchy).

-- Staff User (ID: 2)
INSERT INTO users (user_id, password, role_id) VALUES (2, 'staff123', 2);
INSERT INTO staff (user_id, staff_position) VALUES (2, 'Store Manager');

-- DBA User (ID: 3)
INSERT INTO users (user_id, password, role_id) VALUES (3, 'dba123', 3);
INSERT INTO dba (user_id, access_level) VALUES (3, 'Maintenance');

-- =============================================
-- 3. CATEGORIES SCHEMA
-- =============================================
-- Categories classify products. E.g., 'Beverages', 'Snacks'.
TRUNCATE TABLE categories;
INSERT INTO categories (category_name) VALUES
('Instant Noodles'),
('Pasta & Macaroni'),
('Beverages'),
('Spices & Masalas'),
('Snacks & Biscuits'),
('Dairy & Breakfast'),
('Frozen Foods'),
('Sauces & Condiments'),
('Rice & Pulses'),
('Household Care');

-- =============================================
-- 4. SUPPLIERS SCHEMA
-- =============================================
-- Suppliers provide products. 
TRUNCATE TABLE suppliers;
INSERT INTO suppliers (supplier_name, phone, email, address) VALUES
('Unilever Pakistan', '0300-1112223', 'contact@unilever.pk', 'Avari Plaza, Karachi'),
('Shan Foods', '0321-4445556', 'info@shanfoods.com', 'Korangi, Karachi'),
('Engro Foods', '0333-7778889', 'sales@engro.com', 'Clifton, Karachi'),
('National Foods', '0345-1234567', 'orders@nfoods.com', 'SITE, Karachi'),
('Kolson Pvt Ltd', '0312-9998887', 'dist@kolson.com', 'Lahore Road, Sheikhupura'),
('Ismail Industries', '0300-5554443', 'sales@ismail.com.pk', 'Port Qasim, Karachi'),
('Dawn Foods', '0322-1112233', 'fresh@dawnbread.com', 'Kot Lakhpat, Lahore'),
('K&Ns Foods', '0334-9990001', 'info@kandns.com', 'Raiwind Road, Lahore'),
('Tapal Tea', '0301-2223334', 'sales@tapal.com', 'West Wharf, Karachi'),
('Reckitt Benckiser', '0300-8887776', 'dist@rb.com', 'Clifton, Karachi');

-- =============================================
-- 5. PRODUCTS SCHEMA
-- =============================================
-- Products are the items sold. 
-- 'category_id' -> FK to categories. ON DELETE RESTRICT (Cannot delete category if it has products).
-- 'supplier_id' -> FK to suppliers.
TRUNCATE TABLE products;
INSERT INTO products (product_name, category_id, supplier_id, description, price, stock_quantity) VALUES
('Knorr Chattpatta Noodles', 1, 1, 'Family Pack', 280.00, 150),
('Maggi Chicken Noodles', 1, 6, 'Single Pack', 65.00, 200),
('Shoop Masala Noodles', 1, 2, 'Spicy Stick', 55.00, 100),
('Bake Parlor Macaroni', 2, 5, 'Elbow 400g', 180.00, 50),
('Kolson Spaghetti', 2, 5, 'Long Pasta 450g', 190.00, 60),
('Shan Biryani Masala', 4, 2, 'Double Pack', 120.00, 300),
('Tapal Danedar Tea', 3, 9, '950g Pouch', 1450.00, 40),
('Olpers Milk', 6, 3, '1 Litre UHT', 280.00, 500),
('K&Ns Chicken Nuggets', 7, 8, 'Family Pack 1kg', 1250.00, 25),
('National Garlic Sauce', 8, 4, '300g Bottle', 220.00, 80),
('Lays Masala Chips', 5, 2, 'Wavy Masala', 100.00, 200),
('Coke 1.5L', 3, 1, 'Chilled Bottle', 180.00, 120),
('Dawn Milky Bread', 6, 7, 'Large Loaf', 160.00, 40),
('Menu Chapli Kabab', 7, 8, 'Frozen 12pcs', 850.00, 20),
('Ariel Detergent', 10, 10, '2kg Pack', 950.00, 30);

-- =============================================
-- 6. INVENTORY TRIGGER/TABLE
-- =============================================
-- Ideally managed via Triggers, but here we seed it manually to sync with 'products'.
TRUNCATE TABLE inventory;
INSERT INTO inventory (product_id, current_quantity) 
SELECT product_id, stock_quantity FROM products;

-- =============================================
-- 7. CUSTOMERS SCHEMA
-- =============================================
-- Customers place orders.
TRUNCATE TABLE customers;
INSERT INTO customers (customer_name, contact, address) VALUES
('Hamza Ali', '0321-1234567', 'DHA Phase 5, Lahore'),
('Sana Tariq', '0333-9876543', 'Gulshan, Karachi'),
('Bilal Khan', '0345-1122334', 'F-7, Islamabad'),
('Hira Mani', '0300-4455667', 'Bahria, Rawalpindi'),
('Fawad Khan', '0321-0000001', 'Model Town, Lahore'),
('Mahira Hafeez', '0302-5556667', 'Clifton, Karachi'),
('Atif Aslam', '0333-1111111', 'DHA Phase 6, Lahore'),
('Babar Azam', '0300-5656565', 'Gulberg, Lahore'),
('Shaheen Afridi', '0334-9998887', 'Landi Kotal'),
('Nusrat Javed', '0312-3334445', 'Blue Area, Islamabad');

-- =============================================
-- 8. ORDERS SCHEMA (ON DELETE CASCADE)
-- =============================================
-- Orders represent a transaction.
-- 'customer_id' -> FK to customers. ON DELETE CASCADE usually means if customer is deleted, their orders are deleted.
TRUNCATE TABLE orders;
INSERT INTO orders (customer_id, order_date, total_amount) VALUES
(1, DATE_SUB(NOW(), INTERVAL 5 DAY), 560.00),
(2, DATE_SUB(NOW(), INTERVAL 4 DAY), 1450.00),
(3, DATE_SUB(NOW(), INTERVAL 3 DAY), 280.00),
(4, DATE_SUB(NOW(), INTERVAL 2 DAY), 3450.00),
(5, DATE_SUB(NOW(), INTERVAL 1 DAY), 950.00),
(6, NOW(), 180.00),
(7, NOW(), 2200.00),
(8, NOW(), 500.00),
(9, NOW(), 1250.00),
(10, NOW(), 280.00);

-- =============================================
-- 9. ORDER ITEMS KEY CONCEPTS
-- =============================================
-- Junction table between Orders and Products (M:N Relationship).
-- 'order_id' -> FK to orders. ON DELETE CASCADE (If order is deleted, its items are deleted).
-- 'product_id' -> FK to products.
TRUNCATE TABLE order_items;
INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES
(1, 1, 2, 560.00),
(2, 7, 1, 1450.00),
(3, 8, 1, 280.00),
(4, 9, 2, 2500.00), (4, 15, 1, 950.00),
(5, 15, 1, 950.00),
(6, 12, 1, 180.00),
(7, 9, 1, 1250.00), (7, 15, 1, 950.00),
(8, 10, 1, 220.00), (8, 1, 1, 280.00),
(9, 9, 1, 1250.00),
(10, 8, 1, 280.00);

-- =============================================
-- 10. PAYMENTS (1:1 or 1:N with Orders)
-- =============================================
-- Tracks payment status.
-- 'order_id' -> FK to orders. ON DELETE CASCADE (If order is deleted, payment record is removed).
TRUNCATE TABLE payments;
INSERT INTO payments (order_id, payment_date, payment_method, amount_paid, payment_status) VALUES
(1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Cash', 560.00, 'Completed'),
(2, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Card', 1450.00, 'Completed'),
(3, DATE_SUB(NOW(), INTERVAL 3 DAY), 'EasyPaisa', 280.00, 'Completed'),
(5, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Cash', 950.00, 'Completed'),
(7, NOW(), 'Card', 2200.00, 'Completed'),
(8, NOW(), 'JazzCash', 500.00, 'Completed'),
(10, NOW(), 'Cash', 280.00, 'Completed');

-- RE-ENABLE FOREIGN KEYS
SET FOREIGN_KEY_CHECKS = 1;
