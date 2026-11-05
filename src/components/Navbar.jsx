import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, Cast, Bell, Music, Sparkles, LogOut, ShieldCheck, User, Settings, Sliders, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { searchQuery, handleSearch } = usePlayer();
  const { currentUser, logout, setIsProfileModalOpen } = useAuth();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceNotice, setVoiceNotice] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
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

  // Real Web Speech API Microphone Activation
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search is not supported in this browser. Please type your search.');
      setTimeout(() => setVoiceNotice(''), 4000);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Works seamlessly for Hindi & English song names

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
        setVoiceNotice('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);

        if (event.results[0].isFinal || transcript.trim().length > 0) {
          // Clean prefixes like "play", "gana bajao", "song", etc.
          const cleanText = transcript
            .replace(/^(play|bajao|chalao|search for|listen to|suno)\s+/i, '')
            .replace(/\s+(bajao|chalao|song|gana)$/i, '')
            .trim();

          setLocalQuery(cleanText || transcript);
          handleSearch(cleanText || transcript);

          // Auto-close modal after user finishes speaking
          setTimeout(() => {
            setIsListening(false);
          }, 1200);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Please speak louder or tap again.');
        } else {
          setVoiceNotice(`Voice recognition error: ${event.error}`);
        }
        setTimeout(() => {
          setIsListening(false);
          setVoiceNotice('');
        }, 3000);
      };

      recognition.onend = () => {
        // Keep listening state synced
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setVoiceNotice('Could not open microphone. Please check browser permissions.');
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
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
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=TusharMusicVIP'}
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
                  src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=TusharMusicVIP'}
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

      {/* Real Web Speech Voice Search Active Modal */}
      {isListening && (
        <div className="voice-modal-overlay" onClick={stopVoiceSearch}>
          <div className="voice-modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <button className="voice-modal-close" onClick={stopVoiceSearch} title="Cancel">
              <X size={20} />
            </button>

            <div className="voice-pulse-ring">
              <div className="voice-mic-active glow-yellow">
                <Mic size={36} />
              </div>
            </div>

            <div className="voice-modal-text">
              <h3 className="voice-status-title">Listening to your voice...</h3>
              <p className="voice-live-transcript">
                {speechTranscript ? `"${speechTranscript}"` : "Say a song, artist or album (e.g. 'Kesariya', 'Diljit Dosanjh', 'Tauba Tauba')"}
              </p>
            </div>

            <div className="voice-eq-bars">
              <span className="v-bar" />
              <span className="v-bar" />
              <span className="v-bar" />
              <span className="v-bar" />
              <span className="v-bar" />
            </div>

            <div className="voice-quick-chips">
              <span className="voice-try-label">Try speaking:</span>
              <button
                type="button"
                className="voice-chip-btn"
                onClick={() => {
                  setLocalQuery('Arijit Singh');
                  handleSearch('Arijit Singh');
                  stopVoiceSearch();
                }}
              >
                Arijit Singh
              </button>
              <button
                type="button"
                className="voice-chip-btn"
                onClick={() => {
                  setLocalQuery('Tauba Tauba');
                  handleSearch('Tauba Tauba');
                  stopVoiceSearch();
                }}
              >
                Tauba Tauba
              </button>
              <button
                type="button"
                className="voice-chip-btn"
                onClick={() => {
                  setLocalQuery('Diljit Dosanjh');
                  handleSearch('Diljit Dosanjh');
                  stopVoiceSearch();
                }}
              >
                Diljit Dosanjh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Warning / Permission Notice Toast */}
      {voiceNotice && (
        <div className="voice-notice-toast glass-panel">
          <MicOff size={18} color="#ff4757" />
          <span>{voiceNotice}</span>
        </div>
      )}
    </nav>
  );
}
