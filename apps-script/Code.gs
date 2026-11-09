/**
 * Máy chủ lưu trữ dùng chung cho Hệ thống Điều hành Trung tâm DVTC công Hà Tĩnh.
 * Không dùng CSDL: toàn bộ dữ liệu là 1 file JSON trên Google Drive của tài khoản triển khai.
 *
 * GET  ?action=get                         -> { ok, rev, doc }
 * POST {action:'put', baseRev, doc}        -> { ok, rev }  hoặc  { ok:false, conflict:true, rev, doc }
 *
 * Mỗi giờ tự lưu 1 bản sao lưu vào thư mục "TT_HT_BACKUP" (giữ 200 bản gần nhất).
 */
const DATA_FILE_NAME = 'TT_HT_DATA.json';
const BACKUP_FOLDER_NAME = 'TT_HT_BACKUP';
const BACKUP_EVERY_MS = 60 * 60 * 1000;
const BACKUP_KEEP = 200;

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'get';
    if (action !== 'get') return out({ ok: false, error: 'Hành động không hợp lệ' });
    const state = readState();
    return out({ ok: true, rev: state.rev, doc: state.doc });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'put') return out({ ok: false, error: 'Hành động không hợp lệ' });
    const doc = body.doc;
    if (!doc || !doc.db || !Array.isArray(doc.db.tasks) || !Array.isArray(doc.db.cases) || !Array.isArray(doc.users)) {
      return out({ ok: false, error: 'Dữ liệu không đúng cấu trúc' });
    }
    const state = readState();
    if (Number(body.baseRev) !== state.rev) {
      return out({ ok: false, conflict: true, rev: state.rev, doc: state.doc });
    }
    const next = { rev: state.rev + 1, savedAt: new Date().toISOString(), doc: doc };
    writeState(next);
    maybeBackup(next);
    return out({ ok: true, rev: next.rev });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function dataFile() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('DATA_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (x) {}
  }
  const file = DriveApp.createFile(DATA_FILE_NAME, JSON.stringify({ rev: 0, doc: null }), MimeType.PLAIN_TEXT);
  props.setProperty('DATA_FILE_ID', file.getId());
  return file;
}

function readState() {
  const raw = dataFile().getBlob().getDataAsString('UTF-8');
  const s = raw ? JSON.parse(raw) : { rev: 0, doc: null };
  return { rev: Number(s.rev) || 0, doc: s.doc || null };
}

function writeState(state) {
  dataFile().setContent(JSON.stringify(state));
}

function maybeBackup(state) {
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty('LAST_BACKUP_AT') || 0);
  if (Date.now() - last < BACKUP_EVERY_MS) return;
  const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
  const stamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmm');
  folder.createFile('SAO_LUU_' + stamp + '_rev' + state.rev + '.json', JSON.stringify(state.doc), MimeType.PLAIN_TEXT);
  props.setProperty('LAST_BACKUP_AT', String(Date.now()));
  const files = [];
  const it = folder.getFiles();
  while (it.hasNext()) files.push(it.next());
  files.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  files.slice(BACKUP_KEEP).forEach(function (f) { f.setTrashed(true); });
}

/** Chạy tay 1 lần trong trình soạn thảo Apps Script để cấp quyền Drive và tạo file dữ liệu. */
function setup() {
  Logger.log('File dữ liệu: ' + dataFile().getUrl());
}
