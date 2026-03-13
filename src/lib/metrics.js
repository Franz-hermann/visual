const pad2 = (n) => String(n).padStart(2, "0");

export function toYMD(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function parseDayFromIso(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return toYMD(d);
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function num(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function sumBy(arr, get) {
  let s = 0;
  for (const it of arr) s += num(get(it));
  return s;
}

export function groupSum(arr, keyFn, valFn) {
  const m = new Map();
  for (const it of arr) {
    const k = keyFn(it);
    const v = num(valFn(it));
    m.set(k, (m.get(k) || 0) + v);
  }
  return m;
}

// ISO week: { year, week } using local time
export function isoWeekKey(dateLike) {
  const d0 = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
  const d = new Date(Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

export function startOfWeekYMD(dateLike) {
  const d0 = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
  const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diff = (day === 0 ? -6 : 1 - day); // Monday start
  d.setDate(d.getDate() + diff);
  return toYMD(d);
}

export function daysInMonth(year, month1to12) {
  return new Date(year, month1to12, 0).getDate();
}

export function ymdToDate(ymd) {
  const [y, m, d] = (ymd || "").split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function monthKey(ymd) {
  return (ymd || "").slice(0, 7);
}

export function withinMonth(ymd, monthYYYYMM) {
  return monthKey(ymd) === monthYYYYMM;
}

export function withinWeek(ymd, weekStartYmd) {
  const d = ymdToDate(ymd);
  const s = ymdToDate(weekStartYmd);
  if (!d || !s) return false;
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return d >= s && d < e;
}

export function formatKm(n, digits = 1) {
  const v = num(n);
  if (!Number.isFinite(v)) return "0";
  return v.toFixed(digits);
}

export function percent(n, digits = 0) {
  const v = clamp(num(n) * 100, 0, 999);
  return `${v.toFixed(digits)}%`;
}

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

