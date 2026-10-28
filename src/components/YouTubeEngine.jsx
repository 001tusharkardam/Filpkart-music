import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function YouTubeEngine() {
  const { currentTrack, isPlaying, volume, isMuted, seekTo, handleNextTrack } = usePlayer();
  const iframeRef = useRef(null);

  // Send message to YouTube IFrame API
  const postYTCommand = (func, args = []) => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {
        console.warn("YouTube Engine postMessage error:", err);
      }
    }
  };

  // Sync Play / Pause state with YouTube Player
  useEffect(() => {
    if (isPlaying) {
      postYTCommand('playVideo');
    } else {
      postYTCommand('pauseVideo');
    }
  }, [isPlaying, currentTrack]);

  // Sync Volume state
  useEffect(() => {
    const vol = isMuted ? 0 : Math.round(volume * 100);
    postYTCommand('setVolume', [vol]);
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  // Build YouTube Embed URL for exact original full completed song
  let embedUrl = '';
  if (currentTrack.youtubeId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&controls=0&rel=0`;
  } else {
    const query = encodeURIComponent(`${currentTrack.title} ${currentTrack.artist} official audio song`);
    embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1&enablejsapi=1&controls=0&rel=0`;
  }

  return (
    <div className="youtube-audio-engine-hidden" style={{ position: 'fixed', bottom: -500, left: -500, opacity: 0, pointerEvents: 'none' }}>
      <iframe
        ref={iframeRef}
        id="yt-audio-player-element"
        title="YouTube Full Original Audio Engine"
        width="300"
        height="300"
        src={embedUrl}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}
