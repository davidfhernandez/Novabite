"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AdminAuthState {
  isAuthenticated: boolean;
  adminId: string | null;
  email: string | null;
  role: string | null;
  login: (payload: { id: string; email: string; role: string }) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminId: null,
      email: null,
      role: null,
      login: ({ id, email, role }) =>
        set({
          isAuthenticated: true,
          adminId: id,
          email,
          role,
        }),
      logout: () => set({ isAuthenticated: false, adminId: null, email: null, role: null }),
    }),
    {
      name: "novabite-admin-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
