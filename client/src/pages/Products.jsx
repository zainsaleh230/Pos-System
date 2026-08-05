import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { Plus, Search, Trash2, Edit2, Filter } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const Products = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    product_name: '', category_id: '', supplier_id: '', price: '', stock_quantity: '', description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredProducts(products.filter(p => p.product_name.toLowerCase().includes(lowerSearch)));
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        api.get('/categories'),
        api.get('/suppliers')
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/products/${form.product_id}`, form);
        addToast('Product Updated', 'success');
      } else {
        await api.post('/products', form);
        addToast('Product Added', 'success');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      addToast('Operation Failed', 'error');
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ product_name: '', category_id: '', supplier_id: '', price: '', stock_quantity: '', description: '' });
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      addToast('Product Deleted', 'success');
      fetchProducts();
    } catch (error) {
      addToast('Failed to delete product', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Products</h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Supplier</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => (
                <tr key={p.product_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">#{p.product_id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{p.product_name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {p.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.supplier_name}</td>
                  <td className="px-6 py-4 text-slate-900">Rs. {p.price}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${p.stock_quantity < 20 ? 'text-red-600' : 'text-green-600'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(p.product_id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No products found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title={isEditMode ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input name="product_name" value={form.product_name} onChange={handleChange} className="input" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="input" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select name="supplier_id" value={form.supplier_id} onChange={handleChange} className="input" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
              <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="input h-20" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Product' : 'Save Product'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
