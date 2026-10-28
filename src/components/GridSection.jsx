import React from 'react';
import { Play, Disc, UserCheck } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function GridSection({ items, type = 'albums', title = 'Albums' }) {
  const { handleSearch } = usePlayer();

  if (!items || items.length === 0) return null;

  return (
    <div className="grid-section">
      <div className="grid-header">
        <h3 className="section-heading">{title}</h3>
      </div>

      <div className={`card-grid ${type}-grid`}>
        {items.map((item, idx) => {
          if (type === 'artists') {
            return (
              <div
                key={item.id || idx}
                className="artist-card"
                onClick={() => handleSearch(item.name)}
              >
                <div className="artist-avatar-wrap">
                  <img src={item.avatar} alt={item.name} className="artist-avatar" />
                  <div className="avatar-overlay">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="artist-info">
                  <span className="artist-card-name">{item.name}</span>
                  <span className="artist-sub-text">{item.subscribers}</span>
                </div>
              </div>
            );
          }

          if (type === 'playlists') {
            return (
              <div
                key={item.id || idx}
                className="playlist-card"
                onClick={() => handleSearch(item.title.split(' ')[0])}
              >
                <div className="card-thumb-wrap">
                  <img src={item.artwork} alt={item.title} className="card-thumb" />
                  <div className="card-play-overlay">
                    <button className="grid-play-btn glow-yellow">
                      <Play size={22} fill="currentColor" className="play-icon-offset" />
                    </button>
                  </div>
                </div>
                <div className="card-info">
                  <span className="card-title">{item.title}</span>
                  <span className="card-sub">{item.description || item.trackCount}</span>
                </div>
              </div>
            );
          }

          // Default: Albums
          return (
            <div
              key={item.id || idx}
              className="album-card"
              onClick={() => handleSearch(item.title)}
            >
              <div className="card-thumb-wrap">
                <img src={item.artwork} alt={item.title} className="card-thumb" />
                <div className="card-play-overlay">
                  <button className="grid-play-btn glow-yellow">
                    <Play size={22} fill="currentColor" className="play-icon-offset" />
                  </button>
                </div>
              </div>
              <div className="card-info">
                <span className="card-title">{item.title}</span>
                <span className="card-sub">{item.artist} • {item.releaseYear}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
