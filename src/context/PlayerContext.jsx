import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { LOCAL_CATALOG } from '../services/localCatalog';
import { searchMusic, fetchRelatedMusic } from '../services/musicApi';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  // Direct HTML5 Audio Instance
  const audioRef = useRef(new Audio());
  
  const [currentTrack, setCurrentTrack] = useState(LOCAL_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(268);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  
  // Advanced Features: Playback Speed, Audio Quality, Sleep Timer
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [audioQuality, setAudioQuality] = useState('320kbps');
  const [sleepTimer, setSleepTimer] = useState(null); // in minutes or 'end'
  const sleepTimerIntervalRef = useRef(null);

  // Media mode ('song' | 'video')
  const [playerMediaMode, setPlayerMediaMode] = useState('song');
  const [isFullSongEngine, setIsFullSongEngine] = useState(true);

  // History & Queue state
  const [queue, setQueue] = useState(LOCAL_CATALOG);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('flipkart_music_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [LOCAL_CATALOG[0], LOCAL_CATALOG[1]];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'

  // User interactions
  const [likedTrackIds, setLikedTrackIds] = useState(new Set(['local-kesariya', 'local-chaleya', 'local-tauba-tauba']));

  // YouTube Music Style Related Tracks and Auto-Play Mix
  const [relatedData, setRelatedData] = useState({
    moreFromArtist: [],
    youMightLike: [],
    similarArtists: [],
    artistBio: ''
  });
  const [isAutoplay, setIsAutoplay] = useState(true);

  // UI Views
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [expandedTab, setExpandedTab] = useState('upNext');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    topResult: null,
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  });
  const [activeFilter, setActiveFilter] = useState('all');

  // Keep references to prevent stale closures in audio event listeners
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;

  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;

  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const sleepTimerRef = useRef(sleepTimer);
  sleepTimerRef.current = sleepTimer;

  // Track player function
  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return;
    const audio = audioRef.current;

    // Reset current audio state
    audio.pause();
    setCurrentTime(0);

    // Update Queue
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const foundIdx = newQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(foundIdx !== -1 ? foundIdx : 0);
    } else {
      const idx = queueRef.current.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setQueue(prev => [...prev, track]);
        setCurrentIndex(queueRef.current.length);
      }
    }

    // Add to history and persist in localStorage
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id && t.title.toLowerCase() !== track.title.toLowerCase());
      const updated = [track, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('flipkart_music_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setCurrentTrack(track);

    // Load authentic audio URL
    let src = track.audioUrl || (LOCAL_CATALOG[0].audioUrl);
    
    // Set initial full song duration (no 30s clamping!)
    if (track.durationMs) {
      setDuration(Math.floor(track.durationMs / 1000));
    }

    audio.src = src;
    audio.playbackRate = playbackRate;
    audio.load();
    setIsBuffering(true);

    audio.play().then(() => {
      setIsPlaying(true);
      setIsBuffering(false);
    }).catch(err => {
      console.warn("Audio autoplay blocked by browser or loading, user click required:", err);
      setIsPlaying(false);
      setIsBuffering(false);
    });

    // Update MediaSession if supported by browser
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'Flipkart Music',
          artwork: [
            { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      } catch (e) {
        console.warn("MediaSession update error:", e);
      }
    }
  }, [playbackRate]);

  // Dynamic YouTube Music Style Related Tracks Auto-Fetch
  useEffect(() => {
    if (!currentTrack) return;
    let isCancelled = false;

    fetchRelatedMusic(currentTrack).then(res => {
      if (!isCancelled && res) {
        setRelatedData(res);

        // If Autoplay is ON and queue has few tracks ahead, auto-append related songs to queue
        if (isAutoplay) {
          setQueue(prevQueue => {
            const curIdx = currentIndexRef.current;
            const remainingTracks = prevQueue.length - curIdx;
            if (remainingTracks <= 3) {
              const newTracks = [...res.moreFromArtist, ...res.youMightLike].filter(
                nt => !prevQueue.some(pq => pq.id === nt.id || pq.title.toLowerCase() === nt.title.toLowerCase())
              );
              if (newTracks.length > 0) {
                return [...prevQueue, ...newTracks.slice(0, 6)];
              }
            }
            return prevQueue;
          });
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack, isAutoplay]);

  // YouTube Music Style "Start Radio" Mix Generator
  const startRadio = useCallback(async (track) => {
    if (!track) return;
    const rel = await fetchRelatedMusic(track);
    const radioList = [
      track,
      ...(rel?.moreFromArtist || []),
      ...(rel?.youMightLike || [])
    ];
    playTrack(track, radioList);
  }, [playTrack]);

  const handleNextTrack = useCallback(() => {
    const curQueue = queueRef.current;
    if (!curQueue || curQueue.length === 0) return;
    let nextIdx;
    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * curQueue.length);
      if (curQueue.length > 1 && nextIdx === currentIndexRef.current) {
        nextIdx = (nextIdx + 1) % curQueue.length;
      }
    } else {
      nextIdx = (currentIndexRef.current + 1) % curQueue.length;
    }
    setCurrentIndex(nextIdx);
    playTrack(curQueue[nextIdx]);
  }, [playTrack]);

  const seekTo = useCallback((seconds) => {
    const audio = audioRef.current;
    if (audio && !isNaN(seconds)) {
      const liveDuration = (audio.duration && !isNaN(audio.duration) && audio.duration > 0) ? audio.duration : duration;
      const safeTime = Math.max(0, Math.min(seconds, liveDuration));
      try {
        if (typeof audio.fastSeek === 'function') {
          audio.fastSeek(safeTime);
        } else {
          audio.currentTime = safeTime;
        }
      } catch (err) {
        audio.currentTime = safeTime;
      }
      setCurrentTime(safeTime);
    }
  }, [duration]);

  const handlePrevTrack = useCallback(() => {
    const curQueue = queueRef.current;
    if (!curQueue || curQueue.length === 0) return;
    const audio = audioRef.current;
    // If track has been playing for more than 3 seconds, restart it first like Spotify
    if (audio && audio.currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIdx = (currentIndexRef.current - 1 + curQueue.length) % curQueue.length;
    setCurrentIndex(prevIdx);
    playTrack(curQueue[prevIdx]);
  }, [playTrack, seekTo]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const track = currentTrackRef.current;
    if (!track) return;

    if (isPlayingRef.current) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === '' || audio.src === 'about:blank') {
        audio.src = track.audioUrl || LOCAL_CATALOG[0].audioUrl;
        audio.load();
      }
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          if (err.name !== 'AbortError') {
            console.warn("Play error:", err);
          }
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const seekForward10 = useCallback(() => {
    const audio = audioRef.current;
    const cur = (audio && !isNaN(audio.currentTime) && audio.currentTime >= 0) ? audio.currentTime : currentTime;
    seekTo(cur + 10);
  }, [currentTime, seekTo]);

  const seekBackward10 = useCallback(() => {
    const audio = audioRef.current;
    const cur = (audio && !isNaN(audio.currentTime) && audio.currentTime >= 0) ? audio.currentTime : currentTime;
    seekTo(cur - 10);
  }, [currentTime, seekTo]);

  const setVolumeLevel = (val) => {
    const audio = audioRef.current;
    audio.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume > 0 ? volume : 0.85;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const setPlaybackRate = (rate) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  };

  const setTimerMinutes = (mins) => {
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    if (!mins) {
      setSleepTimer(null);
      return;
    }

    if (mins === 'end') {
      setSleepTimer('end');
      return;
    }

    setSleepTimer(mins);
    let secondsLeft = mins * 60;
    sleepTimerIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
        setSleepTimer(null);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        setSleepTimer(Math.ceil(secondsLeft / 60));
      }
    }, 1000);
  };

  // Direct HTML5 Audio Events
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const onPlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const onPause = () => {
      setIsPlaying(false);
    };
    
    const onTimeUpdate = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime);
      }
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const onEnded = () => {
      setIsPlaying(false);
      // Sleep timer check
      if (sleepTimerRef.current === 'end') {
        setSleepTimer(null);
        return;
      }

      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(err => console.warn(err));
      } else {
        handleNextTrack();
      }
    };

    const onError = (e) => {
      console.warn("Audio playback error event:", e);
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Set MediaSession action handlers
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', togglePlay);
        navigator.mediaSession.setActionHandler('pause', togglePlay);
        navigator.mediaSession.setActionHandler('previoustrack', handlePrevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack);
        navigator.mediaSession.setActionHandler('seekforward', seekForward10);
        navigator.mediaSession.setActionHandler('seekbackward', seekBackward10);
      } catch (e) {
        console.warn("MediaSession action handler error:", e);
      }
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [handleNextTrack, handlePrevTrack, togglePlay, volume]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when user is typing in search or input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const cur = audioRef.current && !isNaN(audioRef.current.currentTime) ? audioRef.current.currentTime : currentTime;
        seekTo(cur + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const cur = audioRef.current && !isNaN(audioRef.current.currentTime) ? audioRef.current.currentTime : currentTime;
        seekTo(cur - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolumeLevel(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolumeLevel(Math.max(0, volume - 0.05));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyL') {
        if (currentTrackRef.current) {
          toggleLike(currentTrackRef.current.id);
        }
      } else if (e.code === 'KeyF') {
        setIsExpandedPlayerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, togglePlay]);

  const toggleLike = (trackId) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
  };

  const playNextInQueue = (track) => {
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(currentIndexRef.current + 1, 0, track);
      return copy;
    });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || !query.trim()) {
      setIsSearching(false);
      setSearchResults({
        topResult: null,
        songs: [],
        albums: [],
        artists: [],
        playlists: []
      });
      return;
    }

    setIsSearching(true);
    const results = await searchMusic(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('flipkart_music_history');
    } catch (e) {}
  };

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        audioQuality,
        sleepTimer,
        playerMediaMode,
        isFullSongEngine,
        queue,
        history,
        currentIndex,
        isShuffle,
        repeatMode,
        likedTrackIds,
        isExpandedPlayerOpen,
        expandedTab,
        searchQuery,
        isSearching,
        searchResults,
        activeFilter,
        relatedData,
        isAutoplay,
        
        playTrack,
        startRadio,
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
        setAudioQuality,
        setTimerMinutes,
        setIsAutoplay,
        addToQueue,
        playNextInQueue,
        clearHistory,
        setIsShuffle,
        setRepeatMode,
        setPlayerMediaMode,
        setIsExpandedPlayerOpen,
        setExpandedTab,
        handleSearch,
        setActiveFilter
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
