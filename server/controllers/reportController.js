const db = require('../config/db');

class ReportController {
    static async getSummaryReport(req, res) {
        try {
            const connection = await db.getConnection();

            // 1. Orders Last Month
            const [ordersLastMonth] = await connection.query(`
                SELECT COUNT(*) as count, SUM(total_amount) as revenue
                FROM orders
                WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            `);

            // 2. Top 5 Selling Products
            const [topProducts] = await connection.query(`
                SELECT p.product_name, SUM(oi.quantity) as total_sold
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                GROUP BY p.product_id
                ORDER BY total_sold DESC
                LIMIT 5
            `);

            // 3. Low 5 Selling Products (Inventory that is moving slow - or just low sales count)
            const [lowProducts] = await connection.query(`
                SELECT p.product_name, IFNULL(SUM(oi.quantity), 0) as total_sold
                FROM products p
                LEFT JOIN order_items oi ON p.product_id = oi.product_id
                GROUP BY p.product_id
                ORDER BY total_sold ASC
                LIMIT 5
            `);

            // 4. Average Order Value
            const [[{ avgOrderValue }]] = await connection.query(`
                SELECT AVG(total_amount) as avgOrderValue FROM orders
            `);

            connection.release();

            res.json({
                period: 'Last 30 Days',
                ordersCount: ordersLastMonth[0].count || 0,
                revenue: ordersLastMonth[0].revenue || 0,
                avgOrderValue: avgOrderValue || 0,
                topProducts,
                lowProducts
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error generating report data' });
        }
    }
}

module.exports = ReportController;
