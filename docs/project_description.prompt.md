# Project: Scuba Diving Map Tracker

## Overview

Create an app to record and visualize scuba diving sites visited around the world. The app should allow users to enter details of each dive (site name, location—can be coordinates, address, town, or city name—and date) and display these locations interactively on a world map. The goal is to easily share and track all dive sites visited.

## Features

- Frontend interface to enter dive site name, location, date, and optional notes
- Interactive global map displaying all entered dive sites
- Each site marker should show details when clicked
- Option to share the map or dive history

## Technologies

- Frontend: React with hooks
- Database: Firebase Firestore
- Map: Leaflet.js
- Hosting: Firebase Hosting
- Geocoding: Client-side geocoding solution (e.g., OpenStreetMap Nominatim API)

## Instructions

- Implement a serverless architecture using Firebase
- Store dive site data in Firestore collections
- Use client-side geocoding to convert location names to coordinates for mapping
- Frontend should fetch dive sites from Firestore and plot them on the map
- Each marker should display site name and date when clicked
- Make the map interactive (zoom, pan, marker popups)
- Ensure responsive design for mobile and desktop

## User accounts and per-user data

- Add a simple authentication mechanism so users can sign up, sign in, and sign out.
  - Recommended: Firebase Authentication (Google Sign-In and Email/Password for MVP).
- Store dive sites per-user so each user's dive history is private by default.
  - Data model: include `userId` (Firebase UID) on each dive site document, or use a subcollection under each user: `/users/{uid}/dives/{diveId}`.
- The app should show only the currently authenticated user's dive sites in their dashboard and map view.
- Provide a simple profile area to view or edit account info (display name, photo).
- Ensure Firestore security rules enforce per-user access (only allow reads/writes for authenticated user matching `request.auth.uid`).

## Data Model Example (Firestore)

```js
{
  id: "auto-generated",
  siteName: "Blue Hole",
  location: "Belize City",
  latitude: 17.3156,
  longitude: -87.5346,
  userId: "<firebase-uid>",
  date: Timestamp,
  notes: "Amazing dive with sharks"
}
```

## Constraints

- Focus on simplicity and user experience
- Use modern React patterns (functional components, hooks)
- Keep code modular and well-documented

## Example Data

- Dive Site: "Blue Hole, Belize"
- Location: "Belize City"
- Date: "2023-07-15"
- Notes: "Beautiful dive with clear visibility"

---

Use this prompt to guide Copilot for generating code, scaffolding files, and implementing features for your scuba diving map tracker app using Firebase.
