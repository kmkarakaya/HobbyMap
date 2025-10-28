import React from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import "./EntriesList.css";

// Unified entries list using the card/grid layout
const EntriesList = () => {
  const { entries: entriesList, loading, error, deleteEntry, retryLoadEntries } =
    useFirebase();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteEntry(id);
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  if (loading) return <div className="loading">Loading entries...</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button
          onClick={retryLoadEntries}
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
    <div className="entries-list-container">
      <div className="entries-header">
        <h2>My Entries</h2>
        <Link to="/add" className="add-button">
          Add New Entry
        </Link>
      </div>

      {entriesList.length === 0 ? (
        <div className="no-data">
          <p>No entries found. Add your first entry!</p>
          <Link to="/add" className="add-button">
            Add Entry
          </Link>
        </div>
      ) : (
  <div className="entries-grid">
          {entriesList.map((site) => (
            <div className="entry-card" key={site.id}>
              <h3>{site.title || site.siteName}</h3>
              {site.hobby && <div className="hobby-label">{site.hobby}</div>}
              <p>
                <strong>Location:</strong>{' '}
                {site.place || site.country ? `${site.place || ""}${site.place && site.country ? ", " : ""}${site.country || ""}` : ""}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {site.date ? new Date(site.date).toLocaleDateString() : ''}
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

export default EntriesList;
