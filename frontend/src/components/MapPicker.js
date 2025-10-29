import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../firebase/geocoder';

// Minimal map picker: user can click to place a marker and select coords.
const LocationSelector = ({ onSelect }) => {
  const [pos, setPos] = useState(null);
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPos([lat, lng]);
      // Attempt a reverse geocode to fill place/country for the form
      let place = '';
      let country = '';
      try {
        const rev = await reverseGeocode(lat, lng);
        place = rev.place || '';
        country = rev.country || '';
        // include countryCode when available to help match the select list
        var countryCode = rev.countryCode || '';
      } catch (err) {
        // ignore reverse failures
      }
      if (onSelect) onSelect({ latitude: lat, longitude: lng, place, country, countryCode });
    },
  });
  return pos ? <Marker position={pos} /> : null;
};

const MapPicker = ({ initialPosition = [20, 0], zoom = 2, height = 300, onSelect }) => {
  return (
    <div style={{ width: '100%', height: height, marginTop: '10px' }}>
      <MapContainer center={initialPosition} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector onSelect={onSelect} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
