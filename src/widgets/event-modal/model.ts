import { create } from "zustand";
import type { CalendarEvent } from "../../entities/event";

interface EventModalState {
	isOpen: boolean;
	mode: "create" | "edit";
	event: CalendarEvent | null;
	defaultDate: Date | null;
	defaultTime: { hour: number; minute: number } | null;
	openCreateModal: (date: Date, time?: { hour: number; minute: number }) => void;
	openEditModal: (event: CalendarEvent) => void;
	closeModal: () => void;
}

export const useEventModalStore = create<EventModalState>((set) => ({
	isOpen: false,
	mode: "create",
	event: null,
	defaultDate: null,
	defaultTime: null,

	openCreateModal: (date, time) => {
		set({
			isOpen: true,
			mode: "create",
			event: null,
			defaultDate: date,
			defaultTime: time || null,
		});
	},

	openEditModal: (event) => {
		set({
			isOpen: true,
			mode: "edit",
			event,
			defaultDate: null,
			defaultTime: null,
		});
	},

	closeModal: () => {
		set({
			isOpen: false,
			mode: "create",
			event: null,
			defaultDate: null,
			defaultTime: null,
		});
	},
}));
