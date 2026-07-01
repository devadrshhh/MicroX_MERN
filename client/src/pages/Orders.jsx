import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Package, FileText, ChevronRight, Loader2, Sparkles, Gift } from 'lucide-react';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await api.get('/api/payments/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter for materials the user actually "owns" (Gifts and Regular Purchases, NOT ₹1 trials)
        setOrders(res.data.filter(o => o.isGift || !o.isPromo));
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-6 pt-32">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-white/40 mb-4">
            <Package size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Your Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">MY ORDERS</h1>
          <p className="text-white/40 mt-2 italic">Instant access to your purchased materials</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/40">
            <Loader2 className="animate-spin" size={40} />
            <p>Syncing your library...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            <AnimatePresence>
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/10 group hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 md:mb-6">
                      <div className="bg-white/10 p-2 md:p-4 rounded-xl md:rounded-2xl text-white/60">
                        <FileText size={18} className="md:w-6 md:h-6" />
                      </div>
                      {order.isGift ? (
                        <span className="text-[6px] md:text-[10px] font-black bg-pink-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-tighter shadow-xl flex items-center gap-1">
                          <Gift size={8} className="md:w-[10px] md:h-[10px]" /> GIFTED
                        </span>
                      ) : (
                        <span className="text-[6px] md:text-[10px] font-black bg-white text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-tighter shadow-xl">
                          PURCHASED
                        </span>
                      )}
                    </div>

                    <span className="text-[6px] md:text-[10px] uppercase tracking-widest text-white/20 mb-1 md:mb-2 block">
                      {order.materialId?.category} • {order.materialId?.stream}
                    </span>
                    <h3 className="text-[10px] md:text-xl font-bold mb-0.5 md:mb-1 leading-tight line-clamp-2">{order.materialId?.title}</h3>
                    <p className="text-[8px] md:text-xs text-white/40 mb-1 md:mb-2 line-clamp-1">{order.materialId?.subject}</p>
                    
                    {order.orderId && (
                      <div className="space-y-0.5 md:space-y-1 mb-4 md:mb-8">
                        <p className="text-[6px] md:text-[10px] font-bold text-white/10 uppercase tracking-widest truncate">ID: {order.orderId}</p>
                        <p className="text-[5px] md:text-[8px] font-medium text-white/5 uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/materials/download/${order.materialId?._id}${localStorage.getItem('userToken') ? `?token=${localStorage.getItem('userToken')}` : ''}`, '_blank')}
                    className="w-full bg-white text-black py-2.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-sm font-black flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <Download size={14} className="md:w-[18px] md:h-[18px]" /> DOWNLOAD
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-40 glass rounded-[3rem] border border-white/5">
            <Sparkles size={48} className="mx-auto text-white/10 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No purchases yet</h3>
            <p className="text-white/40 mb-8">Start your learning journey with MICROX premium materials</p>
            <button onClick={() => window.location.href = '/materials/Notes'} className="bg-white text-black px-10 py-4 rounded-2xl font-black">BROWSE MATERIALS</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
