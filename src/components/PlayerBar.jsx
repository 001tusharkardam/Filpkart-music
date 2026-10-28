import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  FileText,
  ChevronUp,
  Clock,
  Sparkles,
  Gauge
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playbackRate,
    audioQuality,
    sleepTimer,
    likedTrackIds,
    isExpandedPlayerOpen,

    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    seekForward10,
    seekBackward10,
    setVolumeLevel,
    toggleMute,
    toggleLike,
    setPlaybackRate,
    setTimerMinutes,
    setIsShuffle,
    setRepeatMode,
    setIsExpandedPlayerOpen,
    setExpandedTab
  } = usePlayer();

  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  if (!currentTrack) return null;

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

  const handleSeekStart = (e) => {
    setIsDragging(true);
    setDragTime(parseFloat(e.target.value));
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setDragTime(newTime);
  };

  const handleSeekEnd = (e) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
    setIsDragging(false);
  };

  const handleTrackClick = (e) => {
    if (e.target.tagName === 'INPUT') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * safeDuration);
  };

  const handleMouseMoveProgress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * safeDuration);
  };

  const handleMouseLeaveProgress = () => {
    setHoverTime(null);
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const openTab = (tabName) => {
    setExpandedTab(tabName);
    setIsExpandedPlayerOpen(true);
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];
  const timerOptions = [
    { label: 'Off', val: null },
    { label: '15 min', val: 15 },
    { label: '30 min', val: 30 },
    { label: '45 min', val: 45 },
    { label: '60 min', val: 60 },
    { label: 'End of Track', val: 'end' }
  ];

  return (
    <div className="player-bar-container glass-panel">
      {/* Top Seek Progress Slider with Hover Time Tooltip */}
      <div
        className="progress-bar-wrap"
        onClick={handleTrackClick}
        onMouseMove={handleMouseMoveProgress}
        onMouseLeave={handleMouseLeaveProgress}
      >
        {hoverTime !== null && (
          <div
            className="seek-tooltip"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatSecs(hoverTime)}
          </div>
        )}
        <input
          type="range"
          min={0}
          max={safeDuration}
          step={0.1}
          value={displayTime || 0}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="seek-slider"
          style={{
            background: `linear-gradient(to right, #ff9f00 0%, #ff9f00 ${progressPercent}%, #333 ${progressPercent}%, #333 100%)`
          }}
        />
      </div>

      <div className="player-bar-content">
        {/* Left Track Info */}
        <div className="player-left">
          <div
            className="player-thumb-wrap"
            onClick={() => setIsExpandedPlayerOpen(!isExpandedPlayerOpen)}
          >
            <img src={currentTrack.artwork} alt={currentTrack.title} className="player-thumb" />
            <div className="expand-overlay">
              <ChevronUp size={20} />
            </div>
          </div>

          <div className="player-track-info">
            <div className="title-row">
              <span
                className="player-title"
                onClick={() => setIsExpandedPlayerOpen(true)}
              >
                {currentTrack.title}
              </span>
              {/* Studio Quality Badge */}
              <span className="hd-audio-pill" title="Ultra HD Studio Quality Stream">
                <Sparkles size={10} />
                <span>320kbps HD</span>
              </span>
            </div>
            <div className="artist-sub-row">
              <span className="player-artist">{currentTrack.artist}</span>
              {isPlaying && (
                <div className="mini-eq" title="Playing Full Song">
                  <span className="mini-eq-bar" />
                  <span className="mini-eq-bar" />
                  <span className="mini-eq-bar" />
                </div>
              )}
            </div>
          </div>

          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => toggleLike(currentTrack.id)}
            title={isLiked ? 'Unlike (L)' : 'Like (L)'}
          >
            <Heart size={18} fill={isLiked ? '#ff4757' : 'none'} color={isLiked ? '#ff4757' : 'currentColor'} />
          </button>
        </div>

        {/* Center Playback Controls */}
        <div className="player-center">
          <div className="controls-row">
            <button
              className={`ctrl-btn ${isShuffle ? 'active-ctrl' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button
              className="ctrl-btn"
              onClick={seekBackward10}
              title="Rewind 10 seconds"
            >
              <RotateCcw size={18} />
            </button>

            <button className="ctrl-btn" onClick={handlePrevTrack} title="Previous track">
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              className={`play-pause-main glow-yellow ${isBuffering ? 'buffering-pulse' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="play-icon-offset" />}
            </button>

            <button className="ctrl-btn" onClick={handleNextTrack} title="Next track">
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button
              className="ctrl-btn"
              onClick={seekForward10}
              title="Forward 10 seconds"
            >
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

          <div className="time-display">
            <span className="time-cur">{formatSecs(displayTime)}</span>
            <span className="time-sep">/</span>
            <span className="time-total">{formatSecs(safeDuration)}</span>
            <span className="full-song-pill">FULL TRACK</span>
          </div>
        </div>

        {/* Right Aux Controls */}
        <div className="player-right">
          {/* Speed Selector */}
          <div className="aux-menu-wrap">
            <button
              className={`aux-btn speed-pill-btn ${playbackRate !== 1.0 ? 'active' : ''}`}
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowTimerMenu(false);
              }}
              title="Playback Speed"
            >
              <Gauge size={16} />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="aux-dropdown-menu glass-panel">
                <span className="menu-header-label">Playback Speed</span>
                {speedOptions.map(rate => (
                  <button
                    key={rate}
                    className={`menu-option-btn ${playbackRate === rate ? 'selected' : ''}`}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <span className="dot-active" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div className="aux-menu-wrap">
            <button
              className={`aux-btn ${sleepTimer ? 'active-timer-btn' : ''}`}
              onClick={() => {
                setShowTimerMenu(!showTimerMenu);
                setShowSpeedMenu(false);
              }}
              title={sleepTimer ? `Sleep Timer: ${sleepTimer} min` : 'Sleep Timer'}
            >
              <Clock size={18} />
              {sleepTimer && <span className="timer-badge">{sleepTimer}m</span>}
            </button>

            {showTimerMenu && (
              <div className="aux-dropdown-menu glass-panel">
                <span className="menu-header-label">Sleep Timer</span>
                {timerOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`menu-option-btn ${sleepTimer === opt.val ? 'selected' : ''}`}
                    onClick={() => {
                      setTimerMinutes(opt.val);
                      setShowTimerMenu(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {sleepTimer === opt.val && <span className="dot-active" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="aux-btn"
            onClick={() => openTab('lyrics')}
            title="Synchronized Lyrics"
          >
            <FileText size={18} />
          </button>

          <button
            className="aux-btn"
            onClick={() => openTab('upNext')}
            title="Up Next Queue"
          >
            <ListMusic size={20} />
          </button>

          {/* Volume Control */}
          <div className="volume-control">
            <button className="aux-btn" onClick={toggleMute} title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="volume-slider"
              style={{
                background: `linear-gradient(to right, #ff9f00 0%, #ff9f00 ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%, #333 100%)`
              }}
            />
          </div>

          <button
            className="aux-btn expand-btn"
            onClick={() => setIsExpandedPlayerOpen(!isExpandedPlayerOpen)}
            title="Full Screen / Expanded Player (F)"
          >
            <ChevronUp size={22} className={`chevron-icon ${isExpandedPlayerOpen ? 'rotated' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
