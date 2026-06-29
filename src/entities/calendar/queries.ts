import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calendarApi } from "./api/calendarApi";
import type { Calendar, CreateCalendarRequest, UpdateCalendarRequest } from "./types";
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from "../../shared/config";
import { reportError } from "../../shared/lib/error";
import { nowDate, nowEpochMilliseconds } from "../../shared/lib/temporal";

const CALENDAR_KEYS = {
	all: ["calendars"] as const,
	byUser: (userId: string) => [...CALENDAR_KEYS.all, userId] as const,
};

type CalendarSnapshot = { key: readonly unknown[]; data: Calendar[] };

function updateUserCalendarQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	userId: string,
	updater: (calendars: Calendar[]) => Calendar[],
): CalendarSnapshot[] {
	const queryKey = CALENDAR_KEYS.byUser(userId);
	const currentData = queryClient.getQueryData<Calendar[]>(queryKey);

	if (!currentData) {
		return [];
	}

	queryClient.setQueryData<Calendar[]>(queryKey, updater(currentData));
	return [{ key: queryKey, data: currentData }];
}

export function useCalendarsQuery(userId: string | null) {
	return useQuery({
		queryKey: CALENDAR_KEYS.byUser(userId || ""),
		queryFn: () => calendarApi.getAll(userId!),
		enabled: !!userId,
		staleTime: QUERY_STALE_TIME_MS,
		retry: QUERY_RETRY_COUNT,
	});
}

export function useCreateCalendarMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCalendarRequest) => calendarApi.create(userId, data),
		onMutate: async (newCalendar) => {
			const now = nowDate();
			const nowMs = nowEpochMilliseconds();
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
			const previousQueries = updateUserCalendarQueries(
				queryClient,
				userId,
				(calendars) => [
					...calendars,
					{
						id: `temp-${nowMs}`,
						userId,
						name: newCalendar.name,
						color: newCalendar.color,
						isVisible: true,
						createdAt: now,
						updatedAt: now,
					},
				],
			);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ key, data }) => {
					queryClient.setQueryData(key, data);
				});
			}
			reportError(error, "Failed to create calendar:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
		},
	});
}

export function useUpdateCalendarMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, ...updates }: { id: string } & UpdateCalendarRequest) =>
			calendarApi.update(userId, id, updates),
		onMutate: async ({ id, ...updates }) => {
			const now = nowDate();
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
			const previousQueries = updateUserCalendarQueries(
				queryClient,
				userId,
				(calendars) =>
					calendars.map((calendar) =>
						calendar.id === id ? { ...calendar, ...updates, updatedAt: now } : calendar,
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
			reportError(error, "Failed to update calendar:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
		},
	});
}

export function useDeleteCalendarMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (calendarId: string) => calendarApi.delete(userId, calendarId),
		onMutate: async (calendarId) => {
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
			const previousQueries = updateUserCalendarQueries(
				queryClient,
				userId,
				(calendars) => calendars.filter((calendar) => calendar.id !== calendarId),
			);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ key, data }) => {
					queryClient.setQueryData(key, data);
				});
			}
			reportError(error, "Failed to delete calendar:");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.byUser(userId) });
		},
	});
}
