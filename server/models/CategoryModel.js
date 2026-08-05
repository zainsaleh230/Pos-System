const db = require('../config/db');

class CategoryModel {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows;
    }

    static async create(categoryName) {
        const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [categoryName]);
        return result.insertId;
    }

    static async delete(id) {
        // DB constraints might prevent deletion if products exist. 
        // We will catch that in controller.
        const [result] = await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = CategoryModel;
