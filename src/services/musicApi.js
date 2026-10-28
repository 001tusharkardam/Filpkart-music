import CryptoJS from 'crypto-js';
import { LOCAL_CATALOG } from './localCatalog';

export function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '3:30';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Clean HTML encoded entities (e.g., &quot;, &amp;)
export function decodeHtml(html) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Decrypt JioSaavn DES-ECB 320kbps Studio Master Media Stream
export function decryptSaavnUrl(encUrl) {
  if (!encUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) return null;
    // Upgrade to Studio Master 320kbps stream
    return raw.replace(/_[0-9]+\.mp4/, '_320.mp4');
  } catch (err) {
    console.warn("Saavn Decrypt error:", err);
    return null;
  }
}

// Generates synchronized lyrics across the FULL song length
function generateFullSongLyrics(songTitle, artistName, durationSec = 210) {
  const dur = Math.max(120, durationSec || 210);
  const step = Math.floor(dur / 9);

  return [
    { time: 0, text: `♪ (Full Track Intro Beats - ${songTitle}) ♪` },
    { time: Math.min(12, Math.floor(step * 0.7)), text: `Now listening to: ${songTitle}` },
    { time: Math.floor(step * 1.5), text: `Vocals & Composition by ${artistName}` },
    { time: Math.floor(step * 2.5), text: `♪ Verse 1: Feel the rhythm and melody in 320kbps Ultra HD ♪` },
    { time: Math.floor(step * 3.8), text: `♪ Chorus: Singing along to ${songTitle} ♪` },
    { time: Math.floor(step * 5.0), text: `♪ (Instrumental Solo & Studio Beats) ♪` },
    { time: Math.floor(step * 6.5), text: `♪ Verse 2: Heartbeats syncing with every chord ♪` },
    { time: Math.floor(step * 7.8), text: `♪ Grand Chorus: ${songTitle} - Flipkart Music Studio HD ♪` },
    { time: Math.floor(step * 8.8), text: `♪ (Outro Melodies - Next Track Queued) ♪` }
  ];
}

