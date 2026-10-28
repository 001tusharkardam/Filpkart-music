import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Headphones,
  Flame,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmailInboxModal from './EmailInboxModal';

export default function AuthScreen() {
  const {
    startSignup,
    verifySignupOtp,
    loginWithPassword,
    startLoginWithOtp,
    verifyLoginOtp,
    pendingAuth,
    activeOtpBanner,
    resendOtp,
    cancelPendingAuth,
    dismissOtpBanner,
    setIsInboxModalOpen
  } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 6-digit OTP fields
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const otpInputsRef = useRef([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer;
    if (pendingAuth && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pendingAuth, countdown]);

  // Focus first OTP box when entering OTP mode
  useEffect(() => {
    if (pendingAuth) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setCountdown(45);
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 150);
    }
  }, [pendingAuth]);

  // Handle individual OTP digit typing & navigation
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const char = value.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto-advance to next box
    if (char && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^[0-9]{6}$/.test(pasted)) {
      const chars = pasted.split('');
      setOtpDigits(chars);
      if (otpInputsRef.current[5]) {
        otpInputsRef.current[5].focus();
      }
    }
  };

  // Submit Sign Up (Triggers OTP)
  const handleSubmitSignup = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      startSignup({ name, email, password });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Login
  const handleSubmitLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      if (loginMethod === 'password') {
        if (!password) {
          setErrorMsg('Please enter your password');
          setIsLoading(false);
          return;
        }
        loginWithPassword({ email, password });
      } else {
        // Login with OTP
        startLoginWithOtp(email);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    const fullCode = otpDigits.join('');

    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    try {
      if (pendingAuth.mode === 'signup') {
        verifySignupOtp(fullCode);
      } else {
        verifyLoginOtp(fullCode);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = () => {
    setEmail('tushar@flipkart.com');
    setPassword('password123');
    loginWithPassword({ email: 'tushar@flipkart.com', password: 'password123' });
  };

  // Autofill code from simulated email toast
  const handleAutofillOtp = (code) => {
    const chars = code.split('');
    setOtpDigits(chars);
    setErrorMsg('');
  };

  return (
    <div className="auth-portal-page">
      {/* Background Ambient Glows & Album Art Montage */}
      <div className="auth-ambient-blob blob-1" />
      <div className="auth-ambient-blob blob-2" />

      {/* Interactive Simulated Email Notification Toast */}
      {activeOtpBanner && (
        <div className="simulated-email-toast glass-panel glow-yellow">
          <div className="toast-left">
            <div className="email-icon-circle">
              <Mail size={18} />
            </div>
            <div className="toast-text">
              <span className="toast-sender">
                Flipkart Security • {activeOtpBanner.type}
              </span>
              <span className="toast-body">
                Verification OTP for <strong>{activeOtpBanner.email}</strong> is{' '}
                <strong className="toast-code">{activeOtpBanner.code}</strong>
              </span>
            </div>
          </div>

          <div className="toast-actions">
            <button
              className="toast-autofill-btn"
              onClick={() => handleAutofillOtp(activeOtpBanner.code)}
              title="Click to paste into OTP boxes"
            >
              <Copy size={13} />
              <span>Autofill Code</span>
            </button>
            <button
              className="toast-close-btn"
              onClick={dismissOtpBanner}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="auth-modal-card glass-panel">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <div className="logo-icon">
              <Music size={24} className="logo-music" />
              <span className="logo-sparkle">★</span>
            </div>
            <div className="logo-text">
              <span className="brand-flipkart">Flipkart</span>
              <span className="brand-music">Music</span>
            </div>
            <span className="plus-badge">PLUS</span>
          </div>
          <span className="auth-tagline">
            Stream 100M+ Songs in 320kbps Studio Ultra HD & Synced Lyrics
          </span>
        </div>

        {/* Conditional Screen: OTP Verification vs Login/Signup */}
        {pendingAuth ? (
          /* ================= STEP 2: EMAIL OTP VERIFICATION ================= */
          <div className="otp-verification-container">
            <div className="otp-icon-header">
              <div className="shield-icon-circle">
                <ShieldCheck size={32} className="shield-gold" />
              </div>
              <h2 className="otp-title">Verify Your Email</h2>
              <p className="otp-subtitle">
                We sent a 6-digit verification code to:
                <br />
                <strong className="highlight-email">{pendingAuth.email}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <form onSubmit={handleVerifyOtp} className="otp-form">
              <div className="otp-inputs-row" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`otp-digit-box ${digit ? 'filled' : ''}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="auth-primary-btn glow-yellow"
                disabled={isLoading || otpDigits.join('').length !== 6}
              >
                {isLoading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Verify & Unlock Music App</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Resend & Cancel Options */}
            <div className="otp-footer-options">
              <button
                type="button"
                className="open-inbox-preview-btn glow-yellow"
                onClick={() => setIsInboxModalOpen(true)}
              >
                <Mail size={16} />
                <span>Open Security Webmail (View Incoming OTP Email)</span>
              </button>

              {countdown > 0 ? (
                <span className="countdown-text">
                  Resend code in <strong>0:{countdown < 10 ? `0${countdown}` : countdown}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="resend-code-btn"
                  onClick={() => {
                    resendOtp();
                    setCountdown(45);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Resend Verification Code</span>
                </button>
              )}

              <button
                type="button"
                className="cancel-auth-btn"
                onClick={cancelPendingAuth}
              >
                Change Email / Back
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEP 1: LOGIN / SIGNUP TABS ================= */
          <div className="auth-form-wrapper">
            {/* Top Switcher Tabs */}
            <div className="auth-tab-switcher">
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
              >
                Create Account (OTP Verified)
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {authMode === 'signup' ? (
              /* SIGN UP FORM */
              <form onSubmit={handleSubmitSignup} className="auth-fields-form">
                <div className="input-group">
                  <label className="field-label">Full Name</label>
                  <div className="input-field-wrap">
                    <User size={18} className="field-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Tushar Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-field-wrap">
                    <Mail size={18} className="field-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <span className="field-hint">
                    A 6-digit OTP code will be sent to this email for verification
                  </span>
                </div>

                <div className="input-group">
                  <label className="field-label">Create Password</label>
                  <div className="input-field-wrap">
                    <Lock size={18} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pw-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn glow-yellow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Sending OTP...</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleSubmitLogin} className="auth-fields-form">
                <div className="input-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-field-wrap">
                    <Mail size={18} className="field-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {loginMethod === 'password' ? (
                  <div className="input-group">
                    <div className="label-row">
                      <label className="field-label">Password</label>
                      <button
                        type="button"
                        className="text-link-btn"
                        onClick={() => setLoginMethod('otp')}
                      >
                        Sign In via OTP instead
                      </button>
                    </div>
                    <div className="input-field-wrap">
                      <Lock size={18} className="field-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-pw-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="otp-login-notice">
                    <span className="field-hint">
                      We'll generate an instant 6-digit OTP code to verify and sign in.
                    </span>
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => setLoginMethod('password')}
                    >
                      Sign In with Password instead
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-primary-btn glow-yellow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>
                        {loginMethod === 'password'
                          ? 'Sign In to Flipkart Music'
                          : 'Send Login OTP'}
                      </span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Quick 1-Click Demo Login */}
                <div className="quick-demo-divider">
                  <span>OR FAST EVALUATION</span>
                </div>

                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={handleQuickDemoLogin}
                >
                  <Sparkles size={16} className="sparkle-gold" />
                  <span>1-Click Demo Login (Tushar)</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Feature Badges Footer */}
        <div className="auth-card-footer">
          <div className="auth-footer-item">
            <Volume2 size={14} className="footer-icon" />
            <span>320kbps HD Audio</span>
          </div>
          <div className="auth-footer-item">
            <Headphones size={14} className="footer-icon" />
            <span>100M+ Full Songs</span>
          </div>
          <div className="auth-footer-item">
            <Flame size={14} className="footer-icon" />
            <span>Synced Lyrics</span>
          </div>
        </div>
      </div>

      {/* Virtual Real Email Client Modal */}
      <EmailInboxModal />
    </div>
  );
}
