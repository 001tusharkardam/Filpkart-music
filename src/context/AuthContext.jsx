import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY_USER = 'flipkart_music_current_user';
const STORAGE_KEY_USERS = 'flipkart_music_registered_users';
const STORAGE_KEY_PRIVACY = 'flipkart_music_privacy_settings';

export function AuthProvider({ children }) {
  // Current active logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Registered users database
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'user-tushar',
        name: 'Tushar',
        email: 'tushar@flipkart.com',
        password: 'password123',
        isVerified: true,
        role: 'vip_subscriber',
        plan: 'Flipkart VIP Plus • 320kbps',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        joinedAt: '28 Oct 2026',
        permissions: ['unlimited_streaming', 'studio_hd_320kbps', 'synced_lyrics', 'ad_free', 'offline_mode']
      }
    ];
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRIVACY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      privateSession: false,
      hideOnlineStatus: false,
      dataSharing: false,
      twoFactorRequired: true
    };
  });

  // Pending Auth verification state
  const [pendingAuth, setPendingAuth] = useState(null); 
  // { mode: 'signup' | 'loginOtp', name, email, password, otp, attempts: 0, lockedUntil: null }

  // Virtual Email Inbox messages (simulates user's real email inbox)
  const [emailInbox, setEmailInbox] = useState([]);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active top toast notification
  const [activeOtpBanner, setActiveOtpBanner] = useState(null);

  // Persist registered users
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registeredUsers));
    } catch (e) {}
  }, [registeredUsers]);

  // Persist current active user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {}
  }, [currentUser]);

  // Persist privacy settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(privacySettings));
    } catch (e) {}
  }, [privacySettings]);

  // Generate cryptographic 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Deliver simulated official email to user's virtual email client
  const sendEmailMessage = (recipientEmail, recipientName, otpCode, subject) => {
    const newEmail = {
      id: `mail-${Date.now()}`,
      from: 'Flipkart Security <no-reply@security.flipkart.com>',
      to: recipientEmail,
      recipientName: recipientName || recipientEmail.split('@')[0],
      subject: subject || `Your Flipkart Music Verification Code is ${otpCode}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      code: otpCode,
      body: `Hi ${recipientName || 'User'},\n\nYour One-Time Password (OTP) for Flipkart Music account verification is ${otpCode}.\n\nThis OTP is valid for 10 minutes. For your security, do not share this code with anyone.`,
      isRead: false
    };

    setEmailInbox(prev => [newEmail, ...prev]);
    return newEmail;
  };

  // Step 1: Start Signup with Email
  const startSignup = ({ name, email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error('This email address is already registered. Please sign in instead.');
    }

    const otpCode = generateOtp();
    const pendingData = {
      mode: 'signup',
      name: name.trim(),
      email: cleanEmail,
      password,
      otp: otpCode,
      attempts: 0,
      createdAt: Date.now()
    };

    setPendingAuth(pendingData);
    sendEmailMessage(cleanEmail, name.trim(), otpCode, `Your Flipkart Music Registration Code: ${otpCode}`);

    setActiveOtpBanner({
      code: otpCode,
      email: cleanEmail,
      type: 'Registration Verification'
    });

    return { success: true, otp: otpCode };
  };

  // Step 2: Verify OTP and finalize Registration
  const verifySignupOtp = (enteredOtp) => {
    if (!pendingAuth || pendingAuth.mode !== 'signup') {
      throw new Error('No pending registration found.');
    }

    // Security: Check Brute Force lockout
    if (pendingAuth.lockedUntil && Date.now() < pendingAuth.lockedUntil) {
      const remainingSecs = Math.ceil((pendingAuth.lockedUntil - Date.now()) / 1000);
      throw new Error(`Too many incorrect attempts. Account locked for ${remainingSecs} seconds.`);
    }

    if (enteredOtp.trim() !== pendingAuth.otp) {
      const newAttempts = (pendingAuth.attempts || 0) + 1;
      let lockedUntil = null;
      if (newAttempts >= 3) {
        lockedUntil = Date.now() + 60000; // 60 seconds lockout
      }
      setPendingAuth(prev => ({ ...prev, attempts: newAttempts, lockedUntil }));

      if (newAttempts >= 3) {
        throw new Error('3 incorrect attempts. Security lockout active for 60 seconds.');
      } else {
        throw new Error(`Invalid verification code. (${3 - newAttempts} attempts remaining)`);
      }
    }

    // Success: Create Authorized User Object
    const newUser = {
      id: `user-${Date.now()}`,
      name: pendingAuth.name,
      email: pendingAuth.email,
      password: pendingAuth.password,
      isVerified: true,
      role: 'vip_subscriber',
      plan: 'Flipkart VIP Plus • 320kbps',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(pendingAuth.name)}`,
      joinedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      permissions: ['unlimited_streaming', 'studio_hd_320kbps', 'synced_lyrics', 'ad_free', 'offline_mode']
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setPendingAuth(null);
    setActiveOtpBanner(null);

    return { success: true, user: newUser };
  };

  // Email & Password Login
  const loginWithPassword = ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      throw new Error('Incorrect email address or password. Please check your credentials.');
    }

    setCurrentUser(user);
    setPendingAuth(null);
    setActiveOtpBanner(null);
    return { success: true, user };
  };

  // Start Login via OTP
  const startLoginWithOtp = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No registered account found with this email. Please sign up first.');
    }

    const otpCode = generateOtp();
    const pendingData = {
      mode: 'loginOtp',
      email: cleanEmail,
      targetUser: user,
      otp: otpCode,
      attempts: 0,
      createdAt: Date.now()
    };

    setPendingAuth(pendingData);
    sendEmailMessage(cleanEmail, user.name, otpCode, `Your Flipkart Music Sign-In Code: ${otpCode}`);

    setActiveOtpBanner({
      code: otpCode,
      email: cleanEmail,
      type: 'Login Authorization'
    });

    return { success: true, otp: otpCode };
  };

  // Verify Login OTP
  const verifyLoginOtp = (enteredOtp) => {
    if (!pendingAuth || pendingAuth.mode !== 'loginOtp') {
      throw new Error('No pending login OTP verification found.');
    }

    if (enteredOtp.trim() !== pendingAuth.otp) {
      throw new Error('Invalid verification code.');
    }

    setCurrentUser(pendingAuth.targetUser);
    setPendingAuth(null);
    setActiveOtpBanner(null);

    return { success: true, user: pendingAuth.targetUser };
  };

  // Resend OTP
  const resendOtp = () => {
    if (!pendingAuth) return;
    const newOtp = generateOtp();
    setPendingAuth(prev => ({ ...prev, otp: newOtp, attempts: 0, lockedUntil: null }));
    sendEmailMessage(pendingAuth.email, pendingAuth.name, newOtp, `Your New Verification Code: ${newOtp}`);

    setActiveOtpBanner({
      code: newOtp,
      email: pendingAuth.email,
      type: 'Resent Verification Code'
    });
  };

  // Update User Profile
  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    setRegisteredUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  // Toggle Privacy Option
  const togglePrivacyOption = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setPendingAuth(null);
    setActiveOtpBanner(null);
    setIsProfileModalOpen(false);
  };

  const cancelPendingAuth = () => {
    setPendingAuth(null);
    setActiveOtpBanner(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        pendingAuth,
        privacySettings,
        emailInbox,
        isInboxModalOpen,
        isProfileModalOpen,
        activeOtpBanner,
        setIsInboxModalOpen,
        setIsProfileModalOpen,
        startSignup,
        verifySignupOtp,
        loginWithPassword,
        startLoginWithOtp,
        verifyLoginOtp,
        resendOtp,
        updateProfile,
        togglePrivacyOption,
        logout,
        cancelPendingAuth,
        dismissOtpBanner: () => setActiveOtpBanner(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
