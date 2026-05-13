import { useState, useEffect } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronRight, Zap, Shield, Rocket, Users, BookOpen, Sparkles } from 'lucide-react';
const Home = () => {
  const [freeNotes, setFreeNotes] = useState([]);

  useEffect(() => {
    const fetchLatestFreeNotes = async () => {
      try {
        const res = await api.get('/api/community/approved');
        setFreeNotes(res.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch home free notes');
      }
    };
    fetchLatestFreeNotes();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8"
          >
            Evolution of Learning
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.0] md:leading-[0.9]"
          >
            MICROX <br /> <span className="text-white/20">ECOSYSTEM</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] md:text-xl text-white/40 max-w-2xl mx-auto mb-10 md:mb-12 px-4"
          >
            The definitive platform for HSE and UG students. <br className="hidden md:block" />
            Premium study materials, micro copies, and expert notes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
          >
            {/* Addictive Notes Button */}
            <Link to="/materials/Notes" className="group relative w-64 sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-white to-gray-400 rounded-xl md:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-xl md:rounded-2xl text-sm md:text-base font-black flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02] active:scale-[0.98]">
                EXPLORE NOTES <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Addictive Microcopy Button */}
            <Link to="/materials/Microcopy" className="group relative w-64 sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/30 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative px-8 md:px-10 py-4 md:py-5 bg-black border border-white/20 text-white rounded-xl md:rounded-2xl text-sm md:text-base font-black flex items-center justify-center gap-2 transition-all group-hover:bg-white/5 group-hover:border-white/40 group-hover:scale-[1.02] active:scale-[0.98]">
                MICROCOPY <Sparkles size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 blur-[120px] rounded-full -z-0"></div>
      </section>

      {/* NEW: Free Notes Community Section */}
      <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-black to-white/[0.02]">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-white/40 mb-6">
                <Users size={20} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Community Power</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
                FREE NOTES <br /> <span className="text-white/20 text-3xl md:text-5xl italic font-medium tracking-normal">BY THE STUDENTS, <br /> FOR THE STUDENTS.</span>
              </h2>
              <p className="text-white/40 text-lg mb-10 leading-relaxed max-w-lg">
                Join our decentralized learning community. Access thousands of free crowd-sourced notes, assignments, and presentations.
              </p>
              <Link to="/free-notes" className="inline-flex items-center gap-4 text-white font-bold group">
                <span className="bg-white/5 border border-white/10 p-4 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                  <BookOpen size={24} />
                </span>
                <span className="border-b border-white/20 pb-1 group-hover:border-white transition-all">Browse Community Library</span>
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {freeNotes.length > 0 ? freeNotes.map((note, idx) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/20 mb-2 block">{note.category} • {note.stream}</span>
                    <h4 className="text-lg font-bold mb-1 truncate">{note.subject}</h4>
                    <p className="text-[11px] text-white/40 italic">By {note.uploadedBy}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/20">{note.type}</span>
                    <Link to="/free-notes" className="text-white/40 hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              )) : (
                <>
                  <div className="glass p-8 rounded-3xl border border-white/5 animate-pulse flex flex-col gap-4">
                    <div className="h-4 w-24 bg-white/5 rounded"></div>
                    <div className="h-6 w-48 bg-white/10 rounded"></div>
                    <div className="h-4 w-32 bg-white/5 rounded"></div>
                  </div>
                  <div className="glass p-8 rounded-3xl border border-white/5 animate-pulse flex flex-col gap-4">
                    <div className="h-4 w-24 bg-white/5 rounded"></div>
                    <div className="h-6 w-48 bg-white/10 rounded"></div>
                    <div className="h-4 w-32 bg-white/5 rounded"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap size={24} />}
              title="Fast Access"
              desc="Instant download after secure payment."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Secure"
              desc="End-to-end encrypted material delivery."
            />
            <FeatureCard
              icon={<Rocket size={24} />}
              title="Premium Quality"
              desc="Curated by top educators and scholars."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-40 px-6">
        <div className="container mx-auto">
          <div className="glass p-12 md:p-24 rounded-[3rem] md:rounded-[5rem] text-center relative overflow-hidden">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">Ready to level up?</h2>
            <Link to="/materials/Notes" className="inline-flex bg-white text-black px-12 py-6 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl">
              START NOW
            </Link>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-white/20 text-[10px] uppercase tracking-widest">
        © 2026 MICROX ECOSYSTEM. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="glass p-10 rounded-[2.5rem] border border-white/10"
  >
    <div className="text-white mb-6 bg-white/5 w-12 h-12 flex items-center justify-center rounded-2xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;
