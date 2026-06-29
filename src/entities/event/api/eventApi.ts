import {
	collection,
	doc,
	getDocs,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	serverTimestamp,
	Timestamp,
	where,
} from "firebase/firestore";
import { db } from "../../../shared/config/firebase";
import type {
	CalendarEvent,
	CreateEventRequest,
	RecurrenceRule,
	UpdateEventRequest,
} from "../types";
import {
	getDayOfMonth,
	getMonthIndex,
	getWeekdayIndex,
} from "../../../shared/lib/temporal";

interface FirestoreEvent {
	calendarId: string;
	title: string;
	description?: string;
	repeat?: string;
	recurrence?: RecurrenceRule;
	hasRecurrence?: boolean;
	startDate: Timestamp;
	endDate: Timestamp;
	isAllDay: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

function toFirestoreTimestamp(value: Date): Timestamp {
	return Timestamp.fromDate(value);
}

function fromFirestoreTimestamp(value: Timestamp): Date {
	return value.toDate();
}

function sanitizeRecurrence(
	recurrence: RecurrenceRule,
	startDate?: Date,
): RecurrenceRule {
	const cleaned: RecurrenceRule = {
		type: recurrence.type ?? "none",
		interval: recurrence.interval ?? 1,
	};

	if (cleaned.type === "weekly") {
		const weekday =
			recurrence.weekday ?? (startDate ? getWeekdayIndex(startDate) : undefined);
		if (weekday !== undefined) cleaned.weekday = weekday;
	}

	if (cleaned.type === "monthly") {
		const monthDay =
			recurrence.monthDay ?? (startDate ? getDayOfMonth(startDate) : undefined);
		if (monthDay !== undefined) cleaned.monthDay = monthDay;
	}

	if (cleaned.type === "yearly") {
		const month = recurrence.month ?? (startDate ? getMonthIndex(startDate) : undefined);
		const monthDay =
			recurrence.monthDay ?? (startDate ? getDayOfMonth(startDate) : undefined);
		if (month !== undefined) cleaned.month = month;
		if (monthDay !== undefined) cleaned.monthDay = monthDay;
	}

	return cleaned;
}

function hasRecurrenceValue(recurrence?: RecurrenceRule, repeat?: string): boolean {
	const recurrenceType = recurrence?.type;
	if (recurrenceType && recurrenceType !== "none") {
		return true;
	}

	return !!repeat && repeat !== "Does not repeat";
}

function mapFirestoreToEvent(id: string, data: FirestoreEvent): CalendarEvent {
	return {
		id,
		calendarId: data.calendarId,
		title: data.title,
		description: data.description,
		repeat: data.repeat,
		recurrence: data.recurrence,
		startDate: fromFirestoreTimestamp(data.startDate),
		endDate: fromFirestoreTimestamp(data.endDate),
		isAllDay: data.isAllDay,
		createdAt: fromFirestoreTimestamp(data.createdAt),
		updatedAt: fromFirestoreTimestamp(data.updatedAt),
	};
}

function shouldIncludeEventInRange(
	event: CalendarEvent,
	startDate: Date,
	endDate: Date,
): boolean {
	const hasRecurrence =
		(event.recurrence && event.recurrence.type !== "none") ||
		(!!event.repeat && event.repeat !== "Does not repeat");
	if (hasRecurrence) return true;
	return event.startDate <= endDate && event.endDate >= startDate;
}

export const eventApi = {
	async getEvents(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<CalendarEvent[]> {
		const eventsRef = collection(db, "users", userId, "events");
		const rangeEndTimestamp = toFirestoreTimestamp(endDate);

		const nonRecurringQuery = query(
			eventsRef,
			where("hasRecurrence", "==", false),
			where("startDate", "<=", rangeEndTimestamp),
		);
		const recurringQuery = query(
			eventsRef,
			where("hasRecurrence", "==", true),
			where("startDate", "<=", rangeEndTimestamp),
		);

		const [nonRecurringSnapshot, recurringSnapshot] = await Promise.all([
			getDocs(nonRecurringQuery),
			getDocs(recurringQuery),
		]);

		const eventMap = new Map<string, CalendarEvent>();
		[...nonRecurringSnapshot.docs, ...recurringSnapshot.docs].forEach((docSnap) => {
			eventMap.set(
				docSnap.id,
				mapFirestoreToEvent(docSnap.id, docSnap.data() as FirestoreEvent),
			);
		});
		const filteredEvents = Array.from(eventMap.values()).filter((event) =>
			shouldIncludeEventInRange(event, startDate, endDate),
		);
		return filteredEvents;
	},

	async createEvent(userId: string, data: CreateEventRequest): Promise<CalendarEvent> {
		const eventsRef = collection(db, "users", userId, "events");
		const now = serverTimestamp();

		const payload: Record<string, unknown> = {
			calendarId: data.calendarId,
			title: data.title,
			hasRecurrence: hasRecurrenceValue(data.recurrence, data.repeat),
			startDate: toFirestoreTimestamp(data.startDate),
			endDate: toFirestoreTimestamp(data.endDate),
			isAllDay: data.isAllDay,
			createdAt: now,
			updatedAt: now,
		};

		if (data.description !== undefined) {
			payload.description = data.description;
		}
		if (data.repeat !== undefined) {
			payload.repeat = data.repeat;
		}
		if (data.recurrence !== undefined) {
			payload.recurrence = sanitizeRecurrence(data.recurrence, data.startDate);
		}

		const docRef = await addDoc(eventsRef, payload);

		const docSnap = await getDoc(docRef);
		return mapFirestoreToEvent(docRef.id, docSnap.data() as FirestoreEvent);
	},

	async updateEvent(
		userId: string,
		eventId: string,
		updates: UpdateEventRequest,
	): Promise<void> {
		const eventRef = doc(db, "users", userId, "events", eventId);
		const existingSnap = await getDoc(eventRef);
		const existingData = existingSnap.data() as FirestoreEvent | undefined;

		const firestoreUpdates: Record<string, unknown> = {
			updatedAt: serverTimestamp(),
		};

		if (updates.calendarId !== undefined)
			firestoreUpdates.calendarId = updates.calendarId;
		if (updates.title !== undefined) firestoreUpdates.title = updates.title;
		if (updates.description !== undefined)
			firestoreUpdates.description = updates.description;
		if (updates.repeat !== undefined) firestoreUpdates.repeat = updates.repeat;
		if (updates.recurrence !== undefined) {
			firestoreUpdates.recurrence = sanitizeRecurrence(
				updates.recurrence,
				updates.startDate,
			);
		}
		const mergedRecurrence =
			updates.recurrence !== undefined ? updates.recurrence : existingData?.recurrence;
		const mergedRepeat =
			updates.repeat !== undefined ? updates.repeat : existingData?.repeat;
		firestoreUpdates.hasRecurrence = hasRecurrenceValue(mergedRecurrence, mergedRepeat);
		if (updates.startDate !== undefined)
			firestoreUpdates.startDate = toFirestoreTimestamp(updates.startDate);
		if (updates.endDate !== undefined)
			firestoreUpdates.endDate = toFirestoreTimestamp(updates.endDate);
		if (updates.isAllDay !== undefined) firestoreUpdates.isAllDay = updates.isAllDay;

		await updateDoc(eventRef, firestoreUpdates);
	},

	async deleteEvent(userId: string, eventId: string): Promise<void> {
		const eventRef = doc(db, "users", userId, "events", eventId);
		await deleteDoc(eventRef);
	},
};
