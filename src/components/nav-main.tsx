import { Link } from "@tanstack/react-router";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: React.ReactNode;
	}[];
}) {
	const { isMobile, setOpenMobile } = useSidebar();
	const closeOnMobile = () => {
		if (isMobile) setOpenMobile(false);
	};
	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton asChild>
						<Link
							to={item.url}
							activeProps={{ className: "bg-muted" }}
							activeOptions={{ exact: true }}
							onClick={closeOnMobile}
						>
							{item.icon}
							<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}
