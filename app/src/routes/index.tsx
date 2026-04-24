import { createFileRoute } from "@tanstack/react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flow } from "#/components/flow";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<>
			<header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background/50 backdrop-blur-sm z-10">
				<div className="flex flex-1 items-center gap-2 px-3">
					<SidebarTrigger />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4 mt-1"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage className="line-clamp-1">
									Project Management & Task Tracking
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="absolute inset-x-0 bottom-0 top-0">
				<Flow />
			</div>
		</>
	);
}
