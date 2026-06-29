import { Dropdown } from "../../shared/ui";
import { useCalendarStore } from "../../entities/calendar";

export const ViewSwitcher = () => {
	const { viewMode, setViewMode } = useCalendarStore();

	const currentLabel = viewMode === "day" ? "Day" : "Week";

	const handleChange = (value: string) => {
		setViewMode(value.toLowerCase() as "day" | "week");
	};

	return (
		<Dropdown value={currentLabel} items={["Day", "Week"]} onChange={handleChange} />
	);
};
