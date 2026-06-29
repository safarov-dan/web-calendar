import { GoogleLoginButton } from "../../features/auth";
import logoIcon from "../../assets/logo-icon.svg";

export const LoginPage = () => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="bg-white rounded-2xl shadow-xl p-12 w-full max-w-md">
				<div className="flex items-center justify-center gap-3 mb-8">
					<img src={logoIcon} alt="WebCalendar" className="w-10 h-10" />
					<h1 className="text-2xl font-semibold text-gray-900">WebCalendar</h1>
				</div>

				<GoogleLoginButton />
			</div>
		</div>
	);
};
