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

function renderConstellation(essentials, days, today) {
  const root = $("#constellation");
  if (!root) return;
  const sats = days.map((day, i) => `
    <div class="sat-slot" style="--a:${i * STEP}deg">
      <a class="sat${day.dow === today ? " is-today" : ""}" href="#${day.id}" style="--accent:${day.accent}">
        <img src="${escapeAttr(day.art)}" alt="${escapeAttr(day.ticker)}">
      </a>
    </div>
  `).join("");
  root.innerHTML = `
    <a class="sun" href="#essentials">
      <img src="${escapeAttr(essentials.art)}" alt="${escapeAttr(essentials.ticker)}">
    </a>
    <div class="orbit">${sats}</div>
  `;
}

function renderFeature(item) {
  const root = $("#essentials-card");
  if (!root) return;
  root.innerHTML = `
    <img class="medal" src="${escapeAttr(item.art)}" alt="${escapeAttr(item.ticker)}" data-zoom="${escapeAttr(item.art)}" data-zoom-alt="${escapeAttr(item.ticker)}">
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

function renderWeek(days, today) {
  const grid = $("#week-grid");
  if (!grid) return;
  grid.innerHTML = days.map((day) => `
    <article class="coin-card${day.dow === today ? " is-today" : ""}" id="${day.id}" style="--accent:${day.accent}">
      ${day.dow === today ? `<span class="now-tag">Now on the tape</span>` : ""}
      <img class="medal" src="${escapeAttr(day.art)}" alt="${escapeAttr(day.ticker)}" data-zoom="${escapeAttr(day.art)}" data-zoom-alt="${escapeAttr(day.ticker)}">
      <p class="status">${statusLabel(day.status)}</p>
      <h3>${day.ticker}</h3>
      <p class="cadence">${day.cadence}</p>
      <p class="blurb">${day.blurb}</p>
      ${day.mint ? `<p class="mint">${day.mint}</p>` : ""}
      ${actions(day)}
    </article>
  `).join("");
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
  renderWeek(days, today);
  renderTicker(days);
}

boot();
