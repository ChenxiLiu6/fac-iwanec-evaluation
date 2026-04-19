// FAC Eval backend - Google Apps Script Web App
// Receives POSTs from the evaluation page and appends rows to the target sheet.
//
// IMPORTANT: the SPREADSHEET_ID below is hardcoded to your sheet
// "FAC Eval Results 2026" so the script will work whether or not it is bound.

var SPREADSHEET_ID = '1_JtAhjg9zG9QcGD6wNTYQKZFvEEKTGO_RdSGe8kxpS8';

function doGet(e) {
  var ss = openSheet_();
  var out = {
    ok: true,
    service: 'FAC Eval Backend',
    message: 'Service is live. POST JSON to this URL to save results.',
    time: new Date().toISOString(),
    spreadsheet_name: ss ? ss.getName() : '(not accessible)',
    spreadsheet_id: SPREADSHEET_ID
  };
  return jsonOut_(out);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    if (!raw) {
      return jsonOut_({ ok: false, error: 'Empty POST body' });
    }
    var payload = JSON.parse(raw);

    var ss = openSheet_();
    if (!ss) {
      return jsonOut_({ ok: false, error: 'Could not open spreadsheet. Check SPREADSHEET_ID.' });
    }

    var abSheet    = getOrCreateSheet_(ss, 'AB',     ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'answer',  'user_agent']);
    var xabSheet   = getOrCreateSheet_(ss, 'XAB',    ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'answer',  'user_agent']);
    var mosSheet   = getOrCreateSheet_(ss, 'MOS',    ['received_at', 'rater_id', 'client_timestamp', 'item_idx', 'item_id', 'score',   'user_agent']);
    var raterSheet = getOrCreateSheet_(ss, 'Raters', ['received_at', 'rater_id', 'client_timestamp', 'ab_count', 'xab_count', 'mos_count', 'user_agent']);

    var now   = new Date();
    var rid   = payload.rater_id || '';
    var stamp = payload.timestamp || '';
    var ua    = payload.user_agent || '';
    var ab    = payload.ab  || [];
    var xab   = payload.xab || [];
    var mos   = payload.mos || [];

    // Batch the AB/XAB/MOS rows with a single setValues call each for speed.
    if (ab.length > 0) {
      var abRows = ab.map(function(r) { return [now, rid, stamp, r.idx, r.id, r.answer || '', ua]; });
      abSheet.getRange(abSheet.getLastRow() + 1, 1, abRows.length, abRows[0].length).setValues(abRows);
    }
    if (xab.length > 0) {
      var xabRows = xab.map(function(r) { return [now, rid, stamp, r.idx, r.id, r.answer || '', ua]; });
      xabSheet.getRange(xabSheet.getLastRow() + 1, 1, xabRows.length, xabRows[0].length).setValues(xabRows);
    }
    if (mos.length > 0) {
      var mosRows = mos.map(function(r) { return [now, rid, stamp, r.idx, r.id, r.score || '', ua]; });
      mosSheet.getRange(mosSheet.getLastRow() + 1, 1, mosRows.length, mosRows[0].length).setValues(mosRows);
    }
    raterSheet.appendRow([now, rid, stamp, ab.length, xab.length, mos.length, ua]);

    return jsonOut_({ ok: true, rater_id: rid, ab: ab.length, xab: xab.length, mos: mos.length });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function openSheet_() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return null;
  }
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

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this manually once to grant permission and confirm the script can access
// the target spreadsheet. Check the Execution log for the sheet name.
function selfTest() {
  var ss = openSheet_();
  Logger.log('SPREADSHEET_ID = ' + SPREADSHEET_ID);
  Logger.log('Opened name   = ' + (ss ? ss.getName() : '(none / permission denied)'));
  if (ss) {
    var sheets = ss.getSheets().map(function(s) { return s.getName(); });
    Logger.log('Existing tabs = ' + sheets.join(', '));
  }
}
