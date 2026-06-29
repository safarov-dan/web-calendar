import { useState } from "react";
import { ColorPicker } from "../../shared/ui";
import { convertPxToRem } from "../../shared/lib/units";
import { CALENDAR_COLORS, DEFAULT_CALENDAR_COLOR } from "../../shared/config";
import type {
	CreateCalendarRequest,
	UpdateCalendarRequest,
} from "../../entities/calendar";
import type { Calendar } from "../../entities/calendar";
import textIcon from "../../assets/text-icon.svg";
import colorIcon from "../../assets/color-icon.svg";
import binIcon from "../../assets/bin-icon.svg";

interface CalendarFormProps {
	mode: "create" | "edit";
	calendar?: Calendar | null;
	onSubmit: (data: CreateCalendarRequest | UpdateCalendarRequest) => void;
	onDelete?: () => void;
}

interface CalendarFormState {
	name: string;
	color: string;
}

interface CalendarFormErrors {
	name?: string;
}

export const CalendarForm = ({
	mode,
	calendar,
	onSubmit,
	onDelete,
}: CalendarFormProps) => {
	const [formData, setFormData] = useState<CalendarFormState>(() => {
		if (mode === "edit" && calendar) {
			return {
				name: calendar.name,
				color: calendar.color,
			};
		}

		return {
			name: "",
			color: DEFAULT_CALENDAR_COLOR,
		};
	});

	const [errors, setErrors] = useState<CalendarFormErrors>({});

	const validate = (): boolean => {
		const newErrors: CalendarFormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Calendar name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validate()) return;

		const calendarData = {
			name: formData.name.trim(),
			color: formData.color,
		};

		onSubmit(calendarData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div style={{ width: convertPxToRem(195) }}>
				<div className="flex items-start gap-1.5 mb-4">
					<img src={textIcon} alt="" className="w-3 h-3 mt-1.5 flex-shrink-0" />
					<div className="flex-1">
						<label className="block text-[10px] font-bold text-gray-700 mb-1">
							Title
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="Calendar 2"
							className="w-full px-0 py-1 text-xs border-b border-gray-300 outline-none focus:border-gray-900 transition-colors"
							required
						/>
						{errors.name && (
							<p className="text-[10px] text-red-600 mt-1">{errors.name}</p>
						)}
					</div>
				</div>

				<div className="flex items-start gap-1.5">
					<img src={colorIcon} alt="" className="w-3 h-3 mt-1 flex-shrink-0" />
					<div className="flex-1">
						<label className="block text-[10px] font-bold text-gray-700 mb-2">
							Colour
						</label>
						<ColorPicker
							value={formData.color}
							colors={[...CALENDAR_COLORS]}
							onChange={(color) => setFormData({ ...formData, color })}
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between pt-3">
				{mode === "edit" && onDelete && (
					<button
						type="button"
						onClick={onDelete}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
						aria-label="Delete calendar"
					>
						<img src={binIcon} alt="" className="w-3 h-3" />
					</button>
				)}

				<button
					type="submit"
					className="ml-auto bg-[#00AE1C] text-white rounded-md font-semibold hover:bg-[#008A16] transition-colors"
					style={{
						width: convertPxToRem(60),
						height: convertPxToRem(28),
						fontSize: convertPxToRem(11),
					}}
				>
					{mode === "create" ? "Create" : "Save"}
				</button>
			</div>
		</form>
	);
};
