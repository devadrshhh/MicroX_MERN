import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://microx-mern.onrender.com'
});

// Global Response Interceptor for Auto-Logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message;
      if (message === 'Account suspended' || message === 'Not authorized, token failed') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login?reason=blocked';
      }
    }
    return Promise.reject(error);
  }
);

export default api;