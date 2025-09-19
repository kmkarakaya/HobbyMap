import React from "react";
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

  // Default center position
  const defaultPosition = [20, 0]; // Center of the world map

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

        {diveSites.map((site) =>
          site.latitude && site.longitude ? (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={createColoredIcon(hashColor(site.id))}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{site.siteName}</h3>
                  <p>
                    <strong>Location:</strong> {site.location}
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
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default DiveMap;
