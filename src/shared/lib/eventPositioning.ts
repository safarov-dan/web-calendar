import type { CalendarEvent } from "../../entities/event";
import {
	CALENDAR_END_HOUR,
	CALENDAR_START_HOUR,
	HOUR_SLOT_HEIGHT_PX,
	HOURS_PER_DAY,
} from "../config/calendarConstants";
import { dateToZonedDateTime, isSameDay, toEpochMilliseconds } from "./temporal";

export interface EventPosition {
	top: number;
	height: number;
	left: string;
	width: string;
	zIndex: number;
}

function calculateTopPosition(startDate: Date, isAllDay: boolean): number {
	if (isAllDay) return 0;
	const localDateTime = dateToZonedDateTime(startDate);
	const hours = localDateTime.hour;
	const minutes = localDateTime.minute;
	const hoursFromStart = hours - CALENDAR_START_HOUR + minutes / 60;
	return Math.max(hoursFromStart * HOUR_SLOT_HEIGHT_PX, 0);
}

function calculateHeight(startDate: Date, endDate: Date, isAllDay: boolean): number {
	if (isAllDay) {
		return (HOURS_PER_DAY - CALENDAR_START_HOUR) * HOUR_SLOT_HEIGHT_PX;
	}
	const durationMs = toEpochMilliseconds(endDate) - toEpochMilliseconds(startDate);
	const durationHours = durationMs / (1000 * 60 * 60);
	return Math.max(durationHours * HOUR_SLOT_HEIGHT_PX, HOUR_SLOT_HEIGHT_PX / 4);
}

function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
	return event1.startDate < event2.endDate && event1.endDate > event2.startDate;
}

interface EventGroup {
	events: CalendarEvent[];
	columns: CalendarEvent[][];
}

function groupOverlappingEvents(events: CalendarEvent[]): EventGroup[] {
	if (events.length === 0) return [];

	const sortedEvents = [...events].sort(
		(a, b) => toEpochMilliseconds(a.startDate) - toEpochMilliseconds(b.startDate),
	);

	const groups: EventGroup[] = [];
	let currentGroup: CalendarEvent[] = [sortedEvents[0]];

	for (let i = 1; i < sortedEvents.length; i++) {
		const event = sortedEvents[i];
		const overlapsWithGroup = currentGroup.some((groupEvent) =>
			eventsOverlap(event, groupEvent),
		);

		if (overlapsWithGroup) {
			currentGroup.push(event);
		} else {
			groups.push({
				events: currentGroup,
				columns: arrangeEventsInColumns(currentGroup),
			});
			currentGroup = [event];
		}
	}

	groups.push({
		events: currentGroup,
		columns: arrangeEventsInColumns(currentGroup),
	});

	return groups;
}

function arrangeEventsInColumns(events: CalendarEvent[]): CalendarEvent[][] {
	if (events.length === 0) return [];

	const columns: CalendarEvent[][] = [];

	events.forEach((event) => {
		let placed = false;

		for (const column of columns) {
			const overlaps = column.some((columnEvent) => eventsOverlap(event, columnEvent));

			if (!overlaps) {
				column.push(event);
				placed = true;
				break;
			}
		}

		if (!placed) {
			columns.push([event]);
		}
	});

	return columns;
}

export function calculateEventPosition(
	event: CalendarEvent,
	dayEvents: CalendarEvent[],
): EventPosition {
	const top = calculateTopPosition(event.startDate, event.isAllDay);
	const height = calculateHeight(event.startDate, event.endDate, event.isAllDay);

	const sameDayEvents = dayEvents.filter((e) => isSameDay(e.startDate, event.startDate));

	const groups = groupOverlappingEvents(sameDayEvents);

	const eventGroup = groups.find((group) => group.events.some((e) => e.id === event.id));

	if (!eventGroup) {
		return {
			top,
			height,
			left: "0%",
			width: "100%",
			zIndex: 1,
		};
	}

	const columnCount = eventGroup.columns.length;
	let columnIndex = 0;

	for (let i = 0; i < eventGroup.columns.length; i++) {
		if (eventGroup.columns[i].some((e) => e.id === event.id)) {
			columnIndex = i;
			break;
		}
	}

	const widthPercent = 100 / columnCount;
	const leftPercent = columnIndex * widthPercent;

	return {
		top,
		height,
		left: `${leftPercent}%`,
		width: `${widthPercent - 1}%`,
		zIndex: columnIndex + 1,
	};
}

export function filterEventsForDay(
	date: Date,
	weekEvents: CalendarEvent[],
): CalendarEvent[] {
	return weekEvents.filter((event) => isSameDay(event.startDate, date));
}

export function shouldRenderInGrid(event: CalendarEvent): boolean {
	if (event.isAllDay) return true;

	const hour = dateToZonedDateTime(event.startDate).hour;
	return hour >= CALENDAR_START_HOUR && hour <= CALENDAR_END_HOUR;
}
