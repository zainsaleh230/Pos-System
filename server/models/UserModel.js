const db = require('../config/db');

class UserModel {
    static async findByUsername(username) {
        // Since we don't have a 'username' column, we'll assume 'user_id' is used for login OR we need to specificy a credential.
        // Prompt says: users (user_id, password, role_id).
        // It's weird to login with user_id. Usually there is a username/email.
        // However, looking at the 'suppliers' table it has email. 'users' does NOT.
        // Let's check the Schema again.
        // Schema: users(user_id, password, role_id).
        // Specializations: admin(user_id, admin_level), staff(user_id, position), customeruser(user_id, points).
        // There is NO username column in 'users'.
        // Assuming we login with 'user_id' (e.g. Employee ID) -> Password.
        // OR, maybe we should add a 'username' column? The prompt says "No features... should be invented", but login usually requires an identifier.
        // BUT, the prompt says "Authentication: Login (Admin / Staff)".
        // I will assume Login is via `user_id` and `password`.
        
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [username]); // Treat username as user_id
        return rows[0];
    }

    static async getRole(roleId) {
        const [rows] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [roleId]);
        return rows[0];
    }
}

module.exports = UserModel;
