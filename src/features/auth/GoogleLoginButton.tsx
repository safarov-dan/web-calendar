import { useUserStore } from "../../entities/user";
import { useToastStore } from "../../widgets/toast";
import { notifyAndReportError } from "../../shared/lib/error";
import { Button } from "../../shared/ui";
import googleIcon from "../../assets/google-icon.svg";

export const GoogleLoginButton = () => {
	const signInWithGoogle = useUserStore((state) => state.signInWithGoogle);
	const showToast = useToastStore((state) => state.showToast);

	const handleGoogleLogin = async () => {
		try {
			await signInWithGoogle();
		} catch (error) {
			notifyAndReportError(
				showToast,
				"Failed to login with Google",
				error,
				"Login failed:",
			);
		}
	};

	return (
		<Button
			type="button"
			onClick={handleGoogleLogin}
			value="Continue with Google"
			variant="secondary-icon"
			iconSrc={googleIcon}
			iconAlt="Google"
			fullWidth
		/>
	);
};
