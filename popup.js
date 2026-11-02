let currentTabId = null;
let refreshTimer = null;
let cachedLeads = [];

const $ = (id) => document.getElementById(id);

const STATUS_LABELS = { running: 'Running', complete: 'Complete', stopped: 'Stopped', error: 'Error', idle: 'Idle' };

function cleanText(str) {
  if (!str) return '';
  return String(str).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(str) {
  return String(str === undefined || str === null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statusLabel(state) {
  if (!state) return 'Idle';
  return STATUS_LABELS[state.status] || state.status || 'Idle';
}

function setStatus(text, color) {
  const box = $('status');
  box.style.display = 'block';
  box.style.color = color || '';
  box.innerText = text;
}

function send(msg) {
  return chrome.runtime.sendMessage(msg).catch(() => null);
}

async function loadLeads() {
  if (currentTabId == null) return [];
  const key = 'sn_leads_' + currentTabId;
  const res = await chrome.storage.local.get(key);
  return res[key] || [];
}

function renderStatusCard(state, count) {
  $('statRows').innerText = String(count);
  const chip = $('statStatus');
  if (state && state.status === 'running') {
    chip.innerText = `${statusLabel(state)} (${count}/${state.targetCount || '?'})`;
    chip.style.color = '#38bdf8';
  } else if (state && state.status === 'error') {
    chip.innerText = 'Error';
    chip.style.color = '#f87171';
  } else if (state && state.status === 'complete') {
    chip.innerText = 'Complete';
    chip.style.color = '#10b981';
  } else if (state && state.status === 'stopped') {
    chip.innerText = 'Stopped';
    chip.style.color = '#fbbf24';
  } else {
    chip.innerText = 'Ready';
    chip.style.color = '#10b981';
  }
}

function applyBadge(state, count, onSalesNav) {
  const badge = $('statusBadge');
  const track = $('progressTrack');
  const fill = $('progressFill');
  const pct = (c, t) => (t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0);

  if (!onSalesNav || !state || !state.status) {
    badge.textContent = 'READY';
    badge.className = 'status-badge';
    track.style.display = 'none';
    return;
  }

  switch (state.status) {
    case 'running':
      badge.textContent = 'SCRAPING';
      badge.className = 'status-badge status-scraping';
      track.style.display = 'block';
      fill.style.width = pct(count, state.targetCount) + '%';
      fill.classList.add('animate');
      break;
    case 'complete':
      badge.textContent = 'COMPLETE';
      badge.className = 'status-badge status-complete';
      track.style.display = 'block';
      fill.style.width = '100%';
      fill.classList.remove('animate');
      break;
    case 'error':
      badge.textContent = 'ERROR';
      badge.className = 'status-badge status-error';
      track.style.display = 'block';
      fill.style.width = pct(count, state.targetCount) + '%';
      fill.classList.remove('animate');
      break;
    case 'stopped':
      badge.textContent = 'STOPPED';
      badge.className = 'status-badge status-stopped';
      track.style.display = 'block';
      fill.style.width = pct(count, state.targetCount) + '%';
      fill.classList.remove('animate');
      break;
    default:
      badge.textContent = 'READY';
      badge.className = 'status-badge';
      track.style.display = 'none';
  }
}

function renderPreview(leads) {
  const container = $('preview-container');
  const countEl = $('previewCount');
  if (!leads.length) {
    container.style.display = 'none';
    if (countEl) countEl.textContent = 'Latest leads';
    return;
  }
  container.style.display = 'block';
  if (countEl) countEl.textContent = `${leads.length} captured`;
  const scrubbed = typeof scrubLeads === 'function' ? scrubLeads(leads) : leads;
  const maxPreview = 50;
  const head = scrubbed.slice(0, maxPreview);
  const headerHtml = `
    <div class="preview-table-head">
      <span>[id]</span>
      <span>[name]</span>
      <span>[title]</span>
    </div>`;
  const rowsHtml = head
    .map((l, i) => {
      const idStr = String(i + 1).padStart(3, '0');
      const nameStr = escapeHtml(cleanText(l.name || ''));
      const titleCompany = escapeHtml(
        [cleanText(l.jobTitle || ''), cleanText(l.company || '')].filter(Boolean).join(', ')
      );
      return `
      <div class="lead-row">
        <span class="col-id">${idStr}</span>
        <span class="col-name">${nameStr}</span>
        <span class="col-title">${titleCompany}</span>
      </div>`;
    })
    .join('');
  const remainder =
    scrubbed.length > maxPreview
      ? `<div class="lead-row"><span class="meta">…and ${scrubbed.length - maxPreview} more in export</span></div>`
      : '';
  $('preview').innerHTML = headerHtml + rowsHtml + remainder;
}

function setRunningUI(isRunning) {
  $('extractBtn').disabled = isRunning;
  $('stopBtn').style.display = isRunning ? 'block' : 'none';
}

async function render(state, count, onSalesNav) {
  const isRunning = state && state.status === 'running';
  setRunningUI(isRunning);
  renderStatusCard(state, count);
  applyBadge(state, count, onSalesNav);

  if (!onSalesNav) {
    $('progressTrack').style.display = 'none';
    $('statsBar').style.display = 'none';
    $('preview-container').style.display = 'none';
    $('copyTsvBtn').style.display = 'none';
    $('sheetsBtn').style.display = 'none';
    $('csvBtn').style.display = 'none';
    $('stopBtn').style.display = 'none';
    $('extractBtn').disabled = true;
    cachedLeads = [];
    setStatus('Open a LinkedIn Sales Navigator search page to scrape leads.');
    return;
  }

  $('statsBar').style.display = 'grid';

  $('extractBtn').disabled = isRunning;

  const leads = await loadLeads();
  cachedLeads = leads;
  renderPreview(leads);

  const showExport = leads.length > 0 && !isRunning;
  $('copyTsvBtn').style.display = showExport ? 'flex' : 'none';
  $('sheetsBtn').style.display = showExport ? 'flex' : 'none';
  $('csvBtn').style.display = showExport ? 'flex' : 'none';

  if (isRunning) {
    const page = state.pages ? ` (page ${state.pages + 1})` : '';
    setStatus(`Scraping — ${count}/${state.targetCount} leads${page}. Pacing 8–15s per page.`);
  } else if (state && state.status === 'complete') {
    setStatus(`Done — ${count} leads captured. Ready to export.`, '#10b981');
  } else if (state && state.status === 'stopped') {
    setStatus('Scrape stopped.');
  } else if (state && state.status === 'error') {
    setStatus(state.error || 'Something went wrong.', '#f87171');
  } else {
    setStatus('Ready. Set a target and hit Extract Leads.');
  }
}

async function loadState() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    setStatus('No active tab.');
    return;
  }
  currentTabId = tab.id;
  const resp = await send({ type: 'GET_STATUS', tabId: tab.id, url: tab.url });
  if (!resp || !resp.ok) {
    setStatus((resp && resp.error) || 'Failed to load state.', '#f87171');
    return;
  }
  await render(resp.state, resp.count, resp.isSalesNav === true);
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(loadState, 300);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'SCRAPE_PROGRESS') {
    scheduleRefresh();
  }
});

