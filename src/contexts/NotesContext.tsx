// src/context/NotesContext.tsx
// NotesContext with Appwrite integration + localStorage fallback
// Improved error handling and defensive checks

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { isAppwriteConfigured } from '@/lib/appwrite';
import * as appwriteNotes from '@/api/appwriteNotes';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  createNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, title: string, content: string) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  getNoteById: (id: string) => Note | undefined;
  searchNotes: (query: string) => Note[];
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const NOTES_KEY = 'ai_notes_data';

// Convert Appwrite note to our Note type (defensive)
function mapAppwriteNote(doc: appwriteNotes.AppwriteNote): Note {
  return {
    id: doc.$id,
    title: doc.title ?? '',
    content: doc.content ?? '',
    createdAt: doc.createdAt ?? new Date().toISOString(),
    updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date().toISOString(),
    userId: doc.userId ?? '',
  };
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // load notes whenever user changes
    if (user) {
      loadNotes();
    } else {
      setNotes([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadNotes = async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (isAppwriteConfigured) {
      try {
        const docs = await appwriteNotes.listNotes(user.id);
        setNotes(docs.map(mapAppwriteNote));
      } catch (err) {
        console.error('Failed to load notes from Appwrite:', err);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // fallback: localStorage
      try {
        const allNotes = localStorage.getItem(NOTES_KEY);
        const parsed: Note[] = allNotes ? JSON.parse(allNotes) : [];
        const userNotes = parsed.filter((n) => n.userId === user.id);
        userNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNotes(userNotes);
      } catch (err) {
        console.error('Failed to load notes from localStorage:', err);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const refreshNotes = async () => {
    await loadNotes();
  };

  // Save notes to localStorage while preserving other users' notes
  const saveNotesToStorage = (newNotes: Note[]) => {
    if (!user) return;
    try {
      const all = localStorage.getItem(NOTES_KEY);
      const parsed: Note[] = all ? JSON.parse(all) : [];
      const otherUserNotes = parsed.filter((n) => n.userId !== user.id);
      localStorage.setItem(NOTES_KEY, JSON.stringify([...otherUserNotes, ...newNotes]));
    } catch (err) {
      console.error('Failed to save notes to storage:', err);
    }
  };

  const createNote = async (title: string, content: string): Promise<Note> => {
    if (!user) throw new Error('Not authenticated');

    if (isAppwriteConfigured) {
      try {
        const doc = await appwriteNotes.createNote({ title, content, userId: user.id });
        const note = mapAppwriteNote(doc);
        setNotes((prev) => [note, ...prev]);
        return note;
      } catch (err) {
        console.error('Failed to create note in Appwrite:', err);
        throw err;
      }
    } else {
      // fallback localStorage
      const newNote: Note = {
        id: crypto.randomUUID(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
      };
      setNotes((prev) => {
        const updated = [newNote, ...prev];
        saveNotesToStorage(updated);
        return updated;
      });
      return newNote;
    }
  };

  const updateNote = async (id: string, title: string, content: string): Promise<Note | null> => {
    if (!user) return null;

    if (isAppwriteConfigured) {
      try {
        const doc = await appwriteNotes.updateNote(id, { title, content });
        const updated = mapAppwriteNote(doc);
        setNotes((prev) => {
          const replaced = prev.map((n) => (n.id === id ? updated : n));
          replaced.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          return replaced;
        });
        return updated;
      } catch (err) {
        console.error('Failed to update note in Appwrite:', err);
        return null;
      }
    } else {
      const idx = notes.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      const updatedNote: Note = {
        ...notes[idx],
        title,
        content,
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => {
        const copy = [...prev];
        copy[idx] = updatedNote;
        copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        saveNotesToStorage(copy);
        return copy;
      });
      return updatedNote;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!user) return false;

    if (isAppwriteConfigured) {
      try {
        await appwriteNotes.deleteNote(id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error('Failed to delete note from Appwrite:', err);
        return false;
      }
    } else {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        saveNotesToStorage(updated);
        return updated;
      });
      return true;
    }
  };

  const getNoteById = (id: string): Note | undefined => notes.find((n) => n.id === id);

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;

    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(Boolean);

    return notes
        .map((note) => {
          const titleLower = (note.title || '').toLowerCase();
          const contentLower = (note.content || '').toLowerCase();

          let score = 0;
          if (titleLower.includes(lowerQuery)) score += 100;
          if (contentLower.includes(lowerQuery)) score += 50;

          for (const word of queryWords) {
            if (titleLower.includes(word)) score += 20;
            if (contentLower.includes(word)) score += 10;
          }

          return { note, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.note);
  };

  return (
      <NotesContext.Provider
          value={{
            notes,
            isLoading,
            createNote,
            updateNote,
            deleteNote,
            getNoteById,
            searchNotes,
            refreshNotes,
          }}
      >
        {children}
      </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
