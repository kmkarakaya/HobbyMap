import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1>
          <Link to="/">Scuba Diving Map Tracker</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Map</Link>
            </li>
            <li>
              <Link to="/dives">Dive Sites</Link>
            </li>
            <li>
              <Link to="/add">Add Dive Site</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
