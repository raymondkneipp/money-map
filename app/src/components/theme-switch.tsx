import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "./ui/label";

type ThemeMode = "light" | "dark";

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "dark";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark") {
		return stored;
	}

	return "dark";
}

function applyThemeMode(mode: ThemeMode) {
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(mode);
	document.documentElement.setAttribute("data-theme", mode);
	document.documentElement.style.colorScheme = mode;
}

export function ThemeSwitch() {
	const [checked, setChecked] = useState<boolean>(true);

	useEffect(() => {
		const initialMode = getInitialMode();
		setChecked(initialMode === "dark");
		applyThemeMode(initialMode);
	}, []);

	function onCheckedChange(next: boolean) {
		setChecked(next);
		const mode: ThemeMode = next ? "dark" : "light";
		applyThemeMode(mode);
		window.localStorage.setItem("theme", mode);
	}

	return (
		<div className="flex items-center justify-between">
			<Label htmlFor="theme-switch">Theme</Label>
			<div className="relative inline-grid h-5 grid-cols-[1fr_1fr] items-center text-sm font-medium">
				<Switch
					id="theme-switch"
					checked={checked}
					onCheckedChange={onCheckedChange}
					className="peer data-[state=unchecked]:bg-input/50 absolute inset-0 data-[size=default]:h-[inherit] data-[size=default]:w-10 [&_span]:z-10 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:group-data-[size=default]/switch:size-4.5 [&_span]:data-[state=checked]:translate-x-5 [&_span]:data-[state=checked]:rtl:-translate-x-5"
					aria-label="Switch with permanent icon indicators"
				/>
				<span className="pointer-events-none relative ml-1 flex min-w-3 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-4.5 peer-data-[state=unchecked]:rtl:-translate-x-4.5">
					<HugeiconsIcon
						icon={Sun01Icon}
						className="size-3.5"
						aria-hidden="true"
						strokeWidth={2}
					/>
				</span>
				<span className="peer-data-[state=checked]:text-primary-foreground pointer-events-none relative flex min-w-3 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
					<HugeiconsIcon
						icon={Moon02Icon}
						className="size-3.5"
						aria-hidden="true"
						strokeWidth={2}
					/>
				</span>
			</div>
		</div>
	);
}
