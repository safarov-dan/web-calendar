import { useState, useEffect, useRef } from "react";
import { Button, Select, DatePicker, Input } from "../../shared/ui";
import { useCalendarsQuery } from "../../entities/calendar";
import { useUserStore } from "../../entities/user";
import type {
	CreateEventRequest,
	RecurrenceRule,
	RecurrenceType,
	UpdateEventRequest,
} from "../../entities/event";
import type { CalendarEvent } from "../../entities/event";
import {
	formatRepeatSummary,
	getNormalizedRecurrence,
} from "../../shared/lib/recurrence";
import {
	combineDateAndTime,
	formatDateDisplay,
	formatDateForInput,
	parseDateInputOrNow,
} from "../../shared/lib/dateParsing";
import { useClickOutside } from "../../shared/lib/useClickOutside";
import { convertPxToRem } from "../../shared/lib/units";
import {
	CALENDAR_END_HOUR,
	CALENDAR_START_HOUR,
	HOURS_PER_HALF_DAY,
	MAX_MINUTE,
	MIDNIGHT_HOUR,
	MIDNIGHT_MINUTE,
	NEXT_DAY_OFFSET,
} from "../../shared/config/calendarConstants";
import {
	addDuration,
	combineDateAndTimeToDate,
	getDayOfMonth,
	getHour,
	getMinute,
	getMonthIndex,
	getWeekdayIndex,
	nowDate,
} from "../../shared/lib/temporal";
import textIcon from "../../assets/text-icon.svg";
import clockIcon from "../../assets/clock-icon.svg";
import calendarIcon from "../../assets/calendar-icon.svg";
import descriptionIcon from "../../assets/description-icon.svg";
import checkboxIcon from "../../assets/checkbox-icon.svg";

interface EventFormProps {
	mode: "create" | "edit";
	event?: CalendarEvent | null;
	defaultDate?: Date | null;
	defaultTime?: { hour: number; minute: number } | null;
	onSubmit: (data: CreateEventRequest | UpdateEventRequest) => void;
	onCancel: () => void;
	onDelete?: () => void;
}

interface EventFormState {
	title: string;
	calendarId: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	isAllDay: boolean;
	recurrence: RecurrenceRule;
	description: string;
}

interface EventFormErrors {
	title?: string;
	calendarId?: string;
	endTime?: string;
}

