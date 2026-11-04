// Nexo Sync — sincroniza o arquivo do Figma com o repositório do GitHub.
//
// Puxar (GitHub → Figma):
//   • design/tokens.json  → variáveis da coleção "Tokens" (color/<nome>)
//   • design/content.json → camadas cujo nome começa com "#" (ex.: "#login.title")
//       - camada de TEXTO     recebe a string do caminho
//       - INSTÂNCIA           recebe um objeto { Propriedade: valor } (texto ou variante)
// Enviar (Figma → GitHub): o caminho inverso, gerando os mesmos dois arquivos.

figma.showUI(__html__, { width: 380, height: 560, themeColors: true });

const COLLECTION = "Tokens";
const PREFIX = "color/";

function insideInstance(node) {
  let p = node.parent;
  while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; }
  return false;
}
function getPath(obj, path) {
  return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
}
function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i], nextIsIndex = /^\d+$/.test(keys[i + 1]);
    if (o[k] == null || typeof o[k] !== "object") o[k] = nextIsIndex ? [] : {};
    o = o[k];
  }
  o[keys[keys.length - 1]] = value;
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
}
function rgbToHex(c) {
  const to = function (v) { return Math.round(v * 255).toString(16).padStart(2, "0"); };
  return ("#" + to(c.r) + to(c.g) + to(c.b)).toUpperCase();
}

async function contentNodes() {
  const out = [];
  for (const page of figma.root.children) {
    await page.loadAsync();
    const found = page.findAll(function (n) { return n.name.charAt(0) === "#" && (n.type === "TEXT" || n.type === "INSTANCE"); });
    for (const n of found) if (!insideInstance(n)) out.push(n);
  }
  return out;
}
async function loadFontsIn(node) {
  const texts = node.type === "TEXT" ? [node] : node.findAll(function (n) { return n.type === "TEXT"; });
  for (const t of texts) {
    if (t.fontName !== figma.mixed) await figma.loadFontAsync(t.fontName);
    else for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName);
  }
}
function propKey(defs, name) {
  return Object.keys(defs).find(function (k) { return k === name || k.indexOf(name + "#") === 0; });
}

async function tokensCollection(create) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let col = cols.find(function (c) { return c.name === COLLECTION; });
  if (!col && create) col = figma.variables.createVariableCollection(COLLECTION);
  return col;
}

// ---------- GitHub → Figma ----------
async function applyTokens(tokens) {
  const col = await tokensCollection(true);
  const mode = col.defaultModeId;
  const vars = (await figma.variables.getLocalVariablesAsync("COLOR")).filter(function (v) { return v.variableCollectionId === col.id; });
  let changed = 0, created = 0;
  for (const name of Object.keys(tokens.color || {})) {
    const value = hexToRgb(tokens.color[name]);
    let v = vars.find(function (x) { return x.name === PREFIX + name; });
    if (!v) { v = figma.variables.createVariable(PREFIX + name, col, "COLOR"); v.scopes = ["ALL_FILLS", "STROKE_COLOR"]; created++; }
    const cur = v.valuesByMode[mode];
    if (!cur || rgbToHex(cur) !== rgbToHex(value)) { v.setValueForMode(mode, value); changed++; }
  }
  return { changed: changed, created: created };
}
async function applyContent(content) {
  const nodes = await contentNodes();
  let changed = 0; const missing = [];
  for (const n of nodes) {
    const key = n.name.slice(1);
    const val = getPath(content, key);
    if (val === undefined) { missing.push(key); continue; }
    if (n.type === "TEXT" && typeof val === "string") {
      if (n.characters !== val) { await loadFontsIn(n); n.characters = val; changed++; }
    } else if (n.type === "INSTANCE" && val && typeof val === "object") {
      const defs = n.componentProperties, upd = {};
      for (const p of Object.keys(val)) {
        const k = propKey(defs, p);
        if (k && defs[k].value !== val[p]) upd[k] = String(val[p]);
      }
      if (Object.keys(upd).length) { await loadFontsIn(n); n.setProperties(upd); changed++; }
    }
  }
  return { changed: changed, missing: Array.from(new Set(missing)) };
}

// ---------- Figma → GitHub ----------
async function collect(baseTokens, baseContent) {
  const tokens = JSON.parse(JSON.stringify(baseTokens || {}));
  tokens.color = tokens.color || {};
  const col = await tokensCollection(false);
  if (col) {
    const vars = (await figma.variables.getLocalVariablesAsync("COLOR")).filter(function (v) { return v.variableCollectionId === col.id && v.name.indexOf(PREFIX) === 0; });
    for (const v of vars) {
      const val = v.valuesByMode[col.defaultModeId];
      if (val && typeof val === "object" && "r" in val) tokens.color[v.name.slice(PREFIX.length)] = rgbToHex(val);
    }
  }
  const content = JSON.parse(JSON.stringify(baseContent || {}));
  const seen = {};
  for (const n of await contentNodes()) {
    const key = n.name.slice(1);
    if (seen[key]) continue; seen[key] = true;
    if (n.type === "TEXT") setPath(content, key, n.characters);
    else {
      const defs = n.componentProperties, prev = getPath(content, key) || {}, obj = {};
      for (const k of Object.keys(defs)) {
        const base = k.split("#")[0];
        if (defs[k].type === "TEXT" || defs[k].type === "VARIANT") {
          if (Object.keys(prev).length === 0 || base in prev) obj[base] = defs[k].value;
        }
      }
      setPath(content, key, Object.assign({}, prev, obj));
    }
  }
  return { tokens: tokens, content: content };
}

figma.ui.onmessage = async function (msg) {
  try {
    if (msg.type === "load-settings") {
      figma.ui.postMessage({ type: "settings", settings: (await figma.clientStorage.getAsync("nexo-sync")) || {} });
    } else if (msg.type === "save-settings") {
      await figma.clientStorage.setAsync("nexo-sync", msg.settings);
    } else if (msg.type === "apply") {
      const t = await applyTokens(msg.tokens);
      const c = await applyContent(msg.content);
      figma.ui.postMessage({ type: "applied", tokens: t, content: c });
    } else if (msg.type === "collect") {
      figma.ui.postMessage({ type: "collected", data: await collect(msg.tokens, msg.content) });
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: String(e && e.message ? e.message : e) });
  }
};
