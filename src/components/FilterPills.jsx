import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function FilterPills() {
  const { activeFilter, setActiveFilter } = usePlayer();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' }
  ];

  return (
    <div className="filter-pills-bar">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => setActiveFilter(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
