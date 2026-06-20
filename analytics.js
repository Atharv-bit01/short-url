const API_BASE = "http://localhost:8001";

const loadingEl = document.getElementById("analytics-loading");
const noIdEl = document.getElementById("analytics-no-id");
const errorEl = document.getElementById("analytics-error");
const errorMsgEl = document.getElementById("analytics-error-msg");
const contentEl = document.getElementById("analytics-content");

const shortLinkEl = document.getElementById("analytics-short-link");
const totalClicksEl = document.getElementById("total-clicks");
const ticketRollEl = document.getElementById("ticket-roll");
const ticketListEl = document.getElementById("ticket-list");
const emptyLogEl = document.getElementById("analytics-empty-log");

function showOnly(el) {
  [loadingEl, noIdEl, errorEl, contentEl].forEach((node) => {
    node.hidden = node !== el;
  });
}

function formatTimestamp(ms) {
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderTicket(entry, index, total) {
  const li = document.createElement("li");
  li.className = "ticket-row";

  const num = document.createElement("span");
  num.className = "ticket-number";
  // Most recent first, numbered by recency
  num.textContent = String(total - index).padStart(2, "0");

  const time = document.createElement("span");
  time.className = "ticket-time";
  time.textContent = formatTimestamp(entry.timestamp);

  li.appendChild(num);
  li.appendChild(time);
  return li;
}

async function loadAnalytics() {
  const params = new URLSearchParams(window.location.search);
  const shortId = params.get("id");

  if (!shortId) {
    showOnly(noIdEl);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/url/analytics/${encodeURIComponent(shortId)}`);

    if (!res.ok) {
      throw new Error("not-found");
    }

    const data = await res.json();
    const visits = Array.isArray(data.analytics) ? data.analytics : [];

    const shortUrl = `${API_BASE}/${shortId}`;
    shortLinkEl.textContent = shortUrl;
    shortLinkEl.href = shortUrl;

    totalClicksEl.textContent = data.totalClicks ?? visits.length;

    if (visits.length === 0) {
      ticketRollEl.hidden = true;
      emptyLogEl.hidden = false;
    } else {
      ticketRollEl.hidden = false;
      emptyLogEl.hidden = true;

      // Most recent visit first
      const sorted = [...visits].sort((a, b) => b.timestamp - a.timestamp);
      ticketListEl.innerHTML = "";
      sorted.forEach((entry, i) => {
        ticketListEl.appendChild(renderTicket(entry, i, sorted.length));
      });
    }

    showOnly(contentEl);
  } catch (err) {
    errorMsgEl.textContent =
      "It may have been mistyped, doesn't exist, or the server isn't reachable right now.";
    showOnly(errorEl);
  }
}

loadAnalytics();
