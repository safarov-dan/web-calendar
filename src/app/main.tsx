import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./providers";
import { useUserStore } from "../entities/user";
import "../index.css";
import App from "./App";

function AppWithAuth() {
	const initializeAuth = useUserStore((state) => state.initializeAuth);

	useEffect(() => {
		const unsubscribe = initializeAuth();
		return unsubscribe;
	}, [initializeAuth]);

	return <App />;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryProvider>
			<AppWithAuth />
		</QueryProvider>
	</StrictMode>,
);
