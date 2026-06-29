import {
	combineDateAndTimeToDate,
	formatDateInput,
	nowDate,
	plainDateToDate,
	parsePlainDate,
} from "./temporal";

export function parseDateInputOrNow(dateStr: string): Date {
	const plainDate = dateStr ? parsePlainDate(dateStr) : null;
	if (!plainDate) return nowDate();
	return plainDateToDate(plainDate);
}

export function formatDateDisplay(dateStr: string): string {
	if (!dateStr) return "";
	const date = parseDateInputOrNow(dateStr);
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

export function formatDateForInput(date: Date): string {
	return formatDateInput(date);
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
	return combineDateAndTimeToDate(dateStr, timeStr);
}
