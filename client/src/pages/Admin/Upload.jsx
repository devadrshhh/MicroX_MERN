import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Notes',
    category: 'HSE',
    stream: '',
    classLevel: 'Plus One',
    Sem: 'Sem 1',
    subject: '',
    chapter: 'ALL'
  });
  const [file, setFile] = useState(null);

  const streams = ['Science', 'Commerce', 'Humanities', 'Language'];
  const chapters = ['ALL', ...Array.from({ length: 25 }, (_, i) => (i + 1).toString())];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');

    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('pdf', file);

    try {
      await api.post('/api/materials/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Material Uploaded Successfully');
      navigate('/admin/manage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tighter">Upload Material</h1>
          <p className="text-white/40">Add new educational content to the platform</p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-3xl border border-white/10 max-w-4xl"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
                <input type="text" name="title" required onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Type</label>
                  <select name="type" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30 text-white [&>option]:bg-black [&>option]:text-white">
                    <option value="Notes">Notes</option>
                    <option value="Microcopy">Microcopy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Category</label>
                  <select name="category" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30 text-white [&>option]:bg-black [&>option]:text-white">
                    <option value="HSE">HSE</option>
                    <option value="UG">UG</option>
                  </select>
                </div>
              </div>

              {formData.category === 'HSE' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Stream</label>
                    <select name="stream" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30 text-white [&>option]:bg-black [&>option]:text-white">
                      <option value="">Select Stream</option>
                      {streams.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Class</label>
                    <select name="classLevel" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30 text-white [&>option]:bg-black [&>option]:text-white">
                      <option value="Plus One">Plus One</option>
                      <option value="Plus Two">Plus Two</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Stream Type</label>
                    <input type="text" name="stream" placeholder="e.g. B.Com, BSC" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Sem</label>
                    <select name="Sem" onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30 text-white [&>option]:bg-black [&>option]:text-white">
                      {Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Subject Name</label>
                <input type="text" name="subject" required onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Chapter Selection</label>
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 bg-white/5 rounded-2xl scrollbar-thin">
                  {chapters.map(c => (
                    <label key={c} className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all ${formData.chapter === c ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}>
                      <input type="radio" name="chapter" value={c} className="hidden" onChange={handleInputChange} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Amount (INR)</label>
                <input type="number" name="amount" required onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">PDF Upload</label>
                <div className="relative h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-items justify-center items-center hover:border-white/30 transition-all">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-white/40">{file ? file.name : 'Click or Drag PDF here'}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Uploading...' : 'Publish Material'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default Upload;
