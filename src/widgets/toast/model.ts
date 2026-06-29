import { create } from "zustand";

interface ToastState {
	message: string;
	isVisible: boolean;
	showToast: (message: string, durationMs?: number) => void;
	hideToast: () => void;
}

const DEFAULT_TOAST_DURATION_MS = 4000;

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
	message: "",
	isVisible: false,

	showToast: (message, durationMs = DEFAULT_TOAST_DURATION_MS) => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}

		set({ message, isVisible: true });

		hideTimeout = setTimeout(() => {
			set({ isVisible: false });
			hideTimeout = null;
		}, durationMs);
	},

	hideToast: () => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		set({ isVisible: false });
	},
}));
