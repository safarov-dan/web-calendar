import type { CalendarEvent, RecurrenceRule } from "../../entities/event";
import { Temporal } from "@js-temporal/polyfill";
import {
	DAYS_PER_WEEK,
	JANUARY_MONTH_INDEX,
	MAX_DAY_OF_MONTH,
	MILLISECONDS_PER_SECOND,
	MINUTES_PER_HOUR,
	MONTHS_PER_YEAR,
	REFERENCE_SUNDAY_DAY_OF_MONTH,
	REFERENCE_YEAR,
	SECONDS_PER_MINUTE,
	HOURS_PER_DAY,
	MIN_DAY_OF_MONTH,
} from "../config/calendarConstants";
import {
	addDays,
	addDuration,
	dateToPlainDate,
	dateToZonedDateTime,
	getDayOfMonth,
	getMonthIndex,
	getUserTimeZone,
	getWeekdayIndex,
	getYear,
	startOfDay,
	toEpochMilliseconds,
	zonedDateTimeToDate,
} from "./temporal";

const DAY_MS =
	HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

export function expandEventsForRange(
	events: CalendarEvent[],
	rangeStart: Date,
	rangeEnd: Date,
): CalendarEvent[] {
	const expanded: CalendarEvent[] = [];

	for (const event of events) {
		const recurrence = getNormalizedRecurrence(event);
		if (recurrence.type === "none") {
			if (intersectsRange(event.startDate, event.endDate, rangeStart, rangeEnd)) {
				expanded.push(event);
			}
			continue;
		}

		expanded.push(
			...generateRecurringOccurrences(event, recurrence, rangeStart, rangeEnd),
		);
	}

	return expanded;
}

export function getNormalizedRecurrence(event: CalendarEvent): RecurrenceRule {
	if (event.recurrence) {
		return {
			type: event.recurrence.type ?? "none",
			interval: event.recurrence.interval ?? 1,
			weekday: event.recurrence.weekday,
			monthDay: event.recurrence.monthDay,
			month: event.recurrence.month,
		};
	}

	return fromLegacyRepeat(event.repeat);
}

export function formatRepeatSummary(recurrence: RecurrenceRule, startDate: Date): string {
	switch (recurrence.type) {
		case "daily":
			return "Daily";
		case "weekly": {
			const weekdayIndex = recurrence.weekday ?? getWeekdayIndex(startDate);
			const weekday = getWeekdayName(weekdayIndex);
			return `Weekly on ${weekday}`;
		}
		case "monthly":
			return "Monthly";
		case "yearly": {
			const month = recurrence.month ?? getMonthIndex(startDate);
			const day = recurrence.monthDay ?? getDayOfMonth(startDate);
			const monthDay = formatMonthDay(month, day);
			return `Annually on ${monthDay}`;
		}
		default:
			return "Does not repeat";
	}
}

function generateRecurringOccurrences(
	event: CalendarEvent,
	recurrence: RecurrenceRule,
	rangeStart: Date,
	rangeEnd: Date,
): CalendarEvent[] {
	const occurrences: CalendarEvent[] = [];
	const baseStart = event.startDate;
	const baseEnd = event.endDate;
	const durationMs = Math.max(baseEnd.getTime() - baseStart.getTime(), 0);

	let cursor = startOfDay(addDays(rangeStart, -1));
	const endCursor = startOfDay(rangeEnd);

	while (toEpochMilliseconds(cursor) <= toEpochMilliseconds(endCursor)) {
		if (matchesRecurrenceOnDate(cursor, baseStart, recurrence)) {
			const occurrenceStart = applyTimeToDate(cursor, baseStart);
			if (toEpochMilliseconds(occurrenceStart) >= toEpochMilliseconds(baseStart)) {
				const occurrenceEnd =
					durationMs > 0
						? addDuration(occurrenceStart, { milliseconds: durationMs })
						: occurrenceStart;
				if (intersectsRange(occurrenceStart, occurrenceEnd, rangeStart, rangeEnd)) {
					occurrences.push({
						...event,
						id: buildOccurrenceId(event.id, occurrenceStart),
						sourceEventId: event.id,
						startDate: occurrenceStart,
						endDate: occurrenceEnd,
					});
				}
			}
		}

		cursor = addDays(cursor, 1);
	}

	return occurrences;
}

