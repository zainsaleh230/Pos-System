import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/inventory');
        setInventory(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Package className="w-6 h-6 mr-2 text-indigo-600" />
          Inventory Status
        </h2>
        <div className="flex gap-2">
          <div className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Low Stock (&lt; 50)
          </div>
          <div className="flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium border border-green-100">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            In Stock
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map(item => {
                const isLowStock = item.current_quantity < 50;
                return (
                  <tr key={item.inventory_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{item.product_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px] mr-3">
                          <div
                            className={`h-2.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(item.current_quantity, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-700 font-mono">{item.current_quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center text-red-600 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-sm">
                      {new Date(item.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
