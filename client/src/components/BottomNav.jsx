import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, BookOpen, User, LogOut, FilePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Micro', path: '/materials/Microcopy', icon: Sparkles },
    { name: 'Free', path: '/free-notes', icon: FilePlus },
    { name: 'Notes', path: '/materials/Notes', icon: BookOpen },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pointer-events-none">
      <div className="glass rounded-full border border-white/10 p-1.5 flex items-center justify-between shadow-2xl pointer-events-auto max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all ${
                isActive ? 'bg-white text-black scale-105 shadow-lg' : 'text-white/40'
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[7px] font-bold uppercase tracking-tighter mt-0.5">{item.name}</span>
            </Link>
          );
        })}

        {user ? (
          <button
            onClick={logout}
            className="flex-1 flex flex-col items-center py-2 text-white/40 hover:text-white transition-all"
          >
            <LogOut size={14} />
            <span className="text-[7px] font-bold uppercase tracking-tighter mt-0.5">Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all ${
              location.pathname === '/login' ? 'bg-white text-black scale-105 shadow-lg' : 'text-white/40'
            }`}
          >
            <User size={14} strokeWidth={location.pathname === '/login' ? 3 : 2} />
            <span className="text-[7px] font-bold uppercase tracking-tighter mt-0.5">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
