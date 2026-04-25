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

	const selectedCount =
		nodes.filter((n) => n.selected).length +
		edges.filter((e) => e.selected).length;
	const hasSingleSelection = selectedCount === 1;

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
				open={hasSingleSelection}
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

	return (
		<div
			data-state={hasSingleSelection ? "open" : "closed"}
			aria-hidden={!hasSingleSelection}
			className="sticky top-0 hidden h-svh w-0 overflow-hidden transition-[width] duration-200 ease-in-out data-[state=open]:w-(--sidebar-width) data-[state=open]:border-l lg:block"
		>
			<Sidebar
				collapsible="none"
				className="h-svh w-(--sidebar-width)"
				{...props}
			>
				<SidebarContent>
					<NodeEditor />
				</SidebarContent>
				<SidebarFooter>
					<DeleteSelected />
				</SidebarFooter>
			</Sidebar>
		</div>
	);
}
