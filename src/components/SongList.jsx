import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Share2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongList({ songs, title = "Songs" }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike, addToQueue, playNextInQueue } = usePlayer();
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!songs || songs.length === 0) return null;

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="song-list-container">
      {title && <h3 className="section-heading">{title}</h3>}

      <div className="song-table">
        {songs.map((song, index) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCurrentAndPlaying = isCurrent && isPlaying;
          const isLiked = likedTrackIds.has(song.id);

          return (
            <div
              key={song.id || index}
              className={`song-row ${isCurrent ? 'playing-row' : ''}`}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playTrack(song, songs);
                }
              }}
            >
              {/* Left Column: Index or Equalizer or Play Button */}
              <div className="col-index">
                {isCurrentAndPlaying ? (
                  <div className="eq-container">
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                  </div>
                ) : (
                  <span className={`row-number ${isCurrent ? 'active-num' : ''}`}>{index + 1}</span>
                )}
                <button
                  className="row-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playTrack(song, songs);
                    }
                  }}
                >
                  {isCurrentAndPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button>
              </div>

              {/* Artwork & Song Title */}
              <div className="col-title">
                <img src={song.artwork} alt={song.title} className="song-thumb" />
                <div className="song-meta">
                  <div className="title-wrap">
                    <span className="song-name">{song.title}</span>
                    {song.explicit && <span className="explicit-tag">E</span>}
                  </div>
                  <span className="song-artist-mobile">{song.artist}</span>
                </div>
              </div>

              {/* Artist Name */}
              <div className="col-artist">
                <span>{song.artist}</span>
              </div>

              {/* Album Name */}
              <div className="col-album">
                <span>{song.album}</span>
              </div>

              {/* Like Button */}
              <div className="col-like">
                <button
                  className={`like-icon-btn ${isLiked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(song.id);
                  }}
                  title={isLiked ? 'Liked' : 'Like'}
                >
                  <Heart size={16} fill={isLiked ? '#ff4757' : 'none'} color={isLiked ? '#ff4757' : 'currentColor'} />
                </button>
              </div>

              {/* Duration */}
              <div className="col-duration">
                <span>{song.duration}</span>
              </div>

              {/* Menu Column */}
              <div className="col-menu">
                <button
                  className="menu-icon-btn"
                  onClick={(e) => toggleMenu(e, song.id)}
                  title="More options"
                >
                  <MoreVertical size={18} />
                </button>

                {activeMenuId === song.id && (
                  <div className="context-menu glass-panel" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="menu-item"
                      onClick={() => {
                        playNextInQueue(song);
                        setActiveMenuId(null);
                      }}
                    >
                      <Plus size={16} />
                      <span>Play next</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        addToQueue(song);
                        setActiveMenuId(null);
                      }}
                    >
                      <ListPlus size={16} />
                      <span>Add to queue</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => setActiveMenuId(null)}
                    >
                      <Share2 size={16} />
                      <span>Share song</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
