const STEP = 360 / 7;

const FALLBACK = {
  essentials: {
    ticker: "ESSENTIALS",
    cadence: "Always on the book",
    status: "awaiting-mint",
    blurb: "The perpetual name. All seven sessions live inside this coin.",
    art: "assets/img/coins/essentials.jpg",
    accent: "#e8c15a"
  },
  days: []
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function statusLabel(status) {
  if (status === "live") return "Live on pump.fun";
  return "Awaiting mint";
}

function escapeAttr(value) {
  return String(value || "").replace(/"/g, "&quot;");
}

function coinImg(item, className, extras = "") {
  return `<img class="${className}" src="${escapeAttr(item.art)}" alt="${escapeAttr(item.ticker)}" width="1024" height="1024" decoding="async" ${extras}>`;
}

function actions(item) {
  const bits = [];
  if (item.pumpUrl) {
    bits.push(`<a class="btn btn-gold" href="${escapeAttr(item.pumpUrl)}" target="_blank" rel="noopener">Open on pump.fun</a>`);
  }
  if (item.xUrl) {
    bits.push(`<a class="btn btn-ghost" href="${escapeAttr(item.xUrl)}" target="_blank" rel="noopener">Open X</a>`);
  }
  return bits.length ? `<div class="card-actions">${bits.join("")}</div>` : "";
}

function dexUrl(item) {
  if (item.dexscreener) return item.dexscreener;
  if (item.mint) return `https://dexscreener.com/solana/${item.mint}`;
  return "";
}

function dexEmbed(url) {
  return `${url}${url.includes("?") ? "&" : "?"}embed=1&theme=dark&trades=1`;
}

function bookItems(essentials, days) {
  return [
    { ...essentials, id: "essentials", role: "vault" },
    ...days.map((day) => ({ ...day, role: "session" }))
  ];
}

function berlinNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
}

function sessionRemain() {
  const now = berlinNow();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const ms = Math.max(0, end - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function renderConstellation(essentials, days, today) {
  const root = $("#constellation");
  if (!root) return;
  const sats = days.map((day, i) => `
    <div class="sat-slot" style="--a:${i * STEP}deg">
      <a class="sat${day.dow === today ? " is-today" : ""}" href="#${day.id}" style="--accent:${day.accent}">
        ${coinImg(day, "")}
      </a>
    </div>
  `).join("");
  root.innerHTML = `
    <a class="sun" href="#essentials">
      ${coinImg(essentials, "")}
    </a>
    <div class="orbit">${sats}</div>
  `;
}

function renderFeature(item) {
  const root = $("#essentials-card");
  if (!root) return;
  root.innerHTML = `
    ${coinImg(item, "medal", `data-zoom="${escapeAttr(item.art)}" data-zoom-alt="${escapeAttr(item.ticker)}"`)}
    <div class="feature-copy">
      <p class="status">${statusLabel(item.status)}</p>
      <h3>${item.ticker}</h3>
      <p class="cadence">${item.cadence}</p>
      <p class="blurb">${item.blurb}</p>
      <p class="mint">${item.mint || "Contract lands here once the mint is confirmed."}</p>
      ${actions(item)}
    </div>
  `;
}

function renderSession(days, today) {
  const root = $("#session-hud");
  if (!root) return;
  const live = days.find((day) => day.dow === today);
  const next = days.find((day) => day.dow === (today + 1) % 7);
  if (!live) return;
  root.innerHTML = `
    <span class="session-hud-live"><i></i> ${live.ticker} session</span>
    <span>${sessionRemain()} left today</span>
    <span>Next · ${next ? next.ticker : "—"}</span>
  `;
}

function renderWeek(days, today) {
  const board = $("#week-board");
  if (!board) return;
  board.innerHTML = days.map((day) => {
    const live = day.dow === today;
    return `
    <article class="coin-card${live ? " is-today" : ""}" id="${day.id}" style="--accent:${day.accent}">
      <span class="now-tag">${live ? `<i class="now-dot"></i> Live session` : ""}</span>
      <div class="medal-wrap">
        <span class="medal-ring" aria-hidden="true"></span>
        ${coinImg(day, "medal", `data-zoom="${escapeAttr(day.art)}" data-zoom-alt="${escapeAttr(day.ticker)}"`)}
      </div>
      <p class="status">${statusLabel(day.status)}</p>
      <h3>${day.ticker}</h3>
      <p class="cadence">${day.cadence}</p>
      <p class="blurb">${day.blurb}</p>
      <p class="trade-note${live ? "" : " trade-note-spacer"}">${live ? "Today’s recommended session. This is the name on the book." : ""}</p>
      ${actions(day)}
    </article>
  `;
  }).join("");
}

function tapeCard(item, today) {
  const url = dexUrl(item);
  const focus = item.role === "session" && item.dow === today;
  const vault = item.role === "vault";
  const tag = focus ? "Today on the book" : vault ? "Always on the book" : item.cadence || "Session";
  const body = url
    ? `<div class="tape-viewport"><iframe title="${escapeAttr(item.ticker)} DexScreener" src="${escapeAttr(dexEmbed(url))}" loading="lazy"></iframe></div>`
    : `<div class="tape-placeholder">
        <img class="eagle eagle-watermark" src="assets/img/eagle.png" alt="">
        ${coinImg(item, "tape-coin")}
        <strong>${item.ticker}</strong>
        <p>DexScreener unlocks when the contract is posted. Then this frame shows who traded, and when.</p>
      </div>`;
  const chrome = url
    ? `<a class="tape-chrome" href="${escapeAttr(url)}" target="_blank" rel="noopener">
        <span><img class="eagle eagle-sm" src="assets/img/eagle.png" alt=""> ${item.ticker}</span>
        <span>Open DexScreener</span>
      </a>`
    : `<div class="tape-chrome">
        <span><img class="eagle eagle-sm" src="assets/img/eagle.png" alt=""> ${item.ticker}</span>
        <span>Tape locked</span>
      </div>`;
  const foot = url
    ? `<div class="tape-open"><a class="btn btn-gold" href="${escapeAttr(url)}" target="_blank" rel="noopener">Open ${item.ticker} on DexScreener</a></div>`
    : "";
  return `
    <article class="tape-card${focus ? " is-focus" : ""}${vault ? " is-vault" : ""}" style="--accent:${item.accent}">
      ${chrome}
      <p class="tape-tag">${tag}</p>
      ${body}
      ${foot}
    </article>
  `;
}

function renderTape(essentials, days, today) {
  const board = $("#tape-board");
  const lead = $("#tape-lead");
  if (!board) return;
  const live = days.find((day) => day.dow === today);
  if (lead && live) {
    lead.textContent = `${live.ticker} is today’s session and sits marked on the tape. All eight names have a DexScreener slot. Contracts light the charts.`;
  }
  const items = bookItems(essentials, days);
  const ordered = [
    ...items.filter((item) => item.role === "session" && item.dow === today),
    ...items.filter((item) => item.role === "vault"),
    ...items.filter((item) => !(item.role === "session" && item.dow === today) && item.role !== "vault")
  ];
  board.innerHTML = ordered.map((item) => tapeCard(item, today)).join("");
}

function renderLedger(essentials, days, today) {
  const root = $("#ledger");
  if (!root) return;
  const rows = bookItems(essentials, days).map((item) => {
    const live = item.role === "session" && item.dow === today;
    const url = dexUrl(item);
    return `
      <div class="ledger-row${live ? " is-live" : ""}">
        ${coinImg(item, "ledger-coin")}
        <div>
          <strong>${item.ticker}</strong>
          <span>${live ? "Live session" : item.cadence || "Vault"}</span>
        </div>
        <span class="ledger-status">${statusLabel(item.status)}</span>
        ${url ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">DexScreener</a>` : `<span>Slot ready</span>`}
      </div>
    `;
  }).join("");
  root.innerHTML = `
    <div class="ledger-head">
      <img class="eagle eagle-sm" src="assets/img/eagle.png" alt="">
      <p>The book · eight names</p>
    </div>
    ${rows}
  `;
}

function renderTicker(days) {
  const track = $("#ticker-track");
  if (!track) return;
  const labels = ["ESSENTIALS continuous", ...days.map((d) => `${d.ticker} desk`)];
  track.innerHTML = `${labels.concat(labels).map((label) => `<span>${label}</span>`).join("")}`;
}

function tickClock() {
  const node = $("#clock");
  if (!node) return;
  const now = new Date();
  node.dateTime = now.toISOString();
  node.textContent = `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit"
  }).format(now)} CET`;
}

function bindZoom() {
  const overlay = $("#zoom");
  const img = $("#zoom-img");
  if (!overlay || !img) return;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-zoom]");
    if (!trigger) return;
    event.preventDefault();
    img.src = trigger.getAttribute("data-zoom");
    img.alt = trigger.getAttribute("data-zoom-alt") || "";
    overlay.hidden = false;
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest("[data-zoom-close]")) {
      overlay.hidden = true;
      img.src = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      overlay.hidden = true;
      img.src = "";
    }
  });
}

async function loadDesk() {
  try {
    const res = await fetch("data/desk.json", { cache: "no-store" });
    if (!res.ok) throw new Error("desk unavailable");
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

async function boot() {
  tickClock();
  setInterval(tickClock, 15000);
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  bindZoom();

  const desk = await loadDesk();
  const essentials = desk.essentials || FALLBACK.essentials;
  const days = Array.isArray(desk.days) ? desk.days : [];
  const today = new Date().getDay();

  renderConstellation(essentials, days, today);
  renderFeature(essentials);
  renderSession(days, today);
  renderWeek(days, today);
  renderTape(essentials, days, today);
  renderLedger(essentials, days, today);
  renderTicker(days);
  setInterval(() => renderSession(days, today), 30000);
}

boot();
