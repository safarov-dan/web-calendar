import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "./api/eventApi";
import type { CalendarEvent, CreateEventRequest, UpdateEventRequest } from "./types";
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from "../../shared/config";
import {
	DAY_VIEW_BUFFER_DAYS,
	WEEK_VIEW_BUFFER_DAYS,
} from "../../shared/config/calendarConstants";
import { reportError } from "../../shared/lib/error";
import {
	addDays,
	createWeekDates,
	nowDate,
	nowEpochMilliseconds,
	toEpochMilliseconds,
} from "../../shared/lib/temporal";

const EVENT_KEYS = {
	all: ["events"] as const,
	byUser: (userId: string) => [...EVENT_KEYS.all, userId] as const,
	byDateRange: (userId: string, startDate: Date, endDate: Date) =>
		[
			...EVENT_KEYS.byUser(userId),
			toEpochMilliseconds(startDate),
			toEpochMilliseconds(endDate),
		] as const,
};

const isEventUserQuery = (userId: string) => (query: { queryKey: readonly unknown[] }) =>
	query.queryKey[0] === "events" && query.queryKey[1] === userId;

type QuerySnapshot = { key: readonly unknown[]; data: CalendarEvent[] };

function updateUserEventQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	predicate: ReturnType<typeof isEventUserQuery>,
	updater: (events: CalendarEvent[]) => CalendarEvent[],
): QuerySnapshot[] {
	const previousQueries: QuerySnapshot[] = [];

	queryClient.getQueriesData<CalendarEvent[]>({ predicate }).forEach(([key, data]) => {
		if (data) {
			previousQueries.push({ key, data });
			queryClient.setQueryData<CalendarEvent[]>(key, updater(data));
		}
	});

	return previousQueries;
}

export function useEventsQuery(userId: string | null, startDate: Date, endDate: Date) {
	return useQuery({
		queryKey: EVENT_KEYS.byDateRange(userId || "", startDate, endDate),
		queryFn: () => eventApi.getEvents(userId!, startDate, endDate),
		enabled: !!userId,
		staleTime: QUERY_STALE_TIME_MS,
		retry: QUERY_RETRY_COUNT,
	});
}

function calculateVisibleEventRange(viewMode: "day" | "week", currentDate: Date) {
	if (viewMode === "day") {
		return {
			startDate: addDays(currentDate, -DAY_VIEW_BUFFER_DAYS),
			endDate: addDays(currentDate, DAY_VIEW_BUFFER_DAYS),
		};
	}

	const weekDates = createWeekDates(currentDate);
	return {
		startDate: addDays(weekDates[0], -WEEK_VIEW_BUFFER_DAYS),
		endDate: addDays(weekDates[6], WEEK_VIEW_BUFFER_DAYS),
	};
}

export function useVisibleEventsQuery(
	userId: string | null,
	viewMode: "day" | "week",
	currentDate: Date,
) {
	const { startDate, endDate } = calculateVisibleEventRange(viewMode, currentDate);
	const queryResult = useEventsQuery(userId, startDate, endDate);

	return {
		...queryResult,
		startDate,
		endDate,
	};
}

export function useCreateEventMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEventRequest) => eventApi.createEvent(userId, data),
		onMutate: async (newEvent) => {
			const now = nowDate();
			const nowMs = nowEpochMilliseconds();
			const predicate = isEventUserQuery(userId);
			const optimisticEvent: CalendarEvent = {
				id: `temp-${nowMs}`,
				calendarId: newEvent.calendarId,
				title: newEvent.title,
				description: newEvent.description,
				repeat: newEvent.repeat,
				recurrence: newEvent.recurrence,
				startDate: newEvent.startDate,
				endDate: newEvent.endDate,
				isAllDay: newEvent.isAllDay,
				createdAt: now,
				updatedAt: now,
			};

			await queryClient.cancelQueries({ predicate });
			const previousQueries = updateUserEventQueries(queryClient, predicate, (events) => [
				...events,
				optimisticEvent,
			]);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ key, data }) => {
					queryClient.setQueryData(key, data);
				});
			}
			reportError(error, "Failed to create event:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENT_KEYS.byUser(userId) });
		},
	});
}

export function useUpdateEventMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, ...updates }: { id: string } & UpdateEventRequest) =>
			eventApi.updateEvent(userId, id, updates),
		onMutate: async ({ id, ...updates }) => {
			const now = nowDate();
			const predicate = isEventUserQuery(userId);
			await queryClient.cancelQueries({ predicate });
			const previousQueries = updateUserEventQueries(queryClient, predicate, (events) =>
				events.map((event) =>
					event.id === id
						? {
								...event,
								...updates,
								startDate: updates.startDate || event.startDate,
								endDate: updates.endDate || event.endDate,
								updatedAt: now,
							}
						: event,
				),
			);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ key, data }) => {
					queryClient.setQueryData(key, data);
				});
			}
			reportError(error, "Failed to update event:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENT_KEYS.byUser(userId) });
		},
	});
}

export function useDeleteEventMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventId: string) => eventApi.deleteEvent(userId, eventId),
		onMutate: async (eventId) => {
			const predicate = isEventUserQuery(userId);
			await queryClient.cancelQueries({ predicate });
			const previousQueries = updateUserEventQueries(queryClient, predicate, (events) =>
				events.filter((event) => event.id !== eventId),
			);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ key, data }) => {
					queryClient.setQueryData(key, data);
				});
			}
			reportError(error, "Failed to delete event:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENT_KEYS.byUser(userId) });
		},
	});
}
