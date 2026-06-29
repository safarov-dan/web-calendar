import {
	createTimeSlots,
	formatWeekdayShort,
	getDayOfMonth,
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
import { darkenColor, convertHexToRgba } from "../../shared/lib/color";
import { convertPxToRem } from "../../shared/lib/units";
import { CALENDAR_START_HOUR } from "../../shared/config/calendarConstants";
import { CurrentTimeIndicatorDay } from "./CurrentTimeIndicatorDay";
import { useEventModalStore } from "../event-modal";

export const DayView = () => {
	const user = useUserStore((state) => state.user);
	const currentDate = useCalendarStore((state) => state.currentDate);
	const { openCreateModal, openEditModal } = useEventModalStore();
	const timeSlots = createTimeSlots();
	const today = nowDate();
	const isToday = isSameDay(currentDate, today);

	const { data: calendars = [] } = useCalendarsQuery(user?.id || null);
	const {
		data: allEvents = [],
		startDate,
		endDate,
	} = useVisibleEventsQuery(user?.id || null, "day", currentDate);
	const expandedEvents = expandEventsForRange(allEvents, startDate, endDate);

	const visibleCalendarIds = calendars
		.filter((calendarItem) => calendarItem.isVisible)
		.map((calendarItem) => calendarItem.id);
	const visibleEvents = expandedEvents.filter((event) =>
		visibleCalendarIds.includes(event.calendarId),
	);

	const dayEvents = filterEventsForDay(currentDate, visibleEvents);
	const timedEvents = dayEvents.filter((event) => shouldRenderInGrid(event));

	const calendarColorMap = new Map(
		calendars.map((calendarItem) => [calendarItem.id, calendarItem.color]),
	);

	return (
		<div className="flex-1 overflow-auto bg-white">
			<div className="min-w-[600px]">
				<div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2">
					<div className="space-y-2">
						<div className="inline-flex h-[72px] min-w-[92px] flex-col items-center justify-center rounded-[8px] bg-[#F1FFF4] px-5">
							<div className="text-[38px] font-semibold leading-none text-[#1F2A44]">
								{getDayOfMonth(currentDate)}
							</div>
							<div className="mt-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1F2A44]">
								{formatWeekdayShort(currentDate)}
							</div>
						</div>

						{dayEvents.length > 0 && (
							<div className="space-y-1">
								{dayEvents.map((event) => {
									const backgroundColor =
										calendarColorMap.get(event.calendarId) || "#E5E7EB";
									const translucentBackgroundColor = convertHexToRgba(
										backgroundColor,
										0.3,
									);
									return (
										<button
											key={event.id}
											type="button"
											className="w-full rounded-[3px] px-2 py-0.5 text-left cursor-pointer hover:shadow-sm transition-shadow"
											style={{
												backgroundColor: translucentBackgroundColor,
												borderLeft: `${convertPxToRem(3)} solid ${darkenColor(backgroundColor, 40)}`,
											}}
											onClick={() => openEditModal(event)}
										>
											<span className="text-base text-[#323749] truncate block">
												{event.title}
											</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				<div className="relative">
					<div className="flex">
						<div className="w-24 flex-shrink-0 border-r border-gray-200">
							{timeSlots.map((timeLabel) => (
								<div
									key={timeLabel}
									className="h-16 border-b border-gray-100 flex items-start justify-end pr-3 pt-1"
								>
									<span className="text-xs text-gray-500">{timeLabel}</span>
								</div>
							))}
						</div>

						<div className="flex-1 relative">
							<div className={isToday ? "bg-green-50/30" : ""}>
								{timeSlots.map((timeLabel, timeIndex) => (
									<div
										key={timeLabel}
										className="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
										onClick={() => {
											const hour = CALENDAR_START_HOUR + timeIndex;
											openCreateModal(currentDate, { hour, minute: 0 });
										}}
									/>
								))}
							</div>

							<div className="absolute inset-0 pointer-events-none">
								<div className="relative h-full pointer-events-auto px-2">
									{timedEvents.map((event) => {
										const position = calculateEventPosition(event, timedEvents);
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
							</div>

							{isToday && <CurrentTimeIndicatorDay isVisible={true} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
