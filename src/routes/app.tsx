import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowStateProvider } from "#/components/flow/flow-state";
import { PreventPageZoom } from "#/components/prevent-page-zoom";
import { TooltipProvider } from "#/components/ui/tooltip";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/app")({
	component: AppLayout,
	head: () => ({
		meta: [{ title: "Money Map — Flow" }],
	}),
});

function AppLayout() {
	return (
		<TooltipProvider>
			<PreventPageZoom />
			<ReactFlowProvider>
				<FlowStateProvider>
					<SidebarProvider>
						<SidebarLeft />
						<SidebarInset>
							<Outlet />
						</SidebarInset>
						<SidebarRight />
					</SidebarProvider>
				</FlowStateProvider>
			</ReactFlowProvider>
		</TooltipProvider>
	);
}
