"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ClienteCuenta } from "@/types";

interface CustomerAuthState {
  customer: ClienteCuenta | null;
  isAuthenticated: boolean;
  login: (customer: ClienteCuenta) => void;
  logout: () => void;
  updateCustomer: (customer: ClienteCuenta) => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      login: (customer) => set({ customer, isAuthenticated: true }),
      logout: () => set({ customer: null, isAuthenticated: false }),
      updateCustomer: (customer) => set({ customer, isAuthenticated: true }),
    }),
    {
      name: "novabite-customer-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
