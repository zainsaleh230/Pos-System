const db = require('../config/db');

class PaymentModel {
    static async findByOrderId(orderId) {
        const [rows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
        return rows;
    }

    static async create(data) {
        // data: { order_id, payment_method, payment_status, amount_paid }
        const [result] = await db.query(
            'INSERT INTO payments (order_id, payment_method, payment_date, payment_status, amount_paid) VALUES (?, ?, CURDATE(), ?, ?)',
            [data.order_id, data.payment_method, data.payment_status || 'Completed', data.amount_paid]
        );
        return result.insertId;
    }
}

module.exports = PaymentModel;
