// Regenerate Money Map favicons + PWA icons from a single SVG source.
// Run with: pnpm icons
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");

// Brand purple, matches --primary in styles.css
const BRAND = "#5b21b6";

// Master SVG: rounded purple tile + a stylized "money flow" mark
// (one source node feeding two destination nodes via curved connectors).
// 256-unit viewBox so paths read crisply down to 16px.
const MASTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" ry="56" fill="${BRAND}"/>
  <!-- Connectors: source -> two destinations -->
  <path d="M 128 86 C 128 130, 78 130, 78 178" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.95"/>
  <path d="M 128 86 C 128 130, 178 130, 178 178" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.95"/>
  <!-- Source node (top center) -->
  <rect x="98" y="46" width="60" height="44" rx="12" ry="12" fill="#fff"/>
  <!-- Destination nodes (bottom left + right) -->
  <rect x="44"  y="166" width="68" height="48" rx="12" ry="12" fill="#fff"/>
  <rect x="144" y="166" width="68" height="48" rx="12" ry="12" fill="#fff"/>
</svg>
`;

// Maskable variant — same mark but with extra padding for Android safe zone.
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${BRAND}"/>
  <g transform="translate(38 38) scale(0.703)">
    <path d="M 128 86 C 128 130, 78 130, 78 178" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.95"/>
    <path d="M 128 86 C 128 130, 178 130, 178 178" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.95"/>
    <rect x="98" y="46" width="60" height="44" rx="12" ry="12" fill="#fff"/>
    <rect x="44"  y="166" width="68" height="48" rx="12" ry="12" fill="#fff"/>
    <rect x="144" y="166" width="68" height="48" rx="12" ry="12" fill="#fff"/>
  </g>
</svg>
`;

async function renderPng(svg, size, outPath) {
	const buf = await sharp(Buffer.from(svg))
		.resize(size, size)
		.png({ compressionLevel: 9 })
		.toBuffer();
	await writeFile(outPath, buf);
	return buf;
}

async function main() {
	await mkdir(PUBLIC, { recursive: true });

	// 1. Source SVG (modern browsers prefer this — crisp at every density)
	await writeFile(resolve(PUBLIC, "favicon.svg"), MASTER_SVG);

	// 2. PWA icons + apple touch icon
	const png192 = await renderPng(MASTER_SVG, 192, resolve(PUBLIC, "logo192.png"));
	await renderPng(MASTER_SVG, 512, resolve(PUBLIC, "logo512.png"));
	await renderPng(
		MASTER_SVG,
		180,
		resolve(PUBLIC, "apple-touch-icon.png"),
	);

	// 3. Maskable PWA icon (Android adaptive)
	await renderPng(
		MASKABLE_SVG,
		512,
		resolve(PUBLIC, "logo512-maskable.png"),
	);

	// 4. Multi-size .ico (16, 32, 48) — sharp can't write .ico, so use png-to-ico
	const ico16 = await sharp(Buffer.from(MASTER_SVG)).resize(16, 16).png().toBuffer();
	const ico32 = await sharp(Buffer.from(MASTER_SVG)).resize(32, 32).png().toBuffer();
	const ico48 = await sharp(Buffer.from(MASTER_SVG)).resize(48, 48).png().toBuffer();
	const icoBuf = await pngToIco([ico16, ico32, ico48]);
	await writeFile(resolve(PUBLIC, "favicon.ico"), icoBuf);

	// 5. OG image — 1200x630 with the mark + wordmark
	const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f0a3d"/>
      <stop offset="100%" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(120 195) scale(0.94)">
    <rect width="240" height="240" rx="52" ry="52" fill="#fff" opacity="0.08"/>
    <g transform="translate(0 0)">
      <path d="M 120 80 C 120 122, 73 122, 73 167" stroke="#fff" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M 120 80 C 120 122, 167 122, 167 167" stroke="#fff" stroke-width="13" stroke-linecap="round" fill="none"/>
      <rect x="92"  y="42"  width="56" height="42" rx="11" ry="11" fill="#fff"/>
      <rect x="41"  y="156" width="64" height="46" rx="11" ry="11" fill="#fff"/>
      <rect x="135" y="156" width="64" height="46" rx="11" ry="11" fill="#fff"/>
    </g>
  </g>
  <g transform="translate(420 250)" fill="#fff" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif">
    <text font-size="92" font-weight="700" letter-spacing="-2">Money Map</text>
    <text y="68" font-size="32" opacity="0.85">Visualize your finances as a flow chart.</text>
  </g>
</svg>
`;
	await renderPng(OG_SVG, 1200, resolve(PUBLIC, "og-image.png"));
	// sharp resize above forces square; redo at correct dims
	await sharp(Buffer.from(OG_SVG))
		.resize(1200, 630)
		.png({ compressionLevel: 9 })
		.toFile(resolve(PUBLIC, "og-image.png"));

	console.log("✓ favicons regenerated in /public");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
