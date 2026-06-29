import { useUserStore } from "../model";

interface UserAvatarProps {
	size?: "sm" | "md" | "lg";
}

const sizeClasses = {
	sm: "w-8 h-8 text-sm",
	md: "w-10 h-10 text-base",
	lg: "w-12 h-12 text-lg",
};

export const UserAvatar = ({ size = "md" }: UserAvatarProps) => {
	const user = useUserStore((state) => state.user);

	if (!user) return null;

	const initial = (user.displayName || user.email || "U")[0].toUpperCase();

	return (
		<div
			className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center text-white font-semibold`}
		>
			{initial}
		</div>
	);
};
