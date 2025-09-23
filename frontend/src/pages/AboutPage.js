import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Hobby Map Tracker</h1>
        <div className="about-content">
          <p>
            Hobby Map Tracker was developed by <strong>Murat Karakaya</strong> in 2025 
            for hobbyists who want to track and visualize their hobby activities 
            on an interactive world map.
          </p>
          <p>
            Whether you're into scuba diving, photography, hiking, or any other hobby, 
            this application helps you keep track of all the amazing places you've 
            visited and experiences you've had.
          </p>
          <div className="developer-info">
            <h3>Developer</h3>
            <p>Murat Karakaya</p>
            <p>
              Website: <a 
                href="https://muratkarakaya.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="website-link"
              >
                muratkarakaya.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;