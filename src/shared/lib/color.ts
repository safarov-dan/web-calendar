export function convertHexToRgba(hex: string, alpha: number): string {
	if (!hex.startsWith("#")) return hex;
	const normalized = hex.slice(1);
	const fullHex =
		normalized.length === 3
			? normalized
					.split("")
					.map((char) => char + char)
					.join("")
			: normalized;
	const num = parseInt(fullHex, 16);
	const r = (num >> 16) & 255;
	const g = (num >> 8) & 255;
	const b = num & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenColor(hex: string, percent: number = 20): string {
	const num = parseInt(hex.replace("#", ""), 16);
	const r = Math.max(0, (num >> 16) - percent);
	const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
	const b = Math.max(0, (num & 0x0000ff) - percent);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
