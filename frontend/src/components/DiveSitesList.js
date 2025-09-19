import React from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import "./DiveSitesList.css";

const DiveSitesList = () => {
  const { diveSites, loading, error, deleteDiveSite } = useFirebase();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dive site?")) {
      try {
        await deleteDiveSite(id);
        // The FirebaseContext already handles updating the diveSites state
      } catch (err) {
        console.error("Error deleting dive site:", err);
        // The error will be handled by the FirebaseContext
      }
    }
  };

  if (loading) return <div className="loading">Loading dive sites...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dive-sites-list-container">
      <div className="dive-sites-header">
        <h2>My Dive Sites</h2>
        <Link to="/add" className="add-button">
          Add New Dive Site
        </Link>
      </div>

      {diveSites.length === 0 ? (
        <div className="no-data">
          <p>No dive sites found. Add your first dive site!</p>
          <Link to="/add" className="add-button">
            Add Dive Site
          </Link>
        </div>
      ) : (
        <div className="dive-sites-grid">
          {diveSites.map((site) => (
            <div className="dive-site-card" key={site.id}>
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
