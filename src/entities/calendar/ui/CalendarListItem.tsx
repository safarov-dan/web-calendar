import type { Calendar } from "../types";
import editIcon from "../../../assets/edit-icon.svg";
import binIcon from "../../../assets/bin-icon.svg";

interface CalendarListItemProps {
	calendar: Calendar;
	onToggleVisibility: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export const CalendarListItem = ({
	calendar,
	onToggleVisibility,
	onEdit,
	onDelete,
}: CalendarListItemProps) => {
	return (
		<div className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-50 transition-colors group">
			{/* Visibility Checkbox with Color */}
			<div className="relative flex-shrink-0">
				<input
					type="checkbox"
					checked={calendar.isVisible}
					onChange={() => onToggleVisibility(calendar.id)}
					className="sr-only"
					aria-label={`Toggle ${calendar.name} visibility`}
				/>
				<div
					onClick={() => onToggleVisibility(calendar.id)}
					className="w-[18px] h-[18px] rounded-[3px] cursor-pointer transition-all border-2 flex items-center justify-center"
					style={{
						backgroundColor: calendar.isVisible ? calendar.color : "white",
						borderColor: calendar.isVisible ? calendar.color : "#D1D5DB",
					}}
				>
					{calendar.isVisible && (
						<svg
							className="w-[10px] h-[10px] text-white transition-all"
							fill="none"
							viewBox="-50 -50 100 100"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={8}
								d="M-30 0 L-10 20 L30 -20"
							/>
						</svg>
					)}
				</div>
			</div>

			{/* Calendar Name */}
			<span className="flex-1 text-sm text-gray-700 truncate">{calendar.name}</span>

			{/* Action Buttons - shown on hover */}
			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					onClick={() => onDelete(calendar.id)}
					className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
					aria-label="Delete calendar"
				>
					<img src={binIcon} alt="" className="w-4 h-4" />
				</button>
				<button
					onClick={() => onEdit(calendar.id)}
					className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
					aria-label="Edit calendar"
				>
					<img src={editIcon} alt="" className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};
