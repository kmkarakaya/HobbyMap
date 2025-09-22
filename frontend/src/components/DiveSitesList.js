import React from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import "./DiveSitesList.css";

const DiveSitesList = () => {
  const { diveSites, loading, error, deleteDiveSite, retryLoadDiveSites } =
    useFirebase();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDiveSite(id);
        // The FirebaseContext already handles updating the diveSites state
      } catch (err) {
        console.error("Error deleting dive site:", err);
        // The error will be handled by the FirebaseContext
      }
    }
  };

  if (loading) return <div className="loading">Loading entries...</div>;

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
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="dive-sites-list-container">
      <div className="dive-sites-header">
        <h2>My Entries</h2>
        <Link to="/add" className="add-button">
          Add New Entry
        </Link>
      </div>

      {diveSites.length === 0 ? (
        <div className="no-data">
          <p>No entries found. Add your first entry!</p>
          <Link to="/add" className="add-button">
            Add Entry
          </Link>
        </div>
      ) : (
        <div className="dive-sites-grid">
          {diveSites.map((site) => (
            <div className="dive-site-card" key={site.id}>
              <h3>{site.title || site.siteName}</h3>
              {site.hobby && <div className="hobby-label">{site.hobby}</div>}
              <p>
                <strong>Location:</strong>{" "}
                {site.place || site.country ? `${site.place || ""}${site.place && site.country ? ", " : ""}${site.country || ""}` : ""}
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

              <div className="card-actions">
                <Link to={`/edit/${site.id}`} className="edit-button">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(site.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiveSitesList;
