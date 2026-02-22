import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type AuthPreference = 'magic' | 'password'

interface AuthPreferenceState {
  lastAuthPreference: AuthPreference
  setLastAuthPreference: (pref: AuthPreference) => void
  resetPreference: () => void
}

const defaultPreference: AuthPreference = 'magic'

export const useAuthPreferenceStore = create<AuthPreferenceState>()(
  persist(
    (set) => ({
      lastAuthPreference: defaultPreference,
      setLastAuthPreference: (pref) => set({ lastAuthPreference: pref }),
      resetPreference: () => set({ lastAuthPreference: defaultPreference }),
    }),
    {
      name: "auth-preference-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        // Coerce legacy 'signup' to 'magic'
        const state = persistedState as (AuthPreferenceState & { lastAuthPreference: string }) | null
        if (state && (state.lastAuthPreference as string) === 'signup') {
          return { ...state, lastAuthPreference: 'magic' }
        }
        return state as AuthPreferenceState
      }
    }
  )
)
