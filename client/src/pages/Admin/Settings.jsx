import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import { Trash2, UserPlus } from 'lucide-react';

const Settings = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });

  const fetchAdmins = async () => {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get('http://localhost:5000/api/auth/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAdmins(res.data);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('http://localhost:5000/api/auth/add', newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin Added');
      setNewAdmin({ email: '', password: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add admin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin Removed');
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to remove admin');
    }
  };

  return (
    <div className="flex bg-black min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-64 lg:ml-72 pt-24 md:pt-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
          <p className="text-white/40">Manage your administrative team</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass p-8 rounded-3xl border border-white/10 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus size={20} /> Add New Admin
            </h2>
            <form onSubmit={handleAddAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" 
                  placeholder="admin@microx.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                <input 
                  type="password" 
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-white/30" 
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-white text-black py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                Create Admin Account
              </button>
            </form>
          </div>

          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 font-medium text-white/60">Email</th>
                  <th className="px-6 py-4 font-medium text-white/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 text-sm">{admin.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(admin._id)} className="p-2 hover:bg-red-400/20 rounded-lg text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default Settings;
