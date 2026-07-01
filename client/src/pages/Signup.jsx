import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, RefreshCw, ChevronLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState('signup'); // 'signup' | 'otp'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // OTP Verification States
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [resendTimer, setResendTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef([]);

  // Google Sign-In Callback
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/google', { credential: response.credential });
      login(res.data.token, res.data.user);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

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

      const btnContainer = document.getElementById('google-signup-btn');
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

    if (step === 'signup') {
      initializeGoogleSignIn();
    }

    return () => {
      isMounted = false;
    };
  }, [step]);

  // Resend Countdown Timer Effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Step 1: Submit Details & Request OTP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', formData);
      toast.success('Verification code sent to your email!');
      
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', formData);
      toast.success('New verification code sent!');
      
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      setOtpStatus('idle');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP Backend Call
  const handleVerifyOTP = async (otpCode) => {
    setOtpLoading(true);
    setOtpStatus('idle');
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email: formData.email,
        otp: otpCode
      });
      
      setOtpStatus('success');
      toast.success('Email verified successfully!');
      
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/');
      }, 1800);
    } catch (err) {
      setOtpStatus('error');
      setShake(true);
      toast.error(err.response?.data?.message || 'Verification failed');
      
      setTimeout(() => {
        setShake(false);
        setOtpValues(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 600);
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Input event handlers
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Allow numbers only

    const newValues = [...otpValues];
    const char = val.substring(val.length - 1);
    newValues[index] = char;
    setOtpValues(newValues);

    if (char !== '') {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    const fullCode = newValues.join('');
    if (fullCode.length === 6 && !newValues.includes('')) {
      handleVerifyOTP(fullCode);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpValues[index] === '') {
        if (index > 0) {
          const newValues = [...otpValues];
          newValues[index - 1] = '';
          setOtpValues(newValues);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digitsOnly = pasteData.replace(/\D/g, '').substring(0, 6);
    
    if (digitsOnly.length > 0) {
      const newValues = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newValues[i] = digitsOnly[i] || '';
      }
      setOtpValues(newValues);
      
      const nextFocusIndex = Math.min(digitsOnly.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
      
      if (digitsOnly.length === 6) {
        handleVerifyOTP(digitsOnly);
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

      {step === 'signup' ? (
        <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 text-white/20 hover:text-white flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-all z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg p-1">
          <ArrowRight className="rotate-180" size={16} /> Home
        </Link>
      ) : (
        <button 
          onClick={() => setStep('signup')}
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
          {step === 'signup' ? (
            <motion.div
              key="signup-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Minimal Logo & Branding */}
              <div className="flex flex-col items-center mb-8 text-center">
                <Sparkles className="text-white w-8 h-8 mb-3 opacity-80" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">Join MicroX</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">Create your student account</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-white/40" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[44px] bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[44px] bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'SENDING CODE...' : 'VERIFY EMAIL'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
                {/* Divider */}
                <div className="flex items-center py-1">
                  <div className="flex-1 border-t border-white/5"></div>
                  <span className="px-3 text-[10px] text-white/20 uppercase tracking-widest font-bold">OR</span>
                  <div className="flex-1 border-t border-white/5"></div>
                </div>

                {/* Google Sign-in Button with Logo & Transparent GSI Overlay */}
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
                  {/* Transparent GSI overlay */}
                  <div className="absolute inset-0 w-full h-full opacity-[0.02] cursor-pointer">
                    <div id="google-signup-btn" className="w-full h-full"></div>
                  </div>
                </div>

                {/* Bottom redirection */}
                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-white/20 mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white hover:text-white/80 underline transition-all">
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col items-center mb-8 text-center w-full">
                <RefreshCw className="text-white w-8 h-8 mb-3 opacity-80 animate-spin" style={{ animationDuration: '3s' }} />
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">Verify Email</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-1">
                  Enter 6-digit code sent to <br />
                  <span className="text-white/70 lowercase font-mono">{formData.email}</span>
                </p>
              </div>

              {/* Success State Overlay */}
              {otpStatus === 'success' ? (
                <motion.div 
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center py-6 space-y-4"
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
                  <div className="text-center">
                    <h3 className="text-green-500 text-xs font-bold uppercase tracking-wider">Email Verified Successfully</h3>
                    <p className="text-white/60 text-[10px] mt-1 uppercase font-bold">Welcome, {formData.name}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full space-y-6">
                  {/* OTP Inputs Grid */}
                  <motion.div 
                    variants={shakeVariants}
                    animate={shake ? "shake" : "idle"}
                    className="flex justify-between gap-1.5"
                  >
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        disabled={otpLoading}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={handleOtpPaste}
                        className={`w-10 h-12 sm:w-12 sm:h-14 bg-white/[0.02] border text-center text-lg font-bold rounded-xl focus:outline-none focus:bg-white/[0.06] transition-all
                          ${otpStatus === 'error' ? 'border-red-500 text-red-400 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}
                          ${otpStatus === 'success' ? 'border-green-500 text-green-400 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : ''}
                          ${otpStatus === 'idle' ? 'border-white/5 text-white focus:border-white/20' : ''}
                        `}
                      />
                    ))}
                  </motion.div>

                  {otpLoading && (
                    <div className="flex items-center justify-center gap-2 text-white/50 text-[9px] uppercase tracking-widest font-bold py-2">
                      <RefreshCw size={12} className="animate-spin text-white/40" />
                      <span>Verifying code...</span>
                    </div>
                  )}

                  {otpStatus === 'error' && !otpLoading && (
                    <p className="text-center text-red-400 text-[9px] uppercase font-bold tracking-wider leading-relaxed">
                      Invalid verification code.<br />Please try again.
                    </p>
                  )}

                  {/* Timer & Resend Button */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    {resendTimer > 0 ? (
                      <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
                        Resend code in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
