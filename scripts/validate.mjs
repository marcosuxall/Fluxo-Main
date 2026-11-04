// Confere se os JSONs de design estão completos antes de publicar.
import { readFile } from "node:fs/promises";
const read = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url)));
const errors = [];
const tokens = await read("design/tokens.json");
const content = await read("design/content.json");

const requiredColors = ["primary", "primary-hover", "primary-soft", "text", "text-muted", "border", "surface", "background", "success", "warning", "danger"];
for (const c of requiredColors) {
  const v = tokens.color?.[c];
  if (!v) errors.push(`tokens.color.${c} está faltando`);
  else if (!/^#[0-9A-Fa-f]{6}$/.test(v)) errors.push(`tokens.color.${c} = "${v}" não é um hex #RRGGBB`);
}
for (const p of ["hoje", "7d", "30d"]) {
  const list = content.metrics?.[p];
  if (!Array.isArray(list) || list.length !== 3) errors.push(`content.metrics.${p} precisa ter 3 cards`);
  else list.forEach((m, i) => ["Label", "Valor", "Variação"].forEach((k) => { if (!m[k]) errors.push(`content.metrics.${p}.${i}.${k} vazio`); }));
}
(content.table?.rows || []).forEach((r, i) => {
  if (!["Pago", "Pendente"].includes(r.Status)) errors.push(`content.table.rows.${i}.Status deve ser "Pago" ou "Pendente"`);
});
if ((content.table?.rows || []).length !== 4) errors.push("content.table.rows precisa ter 4 linhas (o Figma tem 4)");
if ((content.notifications || []).length !== 3) errors.push("content.notifications precisa ter 3 itens (o Figma tem 3)");

if (errors.length) { console.error("✖ Problemas encontrados:\n  - " + errors.join("\n  - ")); process.exit(1); }
console.log("✔ design/tokens.json e design/content.json estão válidos");
