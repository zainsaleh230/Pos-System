import React, { useEffect, useState } from 'react';
import api from '../api';
import { Layers, Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { category_name: newCategory });
      setNewCategory('');
      fetchCategories();
      addToast('Category Added', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Error adding category', 'error');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      addToast('Category Deleted', 'success');
      fetchCategories();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Layers className="w-6 h-6 mr-2 text-indigo-600" />
        Category Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Category</h3>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input"
                  placeholder="e.g., Beverages"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full flex justify-center items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2">
          <div className="card overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider">Existing Categories</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {categories.map(c => (
                <li key={c.category_id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4">
                      {c.category_name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{c.category_name}</span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-4">
                    <span>#{c.category_id}</span>
                    <button
                      onClick={() => confirmDelete(c.category_id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="p-8 text-center text-gray-500">No categories found.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete this category? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
