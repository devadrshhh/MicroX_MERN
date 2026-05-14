import { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { Trash2, ExternalLink, Download, Edit3, X, Save, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageUploads = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', amount: '', type: 'Notes', category: 'HSE',
    stream: '', classLevel: 'Plus One', semester: 'Semester 1',
    subject: '', chapter: 'ALL'
  });

  const streams = ['Science', 'Commerce', 'Humanities', 'Language'];
  const chapters = ['ALL', ...Array.from({ length: 25 }, (_, i) => (i + 1).toString())];

  const fetchMaterials = async () => {
    const res = await api.get('/api/materials');
    setMaterials(res.data);
    setFilteredMaterials(res.data);
  };

  useEffect(() => { fetchMaterials(); }, []);

  useEffect(() => {
    const filtered = materials.filter(m => {
      const matchCategory = activeCategory === 'ALL' || m.category === activeCategory;
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.subject.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
    setFilteredMaterials(filtered);
  }, [search, materials, activeCategory]);

  const openEdit = (m) => {
    setEditingMaterial(m);
    setEditForm({
      title: m.title, amount: m.amount, type: m.type, category: m.category,
      stream: m.stream || '', classLevel: m.classLevel || 'Plus One',
      semester: m.semester || 'Semester 1', subject: m.subject, chapter: m.chapter || 'ALL'
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await api.put(`/api/materials/${editingMaterial._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Material Updated');
      setIsEditing(false);
      fetchMaterials();
    } catch (error) {
      toast.error('Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await api.delete(`/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Material Deleted');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10 overflow-x-hidden">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Manage Uploads</h1>
            <p className="text-white/40">Edit or remove your uploaded content</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>
        </header>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mb-8">
          {['ALL', 'HSE', 'UG'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Material</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest text-center">Price</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest text-center">Downloads</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMaterials.map((m) => (
                  <tr key={m._id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="font-bold">{m.title}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-tighter">{m.subject} • {m.type} • CH: {m.chapter}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        {m.category} • {m.category === 'HSE' ? m.classLevel : m.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-center">₹{m.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-white/5 px-4 py-1.5 rounded-xl text-xs font-bold text-white/60">
                        {m.downloadCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                          <Edit3 size={18} />
                        </button>
                        <a href={`/view/${m._id}`} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                          <ExternalLink size={18} />
                        </a>
                        <button onClick={() => handleDelete(m._id)} className="p-2.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-black transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materials.length === 0 && <div className="p-20 text-center text-white/40">No materials uploaded yet</div>}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl glass p-8 md:p-12 rounded-[3rem] border border-white/10 overflow-y-auto max-h-[90vh] scrollbar-none"
            >
              <button onClick={() => setIsEditing(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>

              <div className="mb-10">
                <h3 className="text-3xl font-black tracking-tighter">Edit Material</h3>
                <p className="text-white/40">Update material details across the ecosystem</p>
              </div>

              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Title</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Type</label>
                      <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                        <option value="Notes">Notes</option>
                        <option value="Microcopy">Microcopy</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Category</label>
                      <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                        <option value="HSE">HSE</option>
                        <option value="UG">UG</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Subject</label>
                    <input type="text" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                  </div>
                </div>

                <div className="space-y-6">
                  {editForm.category === 'HSE' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Stream</label>
                        <select value={editForm.stream} onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          <option value="">Select</option>
                          {streams.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Class</label>
                        <select value={editForm.classLevel} onChange={(e) => setEditForm({ ...editForm, classLevel: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          <option value="Plus One">Plus One</option>
                          <option value="Plus Two">Plus Two</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">UG Stream</label>
                        <input type="text" value={editForm.stream} onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Semester</label>
                        <select value={editForm.semester} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Chapter</label>
                      <select value={editForm.chapter} onChange={(e) => setEditForm({ ...editForm, chapter: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                        {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Amount (₹)</label>
                      <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> UPDATE MATERIAL</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUploads;
