import { useState, useEffect } from 'react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import { CreditCard, FileText, Users, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalMaterials: 0, 
    totalFreeNotes: 0, 
    totalDownloads: 0,
    materialDownloads: 0,
    freeNoteDownloads: 0,
    totalRevenue: 0 
  });
  const [revenueStats, setRevenueStats] = useState({ materialWiseRevenue: [] });
  const [communityStats, setCommunityStats] = useState({ pending: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const resStats = await api.get('/api/admin/stats', config);
        setStats(resStats.data);

        const resRev = await api.get('/api/payments/stats', config);
        setRevenueStats(resRev.data);

        const resPending = await api.get('/api/community/pending', config);
        setCommunityStats({ pending: resPending.data.length });
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: 'text-white' },
    { title: 'Total Downloads', value: stats.totalDownloads, icon: FileText, color: 'text-blue-400' },
    { title: 'Paid Downloads', value: stats.materialDownloads, icon: CreditCard, color: 'text-green-400' },
    { title: 'Free Downloads', value: stats.freeNoteDownloads, icon: FileText, color: 'text-white/40' },
    { title: 'Total Students', value: stats.totalUsers, icon: Users, color: 'text-white/60' },
    { title: 'Pending Requests', value: communityStats.pending, icon: CreditCard, color: 'text-red-400' },
  ];

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-white/40">Overview of your platform performance</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-3xl border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <Icon size={24} className={card.color} />
                  </div>
                </div>
                <h3 className="text-white/40 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-6">Subject Performance</h2>
            <div className="space-y-4">
              {revenueStats.materialWiseRevenue.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <span className="font-medium">{item._id}</span>
                  <span className="font-bold">₹{item.total}</span>
                </div>
              ))}
              {revenueStats.materialWiseRevenue.length === 0 && <p className="text-white/40">No data available</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
