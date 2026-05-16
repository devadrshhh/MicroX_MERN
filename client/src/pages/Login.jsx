import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest();
    toast.info('Browsing as Guest');
    navigate('/');
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full"></div>

      <Link to="/" className="absolute top-8 left-8 text-white/20 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all z-20">
        <ArrowRight className="rotate-180" size={16} /> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[22rem] glass p-6 md:p-8 rounded-[2rem] border border-white/10"
      >
        <div className="text-center mb-6 md:mb-8">
          {new URLSearchParams(window.location.search).get('reason') === 'blocked' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
            >
              <h2 className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-1">Access Denied</h2>
              <p className="text-red-400 text-[10px] font-bold uppercase leading-tight">YOU ARE BANNED BY MICROX</p>
            </motion.div>
          )}
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-1">MICROX</h1>
          <p className="text-white/40 text-[9px] uppercase tracking-widest">Sign in to Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/30 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            {loading ? 'Authenticating...' : 'SIGN IN'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">
          <Link
            to="/signup"
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px]"
          >
            CREATE NEW ACCOUNT <Sparkles size={14} className="text-white/40" />
          </Link>

          <p className="text-center text-[8px] uppercase tracking-widest text-white/20">
            Join the MICROX ecosystem today
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
