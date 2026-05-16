import { useState, useEffect } from 'react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import { Gift, Search, Loader2, Mail, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await api.get('/api/payments/gifts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGifts(res.data);
        setFilteredGifts(res.data);
      } catch (err) {
        console.error('Failed to fetch gifts');
      } finally {
        setLoading(false);
      }
    };
    fetchGifts();
  }, []);

  useEffect(() => {
    const filtered = gifts.filter(g =>
      g.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      g.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      g.subject?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredGifts(filtered);
  }, [search, gifts]);

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10 overflow-x-hidden">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Gift History</h1>
            <p className="text-white/40">Log of all materials granted to users</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search by email or Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-white/20" size={40} />
          </div>
        ) : (
          <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Gift Info</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Material</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Recipient</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Date Granted</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGifts.map((g) => (
                    <tr key={g._id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500">
                            <Gift size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-xs uppercase tracking-tighter text-white">{g.orderId}</div>
                            <div className="text-[10px] font-mono text-white/30 mt-1 uppercase tracking-widest">System Granted</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <FileText size={14} className="text-white/20" />
                          {g.subject}
                        </div>
                        <div className="text-xs text-white/40 ml-5">{g.stream}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Mail size={14} className="text-white/20" />
                          {g.userEmail}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium">
                          <Calendar size={12} className="text-white/20" />
                          {new Date(g.createdAt).toLocaleString('en-GB', { 
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true 
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-pink-500/20 text-pink-500 border border-pink-500/20">
                          GIFTED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGifts.length === 0 && <div className="p-20 text-center text-white/40 italic">No gifts recorded yet</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gifts;
