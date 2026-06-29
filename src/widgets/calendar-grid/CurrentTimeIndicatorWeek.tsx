import { TIME_COLUMN_WIDTH_PX } from "../../shared/config/calendarConstants";
import { convertPxToRem } from "../../shared/lib/units";
import { isCurrentTimeVisible } from "./currentTimeIndicator";
import { useCurrentTimePosition } from "./useCurrentTimePosition";

interface CurrentTimeIndicatorWeekProps {
	isVisible: boolean;
	todayColumnIndex: number;
	totalColumns: number;
}

export const CurrentTimeIndicatorWeek = ({
	isVisible,
	todayColumnIndex,
	totalColumns,
}: CurrentTimeIndicatorWeekProps) => {
	const topPosition = useCurrentTimePosition();

	if (!isVisible) return null;
	if (!isCurrentTimeVisible()) return null;

	const columnWidthPercent = 100 / totalColumns;
	const leftPercent = todayColumnIndex * columnWidthPercent;

	return (
		<div
			className="absolute z-20 pointer-events-none"
			style={{
				top: convertPxToRem(topPosition),
				left: convertPxToRem(TIME_COLUMN_WIDTH_PX),
				width: `calc(100% - ${convertPxToRem(TIME_COLUMN_WIDTH_PX)})`,
			}}
		>
			<div
				className="absolute h-0.5 bg-red-500 shadow-sm flex items-center"
				style={{
					left: `${leftPercent}%`,
					width: `${columnWidthPercent}%`,
				}}
			>
				<div className="absolute left-0 -ml-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
			</div>
		</div>
	);
};
