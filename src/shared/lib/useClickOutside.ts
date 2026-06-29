import { useEffect } from "react";
import type { RefObject } from "react";

export function useClickOutside(
	refs: Array<RefObject<HTMLElement | null>>,
	onOutsideClick: () => void,
	enabled: boolean = true,
) {
	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!document.contains(target)) return;

			const isInsideAnyRef = refs.some((ref) => ref.current?.contains(target));
			if (!isInsideAnyRef) {
				onOutsideClick();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [refs, onOutsideClick, enabled]);
}
