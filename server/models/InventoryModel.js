const db = require('../config/db');

class InventoryModel {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT i.*, p.product_name, p.stock_quantity AS product_stock 
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
        `);
        return rows;
    }

    static async getLowStock(threshold = 50) {
        const [rows] = await db.query(`
            SELECT p.product_name, i.current_quantity, s.supplier_name, s.phone
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            JOIN suppliers s ON p.supplier_id = s.supplier_id
            WHERE i.current_quantity < ?
        `, [threshold]);
        return rows;
    }

    static async updateStock(productId, quantity) {
        // Updates inventory. Should we update Product.stock_quantity too? 
        // Ideally yes to keep them in sync as per prompt structure.
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            await connection.query('UPDATE inventory SET current_quantity = ? WHERE product_id = ?', [quantity, productId]);
            await connection.query('UPDATE products SET stock_quantity = ? WHERE product_id = ?', [quantity, productId]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = InventoryModel;
