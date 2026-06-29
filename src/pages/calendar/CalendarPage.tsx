import { CalendarHeader } from "../../widgets/calendar-header";
import { CalendarSidebar } from "../../widgets/calendar-sidebar";
import { WeekView, DayView } from "../../widgets/calendar-grid";
import { EventModal } from "../../widgets/event-modal";
import { CalendarModal } from "../../widgets/calendar-modal";
import { ToastViewport } from "../../widgets/toast";
import { useCalendarStore } from "../../entities/calendar";

export const CalendarPage = () => {
	const viewMode = useCalendarStore((state) => state.viewMode);

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			<CalendarHeader />
			<div className="flex-1 flex overflow-hidden">
				<CalendarSidebar />
				<main className="relative flex-1 flex flex-col overflow-hidden">
					{viewMode === "week" && <WeekView />}
					{viewMode === "day" && <DayView />}
					<ToastViewport />
				</main>
			</div>
			<EventModal />
			<CalendarModal />
		</div>
	);
};
