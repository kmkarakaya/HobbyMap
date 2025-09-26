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
        <div className="hero-background-elements">
          <div className="floating-bubble bubble-1"></div>
          <div className="floating-bubble bubble-2"></div>
          <div className="floating-bubble bubble-3"></div>
          <div className="floating-bubble bubble-4"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="water-icon">🌊</span>
            <span>Dive • Explore • Document</span>
          </div>
          <h1 className="hero-title">
            Discover & Track Your
            <span className="hero-title-accent"> Scuba Diving </span>
            Adventures
          </h1>
          <p className="hero-subtitle">
            Create your personal diving logbook on an interactive world map. 
            Record dive sites, depths, marine life encounters, and build a 
            visual story of your underwater exploration journey.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Dive Sites</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12K+</span>
              <span className="stat-label">Divers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">180+</span>
              <span className="stat-label">Countries</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/signup" className="cta-button primary">
              <span className="rocket-icon">🚀</span>
              Start Your Journey
            </Link>
            <Link to="/login" className="cta-button secondary">
              <span className="signin-icon">👤</span>
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="map-preview">
            <div className="map-preview-inner">
              <div className="dive-markers">
                <div className="dive-marker marker-1">
                  <span className="marker-icon">📍</span>
                  <div className="marker-tooltip">
                    <strong>Great Barrier Reef</strong>
                    <span>Depth: 18m • Visibility: Excellent</span>
                  </div>
                </div>
                <div className="dive-marker marker-2">
                  <span className="marker-icon">📍</span>
                  <div className="marker-tooltip">
                    <strong>Blue Hole, Belize</strong>
                    <span>Depth: 40m • Visibility: Good</span>
                  </div>
                </div>
                <div className="dive-marker marker-3">
                  <span className="marker-icon">📍</span>
                  <div className="marker-tooltip">
                    <strong>Maldives</strong>
                    <span>Depth: 25m • Visibility: Perfect</span>
                  </div>
                </div>
              </div>
              <div className="map-background-grid"></div>
            </div>
            <div className="preview-overlay">
              <span className="globe-icon">🌍</span>
              <p>Your diving map awaits!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need for Dive Logging</h2>
            <p className="section-subtitle">
              Professional tools designed specifically for scuba divers and underwater explorers
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="map-icon">🗺️</span>
              </div>
              <h3>Interactive Dive Map</h3>
              <p>Plot your dive sites on a beautiful world map. Search locations, add custom markers, and visualize your diving journey across the globe.</p>
              <div className="feature-highlight">
                <span className="check-icon">✓</span>
                <span>GPS coordinates & depth tracking</span>
              </div>
            </div>
            <div className="feature-card featured">
              <div className="feature-badge">Most Popular</div>
              <div className="feature-icon">
                <span className="book-icon">📚</span>
              </div>
              <h3>Digital Logbook</h3>
              <p>Record comprehensive dive details including depth, duration, conditions, marine life, and personal notes. Never lose a dive memory again.</p>
              <div className="feature-highlight">
                <span className="check-icon">✓</span>
                <span>PADI logbook compatible</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="chart-icon">📊</span>
              </div>
              <h3>Dive Analytics</h3>
              <p>Track your progress with detailed statistics. Monitor your diving patterns, preferred depths, and discover trends in your underwater adventures.</p>
              <div className="feature-highlight">
                <span className="check-icon">✓</span>
                <span>Export to Excel & PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Loved by Divers Worldwide</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"HobbyMap has revolutionized how I track my dives. The visual map makes it so easy to remember each site and plan future trips!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span className="user-icon">👤</span>
                </div>
                <div className="author-info">
                  <strong>Sarah Chen</strong>
                  <span>PADI Divemaster • 200+ dives</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a dive instructor, I recommend HobbyMap to all my students. It's the perfect tool for building a comprehensive dive history."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span className="user-icon">👤</span>
                </div>
                <div className="author-info">
                  <strong>Marcus Rivera</strong>
                  <span>PADI Instructor • 500+ dives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Dive Into Your Digital Logbook?</h2>
            <p>Join thousands of divers already using HobbyMap to document their underwater adventures. Start your free account today!</p>
            <div className="cta-actions">
              <Link to="/signup" className="cta-button primary large">
                <span className="water-icon">🌊</span>
                Create Free Account
              </Link>
              <Link to="/login" className="cta-button secondary large">
                <span className="signin-icon">👤</span>
                Sign In
              </Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <span className="check-icon">✓</span>
                <span>Free forever</span>
              </div>
              <div className="cta-feature">
                <span className="check-icon">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <span className="check-icon">✓</span>
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;