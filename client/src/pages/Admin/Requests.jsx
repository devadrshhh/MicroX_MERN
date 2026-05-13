import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { Check, X, Eye, FileText, FileCode, Presentation, Trash2, Calendar, User, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('http://localhost:5000/api/community/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (err) {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    const filtered = requests.filter(r => 
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.uploadedBy?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [search, requests]);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.put(`http://localhost:5000/api/community/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Note Approved');
      fetchRequests();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this upload?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`http://localhost:5000/api/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Note Rejected');
      fetchRequests();
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const getFileIcon = (ext, size = 32) => {
    if (ext.includes('pdf')) return <FileText className="text-red-400" size={size} />;
    if (ext.includes('doc')) return <FileCode className="text-blue-400" size={size} />;
    if (ext.includes('ppt')) return <Presentation className="text-orange-400" size={size} />;
    return <FileText size={size} />;
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Community Requests</h1>
            <p className="text-white/40">Review and approve user-submitted study materials</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Search by title, subject or user..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white/20" size={40} /></div>
        ) : filteredRequests.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center border border-white/5 text-white/20">
            {search ? 'No results match your search.' : 'No pending requests at the moment.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredRequests.map((r) => (
                <motion.div 
                  key={r._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/5 p-3 text-center relative overflow-hidden">
                      <span className="text-[8px] uppercase tracking-widest text-white/40 mb-1 z-10">
                        {r.category === 'HSE' ? `${r.classLevel} • ${r.stream}` : `${r.semester} • ${r.stream}`}
                      </span>
                      <h4 className="text-xs font-black tracking-tighter leading-tight uppercase z-10">{r.subject}</h4>
                      <div className="absolute -right-2 -bottom-2 opacity-[0.03]">
                        {getFileIcon(r.fileType, 60)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{r.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                        <span className="flex items-center gap-1"><User size={12}/> {r.uploadedBy}</span>
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(r.createdAt).toLocaleDateString()}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase tracking-tighter font-bold">{r.category} • {r.type}</span>
                      </div>
                      <p className="text-xs text-white/60 mt-2 italic">Subject: {r.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => window.open(`http://localhost:5000/${r.filePath}`, '_blank')}
                      className="flex-1 md:flex-none p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                      title="Preview"
                    >
                      <Eye size={20} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleApprove(r._id)}
                      className="flex-1 md:flex-none p-4 bg-green-500/10 rounded-2xl hover:bg-green-500 transition-all text-green-500 hover:text-black"
                      title="Approve"
                    >
                      <Check size={20} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleReject(r._id)}
                      className="flex-1 md:flex-none p-4 bg-red-500/10 rounded-2xl hover:bg-red-500 transition-all text-red-500 hover:text-black"
                      title="Reject"
                    >
                      <X size={20} className="mx-auto" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;
