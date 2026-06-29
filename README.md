# Web Calendar App

This project is built with React 19, Vite, and TypeScript.

## Setup

1. Install dependencies for the app:

```bash
npm --prefix web-calendar install
```

2. Create environment variables file:
   - Copy `web-calendar/.env.example` to `web-calendar/.env`
   - Replace example values with your Firebase project values

Required env vars:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Local development

To start a local development server, run:

```bash
npm --prefix web-calendar run dev
```

## Unit tests

To run tests, use:

```bash
npm --prefix web-calendar run test
```

## Build

Production build:

```bash
npm --prefix web-calendar run build
```

Hosting build (used in Firebase predeploy):

```bash
npm --prefix web-calendar run build:hosting
```

## Firebase Hosting deployment

This repository is configured to deploy from `Task_3_9` with:
- `firebase.json` public dir: `web-calendar/dist`
- predeploy script: `npm --prefix web-calendar run build:hosting`

Manual deploy:

```bash
firebase deploy --only hosting --project web-calendar-c8167
```

Live URL:
- https://web-calendar-c8167.web.app

## Description

The application is a web calendar with Firebase authentication and cloud data storage.  
It uses Firestore for calendars/events data, React Query for server state, Zustand for UI/app state, and Tailwind CSS for styling.

## Key features

- Google sign-in via Firebase Auth
- Calendar and event CRUD operations
- Day and week views
- Recurring events support
- Optimistic UI updates with React Query
- Firestore offline cache support
- Deployable to Firebase Hosting

