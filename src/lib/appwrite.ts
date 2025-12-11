// src/lib/appwrite.ts
// Appwrite client initialization
// Configure via environment variables in .env.local
//
// Notes:
// - After updating .env.local restart the dev server (npm run dev).
// - If Appwrite is not configured, isAppwriteConfigured === false and calling ensureConfigured() will throw.

import { Client, Account, Databases, ID } from 'appwrite';

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Boolean flag indicating whether Appwrite env vars are set
export const isAppwriteConfigured = Boolean(ENDPOINT && PROJECT_ID && APPWRITE_DB_ID && APPWRITE_COLLECTION_ID);

// Initialize client (safe to create even if not configured)
const client = new Client();

if (isAppwriteConfigured) {
  client.setEndpoint(ENDPOINT as string).setProject(PROJECT_ID as string);
} else {
  // Helpful notice during development
  // (This avoids mysterious errors when someone forgets to set .env.local)
  // Remove or silence in production if desired.
  // eslint-disable-next-line no-console
  console.warn('[Appwrite] endpoint/project/db/collection not configured. Appwrite calls will fail until .env.local is set.');
}

// Services
export const account = new Account(client);
export const databases = new Databases(client);
export const ID_UTIL = ID;

export { client };

/**
 * Helper to throw a clear error if Appwrite is not configured.
 * Use this at the top of appwrite-wrapping functions to give a friendly message.
 */
export function ensureConfigured() {
  if (!isAppwriteConfigured) {
    throw new Error(
        'Appwrite is not configured. Please set VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DB_ID and VITE_APPWRITE_COLLECTION_ID in .env.local and restart the dev server.'
    );
  }
}
