import { create } from 'zustand';

interface Organisation {
  id: string;
  nom: string;
  sigle?: string;
  logo?: string;
  devise?: string;
  [key: string]: unknown;
}

interface AppStore {
  organisationId: string | null;
  organisation: Organisation | null;
  setOrganisation: (org: Organisation) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  organisationId: null,
  organisation: null,
  setOrganisation: (org) =>
    set({ organisation: org, organisationId: org.id }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
