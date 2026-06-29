import { Modal } from "../../shared/ui";
import { useModalLifecycle } from "../../shared/lib/useModalLifecycle";

interface EventModalWrapperProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	headerActions?: React.ReactNode;
	children: React.ReactNode;
}

export const EventModalWrapper = ({
	isOpen,
	title,
	onClose,
	headerActions,
	children,
}: EventModalWrapperProps) => {
	useModalLifecycle(isOpen, onClose);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/50 transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<Modal title={title} onClick={onClose} headerActions={headerActions} fullWidth>
					{children}
				</Modal>
			</div>
		</div>
	);
};
