import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import './Map.css';

// Use react-leaflet for the interactive map and fall back gracefully if not
// available in a test environment. Leaflet assets are imported so markers show.
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for CRA so markers display correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const FitBounds = ({ markers, isAnimating }) => {
  const map = useMap();
  useEffect(() => {
    // Don't auto-fit bounds during animation - let the animation control the zoom
    if (!map || !markers || markers.length === 0 || isAnimating) return;
    const latlngs = markers.map((m) => [Number(m.latitude), Number(m.longitude)]);
    try {
      map.fitBounds(latlngs, { padding: [40, 40] });
    } catch (e) {
      // ignore
    }
  }, [map, markers, isAnimating]);
  return null;
};

const MapRef = ({ setMapRef }) => {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
};

const EntryMap = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const { entries = [], loading = false, error = null, retryLoadEntries = () => {} } = firebase || {};
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [floatingPopup, setFloatingPopup] = useState(null);
  const leafletRef = useRef(null);
  // Refs for marker instances so we can open/close popups programmatically
  const markerRefs = useRef({});
  const isPlayingRef = useRef(false);
  // Build marker list flexibly: support `latitude`/`longitude`, legacy `lat`/`lng`,
  // and nested `location` objects. Convert to Numbers and drop invalid coords.
  const markers = (entries || [])
    .map((e) => {
      if (!e) return null;

      // Try canonical fields first, then fall back to legacy names
      const rawLat = e.latitude ?? e.lat ?? (e.location && (e.location.latitude ?? e.location.lat)) ?? (e.coords && (e.coords.latitude ?? e.coords.lat));
      const rawLon = e.longitude ?? e.lng ?? (e.location && (e.location.longitude ?? e.location.lng)) ?? (e.coords && (e.coords.longitude ?? e.coords.lng));

      if (rawLat === undefined || rawLat === null || rawLon === undefined || rawLon === null) return null;

      const lat = Number(rawLat);
      const lon = Number(rawLon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

      // Return a normalized marker object with numeric latitude/longitude
      return { ...e, latitude: lat, longitude: lon };
    })
    .filter(Boolean);

  // Debugging aid: log entry vs marker counts so it's easy to diagnose why some
  // entries are not rendered as markers when running locally.
  React.useEffect(() => {
    try {
      console.log('EntryMap: entries count', (entries || []).length, 'markers count', markers.length);
      console.log('EntryMap: markers sample', markers.map((m) => ({ id: m.id, latitude: m.latitude, longitude: m.longitude })));
    } catch (e) {
      // ignore logging errors
    }
  }, [entries, markers]);

  if (loading) return <div className="loading">Loading map...</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={retryLoadEntries} className="retry-button">Retry Loading</button>
      </div>
    );
  }

  // Helper to sleep for ms
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Start animation: sequentially pan to each marker and open its popup
  const startAnimation = async () => {
    if (!leafletRef.current) return;
    const map = leafletRef.current;
    const list = markers.slice();
    if (list.length === 0) return;
    isPlayingRef.current = true;
    setIsAnimating(true);
    try {
      for (let i = 0; i < list.length && isPlayingRef.current; i++) {
        const m = list[i];
        const lat = Number(m.latitude);
        const lon = Number(m.longitude);
        // Save original view so we can restore it after zooming in
        const originalCenter = map.getCenter();
        const originalZoom = map.getZoom();

        // Zoom in first (choose a closer zoom level); ensure we don't exceed max zoom
        const maxZoom = map.getMaxZoom ? map.getMaxZoom() : 18;
        const targetZoom = Math.min(maxZoom || 18, Math.max(originalZoom + 3, 12));
        const zoomInDuration = Math.max(0.8, animationSpeed / 1000);
        
        // Perform the zoom-in
        try {
          map.flyTo([lat, lon], targetZoom, { duration: zoomInDuration });
          await sleep(Math.max(800, zoomInDuration * 1000 + 300));
        } catch (e) {
          try { 
            map.setView([lat, lon], targetZoom); 
            await sleep(500);
          } catch (ee) {}
        }

        // prepare marker instance (may be used by fallbacks)
        const markerInst = markerRefs.current[m.id];

        // immediately show the floating popup after zoom-in completes
        try {
          const point = map.latLngToContainerPoint([lat, lon]);
          const size = map.getSize();
          const clampedX = Math.min(Math.max(point.x, 60), size.x - 60);
          const clampedY = Math.min(Math.max(point.y, 80), size.y - 80);
          setFloatingPopup({ entry: m, x: clampedX, y: clampedY });
        } catch (e) {
          // fallback to marker popup
          try {
            if (markerInst && markerInst.openPopup) markerInst.openPopup();
            else if (markerInst && markerInst.leafletElement && typeof markerInst.leafletElement.openPopup === 'function') markerInst.leafletElement.openPopup();
          } catch (ee) {}
        }

        // animate the marker DOM element (add a CSS class that bounces)
        try {
          let domWrapper = null;

          // primary: our DivIcon renders an element with data-entry-id
          try {
            domWrapper = document.querySelector(`[data-entry-id="${m.id}"]`);
            if (domWrapper && domWrapper.classList) {
              domWrapper.classList.add('hm-animate');
              setTimeout(() => {
                domWrapper.classList.remove('hm-animate');
              }, 1500); // longer duration to match the CSS animation
            }
          } catch (e) {
            domWrapper = null;
          }

          // fallback: try previous approaches to get marker DOM
          if (!domWrapper && markerInst) {
            let domEl = null;
            if (typeof markerInst.getElement === 'function') domEl = markerInst.getElement();
            else if (markerInst._icon) domEl = markerInst._icon;
            else if (markerInst.leafletElement && markerInst.leafletElement._icon) domEl = markerInst.leafletElement._icon;

            if (domEl) {
              // try to find the wrapper inside the domEl
              const inside = domEl.querySelector && domEl.querySelector('[data-entry-id]');
              const target = inside || domEl;
              if (target && target.classList) {
                target.classList.add('hm-animate');
                setTimeout(() => target.classList.remove('hm-animate'), 1500); // longer duration
              }
            }
          }
        } catch (e) {
          // ignore animation failures
        }

        // keep the popup open for the required minimum 0.5s
        const dwellDuration = Math.max(500, animationSpeed);
        await sleep(dwellDuration);

        // After preview, zoom back out to the original view so the sequence is: zoom in -> show card -> zoom out
        try {
          const restoreDuration = Math.max(0.6, (animationSpeed / 1000) * 0.8);
          try {
            map.flyTo(originalCenter, originalZoom, { duration: restoreDuration });
          } catch (e) {
            try { map.setView(originalCenter, originalZoom); } catch (ee) {}
          }
          await sleep(Math.max(300, restoreDuration * 1000 + 150));
        } catch (e) {}

        // hide floating popup after zooming back out
        setFloatingPopup(null);
      }
    } finally {
      isPlayingRef.current = false;
      setIsAnimating(false);
      // at the end, show all markers again
      try { setShowAll(true); } catch (e) {}
      // ensure bounds contains all
      try { if (leafletRef.current && markers.length) leafletRef.current.fitBounds(markers.map((m) => [Number(m.latitude), Number(m.longitude)]), { padding: [40,40] }); } catch (e) {}
    }
  };

  // Stop animation
  const stopAnimation = () => {
    isPlayingRef.current = false;
    setIsAnimating(false);
  };

  // Show all / Reset actions
  const showAllAction = () => {
    if (!leafletRef.current || markers.length === 0) return;
    try { leafletRef.current.fitBounds(markers.map((m) => [Number(m.latitude), Number(m.longitude)]), { padding: [40,40] }); } catch (e) {}
    setShowAll(true);
    stopAnimation();
  };

  const resetAction = () => {
    showAllAction();
  };

  // wire control callbacks in rendered buttons
  
  return (
    <div className="map-wrapper">
      <div className="map-overlay">
        <div className="map-controls">
          <div className="controls-row">
            <button aria-label="Play animation" className="primary" disabled={isAnimating} onClick={() => { 
              if (!isAnimating) { 
                setShowAll(false); 
                startAnimation(); 
              }
            }}>
              Play Animation
            </button>

            <button aria-label="Show all" disabled={showAll || markers.length === 0} onClick={showAllAction}>
              Show All
            </button>

            <button aria-label="Reset" onClick={resetAction}>
              Reset
            </button>
          </div>

          <div className="controls-row speed-row">
            <label htmlFor="speed">Animation Speed:</label>
            <input
              aria-label="Animation speed"
              id="speed"
              type="range"
              min="100"
              max="5000"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            />
            <span aria-live="polite" className="speed-value">{(animationSpeed / 1000).toFixed(1)}s</span>
          </div>

          <div className="controls-footer">{`Showing all ${markers.length} entries`}</div>
        </div>
      </div>

  <div data-testid="map-container" className="map-container" role="img" aria-label={`Map showing ${markers.length} markers`}>
        {/* Use a Leaflet MapContainer for real tiles and markers */}
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapRef setMapRef={(map) => { leafletRef.current = map; }} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((m) => {
            // create a div icon so the DOM structure is under our control and
            // we can reliably query it for animations
            const icon = L.divIcon({
              className: 'hm-div-icon',
              html: `<div class="hm-pin-wrapper" data-entry-id="${m.id}"><span class="hm-pin"></span></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 24],
            });

            return (
              <Marker
                key={m.id}
                position={[Number(m.latitude), Number(m.longitude)]}
                icon={icon}
                ref={(el) => { if (el) markerRefs.current[m.id] = el; }}
                eventHandlers={{
                  click: (e) => {
                    try {
                      const p = leafletRef.current.latLngToContainerPoint(e.latlng);
                      setFloatingPopup({ entry: m, x: p.x, y: p.y });
                    } catch (err) {
                      // ignore
                    }
                  }
                }}
              />
            );
          })}

          {floatingPopup && (
            <div className="hm-floating-popup" style={{ left: floatingPopup.x, top: floatingPopup.y }}>
              <div className="popup-content">
                <h3>{floatingPopup.entry.title || 'Untitled Entry'}</h3>
                <p><strong>Activity:</strong> {floatingPopup.entry.hobby || 'Not specified'}</p>
                {(floatingPopup.entry.place || floatingPopup.entry.country) && (
                  <p><strong>Location:</strong> {[floatingPopup.entry.place, floatingPopup.entry.country].filter(Boolean).join(', ')}</p>
                )}
                {floatingPopup.entry.date && <p><strong>Date:</strong> {new Date(floatingPopup.entry.date).toLocaleDateString()}</p>}
                {(floatingPopup.entry.notes || floatingPopup.entry.note) && (
                  <p className="popup-notes"><strong>Notes:</strong>{' '}
                    {(floatingPopup.entry.notes || floatingPopup.entry.note).split('\n').map((line, idx, arr) => (
                      <span key={idx}>{line}{idx < arr.length - 1 ? <br /> : null}</span>
                    ))}
                  </p>
                )}
                <div className="popup-actions">
                  <button className="edit-btn" onClick={() => navigate(`/edit/${floatingPopup.entry.id}`)}>Edit</button>
                </div>
              </div>
            </div>
          )}

          <FitBounds markers={markers} isAnimating={isAnimating} />
        </MapContainer>
      </div>
    </div>
  );
};

export default EntryMap;
