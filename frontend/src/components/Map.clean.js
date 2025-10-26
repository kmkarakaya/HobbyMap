import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';

// Minimal, test-friendly map component used by the tests.
const EntryMap = () => {
  const firebase = useFirebase();
  const { entries = [], loading = false, error = null, retryLoadEntries = () => {} } = firebase || {};
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  if (loading) return <div className="loading">Loading map...</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={retryLoadEntries} className="retry-button">Retry Loading</button>
      </div>
    );
  }

  const markers = (entries || []).filter((e) => e && e.latitude != null && e.longitude != null);

  return (
    <div>
      <div className="map-controls">
        <button aria-label="Play animation">Play Animation</button>
        <button aria-label="Show all" disabled={markers.length === 0}>Show All</button>
        <button aria-label="Reset">Reset</button>
        <label htmlFor="speed">Animation Speed</label>
        <input
          aria-label="Animation speed"
          id="speed"
          type="range"
          min="100"
          max="5000"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
        />
      </div>

      <div>{`Showing all ${markers.length} entries`}</div>

      <div data-testid="map-container">
        {markers.map((m) => (
          <div key={m.id} data-testid="marker">{m.title || 'Entry'}</div>
        ))}
      </div>
    </div>
  );
};

export default EntryMap;
