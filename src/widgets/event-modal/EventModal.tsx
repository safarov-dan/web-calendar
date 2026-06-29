import { useEffect, useState } from "react";
import { useEventModalStore } from "./model";
import { EventModalWrapper } from "./EventModalWrapper";
import { EventForm } from "../../features/event-form/EventForm";
import { useToastStore } from "../toast";
import { useCalendarsQuery } from "../../entities/calendar";
import { DeleteConfirmDialog } from "../../shared/ui";
import {
	useCreateEventMutation,
	useUpdateEventMutation,
	useDeleteEventMutation,
} from "../../entities/event";
import { useUserStore } from "../../entities/user";
import type { CreateEventRequest, UpdateEventRequest } from "../../entities/event";
import { formatDateWithDay, formatTime } from "../../shared/lib/temporal";
import {
	formatRepeatSummary,
	getNormalizedRecurrence,
} from "../../shared/lib/recurrence";
import { notifyAndReportError } from "../../shared/lib/error";
import textIcon from "../../assets/text-icon.svg";
import clockIcon from "../../assets/clock-icon.svg";
import calendarIcon from "../../assets/calendar-icon.svg";
import descriptionIcon from "../../assets/description-icon.svg";
import editIcon from "../../assets/edit-icon.svg";
import binIcon from "../../assets/bin-icon.svg";

export const EventModal = () => {
	const user = useUserStore((state) => state.user);
	const { isOpen, mode, event, defaultDate, defaultTime, closeModal } =
		useEventModalStore();
	const showToast = useToastStore((state) => state.showToast);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [activeView, setActiveView] = useState<"details" | "form">("form");

	const createMutation = useCreateEventMutation(user?.id || "");
	const updateMutation = useUpdateEventMutation(user?.id || "");
	const deleteMutation = useDeleteEventMutation(user?.id || "");
	const { data: calendars = [] } = useCalendarsQuery(user?.id || null);

	useEffect(() => {
		if (!isOpen) {
			setActiveView("form");
			setShowDeleteConfirm(false);
			return;
		}

		if (mode === "edit" && event) {
			setActiveView("details");
		} else {
			setActiveView("form");
		}
	}, [isOpen, mode, event]);

	const handleSubmit = async (data: CreateEventRequest | UpdateEventRequest) => {
		try {
			if (mode === "create") {
				await createMutation.mutateAsync(data as CreateEventRequest);
				showToast("Event created");
			} else if (mode === "edit" && event) {
				const targetEventId = event.sourceEventId ?? event.id;
				await updateMutation.mutateAsync({
					id: targetEventId,
					...data,
				});
				showToast("Event updated");
			}
			closeModal();
		} catch (error) {
			notifyAndReportError(
				showToast,
				mode === "create" ? "Failed to create event" : "Failed to update event",
				error,
				"Failed to save event:",
			);
		}
	};

	const handleDelete = () => {
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (!event) return;

		try {
			const targetEventId = event.sourceEventId ?? event.id;
			await deleteMutation.mutateAsync(targetEventId);
			closeModal();
			setShowDeleteConfirm(false);
			showToast("Event deleted");
		} catch (error) {
			notifyAndReportError(
				showToast,
				"Failed to delete event",
				error,
				"Failed to delete event:",
			);
		}
	};

	const cancelDelete = () => {
		setShowDeleteConfirm(false);
	};

	const selectedCalendar = event
		? calendars.find((calendar) => calendar.id === event.calendarId)
		: null;
	const isDetailsView = mode === "edit" && !!event && activeView === "details";
	const repeatSummary = event
		? formatRepeatSummary(getNormalizedRecurrence(event), event.startDate)
		: "Does not repeat";

	if (showDeleteConfirm && event) {
		return (
			<EventModalWrapper isOpen={isOpen} title="Delete event" onClose={cancelDelete}>
				<DeleteConfirmDialog
					message={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
					confirmVariant="danger"
				/>
			</EventModalWrapper>
		);
	}

	return (
		<EventModalWrapper
			isOpen={isOpen}
			title={
				isDetailsView
					? "Event information"
					: mode === "create"
						? "Create event"
						: "Edit event"
			}
			onClose={closeModal}
			headerActions={
				isDetailsView ? (
					<>
						<button
							type="button"
							onClick={() => setActiveView("form")}
							className="p-1 hover:bg-gray-100 rounded transition-colors"
							aria-label="Edit event"
						>
							<img src={editIcon} alt="" className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={handleDelete}
							className="p-1 hover:bg-gray-100 rounded transition-colors"
							aria-label="Delete event"
						>
							<img src={binIcon} alt="" className="w-4 h-4" />
						</button>
					</>
				) : undefined
			}
		>
			{isDetailsView && event ? (
				<div className="space-y-5">
					<div className="flex items-center gap-3">
						<img src={textIcon} alt="" className="w-3 h-3 flex-shrink-0" />
						<p className="text-3xl font-medium text-[#323749]">{event.title}</p>
					</div>

					<div className="flex items-start gap-3">
						<img src={clockIcon} alt="" className="w-3 h-3 mt-1 flex-shrink-0" />
						<div>
							<p className="text-base text-[#323749]">
								{formatDateWithDay(event.startDate)}
								{", "}
								{formatTime(event.startDate)} - {formatTime(event.endDate)}
							</p>
							<p className="text-base text-[#323749]">
								{event.isAllDay ? `All day, ${repeatSummary}` : repeatSummary}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<img src={calendarIcon} alt="" className="w-3 h-3 flex-shrink-0" />
						<div className="flex items-center gap-2">
							<span
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: selectedCalendar?.color || "#D1D5DB" }}
							/>
							<p className="text-base text-[#323749]">
								{selectedCalendar?.name || "No calendar"}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<img src={descriptionIcon} alt="" className="w-3 h-3 mt-1 flex-shrink-0" />
						<p className="text-base text-[#323749]">
							{event.description || "No description"}
						</p>
					</div>
				</div>
			) : (
				<EventForm
					mode={mode}
					event={event}
					defaultDate={defaultDate}
					defaultTime={defaultTime}
					onSubmit={handleSubmit}
					onCancel={closeModal}
				/>
			)}
		</EventModalWrapper>
	);
};
