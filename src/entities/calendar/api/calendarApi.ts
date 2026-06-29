import {
	collection,
	doc,
	getDocs,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	Timestamp,
} from "firebase/firestore";
import { db } from "../../../shared/config/firebase";
import type { Calendar, CreateCalendarRequest, UpdateCalendarRequest } from "../types";

interface FirestoreCalendar {
	name: string;
	color: string;
	isVisible: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

function fromFirestoreTimestamp(value: Timestamp): Date {
	return value.toDate();
}

function mapFirestoreToCalendar(
	id: string,
	userId: string,
	data: FirestoreCalendar,
): Calendar {
	return {
		id,
		userId,
		name: data.name,
		color: data.color,
		isVisible: data.isVisible,
		createdAt: fromFirestoreTimestamp(data.createdAt),
		updatedAt: fromFirestoreTimestamp(data.updatedAt),
	};
}

export const calendarApi = {
	async getAll(userId: string): Promise<Calendar[]> {
		const calendarsRef = collection(db, "users", userId, "calendars");
		const snapshot = await getDocs(calendarsRef);

		return snapshot.docs.map((doc) =>
			mapFirestoreToCalendar(doc.id, userId, doc.data() as FirestoreCalendar),
		);
	},

	async create(userId: string, data: CreateCalendarRequest): Promise<Calendar> {
		const calendarsRef = collection(db, "users", userId, "calendars");
		const now = serverTimestamp();

		const docRef = await addDoc(calendarsRef, {
			name: data.name,
			color: data.color,
			isVisible: true,
			createdAt: now,
			updatedAt: now,
		});

		const docSnap = await getDoc(docRef);
		return mapFirestoreToCalendar(docRef.id, userId, docSnap.data() as FirestoreCalendar);
	},

	async update(
		userId: string,
		calendarId: string,
		updates: UpdateCalendarRequest,
	): Promise<void> {
		const calendarRef = doc(db, "users", userId, "calendars", calendarId);

		await updateDoc(calendarRef, {
			...updates,
			updatedAt: serverTimestamp(),
		});
	},

	async delete(userId: string, calendarId: string): Promise<void> {
		const calendarRef = doc(db, "users", userId, "calendars", calendarId);
		await deleteDoc(calendarRef);
	},
};
