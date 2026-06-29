export function reportError(error: unknown, context: string): void {
	console.error(context, error);
}

export function notifyAndReportError(
	showToast: (message: string) => void,
	toastMessage: string,
	error: unknown,
	context: string,
): void {
	showToast(toastMessage);
	reportError(error, context);
}
