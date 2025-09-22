import React from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import DiveMap from './Map';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useFirebase();

  // If user is authenticated, show the map directly
  if (user) {
    return (
      <div>
        <DiveMap />
      </div>
    );
  }

  // For unauthenticated users, show the informative landing page
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Track Your Hobby Adventures Worldwide</h1>
          <p className="hero-subtitle">
            Record and visualize your hobby activities on an interactive world map. 
            Whether you're into diving, photography, hiking, or any other hobby - 
            keep track of all the amazing places you've been!
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="map-preview">
            <div className="map-placeholder">
              <span className="map-icon">🗺️</span>
              <p>Your hobby map awaits!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Record Locations</h3>
              <p>Add your hobby activities with details like location, date, and notes. Track diving spots, photography locations, or any hobby venue.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Visualize on Map</h3>
              <p>See all your activities plotted on an interactive world map. Click on markers to view details of each entry.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Build a visual diary of your hobby journey. See patterns, discover new places, and remember all your adventures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Mapping Your Hobbies?</h2>
          <p>Join hobby enthusiasts from around the world and start tracking your adventures today.</p>
          <div className="cta-actions">
            <Link to="/signup" className="cta-button primary large">
              Create Your Free Account
            </Link>
            <Link to="/login" className="cta-button secondary large">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;