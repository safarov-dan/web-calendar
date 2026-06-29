import { ViewSwitcher } from "../../features/view-switcher";
import { UserMenu } from "../../features/auth";
import { useCalendarStore } from "../../entities/calendar";
import { Button } from "../../shared/ui";
import { formatMonthYear } from "../../shared/lib/temporal";
import logoIcon from "../../assets/logo-icon.svg";

export const CalendarHeader = () => {
	const { currentDate, goToToday, goToNextPeriod, goToPreviousPeriod } =
		useCalendarStore();

	const monthYear = formatMonthYear(currentDate);

	return (
		<header className="bg-white border-b border-gray-200 px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-3">
						<img src={logoIcon} alt="WebCalendar" className="w-8 h-8" />
						<h1 className="text-xl font-semibold text-gray-900">WebCalendar</h1>
					</div>

					<Button type="button" onClick={goToToday} value="Today" variant="primary" />

					<div className="flex items-center gap-4">
						<button
							onClick={goToPreviousPeriod}
							className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							aria-label="Previous period"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								className="text-gray-600"
							>
								<path
									d="M12.5 15L7.5 10L12.5 5"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						<span className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">
							{monthYear}
						</span>

						<button
							onClick={goToNextPeriod}
							className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							aria-label="Next period"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								className="text-gray-600"
							>
								<path
									d="M7.5 15L12.5 10L7.5 5"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<ViewSwitcher />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};
