import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // 初期化時に Firebase の認証状態を監視
  void onAuthStateChanged(auth, (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  });

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    signOut: async () => {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
  };
});
