# Sahyog

A resource-sharing platform for institutional equipment, spaces and technical facilities.

Website: https://sahyog-resource-sharing.vercel.app/

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm start
```

Open http://localhost:5173.

## Build and test

```sh
npm test
npm run build
```

The production frontend is written to `dist/`. The archive includes source files, backend functions, database setup, tests, assets and the production build.

## Backend

The frontend is configured for the existing Sahyog Supabase project through `js/config.js`. This contains only the public client key. Server credentials are not included.

See SETUP.md for backend setup, account roles, deployment and operational limits. Do not run the initial database setup again against the existing project.

## Hosting

Vercel uses `npm run build` and serves `dist/`. Supabase handles authentication, application records and private evidence photos. When changing the frontend domain, update the authentication Site URL and allowed redirects in Supabase.
