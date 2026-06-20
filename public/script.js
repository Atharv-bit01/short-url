const API_BASE = "";

const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const submitBtn = document.getElementById("submit-btn");
const fieldError = document.getElementById("field-error");
const statusLine = document.getElementById("status-line");

const resultStub = document.getElementById("result-stub");
const shortLinkEl = document.getElementById("short-link");
const originalLinkEl = document.getElementById("original-link");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-qr-btn");
const qrWrap = document.getElementById("qr-canvas-wrap");
const analyticsLink = document.getElementById("analytics-link");

let qrInstance = null;

function showError(message) {
  fieldError.textContent = message;
  fieldError.hidden = false;
}

function clearError() {
  fieldError.hidden = true;
  fieldError.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.querySelector(".btn-text").textContent = isLoading ? "Shortening…" : "Shorten";
}

function renderQR(targetUrl) {
  qrWrap.innerHTML = "";
  qrInstance = new QRCode(qrWrap, {
    text: targetUrl,
    width: 132,
    height: 132,
    colorDark: "#0A0A0A",
    colorLight: "#FAFAF8",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function downloadQR() {
  // qrcodejs renders either an <img> or a <canvas> depending on browser support
  const canvas = qrWrap.querySelector("canvas");
  const img = qrWrap.querySelector("img");

  let dataUrl;
  if (canvas) {
    dataUrl = canvas.toDataURL("image/png");
  } else if (img) {
    dataUrl = img.src;
  } else {
    return;
  }

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "shorty-qr.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function handleSubmit(e) {
  e.preventDefault();
  clearError();
  statusLine.textContent = "";

  const rawUrl = urlInput.value.trim();
  if (!rawUrl) {
    showError("Paste a URL before shortening.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: rawUrl }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Something went wrong on the server.");
    }

    const data = await res.json();
    const shortUrl = data.shortUrl;
    const shortId = shortUrl.split("/").pop();

    shortLinkEl.textContent = shortUrl;
    shortLinkEl.href = shortUrl;
    originalLinkEl.textContent = rawUrl;

    renderQR(shortUrl);
    analyticsLink.href = `analytics.html?id=${encodeURIComponent(shortId)}`;

    resultStub.hidden = false;
    copyBtn.classList.remove("copied");
    copyBtn.textContent = "Copy";
    statusLine.textContent = "";
  } catch (err) {
    showError(err.message || "Couldn't reach the server. Is it running?");
  } finally {
    setLoading(false);
  }
  localStorage.setItem("shorty-last-result", JSON.stringify({
  shortUrl,
  originalUrl: rawUrl,
  shortId
}));
}

async function handleCopy() {
  const text = shortLinkEl.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }, 1600);
  } catch {
    statusLine.textContent = "Couldn't copy automatically — select and copy the link manually.";
  }
}

form.addEventListener("submit", handleSubmit);
copyBtn.addEventListener("click", handleCopy);
downloadBtn.addEventListener("click", downloadQR);
function restoreLastResult() {
  const saved = localStorage.getItem("shorty-last-result");
  if (!saved) return;

  try {
    const { shortUrl, originalUrl, shortId } = JSON.parse(saved);

    shortLinkEl.textContent = shortUrl;
    shortLinkEl.href = shortUrl;
    originalLinkEl.textContent = originalUrl;

    renderQR(shortUrl);
    analyticsLink.href = `analytics.html?id=${encodeURIComponent(shortId)}`;

    resultStub.hidden = false;
  } catch {
    localStorage.removeItem("shorty-last-result");
  }
}

restoreLastResult();