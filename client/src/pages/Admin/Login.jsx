import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/admin-login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      toast.success('Access Granted');
      navigate('/admin');
    } catch (err) {
      toast.error('Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 md:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden"
      >
        <div className="relative z-10">
          <header className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Secure Access
            </div>
            <h1 className="text-3xl font-black tracking-tighter">MICROX ADMIN</h1>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-white/30 transition-all"
                  placeholder="admin@microx.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-white/30 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'AUTHENTICATE'}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        </div>

        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
      </motion.div>
    </div>
  );
};

export default Login;
