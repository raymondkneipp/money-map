import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { NodeEditor } from "#/components/flow/node-editor";
import { NavUser } from "#/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
};

export function SidebarRight({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			collapsible="none"
			className="sticky top-0 hidden h-svh border-l lg:flex"
			{...props}
		>
			<SidebarHeader className="h-16 border-b border-sidebar-border">
				<NavUser user={data.user} />
			</SidebarHeader>
			<SidebarContent>
				<NodeEditor />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
							<span>New Node</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
