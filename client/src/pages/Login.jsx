import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Sparkles, Mail, Eye, EyeOff, RefreshCw, ChevronLeft } from 'lucide-react';

const Login = () => {
  const [view, setView] = useState('login'); // 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_reset' | 'forgot_success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot Password / Reset States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpValues, setForgotOtpValues] = useState(['', '', '', '', '', '']);
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotOtpStatus, setForgotOtpStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
  const [forgotDevOtp, setForgotDevOtp] = useState('');
  const [forgotShake, setForgotShake] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const otpRefs = useRef([]);

  // Check if redirect has parameters (prefill email after reset) or remembered email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetEmail = params.get('resetEmail');
    if (resetEmail) {
      setEmail(resetEmail);
      toast.success('Password updated successfully. Please sign in with your new password.', { autoClose: 3000 });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Timer effect for Forgot Password OTP Resend
  useEffect(() => {
    if (forgotOtpTimer > 0) {
      const timer = setTimeout(() => setForgotOtpTimer(forgotOtpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotOtpTimer]);

  // Focus first OTP input when transition to OTP view occurs
  useEffect(() => {
    if (view === 'forgot_otp') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [view]);

  // Google Sign-In Callback
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/google', { credential: response.credential });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // Initialize GSI
  useEffect(() => {
    let isMounted = true;

    const initializeGoogleSignIn = () => {
      if (typeof window.google === 'undefined') {
        setTimeout(() => {
          if (isMounted) initializeGoogleSignIn();
        }, 300);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        cancel_on_tap_outside: true
      });

      const btnContainer = document.getElementById('google-signin-btn');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '360'
        });
      }
    };

    if (view === 'login') {
      initializeGoogleSignIn();
    }

    return () => {
      isMounted = false;
    };
  }, [view]);

  // Standard Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      // Save or remove remembered email
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Email for Password Reset
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      toast.success('Verification code sent to your email!');
      
      if (res.data.otp) {
        setForgotDevOtp(res.data.otp);
      }
      
      setView('forgot_otp');
      setForgotOtpTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend Reset OTP
  const handleResendResetOTP = async () => {
    if (forgotOtpTimer > 0) return;
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      toast.success('New verification code sent!');
      
      if (res.data.otp) {
        setForgotDevOtp(res.data.otp);
      }
      
      setForgotOtpTimer(60);
      setForgotOtpValues(['', '', '', '', '', '']);
      setForgotOtpStatus('idle');
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify Reset OTP code
  const handleVerifyResetOTP = async (otpCode) => {
    setForgotOtpLoading(true);
    setForgotOtpStatus('idle');
    try {
      await api.post('/api/auth/verify-reset-otp', {
        email: forgotEmail,
        otp: otpCode
      });
      
      setForgotOtpStatus('success');
      toast.success('Code verified successfully!');
      
      setTimeout(() => {
        setView('forgot_reset');
      }, 1500);
    } catch (err) {
      setForgotOtpStatus('error');
      setForgotShake(true);
      toast.error(err.response?.data?.message || 'Verification failed');
      
      setTimeout(() => {
        setForgotShake(false);
        setForgotOtpValues(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }, 600);
    } finally {
      setForgotOtpLoading(false);
    }
  };

  // Step 4: Update Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtpValues.join(''),
        password: newPassword
      });
      
      setView('forgot_success');
      
      setTimeout(() => {
        // Auto-login user with the returned JWT token and user info
        login(res.data.token, res.data.user);
        
        // Clear reset states
        setNewPassword('');
        setConfirmPassword('');
        setForgotOtpValues(['', '', '', '', '', '']);
        
        toast.success('Password updated successfully. Welcome back!', { autoClose: 3000 });
        navigate('/');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs key listeners
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newValues = [...forgotOtpValues];
    const char = val.substring(val.length - 1);
    newValues[index] = char;
    setForgotOtpValues(newValues);

    if (char !== '') {
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    const fullCode = newValues.join('');
    if (fullCode.length === 6 && !newValues.includes('')) {
      handleVerifyResetOTP(fullCode);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (forgotOtpValues[index] === '') {
        if (index > 0) {
          const newValues = [...forgotOtpValues];
          newValues[index - 1] = '';
          setForgotOtpValues(newValues);
          otpRefs.current[index - 1]?.focus();
        }
      } else {
        const newValues = [...forgotOtpValues];
        newValues[index] = '';
        setForgotOtpValues(newValues);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digitsOnly = pasteData.replace(/\D/g, '').substring(0, 6);
    
    if (digitsOnly.length > 0) {
      const newValues = [...forgotOtpValues];
      for (let i = 0; i < 6; i++) {
        newValues[i] = digitsOnly[i] || '';
      }
      setForgotOtpValues(newValues);
      
      const nextFocusIndex = Math.min(digitsOnly.length, 5);
      otpRefs.current[nextFocusIndex]?.focus();
      
      if (digitsOnly.length === 6) {
        handleVerifyResetOTP(digitsOnly);
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: { duration: 0.5 }
    }
  };

  const tickVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1, 
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.2 } 
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] bg-white/[0.03] blur-[70px] sm:blur-[110px] rounded-full pointer-events-none"></div>

      {view === 'login' && (
        <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 text-white/20 hover:text-white flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-all z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg p-1">
          <ArrowRight className="rotate-180" size={16} /> Home
        </Link>
      )}

      {view !== 'login' && view !== 'forgot_success' && (
        <button 
          onClick={() => setView(view === 'forgot_email' ? 'login' : view === 'forgot_otp' ? 'forgot_email' : 'forgot_otp')}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 text-white/20 hover:text-white flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-all z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg p-1"
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-[92%] sm:w-[95%] md:w-[420px] bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-[16px] animate-fade-in-slide my-12"
      >
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {/* Minimal Logo & Branding */}
              <div className="flex flex-col items-center mb-8 text-center">
                <Sparkles className="text-white w-8 h-8 mb-3 opacity-80" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Welcome to MicroX</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">Continue your learning journey</p>
              </div>

              {new URLSearchParams(window.location.search).get('reason') === 'blocked' && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
                >
                  <h2 className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">Access Denied</h2>
                  <p className="text-red-400 text-[10px] font-semibold uppercase leading-tight">YOU ARE BANNED BY MICROX</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-12 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-widest">
                  <label className="flex items-center gap-2 text-white/30 hover:text-white/40 cursor-pointer select-none transition-all">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 accent-white cursor-pointer"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot_email');
                    }}
                    className="text-white/30 hover:text-white/50 transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[44px] bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'AUTHENTICATING...' : 'SIGN IN'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
                {/* Divider Line */}
                <div className="flex items-center py-1">
                  <div className="flex-1 border-t border-white/5"></div>
                  <span className="px-3 text-[10px] text-white/20 uppercase tracking-widest font-bold">OR</span>
                  <div className="flex-1 border-t border-white/5"></div>
                </div>

                {/* Google Sign-in Button with Logo & Transparent GSI Click Catch Overlay */}
                <div className="relative w-full h-[44px]">
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all duration-300 pointer-events-none">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Continue with Google</span>
                  </div>
                  {/* Transparent iframe container overlaid */}
                  <div className="absolute inset-0 w-full h-full opacity-[0.02] cursor-pointer">
                    <div id="google-signin-btn" className="w-full h-full"></div>
                  </div>
                </div>

                {/* Bottom Redirection text */}
                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-white/20 mt-2">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-white hover:text-white/80 underline transition-all">
                    Sign Up
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {view === 'forgot_email' && (
            <motion.div
              key="forgot-email-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center mb-8 text-center">
                <Mail className="text-white w-8 h-8 mb-3 opacity-80 animate-pulse" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">Reset Password</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">Enter your registered email address</p>
              </div>

              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type="email"
                    placeholder="Registered Email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[44px] bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY EMAIL'} <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          )}

          {view === 'forgot_otp' && (
            <motion.div
              key="forgot-otp-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col items-center mb-8 text-center w-full">
                <RefreshCw className="text-white w-8 h-8 mb-3 opacity-85 animate-spin" style={{ animationDuration: '3s' }} />
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">Verify OTP</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">
                  Enter 6-digit code sent to <br />
                  <span className="text-white/70 lowercase font-mono">{forgotEmail}</span>
                </p>
              </div>

              {forgotOtpStatus === 'success' ? (
                <div className="flex flex-col items-center py-4 space-y-3">
                  <svg className="w-12 h-12 text-green-500" viewBox="0 0 52 52">
                    <circle className="stroke-current fill-none" cx="26" cy="26" r="25" strokeWidth="3" />
                    <motion.path 
                      className="stroke-current fill-none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="3.5"
                      d="M14 27l8 8 16-16"
                      variants={tickVariants}
                      initial="hidden"
                      animate="visible"
                    />
                  </svg>
                  <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">OTP Verified</span>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <motion.div 
                    variants={shakeVariants}
                    animate={forgotShake ? "shake" : "idle"}
                    className="flex justify-between gap-1.5"
                  >
                    {forgotOtpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        disabled={forgotOtpLoading}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={handleOtpPaste}
                        className={`w-10 h-12 sm:w-12 sm:h-14 bg-white/[0.02] border text-center text-lg font-bold rounded-xl focus:outline-none focus:bg-white/[0.06] transition-all
                          ${forgotOtpStatus === 'error' ? 'border-red-500 text-red-400 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}
                          ${forgotOtpStatus === 'success' ? 'border-green-500 text-green-400 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : ''}
                          ${forgotOtpStatus === 'idle' ? 'border-white/5 text-white focus:border-white/20' : ''}
                        `}
                      />
                    ))}
                  </motion.div>

                  {forgotOtpLoading && (
                    <div className="flex items-center justify-center gap-2 text-white/50 text-[9px] uppercase tracking-widest font-bold py-1">
                      <RefreshCw size={12} className="animate-spin text-white/40" />
                      <span>Verifying...</span>
                    </div>
                  )}

                  {forgotOtpStatus === 'error' && !forgotOtpLoading && (
                    <p className="text-center text-red-400 text-[9px] uppercase font-bold tracking-wider leading-relaxed">
                      Invalid or expired verification code.
                    </p>
                  )}

                  <div className="flex flex-col items-center gap-2 pt-1">
                    {forgotOtpTimer > 0 ? (
                      <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
                        Resend code in {forgotOtpTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendResetOTP}
                        disabled={loading}
                        className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'forgot_reset' && (
            <motion.div
              key="forgot-reset-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center mb-8 text-center">
                <Lock className="text-white w-8 h-8 mb-3 opacity-80" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">New Password</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">Set up your new account password</p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-12 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors cursor-pointer p-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                  className="w-full h-[44px] bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'UPDATING...' : 'UPDATE PASSWORD'} <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          )}

          {view === 'forgot_success' && (
            <motion.div
              key="forgot-success-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 space-y-4 text-center"
            >
              <svg className="w-16 h-16 text-green-500" viewBox="0 0 52 52">
                <circle className="stroke-current fill-none" cx="26" cy="26" r="25" strokeWidth="3" />
                <motion.path 
                  className="stroke-current fill-none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="3.5"
                  d="M14 27l8 8 16-16"
                  variants={tickVariants}
                  initial="hidden"
                  animate="visible"
                />
              </svg>
              <div className="space-y-1">
                <h2 className="text-green-500 text-sm font-bold uppercase tracking-wider">✅ Password Updated Successfully</h2>
                <p className="text-white/60 text-xs leading-normal">Your password has been changed successfully.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
