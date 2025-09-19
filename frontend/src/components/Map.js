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

L.Marker.prototype.options.icon = DefaultIcon;

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
            <Marker key={site.id} position={[site.latitude, site.longitude]}>
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
