# Server-Side Result Collection (Google Apps Script + Google Sheet)

This guide sets up automatic server-side saving of rater results. You'll only need to do this once — takes about 5 minutes.

Once set up, every time a rater finishes the evaluation, their results are automatically appended to a Google Sheet that **only you** can see. Raters never see the sheet, never need to download anything, and never need to email you a file. A local CSV is still downloaded as a backup.

---

## Step 1 — Create a Google Sheet

1. Go to https://sheets.google.com and create a new blank sheet.
2. Rename it to something like `FAC Eval Results 2026`.
3. Copy the sheet's URL for reference (you won't paste it anywhere — it's just so you can find it later).

---

## Step 2 — Open the script editor attached to the sheet

1. In the sheet, click `Extensions` → `Apps Script`.
2. A new tab opens with a code editor titled `Untitled project`.
3. Rename the project to `FAC Eval Backend`.
4. Delete any boilerplate code inside `Code.gs`.
5. Paste the entire block below into `Code.gs`:

```javascript
// FAC Eval — Google Apps Script backend
// Receives a POST from the evaluation page and appends one row to the
// spreadsheet that this script is bound to.

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Ensure header rows exist on three sheets
    var abSheet  = getOrCreateSheet_(ss, 'AB',  ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'answer', 'user_agent']);
    var xabSheet = getOrCreateSheet_(ss, 'XAB', ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'answer', 'user_agent']);
    var mosSheet = getOrCreateSheet_(ss, 'MOS', ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'score',  'user_agent']);
    var raterSheet = getOrCreateSheet_(ss, 'Raters', ['received_at', 'rater_id', 'client_timestamp', 'ab_count', 'xab_count', 'mos_count', 'user_agent']);

    var now   = new Date();
    var rid   = payload.rater_id || '';
    var stamp = payload.timestamp || '';
    var ua    = payload.user_agent || '';

    (payload.ab  || []).forEach(function(r){ abSheet .appendRow([now, rid, stamp, r.idx, r.id, r.answer, ua]); });
    (payload.xab || []).forEach(function(r){ xabSheet.appendRow([now, rid, stamp, r.idx, r.id, r.answer, ua]); });
    (payload.mos || []).forEach(function(r){ mosSheet.appendRow([now, rid, stamp, r.idx, r.id, r.score,  ua]); });
    raterSheet.appendRow([now, rid, stamp,
      (payload.ab||[]).length, (payload.xab||[]).length, (payload.mos||[]).length, ua]);

    return ContentService.createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('FAC Eval backend is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}
```

6. Click the disk icon (or `Ctrl+S`) to save.

---

## Step 3 — Deploy as a Web App

1. In the Apps Script editor, click `Deploy` (top-right) → `New deployment`.
2. Click the gear icon next to "Select type" → choose `Web app`.
3. Fill in:
   - **Description**: `FAC Eval v1`
   - **Execute as**: `Me`  (your Google account)
   - **Who has access**: `Anyone`  (this is required so raters can POST — but note: only people who know the URL can hit it, and it only accepts writes, not reads)
4. Click `Deploy`.
5. Google will ask you to authorize the script. Click `Authorize access` → pick your account → click `Advanced` → `Go to FAC Eval Backend (unsafe)` → `Allow`. (It says "unsafe" because it's an unverified script — that's expected for your own scripts.)
6. After deployment, you'll see a **Web app URL** ending in `/exec`. Copy it.

---

## Step 4 — Paste the URL into `index.html`

1. Open `index.html` in a text editor.
2. Find this line near the top of the `<script>` section (around line 255):

   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = '';
   ```

3. Paste your URL between the quotes:

   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```

4. Save the file.
5. Commit + push to GitHub (same way you uploaded before). GitHub Pages will redeploy in ~1 minute.

---

## Step 5 — Verify end-to-end

1. Open your evaluation page (`https://chenxiliu6.github.io/fac-iwanec-evaluation/`) on a fresh browser tab.
2. Enter the passcode `iwaenc2026` and a test rater ID like `test01`.
3. Quickly click through all 3 tests and submit.
4. Open your Google Sheet → you should see a new row in the `Raters` tab and rows in `AB`, `XAB`, `MOS`.

If rows appear: you're done. If rows don't appear within 10 seconds: see Troubleshooting below.

---

## Updating the evaluation page later

If you change the HTML (e.g. rotate the passcode), you just push to GitHub again — no Apps Script changes needed.

If you change the Apps Script, go to `Deploy` → `Manage deployments` → pencil icon → `Version: New version` → `Deploy`. The URL stays the same.

---

## Passcode rotation

The rater passcode is hardcoded as `iwaenc2026` at the top of `index.html`:

```javascript
const EVAL_PASSCODE  = 'iwaenc2026';
```

**Important caveat**: because this is a static page, the passcode is visible in the HTML source to anyone who opens DevTools. It's a gate, not a real secret. If you need stronger access control, give each rater a unique random passcode and check server-side — but for an invited-rater IWAENC study this simple gate is enough.

To rotate the passcode: change the string, commit + push to GitHub.

---

## Getting the results out

Two options:

1. **Best workflow** (recommended): From the Google Sheet itself, `File` → `Download` → `CSV` for each tab (AB / XAB / MOS / Raters). Feed these directly into your analysis script.

2. **Legacy workflow**: Collect raters' downloaded CSV backups (only needed if the server upload failed for some rater) and import them via the Admin dashboard in the eval page — the existing CSV import + aggregate export still works.

---

## Troubleshooting

**Rows don't appear in the Google Sheet:**
- Open the evaluation page, open browser DevTools (F12) → Network tab → submit a test. Look for a request to `script.google.com`. Check its status code — should be 200. If it's 0 or blocked, CORS is the issue.
- Go to Apps Script editor → `Executions` (left sidebar) — see if the POST reached the script and what error it threw.
- Re-check that `GOOGLE_APPS_SCRIPT_URL` in `index.html` ends with `/exec` (not `/dev`).

**"Anyone, even anonymous" access warning:**
That's how Apps Script Web Apps work. The URL is effectively a shared secret. Raters who finish the eval will hit it; nobody else will know the URL exists.

**Want to see who submitted without reading every sheet:**
The `Raters` tab gives you a one-row-per-submission summary. Sort by `received_at` to get a submission timeline.
