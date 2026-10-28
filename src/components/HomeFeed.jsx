import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Flame,
  Radio,
  TrendingUp,
  RotateCcw,
  Clock,
  Music,
  ChevronLeft,
  ChevronRight,
  Heart,
  Headphones,
  Compass,
  Shuffle,
  Volume2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import {
  LOCAL_CATALOG,
  QUICK_PICKS,
  TRENDING_HITS,
  BOLLYWOOD_SPECIAL,
  TOP_CHARTS_INDIA,
  DAILY_MIXES,
  CURATED_PLAYLISTS
} from '../services/localCatalog';

export default function HomeFeed() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    handleSearch,
    relatedData,
    startRadio,
    history,
    likedTrackIds,
    toggleLike
  } = usePlayer();

  const [activeMood, setActiveMood] = useState('All');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const carouselRef = useRef(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const moodChips = [
    { label: '✨ All Tracks', mood: 'All', query: '' },
    { label: '🔥 Trending Hits', mood: 'Trending', query: 'Trending' },
    { label: '💖 Bollywood Romance', mood: 'Romance', query: 'Kesariya' },
    { label: '⚡ Punjabi Pop', mood: 'Punjabi', query: 'Punjabi' },
    { label: '🌙 Late Night Chill', mood: 'Chill', query: 'Chill' },
    { label: '🏋️ Workout Hype', mood: 'Workout', query: 'Workout' },
    { label: '🎧 Focus & Lo-Fi', mood: 'Lo-Fi', query: 'Lo-Fi' }
  ];

  const featuredSpotlights = [
    {
      track: LOCAL_CATALOG[0],
      tagline: 'TRENDING #1 ON INDIAN CHARTS',
      subtitle: 'Stream Kesariya & Bollywood Melodies in 320kbps Studio Quality with Synced Lyrics',
      badge: 'TOP 50 INDIA'
    },
    {
      track: LOCAL_CATALOG[1],
      tagline: 'RECORD-BREAKING GLOBAL HIT',
      subtitle: 'Anirudh Ravichander & Arijit Singh join forces in Chaleya',
      badge: 'BLOCKBUSTER'
    },
    {
      track: LOCAL_CATALOG[2],
      tagline: 'VIRAL PUNJABI DANCE ANTHEM',
      subtitle: 'Karan Aujla sets the dance floor on fire with Tauba Tauba',
      badge: 'HOTTEST DANCE'
    }
  ];

  const activeSpotlight = featuredSpotlights[featuredIndex];

  const quickPicksTop6 = [
    LOCAL_CATALOG[0],
    LOCAL_CATALOG[1],
    LOCAL_CATALOG[2],
    LOCAL_CATALOG[3],
    LOCAL_CATALOG[5],
    LOCAL_CATALOG[6]
  ];

  const featuredArtists = [
    {
      name: 'Arijit Singh',
      avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      subscribers: '32M Listeners',
      topSong: LOCAL_CATALOG[0]
    },
    {
      name: 'The Weeknd',
      avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      subscribers: '105M Listeners',
      topSong: LOCAL_CATALOG[6]
    },
    {
      name: 'AP Dhillon',
      avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      subscribers: '18M Listeners',
      topSong: LOCAL_CATALOG[3]
    },
    {
      name: 'Dua Lipa',
      avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      subscribers: '65M Listeners',
      topSong: LOCAL_CATALOG[8]
    },
    {
      name: 'Karan Aujla',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      subscribers: '22M Listeners',
      topSong: LOCAL_CATALOG[2]
    },
    {
      name: 'Jasleen Royal',
      avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      subscribers: '14M Listeners',
      topSong: LOCAL_CATALOG[5]
    }
  ];

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-feed-container">
      {/* Top Greeting Header */}
      <div className="home-greeting-row">
        <div className="greeting-text-wrap">
          <span className="greeting-pill">
            <Sparkles size={13} className="sparkle-gold" />
            <span>VIP Studio Audio • 320kbps Ultra HD</span>
          </span>
          <h1 className="greeting-heading">{getGreeting()}, Music Lover</h1>
        </div>
      </div>

      {/* Mood & Genre Filter Pills */}
      <div className="mood-chips-bar">
        {moodChips.map((chip, idx) => (
          <button
            key={idx}
            className={`mood-chip ${activeMood === chip.mood ? 'active-mood-chip' : ''}`}
            onClick={() => {
              setActiveMood(chip.mood);
              if (chip.query) handleSearch(chip.query);
            }}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Spotify-Style Quick 6-Tile Grid */}
      <div className="quick-tiles-grid">
        {quickPicksTop6.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const isCurrentPlaying = isCurrent && isPlaying;

          return (
            <div
              key={track.id || idx}
              className={`quick-tile-card ${isCurrent ? 'active-quick-tile' : ''}`}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playTrack(track, LOCAL_CATALOG);
                }
              }}
            >
              <img src={track.artwork} alt={track.title} className="quick-tile-thumb" />
              <div className="quick-tile-info">
                <span className="quick-tile-title">{track.title}</span>
                <span className="quick-tile-artist">{track.artist}</span>
              </div>
              <button
                className={`quick-tile-play-btn ${isCurrentPlaying ? 'tile-playing' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playTrack(track, LOCAL_CATALOG);
                  }
                }}
              >
                {isCurrentPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" className="play-icon-offset" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dynamic Featured Hero Spotlight */}
      <div className="hero-banner glass-panel">
        <div
          className="hero-ambient-glow"
          style={{ backgroundImage: `url(${activeSpotlight.track.artwork})` }}
        />
        <div className="banner-content">
          <div className="banner-badge-row">
            <span className="banner-badge gold-badge">
              <Sparkles size={13} />
              <span>{activeSpotlight.badge}</span>
            </span>
            <span className="banner-sub-tag">{activeSpotlight.tagline}</span>
          </div>

          <h1 className="banner-title">{activeSpotlight.track.title}</h1>
          <p className="banner-artist-text">By {activeSpotlight.track.artist}</p>
          <p className="banner-sub">{activeSpotlight.subtitle}</p>

          <div className="banner-buttons">
            <button
              className="banner-play-btn glow-yellow"
              onClick={() => {
                if (currentTrack?.id === activeSpotlight.track.id) {
                  togglePlay();
                } else {
                  playTrack(activeSpotlight.track, LOCAL_CATALOG);
                }
              }}
            >
              {currentTrack?.id === activeSpotlight.track.id && isPlaying ? (
                <>
                  <Pause size={20} fill="currentColor" />
                  <span>Pause Track</span>
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" className="play-icon-offset" />
                  <span>Play Full Track</span>
                </>
              )}
            </button>

            <button
              className="banner-radio-btn"
              onClick={() => startRadio(activeSpotlight.track)}
            >
              <Radio size={18} />
              <span>Start Radio Mix</span>
            </button>

            <button
              className="banner-cycle-btn"
              onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredSpotlights.length)}
              title="Next Featured Track"
            >
              <RotateCcw size={16} />
              <span>Next Spotlight</span>
            </button>
          </div>
        </div>

        <div className="banner-art-wrap">
          <img
            src={activeSpotlight.track.artwork}
            alt={activeSpotlight.track.title}
            className="banner-img"
          />
          {currentTrack?.id === activeSpotlight.track.id && isPlaying && (
            <div className="banner-live-eq">
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
          )}
        </div>
      </div>

      {/* "Listen Again" / Recently Played Section */}
      {history && history.length > 0 && (
        <div className="home-section listen-again-section">
          <div className="section-title-wrap">
            <div className="section-left-title">
              <RotateCcw size={22} className="section-title-icon" />
              <h2 className="home-section-title">Listen Again</h2>
              <span className="listen-again-badge">{history.length} Played</span>
            </div>
            <div className="carousel-nav-arrows">
              <button
                className="carousel-arrow-btn"
                onClick={() => scrollCarousel('left')}
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="carousel-arrow-btn"
                onClick={() => scrollCarousel('right')}
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="listen-again-carousel" ref={carouselRef}>
            {history.slice(0, 16).map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id || idx}
                  className={`listen-again-card ${isCurrent ? 'active-history-card' : ''}`}
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playTrack(track, history);
                    }
                  }}
                >
                  <div className="listen-card-thumb-wrap">
                    <img src={track.artwork} alt={track.title} className="listen-card-thumb" />
                    <div className="listen-card-overlay">
                      <button className="listen-play-btn glow-yellow">
                        {isCurrentPlaying ? (
                          <Pause size={20} fill="currentColor" />
                        ) : (
                          <Play size={20} fill="currentColor" className="play-icon-offset" />
                        )}
                      </button>
                    </div>
                    {isCurrentPlaying && (
                      <div className="listen-card-eq">
                        <span className="mini-eq-bar" />
                        <span className="mini-eq-bar" />
                        <span className="mini-eq-bar" />
                      </div>
                    )}
                  </div>
                  <div className="listen-card-info">
                    <span className="listen-card-title">{track.title}</span>
                    <span className="listen-card-artist">{track.artist}</span>
                    <span className="listen-card-meta">
                      {track.duration} • 320kbps HD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Top 10 Indian Charts - Ranked List */}
      <div className="home-section">
        <div className="section-title-wrap">
          <div className="section-left-title">
            <TrendingUp size={22} className="section-title-icon" />
            <div>
              <h2 className="home-section-title">Today's Top Hits • India</h2>
              <span className="section-subtitle">The most streamed tracks right now</span>
            </div>
          </div>
          <button
            className="play-all-pill-btn"
            onClick={() => playTrack(TOP_CHARTS_INDIA[0], TOP_CHARTS_INDIA)}
          >
            <Play size={14} fill="currentColor" />
            <span>Play All Charts</span>
          </button>
        </div>

        <div className="charts-table">
          {TOP_CHARTS_INDIA.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isLiked = likedTrackIds.has(track.id);

            return (
              <div
                key={track.id || idx}
                className={`chart-row ${isCurrent ? 'active-chart-row' : ''}`}
                onClick={() => {
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playTrack(track, TOP_CHARTS_INDIA);
                  }
                }}
              >
                {/* Rank Number or Equalizer */}
                <div className="chart-rank-col">
                  {isCurrentPlaying ? (
                    <div className="chart-eq">
                      <span className="mini-eq-bar" />
                      <span className="mini-eq-bar" />
                      <span className="mini-eq-bar" />
                    </div>
                  ) : (
                    <span className={`rank-number ${idx < 3 ? 'top-three-rank' : ''}`}>
                      #{track.rank}
                    </span>
                  )}
                  <button
                    className="chart-play-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        playTrack(track, TOP_CHARTS_INDIA);
                      }
                    }}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                </div>

                {/* Cover & Title */}
                <div className="chart-info-col">
                  <img src={track.artwork} alt={track.title} className="chart-thumb" />
                  <div className="chart-meta">
                    <span className="chart-title">{track.title}</span>
                    <span className="chart-artist">{track.artist}</span>
                  </div>
                </div>

                {/* Trend Badge */}
                <div className="chart-trend-col">
                  <span className="trend-pill">{track.trend}</span>
                </div>

                {/* Streams Count */}
                <div className="chart-plays-col">
                  <span className="plays-count">{track.plays || '100M+'} plays</span>
                </div>

                {/* Duration & Like Button */}
                <div className="chart-action-col">
                  <button
                    className={`chart-like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      size={18}
                      fill={isLiked ? '#ff4757' : 'none'}
                      color={isLiked ? '#ff4757' : 'currentColor'}
                    />
                  </button>
                  <span className="chart-duration">{track.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Made For You / Daily Mixes */}
      <div className="home-section">
        <div className="section-title-wrap">
          <div className="section-left-title">
            <Sparkles size={22} className="section-title-icon" />
            <div>
              <h2 className="home-section-title">Made For You • Daily Mixes</h2>
              <span className="section-subtitle">Tailored non-stop radio mixes updated daily</span>
            </div>
          </div>
        </div>

        <div className="mixes-grid">
          {DAILY_MIXES.map((mix) => (
            <div
              key={mix.id}
              className="daily-mix-card"
              onClick={() => playTrack(mix.tracks[0], mix.tracks)}
            >
              <div className="mix-thumb-wrap">
                <img src={mix.artwork} alt={mix.title} className="mix-thumb" />
                <div
                  className="mix-gradient-overlay"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)`
                  }}
                />
                <span
                  className="mix-accent-pill"
                  style={{ backgroundColor: mix.accentColor }}
                >
                  {mix.title}
                </span>
                <button className="mix-play-btn glow-yellow">
                  <Play size={22} fill="currentColor" className="play-icon-offset" />
                </button>
              </div>
              <div className="mix-info">
                <span className="mix-title">{mix.title}</span>
                <span className="mix-sub">{mix.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Mood & Genre Playlists */}
      <div className="home-section">
        <div className="section-title-wrap">
          <div className="section-left-title">
            <Headphones size={22} className="section-title-icon" />
            <div>
              <h2 className="home-section-title">Featured Playlists</h2>
              <span className="section-subtitle">Hand-picked collections for every mood</span>
            </div>
          </div>
        </div>

        <div className="playlist-showcase-grid">
          {CURATED_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              className="curated-pl-card"
              onClick={() => playTrack(pl.songs[0], pl.songs)}
            >
              <div className="curated-pl-thumb-wrap">
                <img src={pl.artwork} alt={pl.title} className="curated-pl-thumb" />
                <div className="curated-pl-overlay">
                  <button className="grid-play-btn glow-yellow">
                    <Play size={22} fill="currentColor" className="play-icon-offset" />
                  </button>
                </div>
              </div>
              <div className="curated-pl-info">
                <span className="curated-pl-title">{pl.title}</span>
                <span className="curated-pl-desc">{pl.description}</span>
                <span className="curated-pl-count">{pl.trackCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Artists Showcase */}
      <div className="home-section">
        <div className="section-title-wrap">
          <div className="section-left-title">
            <Flame size={22} className="section-title-icon" />
            <div>
              <h2 className="home-section-title">Popular Artists</h2>
              <span className="section-subtitle">Follow and stream your favorite voices</span>
            </div>
          </div>
        </div>

        <div className="artists-row">
          {featuredArtists.map((artist, idx) => (
            <div
              key={idx}
              className="artist-circle-card"
              onClick={() => {
                if (artist.topSong) {
                  startRadio(artist.topSong);
                } else {
                  handleSearch(artist.name);
                }
              }}
            >
              <div className="artist-avatar-container">
                <img src={artist.avatar} alt={artist.name} className="artist-circle-avatar" />
                <div className="artist-play-overlay">
                  <Play size={22} fill="currentColor" />
                </div>
              </div>
              <span className="artist-circle-name">{artist.name}</span>
              <span className="artist-circle-stat">{artist.subscribers}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
