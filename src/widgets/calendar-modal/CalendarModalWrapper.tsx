import closeIcon from "../../assets/close-icon.svg";
import { useModalLifecycle } from "../../shared/lib/useModalLifecycle";
import { convertPxToRem } from "../../shared/lib/units";

interface CalendarModalWrapperProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}

export const CalendarModalWrapper = ({
	isOpen,
	title,
	onClose,
	children,
}: CalendarModalWrapperProps) => {
	useModalLifecycle(isOpen, onClose);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop for click outside */}
			<div className="fixed inset-0 z-40" onClick={onClose} />

			{/* Modal - positioned on left side, width 250px */}
			<div
				className="fixed left-4 bottom-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200"
				style={{ width: convertPxToRem(250) }}
			>
				{/* Header */}
				<div className="px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200">
					<h2 className="text-sm font-bold text-gray-900">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-0.5 hover:bg-gray-100 rounded transition-colors"
						aria-label="Close"
					>
						<img src={closeIcon} alt="" className="w-3 h-3" />
					</button>
				</div>

				{/* Content */}
				<div className="px-3.5 py-3.5">{children}</div>
			</div>
		</>
	);
};
