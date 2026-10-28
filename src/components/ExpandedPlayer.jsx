import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Heart,
  Music2,
  Film,
  ExternalLink,
  Sparkles,
  Shuffle,
  Repeat,
  Repeat1,
  Radio,
  TrendingUp,
  UserCheck,
  Plus,
  Info
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function ExpandedPlayer() {
  const {
    audioRef,
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    queue,
    currentIndex,
    likedTrackIds,
    isShuffle,
    repeatMode,
    isExpandedPlayerOpen,
    expandedTab,
    playerMediaMode,
    relatedData,
    isAutoplay,
    
    togglePlay,
    playTrack,
    startRadio,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    seekForward10,
    seekBackward10,
    toggleLike,
    addToQueue,
    setIsAutoplay,
    setIsShuffle,
    setRepeatMode,
    setPlayerMediaMode,
    setIsExpandedPlayerOpen,
    setExpandedTab,
    handleSearch
  } = usePlayer();

  const activeLyricRef = useRef(null);
  const lyricsScrollerRef = useRef(null);

  // Auto-scroll the active lyric into the center
  useEffect(() => {
    if (activeLyricRef.current && lyricsScrollerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  if (!isExpandedPlayerOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const safeDuration = duration && duration > 0 ? duration : 210;
  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / safeDuration) * 100));

  const formatSecs = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const searchQuery = encodeURIComponent(`${currentTrack.title} ${currentTrack.artist} official video`);
  const ytVideoEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${searchQuery}&autoplay=1`;
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  const handleModeChange = (mode) => {
    setPlayerMediaMode(mode);
    if (mode === 'video' && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  return (
    <div className="expanded-player-overlay glass-panel">
      {/* Background Ambient Glow */}
      <div
        className="ambient-bg"
        style={{ backgroundImage: `url(${currentTrack.artwork})` }}
      />

      {/* Header with YT Music Song / Video Switcher */}
      <div className="expanded-header">
        <button
          className="close-expanded-btn"
          onClick={() => setIsExpandedPlayerOpen(false)}
          title="Minimize player"
        >
          <ChevronDown size={28} />
        </button>

        {/* Song vs Video Toggle Pills */}
        <div className="media-mode-toggle">
          <button
            className={`media-toggle-btn ${playerMediaMode === 'song' ? 'active' : ''}`}
            onClick={() => handleModeChange('song')}
          >
            <Music2 size={16} />
            <span>Song</span>
          </button>
          <button
            className={`media-toggle-btn ${playerMediaMode === 'video' ? 'active' : ''}`}
            onClick={() => handleModeChange('video')}
          >
            <Film size={16} />
            <span>Video</span>
          </button>
        </div>

        <div className="tab-switcher">
          <button
            className={`tab-btn ${expandedTab === 'upNext' ? 'active' : ''}`}
            onClick={() => setExpandedTab('upNext')}
          >
            UP NEXT
          </button>
          <button
            className={`tab-btn ${expandedTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setExpandedTab('lyrics')}
          >
            LYRICS
          </button>
          <button
            className={`tab-btn ${expandedTab === 'related' ? 'active' : ''}`}
            onClick={() => setExpandedTab('related')}
          >
            RELATED
          </button>
        </div>

        <button
          className={`header-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => toggleLike(currentTrack.id)}
        >
          <Heart size={22} fill={isLiked ? '#ff4757' : 'none'} color={isLiked ? '#ff4757' : 'currentColor'} />
        </button>
      </div>

      {/* Main Grid: Left Artwork or Video / Right Tab Content */}
      <div className="expanded-body">
        {/* Left Side: Artwork OR Full Video */}
        <div className="artwork-panel">
          {playerMediaMode === 'video' ? (
            <div className="full-video-frame-container">
              <iframe
                title="Full Song Video"
                src={ytVideoEmbedUrl}
                className="full-video-iframe"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <div className="video-fallback-bar">
                <a
                  href={ytSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yt-open-btn"
                >
                  <ExternalLink size={14} />
                  <span>Open Video in YouTube</span>
                </a>
              </div>
            </div>
          ) : (
            <div className={`album-art-card ${isPlaying ? 'spinning-glow' : ''}`}>
              <img src={currentTrack.artwork} alt={currentTrack.title} className="expanded-artwork" />
            </div>
          )}

          <div className="track-expanded-meta">
            <div className="quality-pill-banner">
              <Sparkles size={12} />
              <span>320kbps Ultra HD • Complete Full Song</span>
            </div>
            <h1 className="expanded-title">{currentTrack.title}</h1>
            <h3 className="expanded-artist">{currentTrack.artist}</h3>
            <span className="expanded-album">{currentTrack.album} • {currentTrack.releaseYear}</span>

            {/* Quick Radio Button */}
            <div className="expanded-quick-actions">
              <button
                className="yt-radio-btn"
                onClick={() => startRadio(currentTrack)}
                title="Start Endless Radio Mix"
              >
                <Radio size={15} />
                <span>Start Radio</span>
              </button>
            </div>
          </div>

          {/* Expanded Player Integrated Transport Controls */}
          <div className="expanded-transport">
            {/* Seek Bar */}
            <div className="expanded-seek-row">
              <span className="seek-timestamp">{formatSecs(displayTime)}</span>
              <input
                type="range"
                min={0}
                max={safeDuration}
                step={0.1}
                value={displayTime || 0}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setDragTime(parseFloat(e.target.value));
                }}
                onTouchStart={(e) => {
                  setIsDragging(true);
                  setDragTime(parseFloat(e.target.value));
                }}
                onChange={(e) => setDragTime(parseFloat(e.target.value))}
                onMouseUp={(e) => {
                  seekTo(parseFloat(e.target.value));
                  setIsDragging(false);
                }}
                onTouchEnd={(e) => {
                  seekTo(parseFloat(e.target.value));
                  setIsDragging(false);
                }}
                className="seek-slider expanded-slider"
                style={{
                  background: `linear-gradient(to right, #ff9f00 0%, #ff9f00 ${progressPercent}%, #333 ${progressPercent}%, #333 100%)`
                }}
              />
              <span className="seek-timestamp">{formatSecs(safeDuration)}</span>
            </div>

            {/* Playback Action Buttons */}
            <div className="expanded-btn-row">
              <button
                className={`ctrl-btn ${isShuffle ? 'active-ctrl' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>

              <button className="ctrl-btn" onClick={seekBackward10} title="Rewind 10s">
                <RotateCcw size={18} />
              </button>

              <button className="ctrl-btn" onClick={handlePrevTrack} title="Previous">
                <SkipBack size={24} fill="currentColor" />
              </button>

              <button
                className={`play-pause-main glow-yellow ${isBuffering ? 'buffering-pulse' : ''}`}
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="play-icon-offset" />}
              </button>

              <button className="ctrl-btn" onClick={handleNextTrack} title="Next">
                <SkipForward size={24} fill="currentColor" />
              </button>

              <button className="ctrl-btn" onClick={seekForward10} title="Forward 10s">
                <RotateCw size={18} />
              </button>

              <button
                className={`ctrl-btn ${repeatMode !== 'off' ? 'active-ctrl' : ''}`}
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Tab View */}
        <div className="tab-content-panel">
          {/* UP NEXT Queue with YouTube Music Autoplay Toggle */}
          {expandedTab === 'upNext' && (
            <div className="up-next-container">
              <div className="queue-header">
                <div className="queue-title-wrap">
                  <h3>Playing from {currentTrack.artist} Radio</h3>
                  <span className="queue-count">{queue.length} Tracks • 320kbps HD</span>
                </div>

                {/* YouTube Music Style Autoplay Switch */}
                <div className="autoplay-toggle-wrap">
                  <span className="autoplay-label">Autoplay</span>
                  <button
                    className={`autoplay-switch ${isAutoplay ? 'on' : 'off'}`}
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    title={isAutoplay ? 'Autoplay is on (Continuous Music)' : 'Autoplay is off'}
                  >
                    <span className="switch-thumb" />
                  </button>
                </div>
              </div>

              <div className="queue-list">
                {queue.map((track, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={track.id + idx}
                      className={`queue-item ${isCurrent ? 'current-playing' : ''}`}
                      onClick={() => playTrack(track)}
                    >
                      <span className="queue-index">
                        {isCurrent && isPlaying ? (
                          <div className="mini-eq">
                            <span className="mini-eq-bar" />
                            <span className="mini-eq-bar" />
                            <span className="mini-eq-bar" />
                          </div>
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <img src={track.artwork} alt={track.title} className="queue-thumb" />
                      <div className="queue-info">
                        <span className="queue-song-title">{track.title}</span>
                        <span className="queue-artist">{track.artist}</span>
                      </div>
                      <span className="queue-duration">{track.duration}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Synced Lyrics with Smooth Auto-Scroll */}
          {expandedTab === 'lyrics' && (
            <div className="lyrics-container">
              <div className="lyrics-header">
                <h3>Synchronized Studio Lyrics</h3>
                <span className="full-song-pill">COMPLETE SONG</span>
              </div>
              <div className="lyrics-scroller" ref={lyricsScrollerRef}>
                {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                  currentTrack.lyrics.map((line, idx) => {
                    const isPassed = currentTime >= line.time;
                    const isNextLine = idx < currentTrack.lyrics.length - 1 && currentTime >= currentTrack.lyrics[idx + 1].time;
                    const isHighlight = isPassed && !isNextLine;

                    return (
                      <p
                        key={idx}
                        ref={isHighlight ? activeLyricRef : null}
                        onClick={() => seekTo(line.time)}
                        className={`lyric-line ${isHighlight ? 'active-lyric' : ''} ${isPassed ? 'passed-lyric' : ''}`}
                      >
                        {line.text}
                      </p>
                    );
                  })
                ) : (
                  <div className="no-lyrics">
                    <Music2 size={48} className="no-lyrics-icon" />
                    <p>Lyrics loading or unavailable for this track</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YouTube Music Authentic RELATED Tab */}
          {expandedTab === 'related' && (
            <div className="yt-related-container">
              {/* Section 1: You Might Also Like */}
              <div className="related-sub-section">
                <div className="section-head">
                  <Sparkles size={18} className="sec-icon" />
                  <h4>You Might Also Like</h4>
                </div>
                <div className="yt-related-list">
                  {(relatedData.youMightLike || []).slice(0, 5).map((track, idx) => (
                    <div
                      key={track.id || idx}
                      className="yt-rel-track-row"
                      onClick={() => playTrack(track)}
                    >
                      <img src={track.artwork} alt={track.title} className="yt-rel-thumb" />
                      <div className="yt-rel-info">
                        <span className="yt-rel-title">{track.title}</span>
                        <span className="yt-rel-artist">{track.artist}</span>
                      </div>
                      <span className="yt-rel-duration">{track.duration}</span>
                      <button
                        className="yt-rel-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                        title="Play"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: More From This Artist */}
              <div className="related-sub-section">
                <div className="section-head">
                  <TrendingUp size={18} className="sec-icon" />
                  <h4>More from {currentTrack.artist.split(/[,&]/)[0].trim()}</h4>
                </div>
                <div className="yt-related-list">
                  {(relatedData.moreFromArtist || []).slice(0, 5).map((track, idx) => (
                    <div
                      key={track.id || idx}
                      className="yt-rel-track-row"
                      onClick={() => playTrack(track)}
                    >
                      <img src={track.artwork} alt={track.title} className="yt-rel-thumb" />
                      <div className="yt-rel-info">
                        <span className="yt-rel-title">{track.title}</span>
                        <span className="yt-rel-artist">{track.album || track.artist}</span>
                      </div>
                      <span className="yt-rel-duration">{track.duration}</span>
                      <button
                        className="yt-rel-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                        title="Play"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Similar Artists */}
              <div className="related-sub-section">
                <div className="section-head">
                  <UserCheck size={18} className="sec-icon" />
                  <h4>Similar Artists</h4>
                </div>
                <div className="similar-artists-grid">
                  {(relatedData.similarArtists || []).map((art, idx) => (
                    <div
                      key={idx}
                      className="similar-artist-chip"
                      onClick={() => {
                        setIsExpandedPlayerOpen(false);
                        handleSearch(art.name);
                      }}
                      title={`Search ${art.name}`}
                    >
                      <img src={art.avatar} alt={art.name} className="sim-artist-avatar" />
                      <span className="sim-artist-name">{art.name}</span>
                      <span className="sim-artist-listeners">{art.listeners}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: About the Artist */}
              <div className="related-sub-section">
                <div className="section-head">
                  <Info size={18} className="sec-icon" />
                  <h4>About {currentTrack.artist.split(/[,&]/)[0].trim()}</h4>
                </div>
                <div className="artist-bio-card glass-panel">
                  <p className="bio-text">
                    {relatedData.artistBio ||
                      `${currentTrack.artist} is a leading music phenomenon on Flipkart Music. Stream full-length original tracks, albums, and signature radio mixes.`}
                  </p>
                  <div className="bio-footer">
                    <span className="bio-stat">Verified Artist</span>
                    <button
                      className="bio-view-btn"
                      onClick={() => {
                        setIsExpandedPlayerOpen(false);
                        handleSearch(currentTrack.artist.split(/[,&]/)[0].trim());
                      }}
                    >
                      View All Songs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
