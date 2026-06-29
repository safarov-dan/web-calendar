import type { CalendarEvent } from "../types";
import type { EventPosition } from "../../../shared/lib/eventPositioning";
import { formatTime } from "../../../shared/lib/temporal";
import { darkenColor, convertHexToRgba } from "../../../shared/lib/color";
import { convertPxToRem } from "../../../shared/lib/units";

interface EventCardProps {
	event: CalendarEvent;
	position: EventPosition;
	backgroundColor: string;
	onClick?: () => void;
}

export const EventCard = ({
	event,
	position,
	backgroundColor,
	onClick,
}: EventCardProps) => {
	const timeRange = `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`;
	const borderColor = darkenColor(backgroundColor, 40);
	const cardBackgroundColor = convertHexToRgba(backgroundColor, 0.3);

	return (
		<div
			className="absolute rounded px-2 py-1 cursor-pointer transition-all hover:shadow-md overflow-hidden group"
			style={{
				top: convertPxToRem(position.top),
				height: convertPxToRem(position.height),
				left: position.left,
				width: position.width,
				backgroundColor: cardBackgroundColor,
				borderLeft: `${convertPxToRem(3)} solid ${borderColor}`,
				zIndex: position.zIndex,
			}}
			onClick={onClick}
		>
			<div className="flex flex-col h-full">
				<div className="text-xs font-semibold text-gray-800 truncate">{event.title}</div>
				<div className="text-xs text-gray-600 truncate">{timeRange}</div>
			</div>
		</div>
	);
};
