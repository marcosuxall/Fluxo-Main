/* Nexo — protótipo navegável.
 * Lê design/tokens.json e design/content.json (os mesmos arquivos que o plugin
 * "Nexo Sync" sincroniza com o Figma) e reproduz o fluxo do protótipo.
 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const state = { content: null, period: "30d", notifRead: false, saved: [], toastTimer: null };

  // ---------- dados ----------
  async function load() {
    try {
      const [tokens, content] = await Promise.all(
        ["../design/tokens.json", "../design/content.json"].map((u) => fetch(u, { cache: "no-store" }).then((r) => {
          if (!r.ok) throw new Error(u);
          return r.json();
        }))
      );
      applyTokens(tokens);
      state.content = content;
      render();
    } catch (err) {
      console.error(err);
      $("#loadError").hidden = false;
    }
  }

  function applyTokens(tokens) {
    const root = document.documentElement.style;
    Object.entries(tokens.color || {}).forEach(([k, v]) => root.setProperty(`--${k}`, v));
    const r = tokens.radius || {};
    if (r.control) root.setProperty("--r-control", r.control + "px");
    if (r.card) root.setProperty("--r-card", r.card + "px");
    if (r.dialog) root.setProperty("--r-dialog", r.dialog + "px");
  }

  function render() {
    const c = state.content;
    $$("[data-k]").forEach((el) => { const v = get(c, el.dataset.k); if (typeof v === "string") el.textContent = v; });
    renderCards(false);
    renderRows();
    $("#notifList").innerHTML = (c.notifications || []).map((n) =>
      `<li><span class="unread"></span><div><strong>${esc(n.title)}</strong><small>${esc(n.time)}</small></div></li>`).join("");
    const nr = get(c, "table.newRow") || {};
    $("#fCliente").value = nr.Cliente || "";
    $("#fValor").value = nr.Valor || "";
  }

  function renderCards(animate = true) {
    const list = get(state.content, `metrics.${state.period}`) || [];
    const box = $("#cards");
    box.innerHTML = list.map((m) =>
      `<article class="card"><span class="label">${esc(m.Label)}</span><strong class="value">${esc(m.Valor)}</strong><span class="delta">${esc(m["Variação"])}</span></article>`).join("");
    if (animate) { box.classList.remove("is-swapping"); void box.offsetWidth; box.classList.add("is-swapping"); }
    $$(".segmented button").forEach((b) => {
      const on = b.dataset.period === state.period;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
  }

  function renderRows(newIndex = -1) {
    const rows = [...state.saved, ...(get(state.content, "table.rows") || [])];
    $("#rows").innerHTML = rows.map((r, i) => {
      const cls = String(r.Status).toLowerCase() === "pago" ? "pill-pago" : "pill-pendente";
      return `<div class="row${i === newIndex ? " row-new" : ""}"><span class="client">${esc(r.Cliente)}</span><span class="pill ${cls}">${esc(r.Status)}</span><span class="value">${esc(r.Valor)}</span><span class="chev" aria-hidden="true">›</span></div>`;
    }).join("");
  }

  // ---------- navegação ----------
  function go(id) {
    const next = document.getElementById(id);
    const current = $(".screen.is-active");
    if (current === next) return;
    closeMenus();
    if (current) { current.classList.remove("is-visible"); setTimeout(() => current.classList.remove("is-active"), 200); }
    setTimeout(() => { next.classList.add("is-active"); requestAnimationFrame(() => next.classList.add("is-visible")); }, current ? 200 : 0);
    history.replaceState(null, "", "#" + id);
  }

  // ---------- overlays ----------
  let lastFocus = null;
  function openOverlay(id) {
    const ov = document.getElementById(id);
    lastFocus = document.activeElement;
    closeMenus();
    ov.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("is-open")));
    setTimeout(() => { const f = ov.querySelector("input, button:not([data-close])"); if (f) f.focus(); }, 60);
  }
  function closeOverlay(ov, restore = true) {
    if (!ov || ov.hidden) return;
    ov.classList.remove("is-open");
    setTimeout(() => { ov.hidden = true; }, 380);
    if (restore && lastFocus) lastFocus.focus();
  }
  const openOverlayEl = () => $$(".overlay").find((o) => !o.hidden);

  // ---------- menus ----------
  function toggleMenu(btn, menu, force) {
    const open = force !== undefined ? force : menu.hidden;
    closeMenus();
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open);
  }
  function closeMenus() {
    [["#bellBtn", "#bellMenu"], ["#userBtn", "#userMenu"]].forEach(([b, m]) => { $(m).hidden = true; $(b).setAttribute("aria-expanded", "false"); });
  }

  // ---------- toast ----------
  function showToast() {
    const t = $("#toast");
    clearTimeout(state.toastTimer);
    t.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("is-open")));
    state.toastTimer = setTimeout(hideToast, 3000);
  }
  function hideToast() {
    const t = $("#toast");
    t.classList.remove("is-open");
    setTimeout(() => { t.hidden = true; }, 320);
  }

  function logout() {
    state.notifRead = false; state.saved = [];
    $("#painel").classList.remove("is-read");
    renderRows(); closeMenus(); hideToast();
    go("login");
  }

  // ---------- eventos ----------
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $("#enterBtn");
    btn.classList.add("is-loading");
    $(".btn-label", btn).textContent = "Entrando…";
    setTimeout(() => {
      go("painel");
      setTimeout(() => { btn.classList.remove("is-loading"); $(".btn-label", btn).textContent = "Entrar"; }, 500);
    }, 1600);
  });
  $("#forgotBtn").addEventListener("click", () => openOverlay("ovRecover"));
  $("#sendLink").addEventListener("click", () => { closeOverlay($("#ovRecover"), false); setTimeout(() => openOverlay("ovSent"), 200); });

  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close]");
    if (closer) closeOverlay(closer.closest(".overlay"));
    if (e.target.closest("[data-logout]")) logout();
    if (!e.target.closest(".popover-wrap")) closeMenus();
  });

  $$(".segmented button").forEach((b) => b.addEventListener("click", () => { state.period = b.dataset.period; renderCards(); }));
  $$(".nav-item").forEach((b) => b.addEventListener("click", () => { $$(".nav-item").forEach((x) => x.classList.toggle("is-active", x === b)); }));

  $("#bellBtn").addEventListener("click", () => toggleMenu($("#bellBtn"), $("#bellMenu")));
  $("#userBtn").addEventListener("click", () => toggleMenu($("#userBtn"), $("#userMenu")));
  $("#markRead").addEventListener("click", () => { state.notifRead = true; $("#painel").classList.add("is-read"); setTimeout(closeMenus, 250); });

  $("#newBtn").addEventListener("click", () => openOverlay("ovNew"));
  $("#newForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.saved.unshift({ Cliente: fd.get("Cliente") || "Novo cliente", Status: fd.get("Status"), Valor: fd.get("Valor") || "R$ 0,00" });
    closeOverlay($("#ovNew"));
    setTimeout(() => { renderRows(0); showToast(); }, 250);
  });
  $(".toast-x").addEventListener("click", hideToast);

  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === "Escape") {
      const ov = openOverlayEl();
      if (ov) closeOverlay(ov); else closeMenus();
    }
    if ((e.key === "n" || e.key === "N") && !typing && !e.metaKey && !e.ctrlKey && $("#painel").classList.contains("is-active") && !openOverlayEl()) {
      e.preventDefault(); openOverlay("ovNew");
    }
  });

  // tela inicial (respeita #painel no link)
  const start = location.hash === "#painel" ? "painel" : "login";
  $$(".screen").forEach((s) => s.classList.remove("is-active", "is-visible"));
  go(start);
  load();
})();
