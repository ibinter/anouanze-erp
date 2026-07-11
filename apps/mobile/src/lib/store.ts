import { create } from 'zustand';

export interface User {
  id: string;
  nom: string;
  email: string;
  organisation?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

interface SyncState {
  pendingSync: boolean;
  lastSync: Date | null;
  setSynced: () => void;
  setPending: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingSync: false,
  lastSync: null,
  setSynced: () => set({ pendingSync: false, lastSync: new Date() }),
  setPending: () => set({ pendingSync: true }),
}));
