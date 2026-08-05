import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { UserCircle, LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [timer, setTimer] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            Dashboard
          </h2>

          <div className="flex items-center space-x-6">
            {/* Session Timer */}
            <div className="flex items-center text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-mono font-medium">{formatTime(timer)}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <UserCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-800">{user?.role || 'User'}</p>
                <p className="text-xs text-slate-500">ID: {user?.user_id}</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors text-sm font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout">
          <div className="space-y-4">
            <p className="text-slate-600">Are you sure you want to log out of the system?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleLogout} className="btn bg-red-600 text-white hover:bg-red-700">Logout</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Layout;
