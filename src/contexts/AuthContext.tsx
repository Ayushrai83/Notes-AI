// src/context/AuthContext.tsx
// AuthContext with Appwrite integration + localStorage fallback
// Uses Appwrite Account SDK when configured, otherwise localStorage mock

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { account, isAppwriteConfigured, ID_UTIL } from '@/lib/appwrite';
import type { Models } from 'appwrite';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys for fallback mode
const USERS_KEY = 'ai_notes_users';
const CURRENT_USER_KEY = 'ai_notes_current_user';

/**
 * Safely extract a message from an unknown error object
 */
function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return 'Unknown error';
  }
}

// Convert Appwrite user to our User type
function mapAppwriteUser(appwriteUser: Models.User<Models.Preferences>): User {
  return {
    id: appwriteUser.$id,
    name: appwriteUser.name || (appwriteUser.email ? appwriteUser.email.split('@')[0] : 'User'),
    email: appwriteUser.email || '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check current authentication status
  const checkAuth = async () => {
    setIsLoading(true);

    if (isAppwriteConfigured) {
      try {
        const appwriteUser = await account.get();
        setUser(mapAppwriteUser(appwriteUser));
      } catch {
        // No active session or failed to fetch
        setUser(null);
      }
    } else {
      // Fallback mode: check localStorage
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }

    setIsLoading(false);
  };

  // LocalStorage helpers for fallback mode
  const getUsers = (): Array<User & { password: string }> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: Array<User & { password: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isAppwriteConfigured) {
      // Appwrite login
      try {
        // createEmailSession is the Appwrite method to create an email/password session
        // (some SDK versions call it createEmailSession)
        // If your SDK exposes createEmailPasswordSession, you can switch accordingly.
        // Here we try the common createEmailSession name.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof account.createEmailSession === 'function') {
          // @ts-ignore
          await account.createEmailSession(email, password);
        } else if (typeof (account as any).createEmailPasswordSession === 'function') {
          // fallback for other SDK naming
          // @ts-ignore
          await (account as any).createEmailPasswordSession(email, password);
        } else {
          throw new Error('Appwrite account session method not available. Check SDK version.');
        }

        const appwriteUser = await account.get();
        setUser(mapAppwriteUser(appwriteUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        return { success: false, error: getErrorMessage(err) };
      }
    } else {
      // Fallback: localStorage mock
      await new Promise((resolve) => setTimeout(resolve, 400));

      const users = getUsers();
      const foundUser = users.find((u) => u.email === email && u.password === password);

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isAppwriteConfigured) {
      try {
        // create user (server will store hashed password). Use ID_UTIL.unique() for id.
        // Note: Appwrite SDK versions differ in names; create(...) is typical.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof account.create === 'function') {
          // @ts-ignore
          await account.create(ID_UTIL.unique(), email, password, name);
        } else {
          throw new Error('Appwrite account create method not available. Check SDK version.');
        }

        // Auto-login after signup
        // try the standard createEmailSession; fallback to alternative name if needed
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof account.createEmailSession === 'function') {
          // @ts-ignore
          await account.createEmailSession(email, password);
        } else if (typeof (account as any).createEmailPasswordSession === 'function') {
          // @ts-ignore
          await (account as any).createEmailPasswordSession(email, password);
        } else {
          // if session creation not available, continue (account.get() may still work if session exists)
        }

        const appwriteUser = await account.get();
        setUser(mapAppwriteUser(appwriteUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        return { success: false, error: getErrorMessage(err) };
      }
    } else {
      // Fallback: localStorage mock
      await new Promise((resolve) => setTimeout(resolve, 400));

      const users = getUsers();

      if (users.find((u) => u.email === email)) {
        setIsLoading(false);
        return { success: false, error: 'Email already exists' };
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
      };

      saveUsers([...users, newUser]);

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isAppwriteConfigured) {
      try {
        // delete current session
        await account.deleteSession('current');
      } catch {
        // ignore if session already gone
      }
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    setUser(null);
    setIsLoading(false);
  };

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
