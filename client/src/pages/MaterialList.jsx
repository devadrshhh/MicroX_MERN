import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Loader2, X, FileText, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const MaterialList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeStream, setActiveStream] = useState('ALL');
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState(['HSE', 'UG'].includes(category) ? category : null);

  // Checkout Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [ownedMaterials, setOwnedMaterials] = useState([]);

  console.log('MaterialList State:', { category, selectedSubCategory, materialsCount: materials.length });

  // 1. Get unique streams for current category
  const availableStreams = ['ALL', ...new Set(
    (materials || [])
      .filter(m => !selectedSubCategory || m.category === selectedSubCategory)
      .map(m => m.stream)
      .filter(Boolean)
  )];

  // 2. Get unique levels (Class/Semester) for current stream
  const dynamicTabs = ['ALL', ...new Set(
    (materials || [])
      .filter(m => !selectedSubCategory || m.category === selectedSubCategory)
      .filter(m => activeStream === 'ALL' || m.stream === activeStream)
      .map(m => m.category === 'HSE' ? m.classLevel : m.semester)
      .filter(Boolean)
  )];

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/materials');
        let data = Array.isArray(res.data) ? res.data : [];
        console.log('Fetched Data:', data);

        // Filter by main category (Notes/Microcopy) if applicable
        if (['Notes', 'Microcopy'].includes(category)) {
          data = data.filter(m => m.type === category);
        }

        setMaterials(data);
        setFilteredMaterials(data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message);
        toast.error('Failed to load materials');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchOwned = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('userToken');
        const res = await api.get('/api/payments/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOwnedMaterials(res.data.map(o => o.materialId._id));
      } catch (err) {
        console.error('Failed to fetch owned materials');
      }
    };

    fetchMaterials();
    fetchOwned();
  }, [category, user]);

  useEffect(() => {
    const filtered = (materials || []).filter(m => {
      const matchSubCat = !selectedSubCategory || m.category === selectedSubCategory;
      const matchSearch = !search ||
        (m.title?.toLowerCase().includes(search.toLowerCase())) ||
        (m.subject?.toLowerCase().includes(search.toLowerCase()));
      const matchStream = activeStream === 'ALL' || m.stream === activeStream;
      const matchLevel = activeLevel === 'ALL' ||
        (m.category === 'HSE' ? m.classLevel === activeLevel : m.semester === activeLevel);

      return matchSubCat && matchSearch && matchStream && matchLevel;
    });
    setFilteredMaterials(filtered);
  }, [search, activeStream, activeLevel, materials, selectedSubCategory]);

  const initiatePurchase = (material) => {
    if (ownedMaterials.includes(material._id)) {
      navigate(`/view/${material._id}`);
      return;
    }

    if (user) {
      setUserEmail(user.email);
    }
    setSelectedMaterial(material);
    setShowEmailModal(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!userEmail) return toast.error('Email is required');

    setIsProcessing(true);
    try {
      console.log('Initiating order creation for:', selectedMaterial._id);
      const { data: order } = await api.post('/api/payments/create-order', {
        materialId: selectedMaterial._id,
        email: userEmail,
        userId: user?._id
      });

      console.log('Order created successfully:', order);

      // Fetch Razorpay Key from backend
      const { data: keyData } = await api.get('/api/payments/key');
      const RAZORPAY_KEY = keyData.key;

      if (!window.Razorpay) {
        toast.error('Razorpay SDK not loaded. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'MICROX',
        description: `Purchase: ${selectedMaterial.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('Payment success response:', response);
            const { data } = await api.post('/api/payments/verify', response);
            if (data.status === 'success') {
              toast.success('Payment Successful!');
              navigate(`/view/${selectedMaterial._id}`);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: { email: userEmail },
        theme: { color: '#000000' },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();
      setShowEmailModal(false);

    } catch (error) {
      console.error('Checkout error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to initiate payment';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black min-h-screen pb-20">
      <Navbar />

      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32">
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-10 gap-4 md:gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-1">{category} Library</h2>
              <p className="text-white/40 text-[10px] md:text-sm">Premium educational collection</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Row 1: Search and Category */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 pr-4 py-2.5 md:py-4 focus:outline-none focus:border-white/30 transition-all text-[11px] md:text-sm"
                />
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10 w-full md:w-auto">
                {['HSE', 'UG'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedSubCategory(cat); setActiveStream('ALL'); setActiveLevel('ALL'); }}
                    className={`flex-1 md:px-8 py-2 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all ${selectedSubCategory === cat ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Stream Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[8px] uppercase tracking-widest text-white/20 ml-4">Select Stream</span>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {availableStreams.map(s => (
                  <button
                    key={s}
                    onClick={() => { setActiveStream(s); setActiveLevel('ALL'); }}
                    className={`px-4 md:px-6 py-1.5 rounded-full text-[9px] md:text-xs font-medium border transition-all whitespace-nowrap ${activeStream === s ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Class/Semester Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[8px] uppercase tracking-widest text-white/20 ml-4">Select {selectedSubCategory === 'HSE' ? 'Class' : 'Semester'}</span>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin px-2">
                {dynamicTabs.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveLevel(f)}
                    className={`px-5 md:px-6 py-2 md:py-2 rounded-full text-[10px] md:text-xs font-bold border transition-all whitespace-nowrap ${activeLevel === f ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {!selectedSubCategory ? (
          <div className="py-10 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => setSelectedSubCategory('HSE')}
              className="glass p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 text-center cursor-pointer group hover:bg-white/5 transition-all"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">HSE</h3>
              <p className="text-white/40 text-xs md:text-sm">Higher Secondary Materials</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => setSelectedSubCategory('UG')}
              className="glass p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 text-center cursor-pointer group hover:bg-white/5 transition-all"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">UG</h3>
              <p className="text-white/40 text-xs md:text-sm">Undergraduate Materials</p>
            </motion.div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/40">
            <Loader2 className="animate-spin" size={40} />
            <p>Scanning library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredMaterials.map((m, i) => (
                <motion.div
                  key={m._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-3 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/10 flex flex-col group"
                >
                  <div className="h-28 md:h-40 bg-white/5 rounded-xl md:rounded-[2rem] mb-3 md:mb-5 flex flex-col items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all p-2 md:p-5 text-center relative overflow-hidden">
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/40 mb-0.5 md:mb-1">
                      {m.category === 'HSE' ? `${m.classLevel} • ${m.stream}` : `${m.semester} • ${m.stream}`}
                    </span>
                    <h4 className="text-[10px] md:text-lg font-black tracking-tighter leading-tight uppercase line-clamp-2">{m.subject}</h4>
                    <div className="mt-2 w-4 md:w-6 h-[1px] md:h-[1.5px] bg-white/20 group-hover:w-10 transition-all"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[7px] md:text-[9px] uppercase tracking-widest text-white/40">{m.category} • {m.type}</span>
                      <span className="text-xs md:text-base font-bold">₹{m.amount}</span>
                    </div>
                    <h3 className="text-xs md:text-lg font-bold mb-1 leading-tight line-clamp-1">{m.title}</h3>
                    <p className="text-[8px] md:text-xs text-white/40 mb-3 md:mb-4 line-clamp-1">{m.subject}</p>
                  </div>

                  <button
                    onClick={() => initiatePurchase(m)}
                    className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-[10px] md:text-sm ${ownedMaterials.includes(m._id)
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    {ownedMaterials.includes(m._id) ? (
                      <>
                        <CheckCircle size={14} className="md:w-4 md:h-4" /> View Material
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} className="md:w-4 md:h-4" /> Buy Now
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Email Selection Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10"
            >
              <button onClick={() => setShowEmailModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white">
                <X size={20} />
              </button>

              <h3 className="text-2xl font-bold mb-2 tracking-tighter">Almost there</h3>
              <p className="text-white/40 mb-8 text-sm">Enter your email to receive the material and proceed to payment.</p>

              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-white/30 transition-all"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                  <span className="text-sm text-white/60">Total Amount:</span>
                  <span className="text-lg font-bold text-white">₹{selectedMaterial?.amount}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Proceed to Payment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialList;
