import { useState } from "react";
import {
	addDuration,
	createMonthGrid,
	createDateFromParts,
	formatMonthYear,
	getDayOfMonth,
	getMonthIndex,
	getYear,
	isSameDay,
	isToday,
	nowDate,
} from "../../../shared/lib/temporal";
import { useCalendarStore } from "../model";

const DAY_LABELS = [
	{ key: "sun", label: "S" },
	{ key: "mon", label: "M" },
	{ key: "tue", label: "T" },
	{ key: "wed", label: "W" },
	{ key: "thu", label: "T" },
	{ key: "fri", label: "F" },
	{ key: "sat", label: "S" },
];

export const MiniCalendar = () => {
	const { selectedDate, selectDate } = useCalendarStore();
	const [viewMonth, setViewMonth] = useState(nowDate());

	const year = getYear(viewMonth);
	const month = getMonthIndex(viewMonth);
	const monthGrid = createMonthGrid(year, month);

	const goToPreviousMonth = () => {
		setViewMonth(addDuration(createDateFromParts(year, month, 1), { months: -1 }));
	};

	const goToNextMonth = () => {
		setViewMonth(addDuration(createDateFromParts(year, month, 1), { months: 1 }));
	};

	const handleDateClick = (date: Date) => {
		selectDate(date);
	};

	const isCurrentMonth = (date: Date) => getMonthIndex(date) === month;

	return (
		<div className="bg-white rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<button
					onClick={goToPreviousMonth}
					className="p-1 hover:bg-gray-100 rounded transition-colors"
					aria-label="Previous month"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M10 12L6 8L10 4"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				<h3 className="text-sm font-semibold text-gray-900">
					{formatMonthYear(viewMonth)}
				</h3>

				<button
					onClick={goToNextMonth}
					className="p-1 hover:bg-gray-100 rounded transition-colors"
					aria-label="Next month"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M6 12L10 8L6 4"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			<div className="grid grid-cols-7 gap-1 mb-2">
				{DAY_LABELS.map((day) => (
					<div key={day.key} className="text-xs font-medium text-gray-500 text-center">
						{day.label}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{monthGrid.flat().map((date) => {
					const isSelected = isSameDay(date, selectedDate);
					const isTodayDate = isToday(date);
					const inCurrentMonth = isCurrentMonth(date);

					return (
						<button
							key={date.getTime()}
							onClick={() => handleDateClick(date)}
							className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                transition-colors
                ${inCurrentMonth ? "text-gray-900 hover:bg-gray-100" : "text-gray-400"}
                ${isTodayDate && !isSelected ? "bg-[#E6F7E9] font-semibold" : ""}
                ${
									isSelected
										? "bg-[#00AE1C] text-white font-semibold hover:bg-[#008A16]"
										: ""
								}
              `}
						>
							{getDayOfMonth(date)}
						</button>
					);
				})}
			</div>
		</div>
	);
};
