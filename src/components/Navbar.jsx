import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, Cast, Bell, Music, Sparkles, LogOut, ShieldCheck, User, Settings, Sliders } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { searchQuery, handleSearch } = usePlayer();
  const { currentUser, logout, setIsProfileModalOpen } = useAuth();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Sync internal state with context
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const onChangeInput = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    handleSearch(val);
  };

  const handleClear = () => {
    setLocalQuery('');
    handleSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleVoiceSearch = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setTimeout(() => {
        setLocalQuery('Arijit Singh');
        handleSearch('Arijit Singh');
        setIsListening(false);
      }, 2000);
    }
  };

  // Autocomplete sample suggestions
  const suggestions = [
    'Kesariya Arijit Singh',
    'Tauba Tauba Karan Aujla',
    'AP Dhillon Excuses',
    'Starboy The Weeknd',
    'Chaleya Arijit Singh',
    'Heeriye Arijit Singh',
    'Blinding Lights The Weeknd',
    'Shape of You Ed Sheeran',
    'Top Punjabi Hits 2026',
    'Bollywood Romantic Songs'
  ].filter(s => s.toLowerCase().includes(localQuery.toLowerCase()) && localQuery.trim().length > 0);

  return (
    <nav className="navbar">
      {/* Left: Brand Logo */}
      <div className="nav-left">
        <div className="brand-logo" onClick={() => handleClear()}>
          <div className="logo-icon">
            <Music size={22} className="logo-music" />
            <span className="logo-sparkle">★</span>
          </div>
          <div className="logo-text">
            <span className="brand-flipkart">Flipkart</span>
            <span className="brand-music">Music</span>
          </div>
          <span className="plus-badge">PLUS</span>
        </div>
      </div>

      {/* Center: YT Music Style Search Bar */}
      <div className="nav-center">
        <div className={`search-container ${isFocused ? 'focused' : ''}`}>
          <Search size={18} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search songs, artists, albums, playlists..."
            value={localQuery}
            onChange={onChangeInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          {localQuery && (
            <button className="clear-btn" onClick={handleClear} title="Clear search">
              <X size={16} />
            </button>
          )}
          <button
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoiceSearch}
            title="Search with voice"
          >
            <Mic size={18} />
          </button>

          {/* Autocomplete Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="suggestions-dropdown glass-panel">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onMouseDown={() => {
                    setLocalQuery(item);
                    handleSearch(item);
                  }}
                >
                  <Search size={14} className="sug-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="nav-right" ref={profileMenuRef}>
        <button className="icon-btn" title="Cast to device">
          <Cast size={20} />
        </button>
        <button className="icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="badge-dot" />
        </button>

        {/* Profile Pill & Dropdown */}
        <div className="profile-container">
          <div
            className="user-profile-badge"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Click to view Profile & Settings"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="user-avatar-img"
            />
            <span className="user-name-abbr">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Profile'}
            </span>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown glass-panel">
              <div className="dropdown-user-header">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  className="dropdown-avatar"
                />
                <div className="dropdown-meta">
                  <span className="dropdown-name">{currentUser?.name || 'User Profile'}</span>
                  <span className="dropdown-email">{currentUser?.email || 'user@example.com'}</span>
                  <div className="verified-badge-row">
                    <ShieldCheck size={12} color="#2ed573" />
                    <span>OTP Verified Member</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-menu-links">
                <button
                  className="dropdown-link-btn"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                >
                  <User size={15} />
                  <span>My Profile & Settings</span>
                </button>

                <button
                  className="dropdown-link-btn"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                >
                  <Sliders size={15} />
                  <span>Privacy & Security</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              <button
                className="dropdown-logout-btn"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Log Out of Flipkart Music</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
