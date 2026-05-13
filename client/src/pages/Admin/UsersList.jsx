import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Calendar, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.orderIds?.some(id => id?.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const toggleBlock = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Registered Users</h1>
            <p className="text-white/40">Manage and monitor student accounts</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Student</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Email</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40">Joined Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-all group"
                    >
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                          {u.name?.[0] || 'U'}
                        </div>
                        <span className="font-bold">{u.name || 'Unknown User'}</span>
                      </td>
                      <td className="px-8 py-6 text-white/60">
                        <div className="flex items-center gap-2">
                           <Mail size={14} className="text-white/20" />
                           {u.email}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${u.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                          {u.isBlocked ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-white/60">
                        <div className="flex items-center gap-2 text-xs">
                           <Calendar size={14} className="text-white/20" />
                           {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => toggleBlock(u._id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                            u.isBlocked 
                              ? 'bg-green-500 text-black border-green-500 hover:bg-green-400' 
                              : 'bg-transparent text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          {u.isBlocked ? 'UNBLOCK USER' : 'BLOCK USER'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-20 text-center text-white/40 italic">No users registered yet</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersList;
