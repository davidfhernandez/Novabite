"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ADMIN_CREDENTIALS } from "@/lib/constants";

interface AdminAuthState {
  isAuthenticated: boolean;
  role: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      login: (email, password) => {
        const ok =
          email === ADMIN_CREDENTIALS.email &&
          password === ADMIN_CREDENTIALS.password;

        if (ok) {
          set({ isAuthenticated: true, role: ADMIN_CREDENTIALS.role });
        }

        return ok;
      },
      logout: () => set({ isAuthenticated: false, role: null }),
    }),
    {
      name: "novabite-admin-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
