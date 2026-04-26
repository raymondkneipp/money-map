import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";

const SITE_URL = "https://moneymap.app";
const SITE_NAME = "Money Map";
const SITE_TITLE = "Money Map — Visualize your finances as a flow chart";
const SITE_DESCRIPTION =
	"Map your income, expenses, assets, and debts as a living flow chart. Run retirement projections, track net worth, and stress-test your financial future.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
			},
			{ title: SITE_TITLE },
			{ name: "description", content: SITE_DESCRIPTION },
			{ name: "application-name", content: SITE_NAME },
			{ name: "apple-mobile-web-app-title", content: SITE_NAME },
			{ name: "theme-color", content: "#5b21b6" },
			{ name: "color-scheme", content: "light dark" },

			// Open Graph
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: SITE_NAME },
			{ property: "og:title", content: SITE_TITLE },
			{ property: "og:description", content: SITE_DESCRIPTION },
			{ property: "og:url", content: SITE_URL },
			{ property: "og:image", content: OG_IMAGE },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },

			// Twitter
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: SITE_TITLE },
			{ name: "twitter:description", content: SITE_DESCRIPTION },
			{ name: "twitter:image", content: OG_IMAGE },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{
				rel: "icon",
				type: "image/png",
				sizes: "192x192",
				href: "/logo192.png",
			},
			{ rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
			{ rel: "canonical", href: SITE_URL },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				{children}
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
