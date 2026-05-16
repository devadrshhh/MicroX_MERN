import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, User, LogOut, ShoppingBag, MoreVertical, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [notification, setNotification] = useState(null);
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

  // Notification Logic
  useEffect(() => {
    const fetchLatestOrder = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('userToken');
        const res = await api.get('/api/payments/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data && res.data.length > 0) {
          const userId = user._id || user.id;
          const lastSeenId = localStorage.getItem(`lastSeenOrder_${userId}`);
          
          if (!lastSeenId) {
            // First time ever: notify with count of visible materials (standard/gift)
            const visibleCount = res.data.filter(o => o.amount > 1 || o.isGift).length;
            if (visibleCount > 0) {
              setNotification({
                type: res.data[0].isGift ? 'gift' : 'purchase',
                id: res.data[0]._id,
                count: visibleCount
              });
            }
            return;
          }

          // Count how many orders are newer than lastSeenId
          const lastSeenIndex = res.data.findIndex(o => o._id === lastSeenId);
          const newCount = lastSeenIndex === -1 ? res.data.length : lastSeenIndex;

          if (newCount > 0) {
            setNotification({
              type: res.data[0].isGift ? 'gift' : 'purchase',
              id: res.data[0]._id,
              count: newCount
            });
          }
        }
      } catch (err) {
        console.error('Notification system error:', err);
      }
    };

    fetchLatestOrder();
  }, [user, location.pathname]);

  // Mark as seen when entering orders page
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (location.pathname === '/orders' && notification && userId) {
      localStorage.setItem(`lastSeenOrder_${userId}`, notification.id);
      setNotification(null);
    }
  }, [location.pathname, notification, user]);

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
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative inline-block py-1 ${location.pathname === link.path ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                  <span className="relative">
                    {link.name}
                    {link.name === 'Orders' && notification && (
                      <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`absolute -top-2.5 -right-5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-black z-[110] flex items-center justify-center text-[9px] font-black leading-none ${notification.type === 'gift' ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,1)]' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,1)]'}`}
                      >
                        {notification.count}
                      </motion.span>
                    )}
                  </span>
              </Link>
            ))}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`p-2 rounded-full transition-all relative ${isMoreOpen ? 'bg-white text-black' : 'text-white/60 hover:text-white bg-white/5 border border-white/5'}`}
              >
                <div className="relative">
                  <MoreVertical size={16} />
                  {notification && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`absolute top-[-5px] right-[-5px] min-w-[16px] h-[16px] px-1 rounded-full border-2 border-black z-[110] flex items-center justify-center text-[8px] font-black leading-none ${notification.type === 'gift' ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,1)]' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,1)]'}`}
                    >
                      {notification.count}
                    </motion.span>
                  )}
                </div>
              </button>
              <AnimatePresence>
                {isMoreOpen && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsMoreOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-40 glass rounded-xl border border-white/10 p-1.5 overflow-hidden shadow-2xl"
                    >
                      <Link 
                        to="/about" 
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                      >
                        About Us
                      </Link>
                      <Link 
                        to="/contact" 
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                      >
                        Contact Us
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

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

          {/* Mobile Upload Button - Center */}
          {location.pathname === '/free-notes' && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
              className="md:hidden px-3 py-1.5 bg-white text-black rounded-full flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-90 transition-all"
            >
              <Plus size={10} />
              Upload
            </button>
          )}

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-all relative"
          >
            <Menu size={24} />
            {notification && (
              <span className={`absolute top-1.5 right-1.5 min-w-[20px] h-[20px] px-1 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black leading-none ${notification.type === 'gift' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`}>
                {notification.count}
              </span>
            )}
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

              <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-none">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      to={link.path}
                      className="text-3xl font-bold tracking-tighter flex items-center justify-between group relative"
                    >
                      <span className="flex items-center gap-3">
                        {link.name}
                        {link.name === 'Orders' && notification && (
                          <span className={`px-2 py-0.5 rounded-full text-[12px] font-black leading-none ${notification.type === 'gift' ? 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,1)]' : 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,1)]'}`}>
                            {notification.count}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="text-white/20 group-hover:text-white transition-all" size={24} />
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Extra Links */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link 
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-bold tracking-tighter flex items-center justify-between group text-white/40 hover:text-white"
                  >
                    <span>About Us</span>
                    <ChevronRight className="text-white/20 group-hover:text-white transition-all" size={24} />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                >
                  <Link 
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-bold tracking-tighter flex items-center justify-between group text-white/40 hover:text-white"
                  >
                    <span>Contact Us</span>
                    <ChevronRight className="text-white/20 group-hover:text-white transition-all" size={24} />
                  </Link>
                </motion.div>
              </div>

              <div className="mt-auto flex flex-col gap-4">
                {user ? (
                  <button 
                    onClick={logout}
                    className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
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
