import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useFirebase } from "../contexts/FirebaseContext";
import "./Map.css";

// Fix for default marker icon issue in React Leaflet
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Apply DefaultIcon as the Leaflet default so React-Leaflet markers have icons when
// using the built-in marker component. This uses the variable so ESLint doesn't
// report it as unused and preserves the original fallback behavior.
L.Marker.prototype.options.icon = DefaultIcon;

// Instead of a global default, create deterministic per-site colored icons.
const hashColor = (str) => {
  if (!str) return "#3498db";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const h = Math.abs(hash) % 360; // hue
  return `hsl(${h},70%,40%)`;
};

const createColoredIcon = (color) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 24 24'>
      <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='${color}'/>
      <circle cx='12' cy='9' r='2.5' fill='white'/>
    </svg>`;

  const svgUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);

  return L.icon({
    iconUrl: svgUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

const DiveMap = () => {
  const { diveSites, loading, error, retryLoadDiveSites } = useFirebase();

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleSiteCount, setVisibleSiteCount] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // milliseconds between marker appearances
  const [showAllSites, setShowAllSites] = useState(true);

  // Sort dive sites by date (oldest first) for chronological animation
  const sortedDiveSites = React.useMemo(() => {
    if (!diveSites) return [];
    return [...diveSites]
      .filter(site => site.latitude && site.longitude) // Only sites with valid coordinates
      .sort((a, b) => {
        // Handle different date formats
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        
        // Invalid dates go to the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
      });
  }, [diveSites]);

  // Sites to display (either all or limited by animation)
  const sitesToDisplay = showAllSites ? sortedDiveSites : sortedDiveSites.slice(0, visibleSiteCount);

  // Default center position
  const defaultPosition = [20, 0]; // Center of the world map

  // Animation control functions
  const startAnimation = () => {
    if (sortedDiveSites.length === 0) return;
    
    setIsAnimating(true);
    setShowAllSites(false);
    setVisibleSiteCount(0);
    
    // Animate markers one by one
    let currentIndex = 0;
    const animateNext = () => {
      if (currentIndex < sortedDiveSites.length) {
        setVisibleSiteCount(currentIndex + 1);
        currentIndex++;
        setTimeout(animateNext, animationSpeed);
      } else {
        setIsAnimating(false);
      }
    };
    
    // Start the animation after a brief delay
    setTimeout(animateNext, 500);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setShowAllSites(true);
    setVisibleSiteCount(0);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setShowAllSites(false);
    setVisibleSiteCount(0);
  };

  if (loading) return <div className="loading">Loading map...</div>;

  // Show error with retry button
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button
          onClick={retryLoadDiveSites}
          className="retry-button"
          style={{
            marginTop: "15px",
            padding: "8px 16px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry Loading Map
        </button>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Animation Controls */}
      <div className="animation-controls">
        <div className="control-group">
          <button 
            onClick={startAnimation} 
            disabled={isAnimating || sortedDiveSites.length === 0}
            className="control-button primary"
          >
            {isAnimating ? '▶ Playing...' : '▶ Play Animation'}
          </button>
          <button 
            onClick={stopAnimation} 
            disabled={!isAnimating && showAllSites}
            className="control-button"
          >
            ⏹ Show All
          </button>
          <button 
            onClick={resetAnimation} 
            disabled={isAnimating}
            className="control-button"
          >
            ⏪ Reset
          </button>
        </div>
        <div className="control-group">
          <label htmlFor="speed-slider">Animation Speed:</label>
          <input
            id="speed-slider"
            type="range"
            min="200"
            max="3000"
            step="200"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            disabled={isAnimating}
            className="speed-slider"
          />
          <span className="speed-label">{(animationSpeed / 1000).toFixed(1)}s</span>
        </div>
        <div className="status-info">
          {isAnimating && (
            <span>Showing {visibleSiteCount} of {sortedDiveSites.length} dive sites</span>
          )}
          {!showAllSites && !isAnimating && (
            <span>Showing {visibleSiteCount} of {sortedDiveSites.length} dive sites</span>
          )}
          {showAllSites && sortedDiveSites.length > 0 && (
            <span>Showing all {sortedDiveSites.length} dive sites</span>
          )}
        </div>
      </div>

      <MapContainer
        center={defaultPosition}
        zoom={2}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sitesToDisplay.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={createColoredIcon(hashColor(site.id))}
          >
            <Popup>
              <div className="popup-content">
                <h3>{site.title || site.siteName}</h3>
                {site.hobby && <p><strong>Hobby:</strong> {site.hobby}</p>}
                <p>
                  <strong>Location:</strong>{" "}
                  {site.place || site.country
                    ? `${site.place || ""}${site.place && site.country ? ", " : ""}${site.country || ""}`
                    : ""}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {site.date instanceof Date
                    ? site.date.toLocaleDateString()
                    : "Unknown date"}
                </p>
                {site.notes && (
                  <p>
                    <strong>Notes:</strong> {site.notes}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DiveMap;
