import React, { useEffect, useState } from 'react';
import api from '../api';
import { Truck, Plus, Trash2, Edit, Save, X } from 'lucide-react'; // Added Edit, Save, X icons
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ supplier_name: '', phone: '', email: '', address: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
      addToast('Error fetching suppliers', 'error');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/suppliers/${editingId}`, form);
        addToast('Supplier Updated', 'success');
      } else {
        await api.post('/suppliers', form);
        addToast('Supplier Added', 'success');
      }
      resetForm();
      fetchSuppliers();
    } catch (error) {
      addToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (supplier) => {
    setForm(supplier);
    setIsEditMode(true);
    setEditingId(supplier.supplier_id);
  };

  const resetForm = () => {
    setForm({ supplier_name: '', phone: '', email: '', address: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/suppliers/${deleteId}`);
      addToast('Supplier Deleted', 'success');
      fetchSuppliers();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete supplier', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Truck className="w-6 h-6 mr-2 text-indigo-600" />
        Supplier Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    name="supplier_name"
                    value={form.supplier_name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., Metro Cash & Carry"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., 0300-1234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="input w-full h-24 resize-none"
                    placeholder="Supplier Address..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button type="submit" className={`btn flex-1 flex justify-center items-center ${isEditMode ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'btn-primary'}`}>
                  {isEditMode ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isEditMode ? 'Update' : 'Add Supplier'}
                </button>
                {isEditMode && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider">Existing Suppliers</h3>
              <span className="text-xs text-gray-400">{suppliers.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map(s => (
                    <tr key={s.supplier_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{s.supplier_name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{s.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">{s.phone}</div>
                        <div className="text-slate-400 text-xs">{s.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-md transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(s.supplier_id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        No suppliers found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete this supplier? This will <b>fail</b> if they supply existing products.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
