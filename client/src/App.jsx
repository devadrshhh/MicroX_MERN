import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from '@vercel/analytics/react';

// Public Pages
import Home from './pages/Home';
import MaterialList from './pages/MaterialList';
import FreeNotes from './pages/FreeNotes';
import PDFViewer from './pages/PDFViewer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import About from './pages/About';
import BottomNav from './components/BottomNav';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import Requests from './pages/Admin/Requests';
import ManageFreeNotes from './pages/Admin/ManageFreeNotes';
import Upload from './pages/Admin/Upload';
import ManageUploads from './pages/Admin/ManageUploads';
import Payments from './pages/Admin/Payments';
import Settings from './pages/Admin/Settings';
import UsersList from './pages/Admin/UsersList';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-height-screen bg-black text-white">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/free-notes" element={<FreeNotes />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/materials/:category" element={<MaterialList />} />
            <Route path="/view/:id" element={<PDFViewer />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/admin/free-notes" element={<ProtectedRoute><ManageFreeNotes /></ProtectedRoute>} />
            <Route path="/admin/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/admin/manage" element={<ProtectedRoute><ManageUploads /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
          <BottomNav />
          <ToastContainer theme="dark" autoClose={2000} />
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
