import { useState } from "react";
import { useCalendarModalStore } from "./model";
import { CalendarModalWrapper } from "./CalendarModalWrapper";
import { EventModalWrapper } from "../event-modal/EventModalWrapper";
import { useToastStore } from "../toast";
import { DeleteConfirmDialog } from "../../shared/ui";
import { notifyAndReportError } from "../../shared/lib/error";
import { CalendarForm } from "../../features/calendar-form/CalendarForm";
import {
	useCreateCalendarMutation,
	useUpdateCalendarMutation,
	useDeleteCalendarMutation,
} from "../../entities/calendar";
import { useUserStore } from "../../entities/user";
import type {
	CreateCalendarRequest,
	UpdateCalendarRequest,
} from "../../entities/calendar";

export const CalendarModal = () => {
	const user = useUserStore((state) => state.user);
	const { isOpen, mode, calendar, closeModal } = useCalendarModalStore();
	const showToast = useToastStore((state) => state.showToast);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const createMutation = useCreateCalendarMutation(user?.id || "");
	const updateMutation = useUpdateCalendarMutation(user?.id || "");
	const deleteMutation = useDeleteCalendarMutation(user?.id || "");

	const handleSubmit = (data: CreateCalendarRequest | UpdateCalendarRequest) => {
		if (mode === "create") {
			createMutation.mutate(data as CreateCalendarRequest, {
				onSuccess: () => {
					showToast("Calendar created");
				},
				onError: (error) => {
					notifyAndReportError(
						showToast,
						"Failed to create calendar",
						error,
						"Failed to create calendar:",
					);
				},
			});
			closeModal(); // Close immediately after starting mutation
		} else if (mode === "edit" && calendar) {
			updateMutation.mutate(
				{
					id: calendar.id,
					...data,
				},
				{
					onSuccess: () => {
						showToast("Calendar updated");
					},
					onError: (error) => {
						notifyAndReportError(
							showToast,
							"Failed to update calendar",
							error,
							"Failed to update calendar:",
						);
					},
				},
			);
			closeModal(); // Close immediately after starting mutation
		}
	};

	const handleDelete = () => {
		if (!calendar) return;
		setShowDeleteConfirm(true);
	};

	const confirmDelete = () => {
		if (!calendar) return;

		const calendarId = calendar.id;
		closeModal();
		setShowDeleteConfirm(false);

		deleteMutation.mutate(calendarId, {
			onSuccess: () => {
				showToast("Calendar deleted");
			},
			onError: (error) => {
				notifyAndReportError(
					showToast,
					"Failed to delete calendar",
					error,
					"Failed to delete calendar:",
				);
			},
		});
	};

	const cancelDelete = () => {
		if (mode === "delete") {
			closeModal();
			return;
		}
		setShowDeleteConfirm(false);
	};

	const shouldShowDeleteConfirm = calendar && (showDeleteConfirm || mode === "delete");

	if (shouldShowDeleteConfirm) {
		return (
			<EventModalWrapper isOpen={isOpen} title="Delete calendar" onClose={cancelDelete}>
				<DeleteConfirmDialog
					message={`Are you sure you want to delete ${calendar.name}? You'll no longer have access to this calendar and its events.`}
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
					confirmVariant="success"
				/>
			</EventModalWrapper>
		);
	}

	return (
		<CalendarModalWrapper
			isOpen={isOpen}
			title={mode === "create" ? "Create Calendar" : "Edit Calendar"}
			onClose={closeModal}
		>
			<CalendarForm
				mode={mode === "create" ? "create" : "edit"}
				calendar={calendar}
				onSubmit={handleSubmit}
				onDelete={mode === "edit" ? handleDelete : undefined}
			/>
		</CalendarModalWrapper>
	);
};
