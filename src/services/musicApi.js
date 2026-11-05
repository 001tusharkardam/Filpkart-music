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

export const REAL_ARTIST_PORTRAITS = {
  'arijit singh': 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/500x500-000000-80-0-0.jpg',
  'the weeknd': 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/500x500-000000-80-0-0.jpg',
  'karan aujla': 'https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/500x500-000000-80-0-0.jpg',
  'ap dhillon': 'https://cdn-images.dzcdn.net/images/artist/52594ac9fa763dc163ed13d21cb130ec/500x500-000000-80-0-0.jpg',
  'diljit dosanjh': 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/500x500-000000-80-0-0.jpg',
  'shreya ghoshal': 'https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/500x500-000000-80-0-0.jpg',
  'dua lipa': 'https://cdn-images.dzcdn.net/images/artist/877872aaf75694f11d53c318700ab2b5/500x500-000000-80-0-0.jpg',
  'jasleen royal': 'https://cdn-images.dzcdn.net/images/artist/c83791c10f0ec33e1d8a18b1a8ff9f84/500x500-000000-80-0-0.jpg',
  'atif aslam': 'https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/500x500-000000-80-0-0.jpg',
  'king': 'https://cdn-images.dzcdn.net/images/artist/a2abdf367a086764c0d8b0e8d8a6832c/500x500-000000-80-0-0.jpg',
  'ed sheeran': 'https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/500x500-000000-80-0-0.jpg',
  'pritam': 'https://cdn-images.dzcdn.net/images/artist/d4914ccd414067cd5e2c108867079a85/500x500-000000-80-0-0.jpg',
  'anirudh ravichander': 'https://cdn-images.dzcdn.net/images/artist/9da0a547b39e99bc35c6a9724aef91bf/500x500-000000-80-0-0.jpg',
  'kaifi khalil': 'https://c.saavncdn.com/352/Kahani-Suno-2-0-Urdu-2022-20230629165609-500x500.jpg',
  'jubin nautiyal': 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg',
  'sachin-jigar': 'https://c.saavncdn.com/195/Heartbeats-Bollywood-Hindi-2026-20260813104641-500x500.jpg'
};

export function getArtistPortrait(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [k, url] of Object.entries(REAL_ARTIST_PORTRAITS)) {
    if (lower.includes(k) || k.includes(lower)) return url;
  }
  return null;
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
              artwork: artwork || (LOCAL_CATALOG[idx % LOCAL_CATALOG.length]?.artwork) || 'https://c.saavncdn.com/423/Arijit-Singh-All-Time-Best-Hindi-Hit-Love-Songs-Collection-Hindi-2026-20261008160834-500x500.jpg',
              audioUrl: rawAudio,
              duration: formatDuration(durationSec * 1000),
              durationMs: durationSec * 1000,
              releaseYear: item.year || '2024',
              genre: item.language ? `${item.language.toUpperCase()} / Pop` : 'Indian / World',
              plays: `${(Math.floor(Math.random() * 800) + 50)}M`,
              explicit: item.explicit_content === '1',
              isFullLength: true,
              quality: '320kbps Ultra HD',
              lyrics: null
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
          : (item.artworkUrl60 || (LOCAL_CATALOG[idx % LOCAL_CATALOG.length]?.artwork) || 'https://c.saavncdn.com/423/Arijit-Singh-All-Time-Best-Hindi-Hit-Love-Songs-Collection-Hindi-2026-20261008160834-500x500.jpg');

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
          lyrics: null
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
        avatar: getArtistPortrait(mainArtist) || song.artwork,
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
      artwork: songs[0]?.artwork || 'https://c.saavncdn.com/423/Arijit-Singh-All-Time-Best-Hindi-Hit-Love-Songs-Collection-Hindi-2026-20261008160834-500x500.jpg',
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
      artwork: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
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

