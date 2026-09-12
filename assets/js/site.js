const DAYS = [
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
  { id: 0, label: "Sun", full: "Sunday" }
];

const FALLBACK = {
  weekvault: {
    ticker: "WEEKVAULT",
    name: "Weekvault",
    cadence: "Continuous",
    status: "awaiting-mint",
    blurb: "The desk name that stays on the book. Always quoted. Always watched. The tape does not close.",
    mint: "",
    pumpUrl: "",
    xUrl: ""
  },
  week: {
    ticker: "",
    name: "",
    cadence: "Monday — Sunday",
    status: "awaiting-mint",
    blurb: "One name owns the week. Seven sessions. Then the book turns.",
    mint: "",
    pumpUrl: "",
    xUrl: ""
  },
  board: []
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function setText(name, value) {
  const node = document.querySelector(`[data-field="${name}"]`);
  if (node && value) node.textContent = value;
}

function statusLabel(status) {
  if (status === "live") return "Live on pump.fun";
  if (status === "awaiting-mint") return "Awaiting mint";
  return "Awaiting assignment";
}

function actions(node, item) {
  if (!node) return;
  node.innerHTML = "";
  if (item.pumpUrl) {
    const a = document.createElement("a");
    a.className = "btn btn-gold";
    a.href = item.pumpUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Open on pump.fun";
    node.appendChild(a);
  }
  if (item.xUrl) {
    const a = document.createElement("a");
    a.className = "btn btn-ghost";
    a.href = item.xUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Open X";
    node.appendChild(a);
  }
}

function fillNamed(prefix, item, emptyTitle) {
  const live = item.status === "live" && item.ticker;
  const title = live || item.ticker ? item.ticker : emptyTitle;
  setText(`${prefix}-status`, statusLabel(item.status));
  setText(`${prefix}-mini-status`, statusLabel(item.status));
  setText(`${prefix}-ticker`, title);
  setText(`${prefix}-mini-ticker`, title);
  setText(`${prefix}-cadence`, item.cadence);
  setText(`${prefix}-blurb`, item.blurb);
  setText(`${prefix}-mint`, item.mint ? item.mint : (prefix === "vault"
    ? "Contract lands here once the mint is confirmed."
    : "Ticker, mint and pump.fun link will be posted here."));
  actions(document.querySelector(`[data-field="${prefix}-actions"]`), item);
}

function renderRail() {
  const rail = $("#week-rail");
  if (!rail) return;
  const today = new Date().getDay();
  rail.innerHTML = DAYS.map((day) => `
    <div class="day${day.id === today ? " is-today" : ""}">
      <strong>${day.label}</strong>
      <span>${day.id === today ? "Now" : "·"}</span>
    </div>
  `).join("");
}

function renderBoard(items) {
  const grid = $("#board-grid");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `
      <div class="board-empty">
        <strong>Slots open</strong>
        Further pump.fun names will appear here when the desk lists them. Nothing is posted early.
      </div>
    `;
    return;
  }
  grid.innerHTML = items.map((item) => `
    <article class="board-card">
      <p class="status">${statusLabel(item.status)}</p>
      <h3>${item.ticker || item.name || "Untitled"}</h3>
      <p class="cadence">${item.cadence || "Listed"}</p>
      <p class="blurb">${item.blurb || ""}</p>
      ${item.mint ? `<p class="mint">${item.mint}</p>` : ""}
      <div class="card-actions">
        ${item.pumpUrl ? `<a class="btn btn-gold" href="${item.pumpUrl}" target="_blank" rel="noopener">pump.fun</a>` : ""}
        ${item.xUrl ? `<a class="btn btn-ghost" href="${item.xUrl}" target="_blank" rel="noopener">X</a>` : ""}
      </div>
    </article>
  `).join("");
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
  renderRail();
  const desk = await loadDesk();
  fillNamed("vault", desk.weekvault || FALLBACK.weekvault, "WEEKVAULT");
  fillNamed("week", desk.week || FALLBACK.week, "The week coin");
  renderBoard(Array.isArray(desk.board) ? desk.board : []);
}

boot();
