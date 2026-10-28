import React from 'react';
import { Play, Pause, Radio, MoreVertical, CheckCircle2, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function TopResultCard({ topResult }) {
  const { currentTrack, isPlaying, playTrack, startRadio, togglePlay, likedTrackIds, toggleLike } = usePlayer();

  if (!topResult || !topResult.songData) return null;

  const song = topResult.songData;
  const isCurrentPlaying = currentTrack?.id === song.id && isPlaying;
  const isLiked = likedTrackIds.has(song.id);

  const handlePlayClick = () => {
    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  return (
    <div className="top-result-card glass-panel">
      <div className="top-result-header">
        <span className="section-label">TOP RESULT</span>
      </div>

      <div className="top-result-content">
        <div className="artwork-container" onClick={handlePlayClick}>
          <img src={song.artwork} alt={song.title} className="top-artwork" />
          <div className="play-overlay">
            <button className="top-play-btn glow-yellow">
              {isCurrentPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="play-icon-offset" />}
            </button>
          </div>
        </div>

        <div className="top-details">
          <div className="type-badge">
            <span>{topResult.type || 'Song'}</span>
            {topResult.verified && <CheckCircle2 size={14} className="verified-icon" />}
          </div>

          <h2 className="top-title" onClick={handlePlayClick}>{song.title}</h2>

          <div className="top-meta">
            <span className="artist-name">{song.artist}</span>
            <span className="bullet">•</span>
            <span className="meta-sub">{song.album}</span>
            <span className="bullet">•</span>
            <span className="meta-sub">{song.plays} Plays</span>
          </div>

          <div className="top-actions">
            <button className="action-btn primary-play" onClick={handlePlayClick}>
              {isCurrentPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              <span>{isCurrentPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              className={`action-btn icon-only ${isLiked ? 'liked' : ''}`}
              onClick={() => toggleLike(song.id)}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={18} fill={isLiked ? '#ff4757' : 'none'} color={isLiked ? '#ff4757' : 'currentColor'} />
            </button>

            <button
              className="action-btn icon-only"
              onClick={() => startRadio(song)}
              title="Start Radio"
            >
              <Radio size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
