const db = require('../config/db');

class OrderModel {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT o.*, c.customer_name, p.payment_method
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            ORDER BY o.order_date DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [orderRows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [id]);
        if (orderRows.length === 0) return null;

        const [itemRows] = await db.query(`
            SELECT oi.*, p.product_name 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [id]);

        return { ...orderRows[0], items: itemRows };
    }

    static async create(data) {
        // data: { customer_id: int, items: [{ product_id, quantity, price }] }
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Calculate Total & Create Order
            let totalAmount = 0;
            // First we need accurate prices. Better to fetch from DB, but for simplicity we trust client or re-fetch.
            // Let's re-fetch prices to be secure.
            const itemsToInsert = [];
            
            for (const item of data.items) {
                const [rows] = await connection.query('SELECT price, stock_quantity FROM products WHERE product_id = ?', [item.product_id]);
                if (rows.length === 0) throw new Error(`Product ${item.product_id} not found`);
                
                const product = rows[0];
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.product_id}`);
                }

                const subtotal = product.price * item.quantity;
                totalAmount += subtotal;
                itemsToInsert.push({ 
                    product_id: item.product_id, 
                    quantity: item.quantity, 
                    subtotal: subtotal,
                    new_stock: product.stock_quantity - item.quantity 
                });
            }

            const [orderRes] = await connection.query(
                'INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)',
                [data.customer_id, totalAmount]
            );
            const orderId = orderRes.insertId;

            // 2. Insert Items & Update Stock
            for (const item of itemsToInsert) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.subtotal]
                );

                // Update Products Table
                await connection.query('UPDATE products SET stock_quantity = ? WHERE product_id = ?', [item.new_stock, item.product_id]);
                
                // Update Inventory Table
                await connection.query('UPDATE inventory SET current_quantity = ? WHERE product_id = ?', [item.new_stock, item.product_id]);
            }

            await connection.commit();
            return { orderId, totalAmount };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }


    static async delete(id) {
        const [result] = await db.query('DELETE FROM orders WHERE order_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = OrderModel;
