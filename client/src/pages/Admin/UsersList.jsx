import { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Calendar, Loader2, Search, Gift, X, BookOpen, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Gifting State
  const [materials, setMaterials] = useState([]);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGifting, setIsGifting] = useState(false);
  const [giftSearch, setGiftSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await api.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const fetchMaterials = async () => {
      try {
        const res = await api.get('/api/materials');
        setMaterials(res.data);
      } catch (err) {
        console.error('Failed to load materials for gifting');
      }
    };

    fetchUsers();
    fetchMaterials();
  }, []);

  useEffect(() => {
    const filtered = users.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      
      let matchTab = true;
      if (activeTab === 'REGISTERED') matchTab = u.isRegistered;
      if (activeTab === 'NON-REGISTERED') matchTab = !u.isRegistered;

      return matchSearch && matchTab;
    });
    setFilteredUsers(filtered);
  }, [search, users, activeTab]);

  const toggleBlock = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.put(`/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleGift = async (materialId) => {
    if (!selectedUser) return;
    setIsGifting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/api/admin/gift', {
        email: selectedUser.email,
        materialId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Material gifted to ${selectedUser.email}`);
      setIsGiftModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to gift material');
    } finally {
      setIsGifting(false);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(giftSearch.toLowerCase()) ||
    m.subject.toLowerCase().includes(giftSearch.toLowerCase())
  );

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Registered Users</h1>
            <p className="text-white/40">Manage and monitor student accounts</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'REGISTERED', label: 'Registered' },
            { id: 'NON-REGISTERED', label: 'Guests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-black shadow-lg shadow-white/10' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-white/20" size={40} />
          </div>
        ) : (
          <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Student</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Email</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Joined</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-all group"
                    >
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className={`w-10 h-10 ${u.isRegistered ? 'bg-white/10' : 'bg-white/5'} rounded-full flex items-center justify-center text-white font-bold`}>
                          {u.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{u.name}</span>
                          {!u.isRegistered && <span className="text-[8px] text-white/20 uppercase tracking-widest">Guest Buyer</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-white/60">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-white/20" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-medium">
                            {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-white/30 uppercase tracking-tighter">
                            {new Date(u.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {u.isRegistered ? (
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${u.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {u.isBlocked ? 'Banned' : 'Active'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter bg-white/5 text-white/40 border border-white/5">
                            Not Registered
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedUser(u); setIsGiftModalOpen(true); }}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all"
                            title="Gift Material"
                          >
                            <Gift size={16} />
                          </button>
                          <button
                            onClick={() => toggleBlock(u._id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${u.isBlocked
                              ? 'bg-green-500 text-black border-green-500 hover:bg-green-400'
                              : 'bg-transparent text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white'
                              }`}
                          >
                            {u.isBlocked ? 'UNBLOCK' : 'BLOCK'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-20 text-center text-white/40 italic">No activity recorded yet</div>}
            </div>
          </div>
        )}

        {/* Gift Modal */}
        <AnimatePresence>
          {isGiftModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsGiftModalOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl glass p-8 rounded-[2.5rem] border border-white/10 max-h-[85vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tighter">Gift Material</h3>
                    <p className="text-white/40 text-sm">Gifting to: {selectedUser?.email}</p>
                  </div>
                  <button onClick={() => setIsGiftModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="text"
                    placeholder="Search materials by title or subject..."
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                  {filteredMaterials.map((m) => (
                    <div
                      key={m._id}
                      className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-tight">{m.title}</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">{m.subject} • {m.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGift(m._id)}
                        disabled={isGifting}
                        className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                      >
                        {isGifting ? 'SENDING...' : 'GIFT NOW'}
                      </button>
                    </div>
                  ))}
                  {filteredMaterials.length === 0 && <div className="py-20 text-center text-white/20 italic">No materials found</div>}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UsersList;
