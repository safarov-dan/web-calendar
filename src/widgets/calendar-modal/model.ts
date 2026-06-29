import { create } from "zustand";
import type { Calendar } from "../../entities/calendar";

interface CalendarModalState {
	isOpen: boolean;
	mode: "create" | "edit" | "delete";
	calendar: Calendar | null;
	openCreateModal: () => void;
	openEditModal: (calendar: Calendar) => void;
	openDeleteModal: (calendar: Calendar) => void;
	closeModal: () => void;
}

export const useCalendarModalStore = create<CalendarModalState>((set) => ({
	isOpen: false,
	mode: "create",
	calendar: null,

	openCreateModal: () => {
		set({
			isOpen: true,
			mode: "create",
			calendar: null,
		});
	},

	openEditModal: (calendar) => {
		set({
			isOpen: true,
			mode: "edit",
			calendar,
		});
	},

	openDeleteModal: (calendar) => {
		set({
			isOpen: true,
			mode: "delete",
			calendar,
		});
	},

	closeModal: () => {
		set({
			isOpen: false,
			mode: "create",
			calendar: null,
		});
	},
}));
