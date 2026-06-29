export interface User {
	id: string;
	email: string;
	displayName: string;
	photoURL?: string;
	createdAt: Date;
}

export interface UserSession {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}
