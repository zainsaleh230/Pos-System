const db = require('../config/db');

class StatsController {
    static async getDashboardStats(req, res) {
        try {
            const connection = await db.getConnection();
            
            // 1. Total Stats
            const [[{ totalRevenue }]] = await connection.query("SELECT SUM(total_amount) as totalRevenue FROM orders");
            const [[{ totalOrders }]] = await connection.query("SELECT COUNT(*) as totalOrders FROM orders");
            const [[{ lowStockCount }]] = await connection.query("SELECT COUNT(*) as lowStockCount FROM products WHERE stock_quantity < 20");

            // 2. Best Customer
            const [bestCustomer] = await connection.query(`
                SELECT c.customer_name, SUM(o.total_amount) as total_spent 
                FROM orders o 
                JOIN customers c ON o.customer_id = c.customer_id 
                GROUP BY c.customer_id 
                ORDER BY total_spent DESC 
                LIMIT 1
            `);

            // 3. Top Selling Product
            const [topProduct] = await connection.query(`
                SELECT p.product_name, SUM(oi.quantity) as total_sold 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.product_id 
                GROUP BY p.product_id 
                ORDER BY total_sold DESC 
                LIMIT 1
            `);

            // 4. Monthly Sales (for graph) - Last 6 months
            const [monthlySales] = await connection.query(`
                SELECT DATE_FORMAT(order_date, '%Y-%m') as month, SUM(total_amount) as sales
                FROM orders
                GROUP BY month
                ORDER BY month DESC
                LIMIT 6
            `);

            connection.release();

            res.json({
                totalRevenue: totalRevenue || 0,
                totalOrders: totalOrders || 0,
                lowStockCount: lowStockCount || 0,
                bestCustomer: bestCustomer[0] || null,
                topProduct: topProduct[0] || null,
                monthlySales: monthlySales.reverse()
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = StatsController;
