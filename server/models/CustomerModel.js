const db = require('../config/db');

class CustomerModel {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM customers');
        return rows;
    }

    static async findById(id) {
         const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [id]);
         return rows[0];
    }

    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO customers (customer_name, contact, address) VALUES (?, ?, ?)',
            [data.customer_name, data.contact, data.address]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(
            'UPDATE customers SET customer_name = ?, contact = ?, address = ? WHERE customer_id = ?',
            [data.customer_name, data.contact, data.address, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        // Cascades handled by DB foreign keys
        const [result] = await db.query('DELETE FROM customers WHERE customer_id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getHistory(id) {
        const [orders] = await db.query(`
            SELECT o.*, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
            FROM orders o 
            WHERE o.customer_id = ? 
            ORDER BY o.order_date DESC`, 
            [id]
        );
        return orders;
    }
}

module.exports = CustomerModel;
