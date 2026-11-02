<img width="1969" height="788" alt="_home_sahi_Downloads_salesez_marquee_promo_tile_1400x560 html" src="https://github.com/user-attachments/assets/0da46687-9cbc-4f05-bbe7-108e7c6245e5" />
# SalesEZ: LinkedIn Sales Navigator Scraper & Lead Extractor

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Privacy: 100% Local-First](https://img.shields.io/badge/Privacy-100%25_Local--First-brightgreen)
![Chrome / Chromium / Brave / Helium / FireFox](https://img.shields.io/badge/Browser-Chrome%20%7C%20Chromium%20%7C%20Brave%20%7C%20Helium-orange)

---

## 🚀 Overview

**SalesEZ** is a free, local-first Chrome extension that extracts and scrubs **LinkedIn Sales Navigator** leads directly into **Google Sheets** or **CSV** in a single click.

Built for **founders, SDRs, B2B marketers, and recruiters**, SalesEZ eliminates the need for expensive cloud scrapers ($49–$99/mo) and manual copy-pasting. Run any people search on LinkedIn Sales Navigator, set your target lead count, and let SalesEZ automatically paginate and scrub your lead list **100% locally inside your browser**—zero external servers, zero tracking.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **1-Click Export to Google Sheets** | Click "Copy Leads & Open Sheets" → `sheets.new` opens instantly → press **Ctrl+V** to paste your clean lead table. |
| **Instant UTF-8 CSV Download** | Excel- and LibreOffice-ready CSV with full UTF-8 BOM support for international characters. |
| **Built-In Lead Data Scrubber** | Every row is auto-cleaned before export: |
| | • Strips emojis, symbols, and pronouns (`he/him`, `she/her`, `they/them`) from names |
| | • Smart Title Case: converts ALL-CAPS names to clean Title Case while **preserving professional acronyms** (`CEO`, `CTO`, `VP`, `MBA`, `PhD`, `CPA`, etc.) |
| | • Strips legal suffixes from company names (`Inc.`, `LLC`, `Ltd.`, `GmbH`, `Corp.`, `Pvt. Ltd.`) for natural cold-email personalization |
| **Clean 6-Column Output** | `Name` · `Job Title` · `Company` · `Company URL` · `Location` · `Profile URL` |
| **Human-Paced Pagination** | Randomized 8–15s delays between pages with automatic MV3 Service Worker resume for reliable multi-page extractions. |
| **Exact Target Lead Cap** | Set your exact target (1–5,000). Scraper stops precisely when your target is reached. |
| **Minimalist Live Preview** | Watch leads populate in real time inside a sleek dark-mode monospace table with sticky `[id] [name] [title]` header. |

---

## 🔒 100% Local-First Privacy & Security

- **Zero External Servers** — All extraction and data scrubbing happen entirely inside your browser on your machine.
- **No Shared API Keys or Cloud Proxies** — SalesEZ uses your active browser session locally. Your LinkedIn cookies and prospect lists are **never uploaded, tracked, or shared** with any third party.
- **Manifest V3 Service Worker** — Runs entirely in the browser's extension context with no background pages.

---

## 📦 Output Columns

| Column | Description |
|--------|-------------|
| `Name` | Cleaned prospect full name (emoji/pronoun-free, smart Title Case) |
| `Job Title` | Current role/title at the company |
| `Company` | Cleaned company name (legal suffixes stripped) |
| `Company URL` | Direct link to LinkedIn Sales Company page |
| `Location` | Geographic region / city / country |
| `Profile URL` | Direct link to LinkedIn Sales Lead profile |

---

## 🚀 How to Use

1. **Install** SalesEZ from the [Chrome Web Store](https://chromewebstore.google.com/detail/aeippbgnjijhobaaanfbfhhjjppjbdlk) (or load unpacked in Developer Mode — see below).
2. Open **LinkedIn Sales Navigator** and run any **People search**.
3. Click the **SalesEZ** icon in your browser toolbar.
4. Set your **Target Results** (1–5,000 leads).
5. Click **Extract Leads** and watch the live preview populate.
5. Click **Copy Leads & Open Sheets** (then press **Ctrl+V**) **or** click **Download CSV File**.

---

## 🛠 Installation

### Option A: Chrome Web Store (Recommended)

1. Visit the [SalesEZ listing](https://chromewebstore.google.com/detail/aeippbgnjijhobaaanfbfhhjjppjbdlk) (or search "SalesEZ LinkedIn Sales Navigator Scraper").
2. Click **Add to Chrome** → **Add extension**.

### Option B: Developer Mode (Unpacked)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/sahil-exz/SalesEZ-LinkedIn-Sales-Navigator-Scraper.git
   ```
2. Open Chrome/Chromium/Brave/Helium and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the project folder.
4. Pin the **SalesEZ** extension to your toolbar.

---

## 📋 Requirements

- Chrome 88+, Chromium 88+, Brave, or Helium (Manifest V3 support)
- Active LinkedIn Sales Navigator subscription
- Active LinkedIn session (cookies used locally only)

---

## 🛡 Privacy by Design

- **No analytics, no telemetry, no tracking pixels.**
- Your LinkedIn session cookies are read locally via `chrome.cookies` API and never leave your browser.
- All lead data stays in `chrome.storage.local` until you export it.
- The extension does **not** inject scripts into LinkedIn pages — it uses `chrome.scripting.executeScript` in `MAIN` world only for the brief fetch replay.

---

## 🤝 Contributing

Issues and PRs welcome! Please open an issue first to discuss proposed changes.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the frustration of overpriced cloud scrapers.
- Built with Manifest V3, `chrome.scripting`, `chrome.cookies`, and `chrome.storage.local`.
- Thanks to the open-source community for tools that make local-first apps possible.

---

**Star ⭐ this repo if SalesEZ saves you hours of manual lead extraction!**
