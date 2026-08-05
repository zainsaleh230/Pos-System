const db = require('../config/db');

class SupplierModel {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM suppliers');
        return rows;
    }

    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO suppliers (supplier_name, phone, email, address) VALUES (?, ?, ?, ?)',
            [data.supplier_name, data.phone, data.email, data.address]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.query(
            'UPDATE suppliers SET supplier_name=?, phone=?, email=?, address=? WHERE supplier_id=?',
            [data.supplier_name, data.phone, data.email, data.address, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = SupplierModel;
