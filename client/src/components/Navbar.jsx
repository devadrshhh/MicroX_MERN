import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, User, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isGuest, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Free Notes', path: '/free-notes' },
    { name: 'Microcopy', path: '/materials/Microcopy' },
    { name: 'Notes', path: '/materials/Notes' },
    ...(user ? [{ name: 'Orders', path: '/orders' }] : []),
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-black/80 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            MICROX
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${location.pathname === link.path ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={logout}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </button>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <div className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-white/60">{user.name.split(' ')[0]}</span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2">
                <User size={14} /> Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-all"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black"
          >
            <div className="flex flex-col h-full p-8">
              <div className="flex justify-between items-center mb-16">
                <span className="text-2xl font-black tracking-tighter">MICROX</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/5 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      to={link.path}
                      className="text-4xl font-bold tracking-tighter flex items-center justify-between group"
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="text-white/20 group-hover:text-white transition-all" size={24} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-4">
                {user ? (
                  <button 
                    onClick={logout}
                    className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <User size={20} /> Sign In
                  </Link>
                )}
                <Link to="/admin" className="text-center text-[10px] uppercase tracking-widest text-white/20 hover:text-white py-2">
                  Admin Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
