import { Temporal } from "@js-temporal/polyfill";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR } from "../config/calendarConstants";

const DEFAULT_TIME = "00:00";

export function getUserTimeZone(): string {
	return Temporal.Now.timeZoneId();
}

export function dateToZonedDateTime(
	date: Date,
	timeZone = getUserTimeZone(),
): Temporal.ZonedDateTime {
	return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(
		timeZone,
	);
}

export function zonedDateTimeToDate(value: Temporal.ZonedDateTime): Date {
	return new Date(value.epochMilliseconds);
}

export function nowDate(): Date {
	return new Date();
}

export function nowEpochMilliseconds(): number {
	return Date.now();
}

export function toEpochMilliseconds(date: Date): number {
	return date.getTime();
}

export function dateToPlainDate(
	date: Date,
	timeZone = getUserTimeZone(),
): Temporal.PlainDate {
	return dateToZonedDateTime(date, timeZone).toPlainDate();
}

export function formatDateInput(date: Date, timeZone = getUserTimeZone()): string {
	return dateToPlainDate(date, timeZone).toString();
}

export function parsePlainDate(dateStr: string): Temporal.PlainDate | null {
	try {
		return Temporal.PlainDate.from(dateStr);
	} catch {
		return null;
	}
}

export function parsePlainTime(timeStr: string): Temporal.PlainTime | null {
	try {
		return Temporal.PlainTime.from(timeStr);
	} catch {
		return null;
	}
}

export function plainDateToDate(
	plainDate: Temporal.PlainDate,
	timeStr = DEFAULT_TIME,
	timeZone = getUserTimeZone(),
): Date {
	const plainTime = parsePlainTime(timeStr) ?? Temporal.PlainTime.from(DEFAULT_TIME);
	const plainDateTime = plainDate.toPlainDateTime(plainTime);
	return zonedDateTimeToDate(plainDateTime.toZonedDateTime(timeZone));
}

export function combineDateAndTimeToDate(
	dateStr: string,
	timeStr: string,
	timeZone = getUserTimeZone(),
): Date {
	const plainDate = parsePlainDate(dateStr);
	if (!plainDate) return nowDate();
	return plainDateToDate(plainDate, timeStr, timeZone);
}

export function addDays(date: Date, days: number, timeZone = getUserTimeZone()): Date {
	const zonedDateTime = dateToZonedDateTime(date, timeZone).add({ days });
	return zonedDateTimeToDate(zonedDateTime);
}

export function addDuration(
	date: Date,
	duration: Temporal.DurationLike,
	timeZone = getUserTimeZone(),
): Date {
	const zonedDateTime = dateToZonedDateTime(date, timeZone).add(duration);
	return zonedDateTimeToDate(zonedDateTime);
}

export function isSameDay(
	date1: Date,
	date2: Date,
	timeZone = getUserTimeZone(),
): boolean {
	return dateToPlainDate(date1, timeZone).equals(dateToPlainDate(date2, timeZone));
}

export function startOfDay(date: Date, timeZone = getUserTimeZone()): Date {
	const plainDate = dateToPlainDate(date, timeZone);
	return plainDateToDate(plainDate, DEFAULT_TIME, timeZone);
}

export function getDayOfMonth(date: Date): number {
	return dateToZonedDateTime(date).day;
}

export function getMonthIndex(date: Date): number {
	return dateToZonedDateTime(date).month - 1;
}

export function getYear(date: Date): number {
	return dateToZonedDateTime(date).year;
}

export function getWeekdayIndex(date: Date): number {
	return dateToZonedDateTime(date).dayOfWeek % 7;
}

export function getHour(date: Date): number {
	return dateToZonedDateTime(date).hour;
}

export function getMinute(date: Date): number {
	return dateToZonedDateTime(date).minute;
}

export function formatMonthYear(date: Date, locale = "en-US"): string {
	return dateToZonedDateTime(date).toLocaleString(locale, {
		month: "long",
		year: "numeric",
	});
}

export function formatWeekdayShort(date: Date, locale = "en-US"): string {
	return dateToZonedDateTime(date).toLocaleString(locale, { weekday: "short" });
}

export function formatDateWithDay(date: Date, locale = "en-US"): string {
	return dateToZonedDateTime(date).toLocaleString(locale, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

export function createDateFromParts(year: number, monthIndex: number, day: number): Date {
	const plainDate = Temporal.PlainDate.from({
		year,
		month: monthIndex + 1,
		day,
	});
	return plainDateToDate(plainDate);
}

export function isToday(date: Date): boolean {
	return isSameDay(date, nowDate());
}

export function createMonthGrid(year: number, monthIndex: number): Date[][] {
	const firstDayOfMonth = Temporal.PlainDate.from({
		year,
		month: monthIndex + 1,
		day: 1,
	});
	const firstDayWeekday = firstDayOfMonth.dayOfWeek % 7;
	let cursor = firstDayOfMonth.subtract({ days: firstDayWeekday });
	const weeks: Date[][] = [];

	for (let week = 0; week < 6; week++) {
		const weekDays: Date[] = [];
		for (let day = 0; day < 7; day++) {
			weekDays.push(plainDateToDate(cursor));
			cursor = cursor.add({ days: 1 });
		}
		weeks.push(weekDays);
	}

	return weeks;
}

export function createWeekDates(date: Date): Date[] {
	const plainDate = dateToPlainDate(date);
	const dayOfWeek = plainDate.dayOfWeek % 7;
	const startOfWeek = plainDate.subtract({ days: dayOfWeek });
	return Array.from({ length: 7 }, (_, idx) =>
		plainDateToDate(startOfWeek.add({ days: idx })),
	);
}

export function formatDayHeader(date: Date): string {
	return `${getDayOfMonth(date)} ${formatWeekdayShort(date).toUpperCase()}`;
}

export function formatTime(date: Date, locale = "en-US"): string {
	return dateToZonedDateTime(date)
		.toLocaleString(locale, {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.toLowerCase();
}

export function createTimeSlots(): string[] {
	const today = dateToPlainDate(nowDate());
	const slots: string[] = [];
	for (let hour = CALENDAR_START_HOUR; hour <= CALENDAR_END_HOUR; hour++) {
		const date = plainDateToDate(today, `${String(hour).padStart(2, "0")}:00`);
		slots.push(
			dateToZonedDateTime(date)
				.toLocaleString("en-US", {
					hour: "numeric",
					hour12: true,
				})
				.toLowerCase(),
		);
	}
	return slots;
}
