import { createFileRoute } from "@tanstack/react-router";
import { Flow } from "#/components/flow";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<>
			<SidebarTrigger
				variant="secondary"
				size="icon-lg"
				className="sticky top-4 left-0 ml-4 z-10"
			/>

			<div className="absolute inset-x-0 bottom-0 top-0">
				<Flow />
			</div>
		</>
	);
}
