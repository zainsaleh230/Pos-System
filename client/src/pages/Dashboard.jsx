import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, ShoppingBag, DollarSign, AlertTriangle, TrendingUp, User, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockCount: 0,
    bestCustomer: null,
    topProduct: null,
    monthlySales: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
    // Poll for real-time updates every 30s
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Hello, Manage Your Store!</h1>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.totalRevenue}`}
          icon={DollarSign}
          color="bg-emerald-500"
          subtext="All time earnings"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-blue-500"
          subtext="Processing & Completed"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtext="Items needing restock"
        />
      </div>

      {/* Advanced Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Graph Placeholder / List */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
            Monthly Sales Trend
          </h3>
          <div className="space-y-3">
            {stats.monthlySales.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{m.month}</span>
                <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(m.sales / (Math.max(...stats.monthlySales.map(x => x.sales)) || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-700">${m.sales}</span>
              </div>
            ))}
            {stats.monthlySales.length === 0 && <p className="text-gray-400 text-sm">No sales data yet.</p>}
          </div>
        </div>

        {/* Awards / Top Performers */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Top Performers
          </h3>

          <div className="space-y-6">
            {stats.bestCustomer ? (
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <User className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-yellow-600 uppercase font-bold">Best Customer</p>
                  <p className="font-bold text-slate-800 text-lg">{stats.bestCustomer.customer_name}</p>
                  <p className="text-sm text-yellow-700">Spent Rs. {stats.bestCustomer.total_spent}</p>
                </div>
              </div>
            ) : <p className="text-sm text-gray-400">No customer data.</p>}

            {stats.topProduct ? (
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="p-3 bg-indigo-100 rounded-full mr-4">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 uppercase font-bold">Best Selling Product</p>
                  <p className="font-bold text-slate-800 text-lg">{stats.topProduct.product_name}</p>
                  <p className="text-sm text-indigo-700">Sold {stats.topProduct.total_sold} units</p>
                </div>
              </div>
            ) : <p className="text-sm text-gray-400">No product data.</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/orders/new" className="btn btn-primary shadow-lg shadow-indigo-200">
          Go to POS (Create Order)
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