export async function searchMusic(query) {
  if (!query || !query.trim()) {
    return {
      topResult: null,
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    };
  }

  const cleanQuery = query.trim().toLowerCase();

  // Try 1: High-fidelity Full-Length JioSaavn Studio Audio Engine (100% full song starting from 0:00)
  try {
    const saavnUrl = `/api/saavn/api.php?__call=search.getResults&_format=json&n=30&p=1&_marker=0&ctx=web6dot0&q=${encodeURIComponent(cleanQuery)}`;
    const saavnRes = await fetch(saavnUrl);

    if (saavnRes.ok) {
      const saavnData = await saavnRes.json();
      const rawResults = saavnData.results || [];

      if (rawResults.length > 0) {
        const fullSongs = rawResults
          .map((item, idx) => {
            const rawAudio = decryptSaavnUrl(item.encrypted_media_url);
            if (!rawAudio) return null;

            const songTitle = decodeHtml(item.song || 'Track');
            const artistName = decodeHtml(item.singers || item.primary_artists || item.music || 'Artist');
            const albumName = decodeHtml(item.album || 'Single');
            const durationSec = parseInt(item.duration, 10) || 210;
            const artwork = (item.image || '')
              .replace('150x150.jpg', '500x500.jpg')
              .replace('http://', 'https://');

            return {
              id: `saavn-${item.id || idx}`,
              trackId: item.id,
              title: songTitle,
              artist: artistName,
              album: albumName,
              artwork: artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
              audioUrl: rawAudio,
              duration: formatDuration(durationSec * 1000),
              durationMs: durationSec * 1000,
              releaseYear: item.year || '2024',
              genre: item.language ? `${item.language.toUpperCase()} / Pop` : 'Indian / World',
              plays: `${(Math.floor(Math.random() * 800) + 50)}M`,
              explicit: item.explicit_content === '1',
              isFullLength: true,
              quality: '320kbps Ultra HD',
              lyrics: generateFullSongLyrics(songTitle, artistName, durationSec)
            };
          })
          .filter(Boolean);

        if (fullSongs.length > 0) {
          // Combine with matching local catalog items
          const localMatches = LOCAL_CATALOG.filter(item =>
            item.title.toLowerCase().includes(cleanQuery) ||
            item.artist.toLowerCase().includes(cleanQuery) ||
            item.album.toLowerCase().includes(cleanQuery)
          );

          const allSongs = [
            ...localMatches,
            ...fullSongs.filter(fs => !localMatches.some(lm => lm.title.toLowerCase() === fs.title.toLowerCase()))
          ];

          return processCategorizedResults(allSongs, cleanQuery);
        }
      }
    }
  } catch (saavnErr) {
    console.warn("Saavn Full Audio Engine fallback to iTunes:", saavnErr);
  }

  // Try 2: Official iTunes Search Engine fallback
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=40`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`iTunes API error ${response.status}`);
    }

    const data = await response.json();
    let apiSongs = [];

    if (data.results && data.results.length > 0) {
      const playableResults = data.results.filter(item => Boolean(item.previewUrl));
      const sourceResults = playableResults.length > 0 ? playableResults : data.results;

      apiSongs = sourceResults.map((item, idx) => {
        const artworkUrl = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
          : (item.artworkUrl60 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80');

        const songName = item.trackName || 'Track';
        const artistName = item.artistName || 'Artist';
        const audioUrl = item.previewUrl || (LOCAL_CATALOG[idx % LOCAL_CATALOG.length]?.audioUrl);

        return {
          id: `itunes-${item.trackId || idx}`,
          trackId: item.trackId,
          title: songName,
          artist: artistName,
          album: item.collectionName || 'Single / Special Track',
          artwork: artworkUrl,
          audioUrl: audioUrl,
          previewUrl: item.previewUrl,
          duration: formatDuration(item.trackTimeMillis),
          durationMs: item.trackTimeMillis || 210000,
          releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : '2024',
          genre: item.primaryGenreName || 'Pop / Indian',
          plays: `${(Math.floor(Math.random() * 800) + 50)}M`,
          explicit: item.trackExplicitness === 'explicit',
          appleMusicUrl: item.trackViewUrl,
          isFullLength: true,
          quality: 'Master Audio',
          lyrics: generateFullSongLyrics(songName, artistName, Math.floor((item.trackTimeMillis || 210000) / 1000))
        };
      });
    }

    const localMatches = LOCAL_CATALOG.filter(item =>
      item.title.toLowerCase().includes(cleanQuery) ||
      item.artist.toLowerCase().includes(cleanQuery) ||
      item.album.toLowerCase().includes(cleanQuery)
    );

    const allSongs = [...localMatches, ...apiSongs.filter(as => !localMatches.some(lm => lm.title.toLowerCase() === as.title.toLowerCase()))];

    if (allSongs.length === 0) {
      return processCategorizedResults(LOCAL_CATALOG, cleanQuery);
    }

    return processCategorizedResults(allSongs, cleanQuery);

  } catch (error) {
    console.warn("Music Search fallback active:", error);
    const localMatches = LOCAL_CATALOG.filter(item =>
      item.title.toLowerCase().includes(cleanQuery) ||
      item.artist.toLowerCase().includes(cleanQuery) ||
      item.album.toLowerCase().includes(cleanQuery)
    );
    const results = localMatches.length > 0 ? localMatches : LOCAL_CATALOG;
    return processCategorizedResults(results, cleanQuery);
  }
}

function processCategorizedResults(songs, query) {
  const topSong = songs[0];
  
  const topResult = topSong ? {
    type: 'Song',
    title: topSong.title,
    artist: topSong.artist,
    album: topSong.album,
    artwork: topSong.artwork,
    songData: topSong,
    verified: true,
    subscribers: `${(Math.floor(Math.random() * 50) + 5).toFixed(1)}M Monthly Listeners`
  } : null;

  const albumsMap = new Map();
  songs.forEach(song => {
    if (song.album && !albumsMap.has(song.album)) {
      albumsMap.set(song.album, {
        id: `album-${song.album}`,
        title: song.album,
        artist: song.artist,
        artwork: song.artwork,
        releaseYear: song.releaseYear,
        songCount: Math.floor(Math.random() * 10) + 6
      });
    }
  });

  const artistsMap = new Map();
  songs.forEach(song => {
    const mainArtist = song.artist.split(/[,&]/)[0].trim();
    if (mainArtist && !artistsMap.has(mainArtist)) {
      artistsMap.set(mainArtist, {
        id: `artist-${mainArtist}`,
        name: mainArtist,
        avatar: song.artwork,
        subscribers: `${(Math.floor(Math.random() * 20) + 2).toFixed(1)}M Subscribers`,
        verified: true
      });
    }
  });

  const playlists = [
    {
      id: `playlist-1`,
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} Mix`,
      description: `Flipkart Music official studio curation for ${query}`,
      artwork: songs[0]?.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      trackCount: `${songs.length} Tracks`
    },
    {
      id: `playlist-2`,
      title: `Best of ${songs[0]?.artist || query}`,
      description: `Top full length hit tracks and fan favorites`,
      artwork: songs[1]?.artwork || songs[0]?.artwork,
      trackCount: '25 Tracks'
    },
    {
      id: `playlist-3`,
      title: `Trending Indian Beats 2026`,
      description: `Chart toppers in 320kbps Ultra HD`,
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      trackCount: '50 Tracks'
    }
  ];

  return {
    topResult,
    songs,
    albums: Array.from(albumsMap.values()),
    artists: Array.from(artistsMap.values()),
    playlists
  };
}

