import { useCurrentTimePosition } from "./useCurrentTimePosition";
import { isCurrentTimeVisible } from "./currentTimeIndicator";
import { convertPxToRem } from "../../shared/lib/units";

interface CurrentTimeIndicatorDayProps {
	isVisible: boolean;
}

export const CurrentTimeIndicatorDay = ({ isVisible }: CurrentTimeIndicatorDayProps) => {
	const topPosition = useCurrentTimePosition();

	if (!isVisible) return null;
	if (!isCurrentTimeVisible()) return null;

	return (
		<div
			className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
			style={{ top: convertPxToRem(topPosition) }}
		>
			<div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
			<div className="flex-1 h-0.5 bg-red-500 shadow-sm" />
		</div>
	);
};