function matchesRecurrenceOnDate(
	date: Date,
	baseStart: Date,
	recurrence: RecurrenceRule,
): boolean {
	const interval = Math.max(recurrence.interval ?? 1, 1);
	const diffDays = Math.floor(
		(toEpochMilliseconds(startOfDay(date)) - toEpochMilliseconds(startOfDay(baseStart))) /
			DAY_MS,
	);
	if (diffDays < 0) return false;

	switch (recurrence.type) {
		case "daily":
			return diffDays % interval === 0;
		case "weekly": {
			const targetWeekday = recurrence.weekday ?? getWeekdayIndex(baseStart);
			if (getWeekdayIndex(date) !== targetWeekday) return false;
			const diffWeeks = Math.floor(diffDays / DAYS_PER_WEEK);
			return diffWeeks % interval === 0;
		}
		case "monthly": {
			const targetDay = recurrence.monthDay ?? getDayOfMonth(baseStart);
			if (getDayOfMonth(date) !== targetDay) return false;
			const monthsDiff =
				(getYear(date) - getYear(baseStart)) * MONTHS_PER_YEAR +
				(getMonthIndex(date) - getMonthIndex(baseStart));
			return monthsDiff >= 0 && monthsDiff % interval === 0;
		}
		case "yearly": {
			const targetMonth = recurrence.month ?? getMonthIndex(baseStart);
			const targetDay = recurrence.monthDay ?? getDayOfMonth(baseStart);
			if (getMonthIndex(date) !== targetMonth || getDayOfMonth(date) !== targetDay)
				return false;
			const yearsDiff = getYear(date) - getYear(baseStart);
			return yearsDiff >= 0 && yearsDiff % interval === 0;
		}
		default:
			return false;
	}
}

function fromLegacyRepeat(repeat: string | undefined): RecurrenceRule {
	if (!repeat || repeat === "Does not repeat") {
		return { type: "none", interval: 1 };
	}

	if (repeat === "Daily") return { type: "daily", interval: 1 };
	if (repeat === "Monthly") return { type: "monthly", interval: 1 };
	if (repeat === "Weekly" || repeat.startsWith("Weekly on "))
		return { type: "weekly", interval: 1 };
	if (repeat === "Annually" || repeat.startsWith("Annually on "))
		return { type: "yearly", interval: 1 };

	return { type: "none", interval: 1 };
}

function intersectsRange(
	eventStart: Date,
	eventEnd: Date,
	rangeStart: Date,
	rangeEnd: Date,
): boolean {
	return (
		toEpochMilliseconds(eventStart) <= toEpochMilliseconds(rangeEnd) &&
		toEpochMilliseconds(eventEnd) >= toEpochMilliseconds(rangeStart)
	);
}

function applyTimeToDate(targetDate: Date, sourceDate: Date): Date {
	const timeZone = getUserTimeZone();
	const targetPlainDate = dateToPlainDate(targetDate, timeZone);
	const sourceZonedDateTime = dateToZonedDateTime(sourceDate, timeZone);
	const plainDateTime = targetPlainDate.toPlainDateTime(
		Temporal.PlainTime.from({
			hour: sourceZonedDateTime.hour,
			minute: sourceZonedDateTime.minute,
			second: sourceZonedDateTime.second,
			millisecond: sourceZonedDateTime.millisecond,
		}),
	);
	return zonedDateTimeToDate(plainDateTime.toZonedDateTime(timeZone));
}

function buildOccurrenceId(eventId: string, occurrenceStart: Date): string {
	return `${eventId}__${toEpochMilliseconds(occurrenceStart)}`;
}

function getWeekdayName(weekday: number): string {
	const normalizedWeekday = ((weekday % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
	const date = Temporal.PlainDate.from({
		year: REFERENCE_YEAR,
		month: JANUARY_MONTH_INDEX + 1,
		day: REFERENCE_SUNDAY_DAY_OF_MONTH + normalizedWeekday,
	});
	return date.toLocaleString("en-US", { weekday: "long" });
}

function formatMonthDay(month: number, day: number): string {
	const date = Temporal.PlainDate.from({
		year: REFERENCE_YEAR,
		month: month + 1,
		day: Math.min(Math.max(day, MIN_DAY_OF_MONTH), MAX_DAY_OF_MONTH),
	});
	return date.toLocaleString("en-US", {
		month: "long",
		day: "numeric",
	});
}
