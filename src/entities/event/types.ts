export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface RecurrenceRule {
	type: RecurrenceType;
	interval?: number;
	weekday?: number;
	monthDay?: number;
	month?: number;
}

export interface CalendarEvent {
	id: string;
	sourceEventId?: string;
	calendarId: string;
	title: string;
	description?: string;
	repeat?: string;
	recurrence?: RecurrenceRule;
	startDate: Date;
	endDate: Date;
	isAllDay: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateEventRequest {
	calendarId: string;
	title: string;
	description?: string;
	repeat?: string;
	recurrence?: RecurrenceRule;
	startDate: Date;
	endDate: Date;
	isAllDay: boolean;
}

export interface UpdateEventRequest {
	calendarId?: string;
	title?: string;
	description?: string;
	repeat?: string;
	recurrence?: RecurrenceRule;
	startDate?: Date;
	endDate?: Date;
	isAllDay?: boolean;
}

export type UpdateEventInput = { id: string } & UpdateEventRequest;
