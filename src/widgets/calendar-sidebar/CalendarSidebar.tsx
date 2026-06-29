import {
	CalendarListItem,
	useCalendarsQuery,
	useUpdateCalendarMutation,
	useCalendarStore,
} from "../../entities/calendar";
import { DatePicker } from "../../shared/ui";
import { getHour, nowDate } from "../../shared/lib/temporal";
import { useUserStore } from "../../entities/user";
import { useEventModalStore } from "../event-modal";
import { useCalendarModalStore } from "../calendar-modal";
import { useToastStore } from "../toast";
import { notifyAndReportError } from "../../shared/lib/error";
import { Button } from "../../shared/ui";
import plusIcon from "../../assets/plus-icon.svg";
import plusDarkIcon from "../../assets/plus-dark-icon.svg";

export const CalendarSidebar = () => {
	const user = useUserStore((state) => state.user);
	const currentDate = useCalendarStore((state) => state.currentDate);
	const selectedDate = useCalendarStore((state) => state.selectedDate);
	const selectDate = useCalendarStore((state) => state.selectDate);
	const { openCreateModal: openEventModal } = useEventModalStore();
	const {
		openCreateModal: openCalendarCreate,
		openEditModal: openCalendarEdit,
		openDeleteModal: openCalendarDelete,
	} = useCalendarModalStore();
	const showToast = useToastStore((state) => state.showToast);
	const { data: calendars = [] } = useCalendarsQuery(user?.id || null);
	const updateCalendarMutation = useUpdateCalendarMutation(user?.id || "");

	const handleCreateEvent = () => {
		const nextHour = getHour(nowDate()) + 1;
		openEventModal(currentDate, { hour: nextHour, minute: 0 });
	};

	const handleToggleVisibility = (id: string) => {
		const calendar = calendars.find((calendarItem) => calendarItem.id === id);
		if (calendar) {
			const nextVisible = !calendar.isVisible;
			updateCalendarMutation.mutate(
				{
					id,
					isVisible: nextVisible,
				},
				{
					onSuccess: () => {
						showToast(nextVisible ? "Calendar shown" : "Calendar hidden");
					},
					onError: (error) => {
						notifyAndReportError(
							showToast,
							"Failed to update calendar",
							error,
							"Failed to toggle calendar visibility:",
						);
					},
				},
			);
		}
	};

	const handleEditCalendar = (id: string) => {
		const calendar = calendars.find((calendarItem) => calendarItem.id === id);
		if (calendar) {
			openCalendarEdit(calendar);
		}
	};

	const handleDeleteCalendar = (id: string) => {
		const calendar = calendars.find((calendarItem) => calendarItem.id === id);
		if (calendar) {
			openCalendarDelete(calendar);
		}
	};

	const handleAddCalendar = () => {
		openCalendarCreate();
	};

	return (
		<aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
			<div className="p-4 space-y-6">
				<Button
					type="button"
					onClick={handleCreateEvent}
					value="Create"
					variant="primary-icon"
					iconSrc={plusIcon}
					fullWidth
				/>

				<DatePicker value={selectedDate ?? nowDate()} onChange={selectDate} />
				<div>
					<h3 className="text-sm font-semibold text-gray-700 mb-3">My calendars</h3>

					<div className="space-y-1">
						{calendars.length === 0 ? (
							<p className="text-sm text-gray-500 px-2">No calendars yet</p>
						) : (
							calendars.map((calendar) => (
								<CalendarListItem
									key={calendar.id}
									calendar={calendar}
									onToggleVisibility={handleToggleVisibility}
									onEdit={handleEditCalendar}
									onDelete={handleDeleteCalendar}
								/>
							))
						)}
					</div>

					<button
						onClick={handleAddCalendar}
						className="mt-3 w-full text-left px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
					>
						<img src={plusDarkIcon} alt="" className="w-3 h-3" />
						Add calendar
					</button>
				</div>
			</div>
		</aside>
	);
};
