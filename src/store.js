const KEY = 'hr_dashboard_v1';

export function loadStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.employees?.length) return null;
    parsed.employees = parsed.employees.map(e => ({
      ...e,
      joinDate: e.joinDate ? new Date(e.joinDate) : null,
      lastDate: e.lastDate ? new Date(e.lastDate) : null,
    }));
    return parsed;
  } catch {
    return null;
  }
}

export function saveToStore(fileName, employees) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ fileName, uploadedAt: new Date().toISOString(), employees }));
    return true;
  } catch (e) {
    console.error('localStorage full:', e);
    return false;
  }
}

export function clearStore() {
  localStorage.removeItem(KEY);
}
