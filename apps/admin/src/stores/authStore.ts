import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './types'

interface AuthState {
  user: User | null
  token: string | null
  permissions: Set<string>
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      permissions: new Set(),
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, token) => {
        const permissions = new Set(
          user.permissions.map(p => `${p.resource}:${p.action}`)
        )
        set({
          user,
          token,
          permissions,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          permissions: new Set(),
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          const permissions = new Set(
            updatedUser.permissions.map(p => `${p.resource}:${p.action}`)
          )
          set({
            user: updatedUser,
            permissions,
          })
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      hasPermission: (permission) => {
        return get().permissions.has(permission)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)