import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/login";
import { CalendarPage } from "../pages/calendar";
import { useUserStore } from "../entities/user";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useUserStore();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useUserStore();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isAuthenticated) {
		return <Navigate to="/calendar" replace />;
	}

	return <>{children}</>;
}

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<PublicRoute>
				<LoginPage />
			</PublicRoute>
		),
	},
	{
		path: "/calendar",
		element: (
			<ProtectedRoute>
				<CalendarPage />
			</ProtectedRoute>
		),
	},
	{
		path: "*",
		element: <Navigate to="/" replace />,
	},
]);
