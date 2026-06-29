import { useEffect, useState } from "react";
import { CURRENT_TIME_UPDATE_INTERVAL_MS } from "../../shared/config/calendarConstants";
import { calculateCurrentTimePosition } from "./currentTimeIndicator";

export function useCurrentTimePosition(): number {
	const [topPosition, setTopPosition] = useState(calculateCurrentTimePosition());

	useEffect(() => {
		const updatePosition = () => {
			setTopPosition(calculateCurrentTimePosition());
		};

		const interval = setInterval(updatePosition, CURRENT_TIME_UPDATE_INTERVAL_MS);
		updatePosition();

		return () => clearInterval(interval);
	}, []);

	return topPosition;
}
