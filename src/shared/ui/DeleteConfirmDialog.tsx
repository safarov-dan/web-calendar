interface DeleteConfirmDialogProps {
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
	confirmLabel?: string;
	confirmVariant?: "danger" | "success";
}

export const DeleteConfirmDialog = ({
	message,
	onCancel,
	onConfirm,
	confirmLabel = "Delete",
	confirmVariant = "danger",
}: DeleteConfirmDialogProps) => {
	const confirmButtonClass =
		confirmVariant === "success"
			? "px-5 py-2 text-sm font-semibold text-white bg-[#00AE1C] hover:bg-[#008A16] rounded-lg transition-colors"
			: "px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors";

	return (
		<div className="space-y-5">
			<p className="text-gray-700">{message}</p>
			<div className="flex justify-end gap-2 pt-1">
				<button
					type="button"
					onClick={onCancel}
					className="px-5 py-2 text-sm font-semibold text-[#323749] bg-white border border-[#DEDFE5] hover:bg-gray-50 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button type="button" onClick={onConfirm} className={confirmButtonClass}>
					{confirmLabel}
				</button>
			</div>
		</div>
	);
};