export const EventForm = ({
	mode,
	event,
	defaultDate,
	defaultTime,
	onSubmit,
}: EventFormProps) => {
	const user = useUserStore((state) => state.user);
	const { data: calendars = [] } = useCalendarsQuery(user?.id || null);
	const datePickerRef = useRef<HTMLDivElement>(null);
	const repeatDropdownRef = useRef<HTMLDivElement>(null);
	const calendarDropdownRef = useRef<HTMLDivElement>(null);

	const [formData, setFormData] = useState<EventFormState>(() => {
		if (mode === "edit" && event) {
			return {
				title: event.title,
				calendarId: event.calendarId,
				startDate: formatDateForInput(event.startDate),
				startTime: formatTimeForInput(event.startDate),
				endDate: formatDateForInput(event.endDate),
				endTime: formatTimeForInput(event.endDate),
				isAllDay: event.isAllDay,
				recurrence: getNormalizedRecurrence(event),
				description: event.description || "",
			};
		}

		const date = defaultDate || nowDate();
		const startHour = defaultTime?.hour ?? getHour(date) + 1;
		const startMinute = defaultTime?.minute ?? 0;
		const startDateTime = combineDateAndTimeToDate(
			formatDateForInput(date),
			`${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
		);
		const endDateTime = addDuration(startDateTime, { hours: 1 });

		return {
			title: "",
			calendarId: calendars[0]?.id || "",
			startDate: formatDateForInput(startDateTime),
			startTime: formatTimeForInput(startDateTime),
			endDate: formatDateForInput(endDateTime),
			endTime: formatTimeForInput(endDateTime),
			isAllDay: false,
			recurrence: { type: "none", interval: 1 },
			description: "",
		};
	});

	const [errors, setErrors] = useState<EventFormErrors>({});
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [isRepeatOpen, setIsRepeatOpen] = useState(false);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const repeatOptions = createRepeatOptions(formData.startDate);
	const repeatLabel = formatRepeatSummary(
		formData.recurrence,
		parseDateInputOrNow(formData.startDate),
	);

	useClickOutside([datePickerRef], () => setShowDatePicker(false), showDatePicker);
	useClickOutside(
		[repeatDropdownRef, calendarDropdownRef],
		() => {
			if (isRepeatOpen) setIsRepeatOpen(false);
			if (isCalendarOpen) setIsCalendarOpen(false);
		},
		isRepeatOpen || isCalendarOpen,
	);

	useEffect(() => {
		if (!formData.calendarId && calendars.length > 0) {
			setFormData((prev) => ({ ...prev, calendarId: calendars[0].id }));
		}
	}, [calendars, formData.calendarId]);

	const validate = (): boolean => {
		const newErrors: EventFormErrors = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!formData.calendarId) {
			newErrors.calendarId = "Please select a calendar";
		}

		if (!formData.isAllDay) {
			const { startDateTime, endDateTime } = getTimedDateRange();

			if (endDateTime <= startDateTime) {
				newErrors.endTime = "End time must be after start time";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const getTimedDateRange = () => {
		const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
		const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

		const isSameDate = formData.startDate === formData.endDate;
		const isMidnightEnd =
			formData.endTime ===
			`${String(MIDNIGHT_HOUR).padStart(2, "0")}:${String(MIDNIGHT_MINUTE).padStart(2, "0")}`;

		if (isSameDate && isMidnightEnd && endDateTime <= startDateTime) {
			return {
				startDateTime,
				endDateTime: addDuration(endDateTime, { days: NEXT_DAY_OFFSET }),
			};
		}

		return { startDateTime, endDateTime };
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validate()) return;

		let startDate: Date;
		let endDate: Date;

		if (formData.isAllDay) {
			startDate = combineDateAndTimeToDate(
				formData.startDate,
				`${String(CALENDAR_START_HOUR).padStart(2, "0")}:00`,
			);
			endDate = addDuration(
				combineDateAndTimeToDate(
					formData.endDate,
					`${String(MIDNIGHT_HOUR).padStart(2, "0")}:${String(MIDNIGHT_MINUTE).padStart(2, "0")}`,
				),
				{ days: NEXT_DAY_OFFSET },
			);
		} else {
			const { startDateTime, endDateTime } = getTimedDateRange();
			startDate = startDateTime;
			endDate = endDateTime;
		}

		const eventData = {
			title: formData.title.trim(),
			calendarId: formData.calendarId,
			startDate,
			endDate,
			isAllDay: formData.isAllDay,
			repeat: formatRepeatSummary(formData.recurrence, startDate),
			recurrence: formData.recurrence,
			description: formData.description.trim() || undefined,
		};

		onSubmit(eventData);
	};

	const formatTimeDisplay = (timeStr: string): string => {
		const [hours, minutes] = timeStr.split(":").map(Number);
		const period = hours >= HOURS_PER_HALF_DAY ? "PM" : "AM";
		const displayHour = (hours % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY)
			.toString()
			.padStart(2, "0");
		return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
	};

	const parseTimeDisplay = (displayTime: string): string => {
		const [timePart = "", periodPart = "AM"] = displayTime.trim().split(/\s+/);
		const [hourStr = `${HOURS_PER_HALF_DAY}`, minuteStr = "00"] = timePart.split(":");
		let hours = Number(hourStr);
		const minutes = Number(minuteStr);
		const period = periodPart.toUpperCase();

		if (period === "PM" && hours !== HOURS_PER_HALF_DAY) hours += HOURS_PER_HALF_DAY;
		if (period === "AM" && hours === HOURS_PER_HALF_DAY) hours = MIDNIGHT_HOUR;

		const safeHours = Number.isFinite(hours)
			? Math.min(Math.max(hours, MIDNIGHT_HOUR), CALENDAR_END_HOUR)
			: MIDNIGHT_HOUR;
		const safeMinutes = Number.isFinite(minutes)
			? Math.min(Math.max(minutes, MIDNIGHT_MINUTE), MAX_MINUTE)
			: MIDNIGHT_MINUTE;

		return `${String(safeHours).padStart(2, "0")}:${String(safeMinutes).padStart(2, "0")}`;
	};

	const selectedCalendar = calendars.find(
		(calendarItem) => calendarItem.id === formData.calendarId,
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Title */}
			<div className="flex items-start gap-3 pb-4 border-b border-gray-200">
				<img
					src={textIcon}
					alt=""
					className="relative top-8 w-3 h-3 flex-shrink-0 text-gray-600"
				/>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
					<Input
						type="text"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
						placeholder="Enter title"
						required
						fullWidth
						error={errors.title}
						className="h-auto px-0 py-0 pb-1 text-base text-gray-900 border-b border-gray-300 focus:border-gray-500"
					/>
				</div>
			</div>

			{/* Date & Time Row */}
			<div className="flex items-start gap-3 pb-4">
				<img
					src={clockIcon}
					alt=""
					className="relative top-6.5 w-3 h-3 mt-1 flex-shrink-0 text-gray-600"
				/>
				<div className="flex-1 flex gap-8">
					{/* Date */}
					<div className="flex-1 relative">
						<label className="block text-xs font-medium text-gray-600 mb-2">Date</label>
						<div
							className="text-base text-gray-900 border-b border-gray-300 pb-1 cursor-pointer"
							onClick={() => setShowDatePicker(!showDatePicker)}
						>
							{formatDateDisplay(formData.startDate)}
						</div>
						{showDatePicker && (
							<div ref={datePickerRef} className="absolute top-12 mt-1 w-full z-30">
								<DatePicker
									value={
										formData.startDate
											? parseDateInputOrNow(formData.startDate)
											: nowDate()
									}
									onChange={(date) => {
										const dateStr = formatDateForInput(date);
										setFormData({ ...formData, startDate: dateStr, endDate: dateStr });
										setShowDatePicker(false);
									}}
								/>
							</div>
						)}
					</div>

					{/* Time */}
					<div className="flex-1">
						<label className="block text-xs font-medium text-gray-600 mb-2">Time</label>
						<div
							className={`flex items-center gap-4 pb-1 ${
								formData.isAllDay ? "opacity-50 pointer-events-none" : ""
							}`}
							aria-disabled={formData.isAllDay}
						>
							<div className="border-b border-gray-300 pb-1">
								<Select
									value={formatTimeDisplay(formData.startTime)}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											startTime: parseTimeDisplay(value),
										}))
									}
								/>
							</div>
							<span className="text-gray-500">–</span>
							<div className="border-b border-gray-300 pb-1">
								<Select
									value={formatTimeDisplay(formData.endTime)}
									onChange={(value) =>
										setFormData((prev) => ({ ...prev, endTime: parseTimeDisplay(value) }))
									}
								/>
							</div>
						</div>
						{!formData.isAllDay && errors.endTime && (
							<p className="text-xs text-red-600 mt-1">{errors.endTime}</p>
						)}
					</div>
				</div>
			</div>

			{/* All day & Repeat Row */}
			<div className="flex items-center gap-3 pb-4 border-b border-gray-200">
				<div className="pl-7 flex-1 flex items-end">
					<div className="relative min-w-[100px] h-[34px] flex items-end border-gray-300">
						<input
							id="all-day-checkbox"
							type="checkbox"
							checked={formData.isAllDay}
							onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
							className="sr-only"
						/>
						<label
							htmlFor="all-day-checkbox"
							className="relative w-full h-full flex items-center pb-1 pl-5 cursor-pointer select-none"
							aria-label="Toggle all day"
						>
							<div
								className="absolute left-0 top-[45%] -translate-y-1/2 w-[12px] h-[12px] rounded-[3px] border border-gray-300 flex items-center justify-center"
								aria-hidden="true"
							>
								{formData.isAllDay && (
									<img src={checkboxIcon} alt="" className="w-[12px] h-[12px]" />
								)}
							</div>
							<span className="text-sm text-gray-700 leading-none">All day</span>
						</label>
					</div>

					<div
						className="relative min-w-[170px] h-[34px] flex items-end"
						ref={repeatDropdownRef}
					>
						<button
							type="button"
							onClick={() => setIsRepeatOpen((prev) => !prev)}
							className="w-full h-full flex items-center justify-between text-sm text-gray-700 border-0 border-b border-gray-300 outline-none pb-1 cursor-pointer bg-transparent"
						>
							<span>{repeatLabel}</span>
							<svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="none">
								<path
									d="M6 8L10 12L14 8"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						{isRepeatOpen && (
							<div
								className="absolute top-[calc(100%+0.25rem)] left-0 min-w-full bg-white border border-gray-300 rounded-lg shadow-md z-30"
								style={{
									boxShadow: `0 ${convertPxToRem(4)} ${convertPxToRem(4)} 0 #0000001A`,
								}}
							>
								{repeatOptions.map((option, index) => (
									<button
										key={option.type}
										type="button"
										onClick={() => {
											setFormData((prev) => ({
												...prev,
												recurrence: createRecurrenceForType(
													option.type,
													parseDateInputOrNow(prev.startDate),
												),
											}));
											setIsRepeatOpen(false);
										}}
										className={`w-full px-4 py-3 text-left text-sm cursor-pointer transition-colors border-0 ${
											option.label === repeatLabel
												? "bg-[#E0E0E0]"
												: "bg-transparent hover:bg-[#F6F6F6]"
										} ${index === 0 ? "rounded-t-lg" : ""} ${index === repeatOptions.length - 1 ? "rounded-b-lg" : ""}`}
									>
										{option.label}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Calendar */}
			<div className="flex items-start gap-3 pb-4 border-b border-gray-200">
				<img
					src={calendarIcon}
					alt=""
					className="relative top-8.5 w-3 h-3 mt-1 flex-shrink-0 text-gray-600"
				/>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1.5">
						Calendar
					</label>
					<div className="relative" ref={calendarDropdownRef}>
						<button
							type="button"
							onClick={() => setIsCalendarOpen((prev) => !prev)}
							className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none bg-white flex items-center justify-between"
						>
							<div className="flex items-center gap-2">
								{selectedCalendar ? (
									<>
										<span
											className="w-2.5 h-2.5 rounded-full flex-shrink-0"
											style={{ backgroundColor: selectedCalendar.color }}
										/>
										<span className="text-gray-700">{selectedCalendar.name}</span>
									</>
								) : (
									<span className="text-gray-400">No calendars</span>
								)}
							</div>
							<svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="none">
								<path
									d="M6 8L10 12L14 8"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						{isCalendarOpen && (
							<div
								className="absolute top-[calc(100%+0.25rem)] left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md z-30"
								style={{
									boxShadow: `0 ${convertPxToRem(4)} ${convertPxToRem(4)} 0 #0000001A`,
								}}
							>
								{calendars.length === 0 ? (
									<div className="px-4 py-3 text-sm text-gray-400">No calendars</div>
								) : (
									calendars.map((calendarItem, index) => (
										<button
											key={calendarItem.id}
											type="button"
											onClick={() => {
												setFormData({ ...formData, calendarId: calendarItem.id });
												setIsCalendarOpen(false);
											}}
											className={`w-full px-4 py-3 text-left text-sm cursor-pointer transition-colors border-0 flex items-center gap-2 ${
												formData.calendarId === calendarItem.id
													? "bg-[#E0E0E0]"
													: "bg-transparent hover:bg-[#F6F6F6]"
											} ${index === 0 ? "rounded-t-lg" : ""} ${index === calendars.length - 1 ? "rounded-b-lg" : ""}`}
										>
											<span
												className="w-2.5 h-2.5 rounded-full flex-shrink-0"
												style={{ backgroundColor: calendarItem.color }}
											/>
											<span className="text-gray-700">{calendarItem.name}</span>
										</button>
									))
								)}
							</div>
						)}
					</div>
					{errors.calendarId && (
						<p className="text-sm text-red-600 mt-1">{errors.calendarId}</p>
					)}
				</div>
			</div>

			{/* Description */}
			<div className="flex items-start gap-3 pb-4">
				<img
					src={descriptionIcon}
					alt=""
					className="relative top-10 w-3 h-3 flex-shrink-0 text-gray-600"
				/>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1.5">
						Description
					</label>
					<Input
						type="text"
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						placeholder="Enter description"
						fullWidth
						className="h-auto px-0 py-0 pb-1 text-base text-gray-900 border-b border-gray-300 focus:border-gray-500"
					/>
				</div>
			</div>

			<div className="flex items-center justify-end pt-2">
				<Button type="submit" value="Save" variant="primary" />
			</div>
		</form>
	);
};

function createRepeatOptions(
	dateStr: string,
): Array<{ type: RecurrenceType; label: string }> {
	const baseDate = parseDateInputOrNow(dateStr);
	return [
		{ type: "none", label: "Does not repeat" },
		{ type: "daily", label: "Daily" },
		{
			type: "weekly",
			label: formatRepeatSummary(createRecurrenceForType("weekly", baseDate), baseDate),
		},
		{ type: "monthly", label: "Monthly" },
		{
			type: "yearly",
			label: formatRepeatSummary(createRecurrenceForType("yearly", baseDate), baseDate),
		},
	];
}

function createRecurrenceForType(type: RecurrenceType, date: Date): RecurrenceRule {
	switch (type) {
		case "daily":
			return { type: "daily", interval: 1 };
		case "weekly":
			return { type: "weekly", interval: 1, weekday: getWeekdayIndex(date) };
		case "monthly":
			return { type: "monthly", interval: 1, monthDay: getDayOfMonth(date) };
		case "yearly":
			return {
				type: "yearly",
				interval: 1,
				month: getMonthIndex(date),
				monthDay: getDayOfMonth(date),
			};
		default:
			return { type: "none", interval: 1 };
	}
}

function formatTimeForInput(date: Date): string {
	return `${String(getHour(date)).padStart(2, "0")}:${String(getMinute(date)).padStart(2, "0")}`;
}
