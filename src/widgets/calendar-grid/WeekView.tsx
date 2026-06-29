import {
	createTimeSlots,
	createWeekDates,
	formatDayHeader,
	isSameDay,
	nowDate,
} from "../../shared/lib/temporal";
import { useCalendarStore, useCalendarsQuery } from "../../entities/calendar";
import { useVisibleEventsQuery, EventCard } from "../../entities/event";
import { useUserStore } from "../../entities/user";
import {
	calculateEventPosition,
	filterEventsForDay,
	shouldRenderInGrid,
} from "../../shared/lib/eventPositioning";
import { expandEventsForRange } from "../../shared/lib/recurrence";
import { convertHexToRgba } from "../../shared/lib/color";
import { convertPxToRem } from "../../shared/lib/units";
import {
	CALENDAR_START_HOUR,
	HEADER_EVENT_PREVIEW_LIMIT,
	TIME_COLUMN_WIDTH_PX,
} from "../../shared/config/calendarConstants";
import { CurrentTimeIndicatorWeek } from "./CurrentTimeIndicatorWeek";
import { useEventModalStore } from "../event-modal";

export const WeekView = () => {
	const user = useUserStore((state) => state.user);
	const currentDate = useCalendarStore((state) => state.currentDate);
	const selectedDate = useCalendarStore((state) => state.selectedDate);
	const selectDate = useCalendarStore((state) => state.selectDate);
	const { openCreateModal, openEditModal } = useEventModalStore();
	const weekDates = createWeekDates(currentDate);
	const timeSlots = createTimeSlots();
	const today = nowDate();

	const { data: calendars = [] } = useCalendarsQuery(user?.id || null);
	const {
		data: allEvents = [],
		startDate,
		endDate,
	} = useVisibleEventsQuery(user?.id || null, "week", currentDate);
	const expandedEvents = expandEventsForRange(allEvents, startDate, endDate);

	const visibleCalendarIds = calendars
		.filter((calendarItem) => calendarItem.isVisible)
		.map((calendarItem) => calendarItem.id);
	const visibleEvents = expandedEvents.filter((event) =>
		visibleCalendarIds.includes(event.calendarId),
	);
	const visibleTimedEvents = visibleEvents.filter((event) => shouldRenderInGrid(event));

	const calendarColorMap = new Map(
		calendars.map((calendarItem) => [calendarItem.id, calendarItem.color]),
	);

	const todayColumnIndex = weekDates.findIndex((date) => isSameDay(date, today));
	const isTodayVisible = todayColumnIndex !== -1;

	return (
		<div className="flex-1 overflow-auto bg-white">
			<div className="min-w-[800px]">
				<div className="sticky top-0 z-30 bg-white border-b border-gray-200">
					<div className="flex">
						<div className="w-20 flex-shrink-0 border-r border-gray-200" />

						{weekDates.map((date) => {
							const isSelectedDay = isSameDay(date, selectedDate);
							const headerDayEvents = filterEventsForDay(date, visibleEvents).slice(
								0,
								HEADER_EVENT_PREVIEW_LIMIT,
							);
							const dateKey = date.getTime();
							return (
								<div
									key={dateKey}
									onClick={() => selectDate(date)}
									className={`flex-1 min-w-[100px] border-r border-gray-200 cursor-pointer transition-colors text-center py-4 ${
										isSelectedDay ? "bg-green-50" : ""
									}`}
								>
									<div className="text-sm font-semibold text-[#323749]">
										{formatDayHeader(date)}
									</div>
									{headerDayEvents.length > 0 && (
										<div className="mt-2 px-2 space-y-1">
											{headerDayEvents.map((event) => {
												const color = calendarColorMap.get(event.calendarId) || "#E5E7EB";
												return (
													<button
														key={event.id}
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															openEditModal(event);
														}}
														className="w-full rounded-md px-2 py-1 text-left text-xs font-medium text-[#323749] truncate"
														style={{
															backgroundColor: convertHexToRgba(color, 0.24),
															borderLeft: `${convertPxToRem(3)} solid ${color}`,
														}}
													>
														{event.title}
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="relative">
					<div className="flex">
						<div className="w-20 flex-shrink-0 border-r border-gray-200">
							{timeSlots.map((timeLabel) => (
								<div
									key={timeLabel}
									className="h-16 border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
								>
									<span className="text-xs text-gray-500">{timeLabel}</span>
								</div>
							))}
						</div>

						<div className="flex-1 flex">
							{weekDates.map((date) => (
								<div
									key={date.getTime()}
									className="flex-1 min-w-[100px] border-r border-gray-200"
								>
									{timeSlots.map((timeLabel, timeIndex) => (
										<div
											key={`${date.getTime()}-${timeLabel}`}
											className="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
											onClick={() => {
												const hour = CALENDAR_START_HOUR + timeIndex;
												openCreateModal(date, { hour, minute: 0 });
											}}
										/>
									))}
								</div>
							))}
						</div>
					</div>

					<div
						className="absolute inset-0 pointer-events-none"
						style={{ marginLeft: convertPxToRem(TIME_COLUMN_WIDTH_PX) }}
					>
						<div className="flex h-full pointer-events-none">
							{weekDates.map((date) => {
								const dayEvents = filterEventsForDay(date, visibleTimedEvents);
								return (
									<div
										key={date.getTime()}
										className="flex-1 min-w-[100px] relative pointer-events-auto"
									>
										{dayEvents.map((event) => {
											const position = calculateEventPosition(event, dayEvents);
											const backgroundColor =
												calendarColorMap.get(event.calendarId) || "#E5E7EB";

											return (
												<EventCard
													key={event.id}
													event={event}
													position={position}
													backgroundColor={backgroundColor}
													onClick={() => openEditModal(event)}
												/>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>

					<CurrentTimeIndicatorWeek
						isVisible={isTodayVisible}
						todayColumnIndex={todayColumnIndex}
						totalColumns={7}
					/>
				</div>
			</div>
		</div>
	);
};
