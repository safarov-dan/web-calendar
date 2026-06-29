import { Toast } from "../../shared/ui";
import { useToastStore } from "./model";

export const ToastViewport = () => {
	const message = useToastStore((state) => state.message);
	const isVisible = useToastStore((state) => state.isVisible);
	const hideToast = useToastStore((state) => state.hideToast);

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
			<div className="pointer-events-auto">
				<Toast value={message} onClick={hideToast} />
			</div>
		</div>
	);
};
