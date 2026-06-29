import {
	signInWithPopup,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	onAuthStateChanged as firebaseOnAuthStateChanged,
	type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../../../shared/config/firebase";
import type { User } from "../types";
import { nowDate } from "../../../shared/lib/temporal";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
	const createdAt = (() => {
		const creationTime = firebaseUser.metadata.creationTime;
		if (!creationTime) return nowDate();
		const epochMs = Date.parse(creationTime);
		return Number.isNaN(epochMs) ? nowDate() : new Date(epochMs);
	})();

	return {
		id: firebaseUser.uid,
		email: firebaseUser.email || "",
		displayName: firebaseUser.displayName || firebaseUser.email || "User",
		photoURL: firebaseUser.photoURL || undefined,
		createdAt,
	};
}

export const authApi = {
	signInWithGoogle: async (): Promise<User> => {
		const result = await signInWithPopup(auth, googleProvider);
		return mapFirebaseUser(result.user);
	},

	signOut: async (): Promise<void> => {
		await firebaseSignOut(auth);
	},

	onAuthStateChanged: (callback: (user: User | null) => void) => {
		return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				callback(mapFirebaseUser(firebaseUser));
			} else {
				callback(null);
			}
		});
	},
};
