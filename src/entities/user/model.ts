import { create } from "zustand";
import type { User, UserSession } from "./types";
import { authApi } from "./api/authApi";

interface UserState extends UserSession {
	setUser: (user: User | null) => void;
	setLoading: (isLoading: boolean) => void;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	initializeAuth: () => () => void;
}

export const useUserStore = create<UserState>((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,

	setUser: (user) =>
		set({
			user,
			isAuthenticated: !!user,
			isLoading: false,
		}),

	setLoading: (isLoading) => set({ isLoading }),

	signInWithGoogle: async () => {
		try {
			const user = await authApi.signInWithGoogle();
			set({
				user,
				isAuthenticated: true,
				isLoading: false,
			});
		} catch (error) {
			set({ isLoading: false });
			throw error;
		}
	},

	signOut: async () => {
		try {
			await authApi.signOut();
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			});
		} catch (error) {
			throw error;
		}
	},

	initializeAuth: () => {
		const unsubscribe = authApi.onAuthStateChanged((user) => {
			set({
				user,
				isAuthenticated: !!user,
				isLoading: false,
			});
		});
		return unsubscribe;
	},
}));
