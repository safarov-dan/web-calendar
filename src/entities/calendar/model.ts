import { create } from "zustand";
import { addDays, nowDate } from "../../shared/lib/temporal";

type ViewMode = "day" | "week";

interface CalendarState {
	viewMode: ViewMode;
	currentDate: Date;
	selectedDate: Date;
	setViewMode: (mode: ViewMode) => void;
	goToToday: () => void;
	goToNextPeriod: () => void;
	goToPreviousPeriod: () => void;
	selectDate: (date: Date) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
	viewMode: "week",
	currentDate: nowDate(),
	selectedDate: nowDate(),

	setViewMode: (mode) => set({ viewMode: mode }),

	goToToday: () => {
		const today = nowDate();
		set({
			currentDate: today,
			selectedDate: today,
		});
	},

	goToNextPeriod: () => {
		const { viewMode, currentDate } = get();
		const daysToAdd = viewMode === "week" ? 7 : 1;
		const nextDate = addDays(currentDate, daysToAdd);
		set({ currentDate: nextDate, selectedDate: nextDate });
	},

	goToPreviousPeriod: () => {
		const { viewMode, currentDate } = get();
		const daysToSubtract = viewMode === "week" ? 7 : 1;
		const prevDate = addDays(currentDate, -daysToSubtract);
		set({ currentDate: prevDate, selectedDate: prevDate });
	},

	selectDate: (date) => {
		set({
			selectedDate: date,
			currentDate: date,
		});
	},
}));
