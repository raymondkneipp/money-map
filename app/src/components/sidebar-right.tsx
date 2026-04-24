import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import type * as React from "react";
import { DeleteSelected } from "#/components/flow/delete-selected";
import { NodeEditor } from "#/components/flow/node-editor";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "#/components/ui/sidebar";
import { useIsMobile } from "#/hooks/use-mobile";

export function SidebarRight(props: React.ComponentProps<typeof Sidebar>) {
	const nodes = useNodes();
	const edges = useEdges();
	const { setNodes, setEdges } = useReactFlow();
	const isMobile = useIsMobile();

	const hasSelection =
		nodes.some((n) => n.selected) || edges.some((e) => e.selected);

	const deselect = () => {
		setNodes((ns) =>
			ns.map((n) => (n.selected ? { ...n, selected: false } : n)),
		);
		setEdges((es) =>
			es.map((e) => (e.selected ? { ...e, selected: false } : e)),
		);
	};

	if (isMobile) {
		return (
			<Sheet
				open={hasSelection}
				onOpenChange={(open) => {
					if (!open) deselect();
				}}
			>
				<SheetContent side="right" className="w-(--sidebar-width) p-0">
					<SheetHeader className="sr-only">
						<SheetTitle>Editor</SheetTitle>
						<SheetDescription>Edit the selected node or edge.</SheetDescription>
					</SheetHeader>
					<div className="flex h-full flex-col">
						<div className="flex-1 overflow-auto">
							<NodeEditor />
						</div>
						<div className="border-t p-2">
							<DeleteSelected />
						</div>
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	if (!hasSelection) return null;

	return (
		<Sidebar
			collapsible="none"
			className="sticky top-0 hidden h-svh border-l lg:flex"
			{...props}
		>
			<SidebarContent>
				<NodeEditor />
			</SidebarContent>
			<SidebarFooter>
				<DeleteSelected />
			</SidebarFooter>
		</Sidebar>
	);
}
