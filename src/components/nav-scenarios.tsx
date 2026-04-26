import {
	Copy01Icon,
	Delete02Icon,
	Edit02Icon,
	MoreHorizontalCircle01Icon,
	PlusSignIcon,
	Tick02Icon,
	WorkflowSquare10Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useFlowState } from "#/components/flow/flow-state";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function NavScenarios() {
	const {
		scenarios,
		activeScenarioId,
		setActiveScenario,
		createScenario,
		renameScenario,
		deleteScenario,
	} = useFlowState();
	const { isMobile } = useSidebar();

	const [renameId, setRenameId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");

	const startRename = (id: string, currentName: string) => {
		setRenameId(id);
		setRenameValue(currentName);
	};

	const submitRename = () => {
		if (renameId) renameScenario(renameId, renameValue);
		setRenameId(null);
	};

	return (
		<>
			<SidebarGroup className="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel>Scenarios</SidebarGroupLabel>
				<SidebarMenu>
					{scenarios.map((s) => {
						const active = s.id === activeScenarioId;
						return (
							<SidebarMenuItem key={s.id}>
								<SidebarMenuButton
									isActive={active}
									onClick={() => setActiveScenario(s.id)}
									title={s.name}
								>
									<HugeiconsIcon
										icon={active ? Tick02Icon : WorkflowSquare10Icon}
										strokeWidth={2}
										className={
											active ? "text-foreground" : "text-muted-foreground"
										}
									/>
									<span className="truncate">{s.name}</span>
								</SidebarMenuButton>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction
											showOnHover
											className="aria-expanded:bg-muted"
										>
											<HugeiconsIcon
												icon={MoreHorizontalCircle01Icon}
												strokeWidth={2}
											/>
											<span className="sr-only">More</span>
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-48 rounded-lg"
										side={isMobile ? "bottom" : "right"}
										align={isMobile ? "end" : "start"}
									>
										<DropdownMenuItem
											onSelect={() => startRename(s.id, s.name)}
										>
											<HugeiconsIcon
												icon={Edit02Icon}
												strokeWidth={2}
												className="text-muted-foreground"
											/>
											<span>Rename</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => createScenario({ fromId: s.id })}
										>
											<HugeiconsIcon
												icon={Copy01Icon}
												strokeWidth={2}
												className="text-muted-foreground"
											/>
											<span>Duplicate</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											disabled={scenarios.length <= 1}
											onSelect={() => deleteScenario(s.id)}
										>
											<HugeiconsIcon
												icon={Delete02Icon}
												strokeWidth={2}
												className="text-muted-foreground"
											/>
											<span>Delete</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						);
					})}
					<SidebarMenuItem>
						<SidebarMenuButton
							className="text-sidebar-foreground/70"
							onClick={() => createScenario()}
						>
							<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
							<span>Add scenario</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<Dialog
				open={renameId !== null}
				onOpenChange={(open) => {
					if (!open) setRenameId(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename scenario</DialogTitle>
						<DialogDescription>
							Give this scenario a new name.
						</DialogDescription>
					</DialogHeader>
					<Input
						autoFocus
						value={renameValue}
						onChange={(e) => setRenameValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								submitRename();
							}
						}}
						placeholder="Scenario name"
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRenameId(null)}>
							Cancel
						</Button>
						<Button onClick={submitRename}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
