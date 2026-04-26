import {
	Analytics01Icon,
	CalendarIcon,
	ChartUpIcon,
	CubeIcon,
	Delete02Icon,
	HomeIcon,
	MessageQuestionIcon,
	Settings05Icon,
	WorkflowSquare10Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type * as React from "react";
import { NavMain } from "#/components/nav-main";
import { NavScenarios } from "#/components/nav-scenarios";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";
import { ThemeSwitch } from "./theme-switch";

const data = {
	navMain: [
		{
			title: "Home",
			url: "/app",
			icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
		},
		{
			title: "Stats",
			url: "/app/stats",
			icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
		},
		{
			title: "Projections",
			url: "/app/projections",
			icon: <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />,
		},
	],
};

export function SidebarLeft({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader>
				<Link to="/" className="flex items-center gap-2 p-2">
					<div className="flex items-center justify-center bg-primary text-primary-foreground rounded-lg size-8">
						<HugeiconsIcon icon={WorkflowSquare10Icon} className="size-6" />
					</div>
					<span className="font-heading font-medium">Money Map</span>
				</Link>
				<NavMain items={data.navMain} />
			</SidebarHeader>
			<SidebarContent>
				<NavScenarios />
			</SidebarContent>
			<SidebarRail />

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className="px-2 py-1">
						<ThemeSwitch />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