$('extractBtn').addEventListener('click', async () => {
  const raw = parseInt($('targetInput').value, 10);
  const target = Math.max(1, Math.min(5000, raw || 50));
  $('targetInput').value = target;
  setStatus(`Starting scrape (target ${target})…`);
  const resp = await send({ type: 'START_SCRAPE', tabId: currentTabId, targetCount: target, maxPages: 0 });
  if (!resp || !resp.ok) {
    setStatus((resp && resp.error) || 'Unable to start scrape.', '#f87171');
  } else {
    await loadState();
  }
});

$('stopBtn').addEventListener('click', async () => {
  setStatus('Stopping…');
  await send({ type: 'STOP_SCRAPE', tabId: currentTabId });
  await loadState();
});

const SHEET_HEADERS = LEAD_HEADERS;

const sheetsBtnElement = document.getElementById("sheetsBtn");

if (sheetsBtnElement) {
  sheetsBtnElement.addEventListener("click", async () => {
    try {
      await chrome.storage.local.set({
        autosaveInterest: true,
        autosaveInterestAt: Date.now()
      });

      setStatus(
        "Auto-Save is coming soon. Thanks for your interest!",
        "#10b981"
      );
    } catch (error) {
      console.error(
        "Failed to record Auto-Save interest:",
        error
      );

      setStatus(
        "Auto-Save is coming soon. Thanks for your interest!"
      );
    }
  });
}

async function tsvExport() {
  const leads = cachedLeads.length ? cachedLeads : await loadLeads();
  if (!leads.length) {
    setStatus('No leads to export yet.');
    return;
  }
  const scrubbed = scrubLeads(leads);
  const clean = (v) =>
    sanitizeSpreadsheetCell(cleanText(v)).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');

  let tsv = SHEET_HEADERS.join('\t') + '\n';
  scrubbed.forEach((l) => {
    tsv +=
      [l.name, l.jobTitle, l.company, l.companyUrl, l.location, l.profileUrl].map(clean).join('\t') + '\n';
  });

  try {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(tsv);
        copied = true;
      } catch (_) {}
    }
    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = tsv;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (!copied) {
      setStatus('Clipboard copy failed. Try again.', '#ff5b5b');
      return;
    }
    setStatus('Leads copied! Opening Google Sheets…', '#10b981');
    await new Promise((r) => setTimeout(r, 120));
    await chrome.tabs.create({ url: 'https://sheets.new' });
  } catch (err) {
    setStatus('Clipboard copy failed: ' + (err && err.message ? err.message : err), '#ff5b5b');
  }
}

$('copyTsvBtn').addEventListener('click', tsvExport);

$('csvBtn').addEventListener('click', async () => {
  const leads = cachedLeads.length ? cachedLeads : await loadLeads();
  if (!leads.length) return;
  const scrubbed = scrubLeads(leads);
  const quote = (v) =>
    '"' + sanitizeSpreadsheetCell(cleanText(v)).replace(/"/g, '""') + '"';
  let csv = '\uFEFF' + SHEET_HEADERS.map(quote).join(',') + '\r\n';
  scrubbed.forEach((l) => {
    csv += [l.name, l.jobTitle, l.company, l.companyUrl, l.location, l.profileUrl].map(quote).join(',') + '\r\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SalesNavigator_Leads_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

loadState();
