import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, Download, Eye, ThumbsUp, FileText, FileCode, Presentation, FilePieChart, X, UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';

const FreeNotes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStream, setActiveStream] = useState('ALL');
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'Notes', category: 'HSE',
    stream: '', classLevel: 'Plus One', semester: 'Semester 1', subject: '', chapter: 'ALL', uploadedBy: ''
  });
  const [file, setFile] = useState(null);

  const streams = ['Science', 'Commerce', 'Humanities', 'Language'];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/approved');
      setNotes(res.data);
      setFilteredNotes(res.data);
    } catch (err) {
      toast.error('Failed to load community notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = notes.filter(n => {
      const matchSubCat = !selectedSubCategory || n.category === selectedSubCategory;
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase());
      const matchStream = activeStream === 'ALL' || n.stream === activeStream;
      const matchLevel = activeLevel === 'ALL' ||
        (n.category === 'HSE' ? n.classLevel === activeLevel : n.semester === activeLevel);

      return matchSubCat && matchSearch && matchStream && matchLevel;
    });
    setFilteredNotes(filtered);
  }, [search, activeStream, activeLevel, notes, selectedSubCategory]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setIsUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('file', file);

    try {
      await api.post('/api/community/upload', data);
      toast.success('Submitted for approval!');
      setShowUploadModal(false);
      setFormData({ title: '', description: '', type: 'Notes', category: 'HSE', stream: '', classLevel: 'Plus One', semester: 'Semester 1', subject: '', chapter: 'ALL', uploadedBy: '' });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await api.post(`/api/community/like/${id}`);
      setNotes(notes.map(n => n._id === id ? { ...n, likes: data.likes } : n));
    } catch (err) { /* silent fail */ }
  };

  const handleDownload = (note) => {
    // We use a window.location change or an invisible link for the download endpoint
    // which sets Content-Disposition: attachment
    window.location.href = `/api/community/download/${note._id}`;
    toast.info('Download started...');
  };

  const getFileIcon = (ext, size = 32) => {
    if (ext.includes('pdf')) return <FileText className="text-red-400" size={size} />;
    if (ext.includes('doc')) return <FileCode className="text-blue-400" size={size} />;
    if (ext.includes('ppt')) return <Presentation className="text-orange-400" size={size} />;
    return <FilePieChart className="text-gray-400" size={size} />;
  };

  // 1. Get unique streams for current category
  const availableStreams = ['ALL', ...new Set(
    notes
      .filter(n => !selectedSubCategory || n.category === selectedSubCategory)
      .map(n => n.stream)
      .filter(Boolean)
  )];

  // 2. Get unique levels (Class/Semester) for current stream
  const dynamicTabs = ['ALL', ...new Set(
    notes
      .filter(n => !selectedSubCategory || n.category === selectedSubCategory)
      .filter(n => activeStream === 'ALL' || n.stream === activeStream)
      .map(n => n.category === 'HSE' ? n.classLevel : n.semester)
      .filter(Boolean)
  )];

  return (
    <div className="bg-black min-h-screen pb-20">
      <Navbar />

      {/* Floating Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-10 right-10 z-[90] bg-white text-black p-5 rounded-full shadow-2xl flex items-center gap-3 font-bold group"
      >
        <Plus size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">UPLOAD NOTE</span>
      </motion.button>

      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32">
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search and Category */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 md:gap-6">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input
                  type="text"
                  placeholder="Search free notes..."
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
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {dynamicTabs.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveLevel(f)}
                    className={`px-4 md:px-6 py-1.5 rounded-full text-[9px] md:text-xs font-medium border transition-all whitespace-nowrap ${activeLevel === f ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/40">
            <Loader2 className="animate-spin" size={40} />
            <p>Gathering knowledge...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredNotes.map((n, i) => (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-5 rounded-[2rem] border border-white/10 flex flex-col group hover:border-white/20 transition-all"
                >
                  {/* Text-Based Thumbnail */}
                  <div className="h-40 bg-white/5 rounded-[2rem] mb-5 flex flex-col items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all p-5 text-center relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      {getFileIcon(n.fileType, 100)}
                    </div>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1 z-10">
                      {n.category === 'HSE' ? `${n.classLevel} • ${n.stream}` : `${n.semester} • ${n.stream}`}
                    </span>
                    <h4 className="text-lg font-black tracking-tighter leading-tight uppercase z-10">{n.subject}</h4>
                    <div className="mt-3 w-6 h-[1.5px] bg-white/20 group-hover:w-10 transition-all z-10"></div>

                    <div className="absolute top-4 right-4 bg-white/5 px-2 py-1 rounded-lg border border-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40">
                      {n.fileType.replace('.', '')}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[9px] uppercase tracking-widest text-white/40">{n.category} • {n.type}</span>
                      <button onClick={() => handleLike(n._id)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                        <ThumbsUp size={14} /> {n.likes}
                      </button>
                    </div>
                    <h3 className="text-lg font-bold mb-1 leading-tight">{n.title}</h3>
                    <p className="text-xs text-white/40 mb-4">{n.subject} • By {n.uploadedBy}</p>
                  </div>

                  <button
                    onClick={() => window.open(`/${n.filePath}`, '_blank')}
                    className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-gray-200 transition-all text-sm"
                  >
                    <Download size={16} /> Download Now
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl glass p-8 md:p-12 rounded-[3rem] border border-white/10 overflow-y-auto max-h-[90vh] scrollbar-none"
            >
              <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>

              <div className="text-center mb-10">
                <h3 className="text-3xl font-black tracking-tighter mb-2">Share Knowledge</h3>
                <p className="text-white/40">Contribute to the MICROX community library</p>
              </div>

              <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Note Title</label>
                    <input type="text" name="title" required onChange={handleInputChange} placeholder="e.g. Physics Quantum Mechanics" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Description</label>
                    <textarea name="description" rows="2" onChange={handleInputChange} placeholder="Brief summary of the content..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Type</label>
                      <select name="type" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                        {['Notes', 'Microcopy', 'PPT', 'Assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Category</label>
                      <select name="category" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                        <option value="HSE">HSE</option>
                        <option value="UG">UG</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Your Name (Optional)</label>
                    <input type="text" name="uploadedBy" onChange={handleInputChange} placeholder="Display as contributor" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                  </div>
                </div>

                <div className="space-y-6">
                  {formData.category === 'HSE' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Stream</label>
                        <select name="stream" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          <option value="">Select</option>
                          {streams.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Class</label>
                        <select name="classLevel" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          <option value="Plus One">Plus One</option>
                          <option value="Plus Two">Plus Two</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">UG Stream</label>
                        <input type="text" name="stream" placeholder="B.Com, etc" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Semester</label>
                        <select name="semester" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none text-white [&>option]:bg-black">
                          {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Subject</label>
                    <input type="text" name="subject" required onChange={handleInputChange} placeholder="e.g. Mathematics" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2">Upload File (PDF, DOC, PPT)</label>
                    <div className="h-40 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center group-hover:border-white/30 transition-all relative overflow-hidden bg-white/5">
                      <input type="file" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <UploadCloud size={32} className="text-white/20 mb-2 group-hover:text-white transition-all" />
                      <p className="text-xs text-white/40">{file ? file.name : 'Click or Drag to Upload'}</p>
                    </div>
                  </div>

                  <button
                    disabled={isUploading}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : 'SUBMIT FOR APPROVAL'}
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

export default FreeNotes;
