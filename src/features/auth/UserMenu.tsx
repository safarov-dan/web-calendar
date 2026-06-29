import { useState, useRef } from "react";
import { UserAvatar } from "../../entities/user";
import { useUserStore } from "../../entities/user";
import { useToastStore } from "../../widgets/toast";
import { useClickOutside } from "../../shared/lib/useClickOutside";
import { notifyAndReportError } from "../../shared/lib/error";
import { convertPxToRem } from "../../shared/lib/units";
import logoutIcon from "../../assets/log-out-icon.svg";

export const UserMenu = () => {
	const { user, signOut } = useUserStore();
	const showToast = useToastStore((state) => state.showToast);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	if (!user) return null;

	useClickOutside([dropdownRef], () => setIsOpen(false), isOpen);

	const handleLogout = async () => {
		try {
			await signOut();
			showToast("Logged out");
		} catch (error) {
			notifyAndReportError(showToast, "Failed to logout", error, "Logout failed:");
		}
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Username and Avatar Button */}
			<button
				onClick={toggleDropdown}
				className="flex items-center gap-3 hover:opacity-80 transition-opacity"
			>
				<span className="text-sm font-medium text-gray-700">
					{user.displayName || user.email?.split("@")[0] || "User"}
				</span>
				<UserAvatar size="md" />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className="absolute top-[calc(100%+0.5rem)] right-0 min-w-[200px] bg-white border border-gray-300 rounded-lg shadow-lg z-50"
					style={{
						boxShadow: `0 ${convertPxToRem(4)} ${convertPxToRem(12)} 0 rgba(0, 0, 0, 0.15)`,
					}}
				>
					<button
						onClick={handleLogout}
						className="w-full flex items-center gap-3 px-4 py-3 text-left text-base text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
					>
						<img src={logoutIcon} alt="" className="w-4 h-4" />
						Logout
					</button>
				</div>
			)}
		</div>
	);
};
