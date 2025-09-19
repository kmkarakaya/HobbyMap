# Scuba Diving Map Tracker – MVP Implementation Plan

This simplified plan focuses on the essential features needed to get a working version of the app up and running quickly, using Firebase for the database.

---

## 1. Project Setup

- Initialize a new Git repository.
- Create a basic `README.md` with project overview.
- Set up simple folder structure:
  - `/frontend` - For React UI
  - `/firebase` - For Firebase configuration

---

## 2. Firebase Setup

### 2.1. Firebase Project Setup

- Create a new Firebase project
- Set up Firestore database
- Configure Firebase Authentication (optional for MVP)
- Add Firebase SDK to the project

### 2.2. Firestore Data Model

- Design a simple Firestore collection for dive sites:
  - `siteName` (String)
  - `location` (String) - city/town name
  - `latitude` (Number)
  - `longitude` (Number)
  - `date` (Timestamp)
  - `notes` (String, optional)

### 2.3. Firebase Functions (Optional)

- Set up a simple Firebase Function for geocoding location names to coordinates
- Or use a client-side geocoding solution

---

## 3. Frontend Development

### 3.1. Basic Frontend Setup

- Create a React app using Create React App
- Install key dependencies:
  - React Router for navigation
  - Leaflet.js for maps
  - Firebase SDK

### 3.2. Firebase Integration

- Create a Firebase config file
- Set up Firebase context or hooks for data access
- Implement functions for CRUD operations on dive sites

### 3.3. Core Components

- Create a simple layout with header and main content area
- Build a form to add/edit dive sites
- Create a list view of dive sites

### 3.4. Map Integration

- Implement basic map with Leaflet.js
- Display dive site locations as markers
- Show site name and date in marker popups
- Make the map interactive (zoom, pan)

### 3.5. Responsive Design

- Ensure the app works on both desktop and mobile devices
- Keep the UI simple and functional

---

## 4. Testing & Deployment

### 4.1. Manual Testing

- Test all core functionality
- Verify map displays correctly
- Check responsiveness on different devices

### 4.2. Simple Deployment

- Deploy the React app to Firebase Hosting
- Set up proper security rules for Firestore

---

## Future Enhancements (Post-MVP)

- User authentication with Firebase Auth
- Public sharing of dive sites
- Advanced filtering
- Custom marker icons
- Detailed analytics
- Mobile app version

---

**How to Use This Plan with Copilot:**

Start with simple, functional requests:

```
"Copilot, help me set up Firebase for my scuba diving app."
```

```
"Copilot, create a Firebase context for my React app."
```

```
"Copilot, help me implement a simple React component to display a map with Leaflet."
```

Focus on getting each core feature working before moving to the next.
