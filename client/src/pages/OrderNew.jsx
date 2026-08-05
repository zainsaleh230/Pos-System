import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, X, Check, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const OrderNew = () => {
  const { addToast } = useToast();
  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);

  // UI State
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);

  // Customer Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Payment/Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New Customer Form
  const [newCustForm, setNewCustForm] = useState({ customer_name: '', contact: '', address: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let res = products;
    if (selectedCategory !== 'All') {
      res = res.filter(p => p.category_id === parseInt(selectedCategory));
    }
    if (search) {
      res = res.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredProducts(res);
  }, [search, selectedCategory, products]);

  const fetchData = async () => {
    try {
      const [pRes, cRes, custRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/customers')
      ]);
      setProducts(pRes.data);
      setFilteredProducts(pRes.data);
      setCategories(cRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      console.error(error);
      addToast('Error loading POS data', 'error');
    }
  };

  // Cart Logic
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      addToast('Out of Stock!', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          addToast('Max stock reached', 'error');
          return prev;
        }
        return prev.map(item => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        // Check stock
        const product = products.find(p => p.product_id === id);
        if (newQty > product.stock_quantity) {
          addToast('Stock limit reached', 'error');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.product_id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Customer Logic
  const handleCustomerSearch = (val) => {
    setCustomerSearch(val);
    setSelectedCustomer(null); // Reset selection if typing
    setShowCustomerSuggestions(true);
  };

  const selectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerSearch(cust.customer_name);
    setShowCustomerSuggestions(false);
  };

  const handleQuickAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', newCustForm);
      // createdId usually returned. If backend returns "message", we assume success. 
      // Better if backend returned the object. Let's assume re-fetch finding it.
      // Or backend returns { insertId: ... }
      addToast(`Customer ${newCustForm.customer_name} added!`, 'success');
      await fetchData(); // Refresh list

      // Try to auto-select the new one (by name match for simplicity if ID not avail)
      const updated = (await api.get('/customers')).data;
      const newUser = updated.find(c => c.customer_name === newCustForm.customer_name);
      if (newUser) selectCustomer(newUser);

      setIsAddCustomerOpen(false);
      setNewCustForm({ customer_name: '', contact: '', address: '' });
    } catch (error) {
      addToast('Failed to add customer', 'error');
    }
  };

  // Checkout Logic
  const handleCheckoutInit = () => {
    if (cart.length === 0) return addToast('Cart is empty', 'error');
    if (!selectedCustomer) return addToast('Please select a customer', 'error');
    setIsPaymentOpen(true);
  };

  const handlePlaceOrder = async (method) => {
    try {
      // 1. Create Order
      const orderData = {
        customer_id: selectedCustomer.customer_id,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price }))
      };
      const res = await api.post('/orders', orderData);
      const orderId = res.data.result.orderId; // Access nested result object from orderController

      // 2. Record Payment
      await api.post('/payments', {
        order_id: orderId,
        payment_method: method,
        payment_status: 'Completed',
        amount_paid: cartTotal
      });

      addToast('Order Placed Successfully!', 'success');
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setIsPaymentOpen(false);
      fetchData(); // Sync stock
    } catch (error) {
      console.error(error);
      addToast('Failed to place order', 'error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* LEFT: Products Grid */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header/Filters */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="input pl-10 bg-gray-50 border-transparent focus:bg-white"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-48 bg-gray-50 border-transparent focus:bg-white"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <div
                key={p.product_id}
                onClick={() => addToCart(p)}
                className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {p.product_name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.stock_quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {p.stock_quantity} Left
                  </span>
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1 truncate">{p.product_name}</h4>
                <p className="text-gray-500 text-xs mb-3 truncate">{p.category_name}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600">Rs. {p.price}</span>
                  <button className="bg-indigo-50 p-1.5 rounded-md text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="w-[400px] flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center"><ShoppingCart className="w-5 h-5 mr-2" /> Current Order</h2>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
        </div>

        {/* Customer Section */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Customer</label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="input pl-9 h-10 text-sm"
                  placeholder="Search or add customer..."
                  value={customerSearch}
                  onChange={e => handleCustomerSearch(e.target.value)}
                  onFocus={() => setShowCustomerSuggestions(true)}
                />
                {selectedCustomer && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <button onClick={() => setIsAddCustomerOpen(true)} className="btn btn-secondary h-10 w-10 p-0 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showCustomerSuggestions && customerSearch && !selectedCustomer && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {customers.filter(c => c.customer_name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                  <div
                    key={c.customer_id}
                    onClick={() => selectCustomer(c)}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700"
                  >
                    {c.customer_name} <span className="text-gray-400 text-xs ml-2">({c.phone})</span>
                  </div>
                ))}
                {customers.filter(c => c.customer_name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-xs text-gray-400 italic">No match. Add new?</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.product_id} className="flex items-center justify-between group">
              <div className="flex-1">
                <p className="font-bold text-slate-700 text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500">Rs. {item.price} x {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.product_id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Minus className="w-3 h-3" /></button>
                <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.product_id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus className="w-3 h-3" /></button>
                <button onClick={() => removeFromCart(item.product_id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 className="w-3 h-3" /></button>
              </div>
              <div className="w-16 text-right font-bold text-slate-700 text-sm">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <ShoppingCart className="w-12 h-12 mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-slate-700">Rs. {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-xl font-bold text-slate-800">
            <span>Total</span>
            <span>Rs. {cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckoutInit}
            className="w-full btn btn-primary py-3 text-lg shadow-lg shadow-indigo-200"
            disabled={cart.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Select Payment Method">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handlePlaceOrder('Cash')}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="font-bold text-slate-700 group-hover:text-emerald-700">Cash</span>
          </button>
          <button
            onClick={() => handlePlaceOrder('Card')}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <CreditCard className="w-8 h-8 text-blue-600 mb-2" />
            <span className="font-bold text-slate-700 group-hover:text-blue-700">Card</span>
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Total Due</p>
          <p className="text-3xl font-bold text-slate-800">Rs. {cartTotal.toFixed(2)}</p>
        </div>
      </Modal>

      {/* Quick Add Customer Modal */}
      <Modal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} title="Quick Add Customer">
        <form onSubmit={handleQuickAddCustomer} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={newCustForm.customer_name} onChange={e => setNewCustForm({ ...newCustForm, customer_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Contact / Phone</label>
            <input className="input" value={newCustForm.contact} onChange={e => setNewCustForm({ ...newCustForm, contact: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAddCustomerOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save & Select</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// DollarIcon helper since I used it above but didn't import (Used DollarSign in import but used local name or standard)
// Let's ensure standard imports. 
// Lucide imports: Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, X, Check.
// Missed 'DollarSign' in import line.


export default OrderNew;
