-- Create Database
DROP DATABASE IF EXISTS grocery_store_db;
CREATE DATABASE grocery_store_db;
USE grocery_store_db;

-- =============================================
-- 1. ROLES SCHEMA (Normalization: 3NF)
-- =============================================
-- Splitting roles into a separate table avoids redundancy in the 'users' table.
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- =============================================
-- 2. USERS SCHEMA
-- =============================================
-- Users table stores authentication details. 
-- 'role_id' is a FOREIGN KEY. 'ON DELETE RESTRICT' ensures we can't delete a role 
-- if users are still assigned to it (Data Integrity).
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- =============================================
-- 3. SPECIALIZATION (ISA Relationship)
-- =============================================
-- The following tables (admin, staff, dba) represent disjoint specialization.
-- A user can be only one of these types. They share the same primary key 'user_id'
-- which also acts as a foreign key to 'users'.

-- 3a. Admin
CREATE TABLE admin (
    user_id INT PRIMARY KEY,
    admin_level VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3b. Staff
CREATE TABLE staff (
    user_id INT PRIMARY KEY,
    staff_position VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3c. DBA (Database Administrator)
CREATE TABLE dba (
    user_id INT PRIMARY KEY,
    access_level VARCHAR(50) DEFAULT 'Full',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- 4. CATEGORIES
-- =============================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- =============================================
-- 5. SUPPLIERS
-- =============================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255)
);

-- =============================================
-- 6. PRODUCTS (Core Entity)
-- =============================================
-- 'category_id' and 'supplier_id' are foreign keys.
-- 'ON DELETE CASCADE' here means if a category/supplier is deleted, its products should also be removed.
-- NOTE: In production, we might use 'ON DELETE RESTRICT' or 'SET NULL' to preserve transaction history,
-- but CASCADE is used here for assignment requirements.
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);

-- =============================================
-- 7. INVENTORY (1:1 with Products)
-- =============================================
-- This table separates stock management from product details.
-- 'product_id' is both PK and FK, ensuring 1:1 relationship.
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    current_quantity INT NOT NULL CHECK (current_quantity >= 0),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =============================================
-- 8. CUSTOMERS
-- =============================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    address VARCHAR(255)
);

-- =============================================
-- 9. ORDERS (Transaction Header)
-- =============================================
-- 'customer_id' is FK. 'ON DELETE CASCADE' removes orders if a customer is deleted.
-- Removed 'status' column as per recent refactoring (derived from Payment or not needed).
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- =============================================
-- 10. ORDER ITEMS (M:N Relationship)
-- =============================================
-- Resolves Many-to-Many relationship between Orders and Products.
-- Composite Primary Key (order_id, product_id) ensures a product appears only once per order.
CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =============================================
-- 11. PAYMENTS (Transaction Details)
-- =============================================
-- Tracks monetary transaction for an order.
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Completed',
    amount_paid DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
