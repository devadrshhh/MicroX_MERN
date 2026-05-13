import { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { Trash2, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageFreeNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/approved');
      setNotes(res.data);
    } catch (err) {
      toast.error('Failed to load free notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this community note?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await api.delete(`/api/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Note Removed');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to remove note');
    }
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10 overflow-x-hidden">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tighter">Manage Free Notes</h1>
          <p className="text-white/40">Moderation of community-contributed materials</p>
        </header>

        <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Material</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Contributor</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Stats</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {notes.map((m) => (
                    <motion.tr
                      key={m._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold">{m.title}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-tighter">{m.subject} • {m.fileType.replace('.', '')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {m.uploadedBy.charAt(0)}
                          </div>
                          {m.uploadedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                          {m.category} • {m.classLevel || m.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1.5"><Download size={12} /> {m.downloadCount}</span>
                          <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {m.likes}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <a
                            href={`/${m.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-black transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {notes.length === 0 && !loading && (
              <div className="p-20 text-center text-white/40">No approved community notes found.</div>
            )}
            {loading && (
              <div className="p-20 text-center text-white/40 animate-pulse">Scanning library...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageFreeNotes;