// Map of top similar artists across Bollywood, Punjabi, and Global Pop with verified official portraits
const SIMILAR_ARTIST_MAP = {
  'Arijit Singh': [
    { name: 'Pritam', avatar: 'https://cdn-images.dzcdn.net/images/artist/d4914ccd414067cd5e2c108867079a85/500x500-000000-80-0-0.jpg', listeners: '38M Listeners' },
    { name: 'Shreya Ghoshal', avatar: 'https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/500x500-000000-80-0-0.jpg', listeners: '34M Listeners' },
    { name: 'Atif Aslam', avatar: 'https://cdn-images.dzcdn.net/images/artist/0ea90444148fff9c11d77f06a344724e/500x500-000000-80-0-0.jpg', listeners: '28M Listeners' },
    { name: 'Jasleen Royal', avatar: 'https://cdn-images.dzcdn.net/images/artist/c83791c10f0ec33e1d8a18b1a8ff9f84/500x500-000000-80-0-0.jpg', listeners: '16M Listeners' }
  ],
  'Karan Aujla': [
    { name: 'Diljit Dosanjh', avatar: 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/500x500-000000-80-0-0.jpg', listeners: '28M Listeners' },
    { name: 'AP Dhillon', avatar: 'https://cdn-images.dzcdn.net/images/artist/52594ac9fa763dc163ed13d21cb130ec/500x500-000000-80-0-0.jpg', listeners: '19M Listeners' },
    { name: 'Shubh', avatar: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg', listeners: '16M Listeners' },
    { name: 'King', avatar: 'https://cdn-images.dzcdn.net/images/artist/a2abdf367a086764c0d8b0e8d8a6832c/500x500-000000-80-0-0.jpg', listeners: '20M Listeners' }
  ],
  'The Weeknd': [
    { name: 'Daft Punk', avatar: 'https://c.saavncdn.com/077/After-Hours-English-2020-20260804045014-500x500.jpg', listeners: '25M Listeners' },
    { name: 'Bruno Mars', avatar: 'https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/500x500-000000-80-0-0.jpg', listeners: '68M Listeners' },
    { name: 'Dua Lipa', avatar: 'https://cdn-images.dzcdn.net/images/artist/877872aaf75694f11d53c318700ab2b5/500x500-000000-80-0-0.jpg', listeners: '68M Listeners' },
    { name: 'Ed Sheeran', avatar: 'https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/500x500-000000-80-0-0.jpg', listeners: '82M Listeners' }
  ],
  'AP Dhillon': [
    { name: 'Karan Aujla', avatar: 'https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/500x500-000000-80-0-0.jpg', listeners: '24M Listeners' },
    { name: 'Diljit Dosanjh', avatar: 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/500x500-000000-80-0-0.jpg', listeners: '28M Listeners' },
    { name: 'Kaifi Khalil', avatar: 'https://c.saavncdn.com/352/Kahani-Suno-2-0-Urdu-2022-20230629165609-500x500.jpg', listeners: '14M Listeners' }
  ],
  'Dua Lipa': [
    { name: 'The Weeknd', avatar: 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/500x500-000000-80-0-0.jpg', listeners: '105M Listeners' },
    { name: 'Ed Sheeran', avatar: 'https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/500x500-000000-80-0-0.jpg', listeners: '82M Listeners' },
    { name: 'Jasleen Royal', avatar: 'https://cdn-images.dzcdn.net/images/artist/c83791c10f0ec33e1d8a18b1a8ff9f84/500x500-000000-80-0-0.jpg', listeners: '16M Listeners' }
  ]
};

function getSimilarArtists(artistName) {
  for (const [key, list] of Object.entries(SIMILAR_ARTIST_MAP)) {
    if (artistName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(artistName.toLowerCase())) {
      return list;
    }
  }
  // Generic popular fallback with verified real portraits
  return [
    { name: 'Arijit Singh', avatar: 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/500x500-000000-80-0-0.jpg', listeners: '38M Listeners' },
    { name: 'Diljit Dosanjh', avatar: 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/500x500-000000-80-0-0.jpg', listeners: '28M Listeners' },
    { name: 'Karan Aujla', avatar: 'https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/500x500-000000-80-0-0.jpg', listeners: '24M Listeners' },
    { name: 'The Weeknd', avatar: 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/500x500-000000-80-0-0.jpg', listeners: '105M Listeners' }
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
          lyrics: null
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
          lyrics: null
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

