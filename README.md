# movie-kh-admin

Admin portal scaffold for managing Movie KH streaming content, taxonomy, TV schedule, and site configuration.

## Features

- Playlist management with nested episode/video editor
- Category, type, and genre administration
- TV schedule management
- Website, social, and about-us configuration forms
- Firebase-ready configuration via Vite environment variables
- Seeded local demo data for immediate UI testing

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies:

   `npm install`

3. Start the dev server:

   `npm run dev`

4. Build for production:

   `npm run build`

## Project Structure

- `src/App.tsx` — main admin portal layout and CRUD UI
- `src/data.ts` — seeded mock data matching the requested schema
- `src/types.ts` — TypeScript models for playlists, schedule, taxonomy, and site config
- `src/firebase.ts` — Firebase initialization using Vite env values

## Notes

This version stores edits in local component state. Firebase credentials are already wired in `src/firebase.ts`, so the next step can be connecting save/load actions to Realtime Database paths for production persistence.
