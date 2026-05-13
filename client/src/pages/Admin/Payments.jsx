import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { IndianRupee, Search, Loader2 } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('http://localhost:5000/api/payments/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(res.data);
        setFilteredPayments(res.data);
      } catch (err) {
        console.error('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const filtered = payments.filter(p => 
      p.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
      p.subject?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [search, payments]);

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10 overflow-x-hidden">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Payments</h1>
            <p className="text-white/40">History of all transactions</p>
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
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Order Info</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Subject</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">User Email</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Date</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-6">
                        <div className="font-bold text-xs uppercase tracking-tighter text-white">{p.orderId || 'N/A'}</div>
                        <div className="text-[10px] font-mono text-white/30 mt-1">{p.razorpayPaymentId || 'PENDING'}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-bold text-sm">{p.subject}</div>
                        <div className="text-xs text-white/40">{p.stream}</div>
                      </td>
                      <td className="px-6 py-6 text-sm text-white/60">{p.userEmail}</td>
                      <td className="px-6 py-6 font-bold">₹{p.amount}</td>
                      <td className="px-6 py-6 text-sm text-white/40">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          p.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && <div className="p-20 text-center text-white/40 italic">No transactions match your search</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payments;
