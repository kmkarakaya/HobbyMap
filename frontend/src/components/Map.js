import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDiveSites } from "../services/diveService";
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
  const [diveSites, setDiveSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiveSites = async () => {
      try {
        setLoading(true);
        const response = await getDiveSites();
        setDiveSites(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching dive sites. Please try again later.");
        setLoading(false);
      }
    };

    fetchDiveSites();
  }, []);

  // Default center position
  const defaultPosition = [20, 0]; // Center of the world map

  if (loading) return <div className="loading">Loading map...</div>;
  if (error) return <div className="error">{error}</div>;

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
            <Marker key={site._id} position={[site.latitude, site.longitude]}>
              <Popup>
                <div className="popup-content">
                  <h3>{site.siteName}</h3>
                  <p>
                    <strong>Location:</strong> {site.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(site.date).toLocaleDateString()}
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
