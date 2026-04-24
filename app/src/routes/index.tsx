import { createFileRoute } from "@tanstack/react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DemoFlow from "#/components/demo-flow";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
				<div className="flex flex-1 items-center gap-2 px-3">
					<SidebarTrigger />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
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

			<div className="absolute inset-x-0 bottom-0 top-14">
                <DemoFlow />
			</div>
		</div>
	);
}
