import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Search, Mail, Phone, MapPin, History, Clock, Edit2, Trash2 } from 'lucide-react';

const Customers = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');

  // Modal & Selection States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);

  const [form, setForm] = useState({ customer_name: '', contact: '', address: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredCustomers(customers.filter(c =>
      c.customer_name.toLowerCase().includes(lower) ||
      (c.contact && c.contact.toLowerCase().includes(lower))
    ));
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditOpen) {
        await api.put(`/customers/${selectedCustomer.customer_id}`, form);
        addToast('Customer Updated Successfully', 'success');
      } else {
        await api.post('/customers', form);
        addToast('Customer Added Successfully', 'success');
      }
      setForm({ customer_name: '', contact: '', address: '' });
      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchCustomers();
    } catch (error) {
      addToast('Operation Failed', 'error');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setForm({
      customer_name: customer.customer_name,
      contact: customer.contact || '',
      address: customer.address || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/customers/${deleteId}`);
      addToast('Customer Deleted', 'success');
      fetchCustomers();
    } catch (error) {
      addToast('Could not delete customer', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleViewHistory = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const res = await api.get(`/customers/${customer.customer_id}/history`);
      setCustomerHistory(res.data);
      setIsHistoryOpen(true);
    } catch (error) {
      addToast('Failed to fetch history', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Users className="w-6 h-6 mr-2 text-indigo-600" />
          Customer Management
        </h2>
        <button onClick={() => { setForm({ customer_name: '', contact: '', address: '' }); setIsAddOpen(true); }} className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Address</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map(c => (
                <tr key={c.customer_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{c.customer_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-slate-600 gap-1">
                      {c.contact && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {c.contact}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate">
                    {c.address}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleViewHistory(c)} className="text-indigo-500 hover:text-indigo-700 p-1" title="History">
                      <Clock className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(c)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(c.customer_id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddOpen || isEditOpen} onClose={() => { setIsAddOpen(false); setIsEditOpen(false); }} title={isEditOpen ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone/Contact</label>
            <input className="input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="input h-20" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{isEditOpen ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      {isHistoryOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsHistoryOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">History: {selectedCustomer.customer_name}</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              {customerHistory.length === 0 ? <p className="text-gray-500">No previous orders found.</p> : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Order ID</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerHistory.map(o => (
                      <tr key={o.order_id}>
                        <td className="px-4 py-3 font-mono">#{o.order_id}</td>
                        <td className="px-4 py-3">{new Date(o.order_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-bold">Rs. {o.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${o.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{o.item_count || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <div className="text-center text-red-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          </div>
          <p className="text-slate-600 text-center">Are you sure you want to delete this customer?<br /><span className="text-xs text-red-500">Order history will be permanently accessed via Archive only.</span></p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteId(null)} className="btn btn-secondary w-24">Cancel</button>
            <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700 w-24">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
