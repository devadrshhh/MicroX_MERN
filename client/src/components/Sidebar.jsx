import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Files, CreditCard, Settings, LogOut, Menu, X, BookOpen, Users } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Requests', icon: <Files size={20} />, path: '/admin/requests' },
    { name: 'Free Notes', icon: <BookOpen size={20} />, path: '/admin/free-notes' },
    { name: 'Upload', icon: <Upload size={20} />, path: '/admin/upload' },
    { name: 'Manage', icon: <Files size={20} />, path: '/admin/manage' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/5 flex items-center justify-between px-6 z-[60]">
        <span className="font-black tracking-tighter">MICROX ADMIN</span>
        <button onClick={() => setIsOpen(true)} className="p-2 text-white/60">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Actual Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-black border-r border-white/5 transition-all duration-500 z-[80] 
        ${isOpen ? 'w-72' : '-translate-x-full'} md:translate-x-0 md:w-64 lg:w-72`}>
        
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl font-black tracking-tighter">MICROX</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-2 bg-white/5 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  location.pathname === item.path 
                    ? 'bg-white text-black font-bold' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
