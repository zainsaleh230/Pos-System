import React, { useEffect, useState } from 'react';
import api from '../api';
import { ClipboardList, Filter, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const Orders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
      setOrderDetails(res.data.items || []);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error(error);
      addToast('Could not fetch order details', 'error');
    }
  };

  const handleDelete = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete.order_id}`);
      addToast('Order Deleted', 'success');
      fetchOrders();
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      addToast('Failed to delete order', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <ClipboardList className="w-6 h-6 mr-2 text-indigo-600" />
          Order Management
        </h2>
        <Link to="/orders/new" className="btn btn-primary">
          + Create New Order
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Pay Method</th>
                <th className="px-6 py-4 font-medium">Total Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.order_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono">#{o.order_id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{o.customer_name}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(o.order_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{o.payment_method || '-'}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">Rs. {o.total_amount}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(o.order_id)}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(o)}
                      className="text-red-500 hover:text-red-700 p-1 flex items-center text-sm font-medium"
                      title="Delete Order"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div onClick={() => setIsDetailsOpen(false)} className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isDetailsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Order #{selectedOrder.order_id}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.order_date).toLocaleString()}</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Customer</p>
                  <p className="font-bold text-slate-800">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                  <p className="font-bold text-indigo-600 text-lg">Rs. {selectedOrder.total_amount}</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-700 mb-3 border-b pb-2">Items</h4>
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderDetails && orderDetails.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-700">{item.product_name || `Product #${item.product_id}`}</td>
                      <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-2 text-right text-slate-600">Rs. {item.price_at_purchase}</td>
                      <td className="py-2 text-right font-medium text-slate-800">Rs. {(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsDetailsOpen(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Order #{orderToDelete?.order_id}?</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete this order? This action cannot be undone and will remove all associated payments and items.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary w-24">Cancel</button>
            <button onClick={confirmDelete} className="btn bg-red-600 hover:bg-red-700 text-white w-24">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
