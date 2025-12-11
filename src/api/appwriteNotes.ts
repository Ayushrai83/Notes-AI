// src/api/appwriteNotes.ts
// Appwrite Notes API wrapper (TypeScript)
// - Do NOT send client-side createdAt/updatedAt attributes unless they exist in collection schema
// - Use Appwrite system fields $createdAt / $updatedAt for ordering/timestamps

import { Query } from 'appwrite';
import {
  databases,
  APPWRITE_DB_ID,
  APPWRITE_COLLECTION_ID,
  ID_UTIL,
  isAppwriteConfigured
} from '@/lib/appwrite';

export interface AppwriteNote {
  $id: string;
  title: string;
  content: string;
  userId: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// List notes for current user with optional pagination
export async function listNotes(userId: string, limit = 100, offset = 0): Promise<AppwriteNote[]> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite not configured');
  }

  try {
    const response = await databases.listDocuments(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          // use Appwrite system timestamp field
          Query.orderDesc('$updatedAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
    );

    return (response.documents as unknown) as AppwriteNote[];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message || 'Failed to list notes');
  }
}

// Get single note by ID
export async function getNote(id: string): Promise<AppwriteNote> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite not configured');
  }

  try {
    const doc = await databases.getDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, id);
    return (doc as unknown) as AppwriteNote;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message || 'Failed to fetch note');
  }
}

// Create new note
// NOTE: Do not send createdAt/updatedAt attributes unless these columns exist in the collection.
// Appwrite will populate system fields $createdAt and $updatedAt automatically.
export async function createNote(data: { title: string; content: string; userId: string }): Promise<AppwriteNote> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite not configured');
  }

  try {
    // createDocument without custom timestamps
    const doc = await databases.createDocument(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        ID_UTIL.unique(),
        {
          title: data.title,
          content: data.content,
          userId: data.userId,
        }
    );

    return doc as unknown as AppwriteNote;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message || 'Failed to create note');
  }
}

// Update existing note
// Do not attempt to set $updatedAt manually; Appwrite will update the system field automatically.
export async function updateNote(id: string, data: { title: string; content: string }): Promise<AppwriteNote> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite not configured');
  }

  try {
    const doc = await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        id,
        {
          title: data.title,
          content: data.content,
        }
    );

    return doc as unknown as AppwriteNote;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message || 'Failed to update note');
  }
}

// Delete note
export async function deleteNote(id: string): Promise<void> {
  if (!isAppwriteConfigured) {
    throw new Error('Appwrite not configured');
  }

  try {
    await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message || 'Failed to delete note');
  }
}

// Search notes - Client-side fallback (default)
export async function searchNotes(userId: string, term: string): Promise<AppwriteNote[]> {
  if (!term || !term.trim()) {
    return listNotes(userId);
  }

  const allNotes = await listNotes(userId);
  const lowerTerm = term.toLowerCase();

  return allNotes.filter(
      (note) =>
          (note.title || '').toLowerCase().includes(lowerTerm) ||
          (note.content || '').toLowerCase().includes(lowerTerm)
  );
}
