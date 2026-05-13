import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    
    if (token) {
      fetchUser(token);
    } else if (guestStatus) {
      setIsGuest(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsGuest(false);
    } catch (err) {
      localStorage.removeItem('userToken');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('userToken', token);
    localStorage.removeItem('isGuest');
    setUser(userData);
    setIsGuest(false);
  };

  const setGuest = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('userToken');
    setUser(null);
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('isGuest');
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, logout, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
