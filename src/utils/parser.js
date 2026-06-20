import * as XLSX from 'xlsx';

const COL_KEYS = {
  name:     ['họ và tên','ho va ten','full name','họ tên','name'],
  code:     ['mã nhân viên','ma nhan vien','employee code','mã nv'],
  company:  ['công ty','cong ty','entity','enity','company'],
  bu:       ['đơn vị','don vi','business unit'],
  division: ['phòng ban','phong ban','division'],
  dept:     ['bộ phận','bo phan','department'],
  type:     ['loại nhân viên','loai nhan vien','employee type','loại hđ'],
  status:   ['tình trạng','tinh trang','status'],
  joinDate: ['ngày vào công ty','ngay vao cong ty','join date','ngày vào'],
  lastDate: ['ngày làm việc cuối','ngay lam viec cuoi','last working','last day','ngày nghỉ'],
};

function norm(v) {
  return String(v ?? '').split('/')[0].replace(/\n/g,' ').trim().toLowerCase();
}

function findHeaderRow(rows) {
  const anchors = ['tình trạng','tinh trang','status','họ và tên','ho va ten','full name','ngày làm việc'];
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const flat = rows[i].map(norm).join(' ');
    if (anchors.some(a => flat.includes(a))) return i;
  }
  return 0;
}

function mapCols(header) {
  const map = {};
  header.forEach((cell, idx) => {
    const s = norm(cell);
    if (!s) return;
    for (const [key, kws] of Object.entries(COL_KEYS)) {
      if (key in map) continue;
      if (kws.some(kw => s.startsWith(kw) || s === kw)) map[key] = idx;
    }
  });
  return map;
}

function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function str(v) { return v != null ? String(v).trim() : ''; }

// Returns { wb, sheetName, needsPicker, sheetNames }
export async function openExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const mpSheet = wb.SheetNames.find(n => /^mp$/i.test(n.trim()));
  const sheetName = mpSheet || wb.SheetNames[0];
  const needsPicker = !mpSheet && wb.SheetNames.length > 1;
  return { wb, sheetName, needsPicker, sheetNames: wb.SheetNames };
}

// Returns employees[]
export function parseSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const hi = findHeaderRow(rows);
  const cm = mapCols(rows[hi] || []);

  if (!('status' in cm) && !('lastDate' in cm))
    throw new Error('Không tìm thấy cột "Tình trạng" hoặc "Ngày làm việc cuối"');

  // Skip sub-header rows
  let start = hi + 1;
  while (start < rows.length) {
    const r = rows[start];
    if (r?.some((c, i) => i >= 2 && c !== null && c !== '' && typeof c !== 'object')) break;
    start++;
  }

  const employees = [];
  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(c => c == null || c === '')) continue;
    const name = cm.name !== undefined ? r[cm.name] : null;
    if (!name) continue;
    employees.push({
      name:     str(name),
      code:     str(r[cm.code]),
      company:  str(r[cm.company]),
      bu:       str(r[cm.bu]),
      division: str(r[cm.division]),
      dept:     str(r[cm.dept]),
      type:     str(r[cm.type]),
      status:   str(r[cm.status]),
      joinDate: cm.joinDate !== undefined ? toDate(r[cm.joinDate]) : null,
      lastDate: cm.lastDate !== undefined ? toDate(r[cm.lastDate]) : null,
    });
  }

  if (!employees.length) throw new Error('Không tìm thấy dữ liệu hợp lệ trong sheet này');
  return employees;
}
