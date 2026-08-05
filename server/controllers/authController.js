const UserModel = require('../models/UserModel');

exports.login = async (req, res) => {
    // Expects { userId, password }
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and Password are required' });
    }

    try {
        const user = await UserModel.findByUsername(userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // In a real app we, would compare hashed password. For this academic project, we might use plain text or simple comparison if not specified.
        // Prompt says "password (VARCHAR)". 
        if (user.password !== password) {
             return res.status(401).json({ message: 'Invalid credentials' });
        }

        const role = await UserModel.getRole(user.role_id);
        
        // Return user info (no JWT implemented unless requested, but usually 'Login' implies session or token)
        // Prompt doesn't strictly ask for JWT, but standard is Token. I'll return a simple JSON for now.
        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                role: role.role_name
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
