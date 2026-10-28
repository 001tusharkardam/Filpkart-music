import React from 'react';
import { Home, Compass, Library, History, Heart, PlusCircle, Music2, Radio, Disc } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Sidebar({ currentNav, setCurrentNav }) {
  const { searchQuery, handleSearch } = usePlayer();

  const handleNavClick = (navId) => {
    setCurrentNav(navId);
    if (navId === 'home' && searchQuery) {
      handleSearch('');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'history', label: 'History', icon: History },
    { id: 'liked', label: 'Liked Songs', icon: Heart }
  ];

  const playlists = [
    { name: 'Bollywood Romance 2026', count: '48 songs' },
    { name: 'Punjabi Bangers', count: '35 songs' },
    { name: 'Lo-Fi Chill Beats', count: '60 songs' },
    { name: 'Synthwave Night', count: '22 songs' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id && !searchQuery;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="section-title">
          <span>My Playlists</span>
          <button className="add-playlist-btn" title="Create Playlist">
            <PlusCircle size={18} />
          </button>
        </div>

        {playlists.map((pl, idx) => (
          <button
            key={idx}
            className="playlist-item"
            onClick={() => {
              setCurrentNav('library');
              handleSearch(pl.name.split(' ')[0]);
            }}
          >
            <Disc size={16} className="playlist-icon" />
            <div className="playlist-info">
              <span className="playlist-name">{pl.name}</span>
              <span className="playlist-count">{pl.count}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-footer glass-panel">
        <Radio size={24} className="radio-icon" />
        <div className="footer-text">
          <span className="footer-title">Flipkart SuperCoins</span>
          <span className="footer-sub">Earn 5 coins per hour streaming</span>
        </div>
      </div>
    </aside>
  );
}