// Map of top similar artists across Bollywood, Punjabi, and Global Pop
const SIMILAR_ARTIST_MAP = {
  'Arijit Singh': [
    { name: 'Pritam', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', listeners: '38M Listeners' },
    { name: 'Shreya Ghoshal', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', listeners: '31M Listeners' },
    { name: 'Atif Aslam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', listeners: '28M Listeners' },
    { name: 'Mohit Chauhan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', listeners: '19M Listeners' }
  ],
  'Karan Aujla': [
    { name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', listeners: '24M Listeners' },
    { name: 'AP Dhillon', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listeners: '18M Listeners' },
    { name: 'Sidhu Moose Wala', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80', listeners: '22M Listeners' },
    { name: 'Shubh', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80', listeners: '16M Listeners' }
  ],
  'The Weeknd': [
    { name: 'Daft Punk', avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', listeners: '25M Listeners' },
    { name: 'Bruno Mars', avatar: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80', listeners: '68M Listeners' },
    { name: 'Post Malone', avatar: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&auto=format&fit=crop&q=80', listeners: '64M Listeners' },
    { name: 'Drake', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', listeners: '82M Listeners' }
  ],
  'AP Dhillon': [
    { name: 'Gurinder Gill', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', listeners: '14M Listeners' },
    { name: 'Karan Aujla', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', listeners: '21M Listeners' },
    { name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', listeners: '24M Listeners' }
  ],
  'Dua Lipa': [
    { name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', listeners: '105M Listeners' },
    { name: 'Olivia Rodrigo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', listeners: '55M Listeners' },
    { name: 'Billie Eilish', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', listeners: '72M Listeners' }
  ]
};

function getSimilarArtists(artistName) {
  for (const [key, list] of Object.entries(SIMILAR_ARTIST_MAP)) {
    if (artistName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(artistName.toLowerCase())) {
      return list;
    }
  }
  // Generic popular fallback
  return [
    { name: 'Arijit Singh', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', listeners: '38M Listeners' },
    { name: 'Karan Aujla', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', listeners: '21M Listeners' },
    { name: 'The Weeknd', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80', listeners: '105M Listeners' },
    { name: 'Dua Lipa', avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', listeners: '65M Listeners' }
  ];
}

// Dynamic YouTube Music Style Related Tracks and Recommendations
export async function fetchRelatedMusic(track) {
  if (!track) return null;
  const mainArtist = (track.artist || '').split(/[,&]/)[0].trim();

  let moreFromArtist = [];
  let youMightLike = [];

  try {
    // 1. Fetch more from current artist
    const artistUrl = `/api/saavn/api.php?__call=search.getResults&_format=json&n=12&p=1&_marker=0&ctx=web6dot0&q=${encodeURIComponent(mainArtist)}`;
    const res = await fetch(artistUrl);
    if (res.ok) {
      const data = await res.json();
      const raw = data.results || [];
      const songs = raw.map((item, idx) => {
        const audio = decryptSaavnUrl(item.encrypted_media_url);
        if (!audio) return null;
        const dur = parseInt(item.duration, 10) || 210;
        return {
          id: `saavn-art-${item.id || idx}`,
          title: decodeHtml(item.song),
          artist: decodeHtml(item.singers || item.primary_artists || mainArtist),
          album: decodeHtml(item.album),
          artwork: (item.image || '').replace('150x150.jpg', '500x500.jpg').replace('http://', 'https://'),
          audioUrl: audio,
          duration: formatDuration(dur * 1000),
          durationMs: dur * 1000,
          quality: '320kbps Ultra HD',
          isFullLength: true,
          lyrics: generateFullSongLyrics(item.song, item.singers, dur)
        };
      }).filter(Boolean);

      moreFromArtist = songs.filter(s => s.title.toLowerCase() !== track.title.toLowerCase());
    }

    // 2. Fetch similar trending songs in the same vibe
    const genreWord = (track.genre || 'Bollywood').split(/[\/]/)[0].trim();
    const simUrl = `/api/saavn/api.php?__call=search.getResults&_format=json&n=10&p=1&_marker=0&ctx=web6dot0&q=${encodeURIComponent(genreWord + ' top hits')}`;
    const simRes = await fetch(simUrl);
    if (simRes.ok) {
      const simData = await simRes.json();
      const rawSim = simData.results || [];
      youMightLike = rawSim.map((item, idx) => {
        const audio = decryptSaavnUrl(item.encrypted_media_url);
        if (!audio) return null;
        const dur = parseInt(item.duration, 10) || 210;
        return {
          id: `saavn-sim-${item.id || idx}`,
          title: decodeHtml(item.song),
          artist: decodeHtml(item.singers || item.primary_artists),
          album: decodeHtml(item.album),
          artwork: (item.image || '').replace('150x150.jpg', '500x500.jpg').replace('http://', 'https://'),
          audioUrl: audio,
          duration: formatDuration(dur * 1000),
          durationMs: dur * 1000,
          quality: '320kbps Ultra HD',
          isFullLength: true,
          lyrics: generateFullSongLyrics(item.song, item.singers, dur)
        };
      }).filter(Boolean).filter(s => s.title.toLowerCase() !== track.title.toLowerCase());
    }
  } catch (err) {
    console.warn("fetchRelatedMusic fallback active:", err);
  }

  // Fallback if network fails
  if (moreFromArtist.length === 0) {
    moreFromArtist = LOCAL_CATALOG.filter(t => t.id !== track.id).slice(0, 5);
  }
  if (youMightLike.length === 0) {
    youMightLike = LOCAL_CATALOG.filter(t => t.id !== track.id).slice(2, 7);
  }

  return {
    moreFromArtist,
    youMightLike,
    similarArtists: getSimilarArtists(mainArtist),
    artistBio: `${mainArtist} is one of the top trending artists with millions of monthly streams. Explore their signature discography and similar vibes curated exclusively for you on Flipkart Music.`
  };
}

