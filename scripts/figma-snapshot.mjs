// Exporta PNGs das telas do Figma para docs/screens/ (usado no README).
// Uso: FIGMA_TOKEN=... npm run snapshot
import { writeFile, mkdir } from "node:fs/promises";

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY || "T00OQ9bu7XArjEOzYAA5xP";
if (!token) { console.error("Defina FIGMA_TOKEN (Figma → Settings → Security → Personal access tokens)."); process.exit(1); }

const screens = {
  "01-login": "4:2",
  "02-entrando": "9:124",
  "03-painel": "4:29",
  "04-painel-registro-salvo": "10:401",
  "05-overlay-recuperar-senha": "9:68",
  "06-overlay-email-enviado": "9:34",
  "07-overlay-novo-registro": "10:299",
};
const ids = Object.values(screens).join(",");
const res = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=1`, { headers: { "X-Figma-Token": token } });
if (!res.ok) { console.error(`Figma respondeu ${res.status}: ${await res.text()}`); process.exit(1); }
const { images } = await res.json();
const dir = new URL("../docs/screens/", import.meta.url);
await mkdir(dir, { recursive: true });
for (const [name, id] of Object.entries(screens)) {
  if (!images[id]) { console.warn(`! sem imagem para ${name} (${id})`); continue; }
  const png = Buffer.from(await (await fetch(images[id])).arrayBuffer());
  await writeFile(new URL(`${name}.png`, dir), png);
  console.log(`✔ docs/screens/${name}.png`);
}
