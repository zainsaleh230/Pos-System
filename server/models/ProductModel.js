const db = require('../config/db');

class ProductModel {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT p.*, c.category_name, s.supplier_name 
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            JOIN suppliers s ON p.supplier_id = s.supplier_id
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
        return rows[0];
    }

    static async findByCategory(categoryId) {
         const [rows] = await db.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
         return rows;
    }
    
    static async searchByName(name) {
        const [rows] = await db.query('SELECT * FROM products WHERE product_name LIKE ?', [`%${name}%`]);
        return rows;
    }

    static async create(data) {
        // Transaction needed? Creating product also inserts into Inventory?
        // Prompt: Inventory has Product (1:1). "prevent orphan records".
        // Usually, when creating a product, we should initialize inventory to 0.
        
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [res] = await connection.query(
                'INSERT INTO products (product_name, category_id, supplier_id, price, stock_quantity, description) VALUES (?, ?, ?, ?, ?, ?)',
                [data.product_name, data.category_id, data.supplier_id, data.price, data.stock_quantity, data.description]
            );
            const productId = res.insertId;

            await connection.query(
                'INSERT INTO inventory (product_id, current_quantity) VALUES (?, ?)',
                [productId, data.stock_quantity] // Sync stock_quantity
            );

            await connection.commit();
            return productId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, data) {
         const [result] = await db.query(
            'UPDATE products SET product_name=?, category_id=?, supplier_id=?, price=?, stock_quantity=?, description=? WHERE product_id=?',
            [data.product_name, data.category_id, data.supplier_id, data.price, data.stock_quantity, data.description, id]
        );
        // Should also update inventory if stock_quantity changed? 
        // Usually 'stock_quantity' in products is redundant if we have 'inventory' table.
        // But prompt has both. Let's keep them in sync or just update product fields.
        // If stock is updated here, we should update inventory table too.
        
        await db.query('UPDATE inventory SET current_quantity = ? WHERE product_id = ?', [data.stock_quantity, id]);
        
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM products WHERE product_id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ProductModel;
