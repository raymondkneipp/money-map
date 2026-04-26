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

// This is sample data.
const data = {
	navMain: [
		{
			title: "Home",
			url: "/",
			icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
		},
		{
			title: "Stats",
			url: "/stats",
			icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
		},
		{
			title: "Projections",
			url: "/projections",
			icon: <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} />,
		},
	],
	navSecondary: [
		{
			title: "Calendar",
			url: "#",
			icon: <HugeiconsIcon icon={CalendarIcon} strokeWidth={2} />,
		},
		{
			title: "Settings",
			url: "#",
			icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
		},
		{
			title: "Templates",
			url: "#",
			icon: <HugeiconsIcon icon={CubeIcon} strokeWidth={2} />,
		},
		{
			title: "Trash",
			url: "#",
			icon: <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />,
		},
		{
			title: "Help",
			url: "#",
			icon: <HugeiconsIcon icon={MessageQuestionIcon} strokeWidth={2} />,
		},
	],
	favorites: [
		{
			name: "Project Management & Task Tracking",
			url: "#",
			emoji: "📊",
		},
		{
			name: "Family Recipe Collection & Meal Planning",
			url: "#",
			emoji: "🍳",
		},
		{
			name: "Fitness Tracker & Workout Routines",
			url: "#",
			emoji: "💪",
		},
		{
			name: "Book Notes & Reading List",
			url: "#",
			emoji: "📚",
		},
		{
			name: "Sustainable Gardening Tips & Plant Care",
			url: "#",
			emoji: "🌱",
		},
		{
			name: "Language Learning Progress & Resources",
			url: "#",
			emoji: "🗣️",
		},
		{
			name: "Home Renovation Ideas & Budget Tracker",
			url: "#",
			emoji: "🏠",
		},
		{
			name: "Personal Finance & Investment Portfolio",
			url: "#",
			emoji: "💰",
		},
		{
			name: "Movie & TV Show Watchlist with Reviews",
			url: "#",
			emoji: "🎬",
		},
		{
			name: "Daily Habit Tracker & Goal Setting",
			url: "#",
			emoji: "✅",
		},
	],
	workspaces: [
		{
			name: "Personal Life Management",
			emoji: "🏠",
			pages: [
				{
					name: "Daily Journal & Reflection",
					url: "#",
					emoji: "📔",
				},
				{
					name: "Health & Wellness Tracker",
					url: "#",
					emoji: "🍏",
				},
				{
					name: "Personal Growth & Learning Goals",
					url: "#",
					emoji: "🌟",
				},
			],
		},
		{
			name: "Professional Development",
			emoji: "💼",
			pages: [
				{
					name: "Career Objectives & Milestones",
					url: "#",
					emoji: "🎯",
				},
				{
					name: "Skill Acquisition & Training Log",
					url: "#",
					emoji: "🧠",
				},
				{
					name: "Networking Contacts & Events",
					url: "#",
					emoji: "🤝",
				},
			],
		},
		{
			name: "Creative Projects",
			emoji: "🎨",
			pages: [
				{
					name: "Writing Ideas & Story Outlines",
					url: "#",
					emoji: "✍️",
				},
				{
					name: "Art & Design Portfolio",
					url: "#",
					emoji: "🖼️",
				},
				{
					name: "Music Composition & Practice Log",
					url: "#",
					emoji: "🎵",
				},
			],
		},
		{
			name: "Home Management",
			emoji: "🏡",
			pages: [
				{
					name: "Household Budget & Expense Tracking",
					url: "#",
					emoji: "💰",
				},
				{
					name: "Home Maintenance Schedule & Tasks",
					url: "#",
					emoji: "🔧",
				},
				{
					name: "Family Calendar & Event Planning",
					url: "#",
					emoji: "📅",
				},
			],
		},
		{
			name: "Travel & Adventure",
			emoji: "🧳",
			pages: [
				{
					name: "Trip Planning & Itineraries",
					url: "#",
					emoji: "🗺️",
				},
				{
					name: "Travel Bucket List & Inspiration",
					url: "#",
					emoji: "🌎",
				},
				{
					name: "Travel Journal & Photo Gallery",
					url: "#",
					emoji: "📸",
				},
			],
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
