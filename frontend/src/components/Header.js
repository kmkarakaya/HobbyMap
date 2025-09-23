import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import "./Header.css";

const Header = () => {
  const { user, signOut } = useFirebase();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      // ignore for now
    }
  };

  const handleMapClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const handleEntriesClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="container">
        <h1>
          <Link to="/">Hobby Map Tracker</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="/" onClick={handleMapClick}>Map</Link>
            </li>
            <li>
              <Link to="/entries" onClick={handleEntriesClick}>My Entries</Link>
            </li>
            <li>
              <Link to="/add">Add Entry</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <div className="auth-actions">
          {user ? (
            <>
              <span className="user-name">{user.displayName || user.email}</span>
              <button onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
