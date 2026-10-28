import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  Check,
  LogOut,
  Sparkles,
  Sliders,
  Shield,
  Key,
  Radio,
  Headphones,
  CheckCircle2,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal() {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    privacySettings,
    togglePrivacyOption,
    updateProfile,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'authorization' | 'security' | 'privacy'
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSaveName = (e) => {
    e.preventDefault();
    if (editName.trim()) {
      updateProfile({ name: editName.trim() });
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2500);
    }
  };

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  ];

  const handleExportData = () => {
    const data = {
      user: currentUser,
      privacySettings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flipkart_music_${currentUser.name.replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
      <div className="profile-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="profile-modal-header">
          <div className="header-user-summary">
            <img src={currentUser.avatar} alt={currentUser.name} className="modal-avatar" />
            <div>
              <div className="modal-name-row">
                <h2 className="modal-name">{currentUser.name}</h2>
                <span className="verified-pill">
                  <ShieldCheck size={13} />
                  <span>Verified</span>
                </span>
              </div>
              <span className="modal-email">{currentUser.email}</span>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsProfileModalOpen(false)}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="profile-tab-bar">
          <button
            className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} />
            <span>Profile</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'authorization' ? 'active' : ''}`}
            onClick={() => setActiveTab('authorization')}
          >
            <Key size={15} />
            <span>Authorization</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={15} />
            <span>Security</span>
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Sliders size={15} />
            <span>Privacy</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <form onSubmit={handleSaveName} className="profile-edit-form">
                <div className="setting-group">
                  <label className="setting-label">Display Name</label>
                  <div className="setting-input-wrap">
                    <User size={16} className="setting-icon" />
                    <input
                      type="text"
                      className="setting-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button type="submit" className="save-field-btn">Save</button>
                  </div>
                </div>

                {isSavedNotice && (
                  <div className="saved-alert">
                    <CheckCircle2 size={15} color="#2ed573" />
                    <span>Profile name updated successfully!</span>
                  </div>
                )}
              </form>

              <div className="setting-group">
                <label className="setting-label">Email Address (Verified via OTP)</label>
                <div className="verified-email-box">
                  <Mail size={16} color="var(--flipkart-yellow)" />
                  <span className="email-text">{currentUser.email}</span>
                  <span className="email-status-tag">100% SECURE & VERIFIED</span>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Choose Avatar</label>
                <div className="avatar-pick-row">
                  {avatarOptions.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar ${idx}`}
                      className={`pick-avatar-thumb ${currentUser.avatar === url ? 'selected' : ''}`}
                      onClick={() => updateProfile({ avatar: url })}
                    />
                  ))}
                </div>
              </div>

              <div className="plan-showcase-card">
                <div className="plan-badge-row">
                  <Sparkles size={16} className="sparkle-gold" />
                  <span className="plan-title">{currentUser.plan || 'Flipkart VIP Plus'}</span>
                </div>
                <p className="plan-desc">
                  Active Subscriber • Full 320kbps Studio Streaming & Synced Lyrics Authorized
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHORIZATION & PERMISSIONS */}
          {activeTab === 'authorization' && (
            <div className="tab-pane">
              <div className="auth-header-card">
                <Key size={24} className="key-icon" />
                <div>
                  <h4 className="auth-card-title">Role: {currentUser.role?.toUpperCase() || 'VIP_SUBSCRIBER'}</h4>
                  <span className="auth-card-sub">Granted high-privilege audio & streaming authorizations</span>
                </div>
              </div>

              <div className="permissions-list">
                <div className="permission-item">
                  <div className="perm-left">
                    <CheckCircle2 size={16} color="#2ed573" />
                    <span className="perm-name">320kbps Studio Master HD Audio</span>
                  </div>
                  <span className="perm-status authorized">AUTHORIZED</span>
                </div>

                <div className="permission-item">
                  <div className="perm-left">
                    <CheckCircle2 size={16} color="#2ed573" />
                    <span className="perm-name">Unlimited Track Skips & Replays</span>
                  </div>
                  <span className="perm-status authorized">AUTHORIZED</span>
                </div>

                <div className="permission-item">
                  <div className="perm-left">
                    <CheckCircle2 size={16} color="#2ed573" />
                    <span className="perm-name">Full-Length Synchronized Lyrics</span>
                  </div>
                  <span className="perm-status authorized">AUTHORIZED</span>
                </div>

                <div className="permission-item">
                  <div className="perm-left">
                    <CheckCircle2 size={16} color="#2ed573" />
                    <span className="perm-name">Ad-Free Uninterrupted Listening</span>
                  </div>
                  <span className="perm-status authorized">AUTHORIZED</span>
                </div>

                <div className="permission-item">
                  <div className="perm-left">
                    <CheckCircle2 size={16} color="#2ed573" />
                    <span className="perm-name">AI Artist Radio & Infinite Queue</span>
                  </div>
                  <span className="perm-status authorized">AUTHORIZED</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="tab-pane">
              <div className="security-status-card">
                <ShieldCheck size={28} color="#2ed573" />
                <div>
                  <h4 className="sec-status-title">Account Security Level: HIGH</h4>
                  <span className="sec-status-sub">Two-factor email OTP authorization is active on this account.</span>
                </div>
              </div>

              <div className="security-item-row">
                <div>
                  <span className="sec-item-title">Two-Factor Email OTP Protection</span>
                  <span className="sec-item-desc">Requires 6-digit verification code sent to your registered email</span>
                </div>
                <span className="sec-pill active">ENABLED</span>
              </div>

              <div className="security-item-row">
                <div>
                  <span className="sec-item-title">Stream Encryption Protocol</span>
                  <span className="sec-item-desc">Hardware DES-ECB encrypted media transport active</span>
                </div>
                <span className="sec-pill active">ACTIVE</span>
              </div>

              <div className="security-item-row">
                <div>
                  <span className="sec-item-title">Active Devices & Sessions</span>
                  <span className="sec-item-desc">Windows Web Client (Current Session)</span>
                </div>
                <span className="sec-pill info">CURRENT</span>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="tab-pane">
              <div className="privacy-toggle-list">
                <div className="privacy-toggle-item">
                  <div>
                    <span className="privacy-title">Private Listening Session</span>
                    <span className="privacy-desc">Hide tracks from your Recently Played public history</span>
                  </div>
                  <button
                    className={`toggle-switch ${privacySettings.privateSession ? 'on' : ''}`}
                    onClick={() => togglePrivacyOption('privateSession')}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="privacy-toggle-item">
                  <div>
                    <span className="privacy-title">Hide Online Listening Status</span>
                    <span className="privacy-desc">Don't show current playing track to friends or followers</span>
                  </div>
                  <button
                    className={`toggle-switch ${privacySettings.hideOnlineStatus ? 'on' : ''}`}
                    onClick={() => togglePrivacyOption('hideOnlineStatus')}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="privacy-toggle-item">
                  <div>
                    <span className="privacy-title">Analytics & Personalization Sharing</span>
                    <span className="privacy-desc">Share listening metrics to improve AI recommendations</span>
                  </div>
                  <button
                    className={`toggle-switch ${privacySettings.dataSharing ? 'on' : ''}`}
                    onClick={() => togglePrivacyOption('dataSharing')}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>
              </div>

              <div className="privacy-actions-row">
                <button className="export-data-btn" onClick={handleExportData}>
                  <Download size={14} />
                  <span>Download My Profile & Security Data (JSON)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="profile-modal-footer">
          <button
            className="modal-logout-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Log Out of Flipkart Music</span>
          </button>
        </div>
      </div>
    </div>
  );
}
