# Project: Hobby Map — record and visualize location-based hobby activity

## Overview

Hobby Map is a generic, location-first app to record and visualize places where users practice their hobbies or participate in hobby-related events. Instead of being limited to scuba diving, users can record any hobby instance (for example: attended milongas for tango dancers, DJ performances in cities, craft fairs, photography outings, or any other hobby activity) and see them plotted on an interactive world map.

Each entry records a concise title, the hobby/activity name, place (city/town/site), country, date, optional notes, and geo-coordinates. The app supports per-user data (so each user's entries are private) and simple sharing options later.

## Features

- Frontend interface to enter an entry title, hobby/activity name, location (city/town/site), date, and optional notes
- Interactive global map displaying all user entries (markers with popups)
- Each marker shows the entry title, hobby, and date when clicked
- Per-user scoping using Firebase Authentication so users only see their own entries
- Simple share/export options (post-MVP)

## Technologies

- Frontend: React with hooks
- Database: Firebase Firestore
- Map: Leaflet.js
- Hosting: Firebase Hosting
- Geocoding: Client-side geocoding solution (e.g., OpenStreetMap Nominatim API)

## Instructions

- Implement a serverless architecture using Firebase
- Store hobby entries in a Firestore collection (each document includes `userId` for per-user scoping)
- Use client-side geocoding to convert place + country into coordinates for mapping when coordinates are missing
- Frontend should fetch the current user's entries from Firestore and plot them on the map
- Each marker should display the entry title, hobby, and date when clicked
- Make the map interactive (zoom, pan, marker popups) and responsive on mobile and desktop

## User accounts and per-user data

- Implement Firebase Authentication (Email/Password and Google Sign-In recommended for MVP).
- Scope entries by user using a `userId` field on each document in the chosen collection (or use a subcollection under `/users/{uid}/entries/` if you prefer). Firestore security rules must require `request.auth.uid == request.resource.data.userId` on create/update reads.
- The app UI should show only the currently authenticated user's entries in the dashboard and map view.

## Data Model Example (Firestore)

```js
{
  id: "auto-generated",
  title: "Saturday Milonga at El Ateneo",
  hobby: "Tango",
  place: "Buenos Aires",
  country: "Argentina", // consider storing ISO2 code for robustness
  latitude: -34.6037,
  longitude: -58.3816,
  userId: "<firebase-uid>",
  date: Timestamp,
  notes: "Great atmosphere, live music"
}
```

## Constraints

- Focus on simplicity and user experience
- Use modern React patterns (functional components, hooks)
- Keep code modular and well-documented

## Example Data

- Entry title: "Saturday Milonga at El Ateneo"
- Hobby: "Tango"
- Location: "Buenos Aires"
- Date: "2024-02-10"
- Notes: "Fantastic live orchestra"

---

Use this prompt to guide Copilot for generating code, scaffolding files, and implementing features for a general Hobby Map app using Firebase.
