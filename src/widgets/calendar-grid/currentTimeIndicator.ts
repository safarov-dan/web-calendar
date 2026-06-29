import { Temporal } from "@js-temporal/polyfill";
import {
	CALENDAR_END_HOUR,
	CALENDAR_START_HOUR,
	HOUR_SLOT_HEIGHT_PX,
} from "../../shared/config/calendarConstants";

export function calculateCurrentTimePosition(): number {
	const now = Temporal.Now.zonedDateTimeISO();
	const hoursFromStart = now.hour - CALENDAR_START_HOUR + now.minute / 60;
	return hoursFromStart * HOUR_SLOT_HEIGHT_PX;
}

export function isCurrentTimeVisible(): boolean {
	const currentHour = Temporal.Now.zonedDateTimeISO().hour;
	return currentHour >= CALENDAR_START_HOUR && currentHour <= CALENDAR_END_HOUR;
}
