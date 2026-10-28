import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import AuthScreen from './components/AuthScreen';
import ProfileModal from './components/ProfileModal';
import EmailInboxModal from './components/EmailInboxModal';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FilterPills from './components/FilterPills';
import TopResultCard from './components/TopResultCard';
import SongList from './components/SongList';
import GridSection from './components/GridSection';
import PlayerBar from './components/PlayerBar';
import ExpandedPlayer from './components/ExpandedPlayer';
import HomeFeed from './components/HomeFeed';
import { LOCAL_CATALOG } from './services/localCatalog';
import { Heart, History, Library, Compass } from 'lucide-react';
import './App.css';

function MainContent() {
  const { searchQuery, isSearching, searchResults, activeFilter, likedTrackIds, history, queue } = usePlayer();
  const [currentNav, setCurrentNav] = useState('home');

  const { topResult, songs, albums, artists, playlists } = searchResults;
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  // Filter Liked tracks
  const likedSongsList = LOCAL_CATALOG.filter(track => likedTrackIds.has(track.id));

  return (
    <div className="app-layout">
      <Navbar />

      <div className="main-body">
        <Sidebar currentNav={currentNav} setCurrentNav={setCurrentNav} />

        <main className="content-area">
          {hasSearch ? (
            <div className="search-results-view">
              <FilterPills />

              {isSearching ? (
                <div className="searching-skeleton">
                  <div className="skeleton-title">Searching Flipkart Music for "{searchQuery}"...</div>
                  <div className="eq-container" style={{ margin: '20px 0' }}>
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                    <div className="eq-bar" />
                  </div>
                </div>
              ) : (
                <>
                  {activeFilter === 'all' && (
                    <>
                      {topResult && <TopResultCard topResult={topResult} />}
                      <SongList songs={songs.slice(0, 8)} title="Songs" />
                      <GridSection items={albums} type="albums" title="Albums" />
                      <GridSection items={artists} type="artists" title="Artists" />
                      <GridSection items={playlists} type="playlists" title="Playlists" />
                    </>
                  )}

                  {activeFilter === 'songs' && (
                    <SongList songs={songs} title={`All Songs matching "${searchQuery}"`} />
                  )}

                  {activeFilter === 'albums' && (
                    <GridSection items={albums} type="albums" title={`Albums matching "${searchQuery}"`} />
                  )}

                  {activeFilter === 'artists' && (
                    <GridSection items={artists} type="artists" title={`Artists matching "${searchQuery}"`} />
                  )}

                  {activeFilter === 'playlists' && (
                    <GridSection items={playlists} type="playlists" title={`Playlists matching "${searchQuery}"`} />
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {currentNav === 'home' && <HomeFeed />}

              {currentNav === 'explore' && (
                <div className="nav-page-view">
                  <div className="page-header">
                    <Compass size={28} className="page-icon" />
                    <h1 className="page-title">Explore Trending Music</h1>
                  </div>
                  <GridSection items={albums} type="albums" title="New Album Releases" />
                  <SongList songs={LOCAL_CATALOG} title="Top 50 Indian Hits" />
                </div>
              )}

              {currentNav === 'library' && (
                <div className="nav-page-view">
                  <div className="page-header">
                    <Library size={28} className="page-icon" />
                    <h1 className="page-title">My Music Library</h1>
                  </div>
                  <SongList songs={queue} title="Current Queue & Saved Tracks" />
                </div>
              )}

              {currentNav === 'history' && (
                <div className="nav-page-view">
                  <div className="page-header">
                    <History size={28} className="page-icon" />
                    <h1 className="page-title">Recently Played History</h1>
                  </div>
                  <SongList songs={history} title="Listening History" />
                </div>
              )}

              {currentNav === 'liked' && (
                <div className="nav-page-view">
                  <div className="page-header">
                    <Heart size={28} className="page-icon" color="#ff4757" fill="#ff4757" />
                    <h1 className="page-title">Liked Songs ({likedSongsList.length})</h1>
                  </div>
                  {likedSongsList.length > 0 ? (
                    <SongList songs={likedSongsList} title="Your Favorite Melodies" />
                  ) : (
                    <div className="empty-state">
                      <p>No liked songs yet. Click the heart icon on any song to save it here!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <PlayerBar />
      <ExpandedPlayer />
      <ProfileModal />
      <EmailInboxModal />
    </div>
  );
}

function AppGate() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <PlayerProvider>
      <MainContent />
    </PlayerProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
