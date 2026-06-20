export const isLeaver = d => (d.status || '').toLowerCase().trim() === 'leave';
export const isActive  = d => (d.status || '').toLowerCase().trim() === 'on';

function groupByDim(data, keyFn, years) {
  const result = {};
  data.forEach(d => {
    if (!isLeaver(d) || !d.lastDate) return;
    const k = keyFn(d) || '—';
    const y = d.lastDate.getFullYear();
    if (!result[k]) { result[k] = {}; years.forEach(yr => (result[k][yr] = 0)); }
    if (y in result[k]) result[k][y]++;
  });
  return Object.fromEntries(
    Object.entries(result).sort((a, b) => {
      const sa = Object.values(a[1]).reduce((x, v) => x + v, 0);
      const sb = Object.values(b[1]).reduce((x, v) => x + v, 0);
      return sb - sa;
    })
  );
}

export function buildMetrics(data) {
  const yearSet = new Set();
  data.forEach(d => { if (isLeaver(d) && d.lastDate) yearSet.add(d.lastDate.getFullYear()); });
  const years = [...yearSet].sort();
  if (!years.length) years.push(new Date().getFullYear());

  const monthly = {}, quarterly = {};
  years.forEach(y => { monthly[y] = Array(12).fill(0); quarterly[y] = Array(4).fill(0); });

  data.forEach(d => {
    if (isLeaver(d) && d.lastDate) {
      const y = d.lastDate.getFullYear(), m = d.lastDate.getMonth();
      if (monthly[y]) { monthly[y][m]++; quarterly[y][Math.floor(m / 3)]++; }
    }
  });

  const headcount = {};
  years.forEach(y => {
    headcount[y] = Array(12).fill(0).map((_, m) => {
      const start = new Date(y, m, 1);
      return data.filter(d => {
        if (!d.joinDate || d.joinDate > start) return false;
        if (d.lastDate && d.lastDate < start) return false;
        return true;
      }).length;
    });
  });

  const byBU      = groupByDim(data, d => d.bu, years);
  const byDiv     = groupByDim(data, d => d.division, years);
  const byType    = groupByDim(data, d => d.type, years);
  const byCompany = groupByDim(data, d => d.company, years);

  // division monthly: { year: { div: [12] } }
  const divMonthly = {};
  years.forEach(y => (divMonthly[y] = {}));
  data.forEach(d => {
    if (!isLeaver(d) || !d.lastDate) return;
    const y = d.lastDate.getFullYear(), m = d.lastDate.getMonth();
    if (!divMonthly[y]) return;
    const k = d.division || 'Khác';
    if (!divMonthly[y][k]) divMonthly[y][k] = Array(12).fill(0);
    divMonthly[y][k][m]++;
  });

  // store (dept) monthly: { year: { store: [12] } }
  const deptMonthly = {};
  years.forEach(y => (deptMonthly[y] = {}));
  data.forEach(d => {
    if (!isLeaver(d) || !d.lastDate) return;
    const y = d.lastDate.getFullYear(), m = d.lastDate.getMonth();
    if (!deptMonthly[y]) return;
    const k = d.dept && d.dept !== 'null' && d.dept.trim() ? d.dept.trim() : (d.bu || 'Khác');
    if (!deptMonthly[y][k]) deptMonthly[y][k] = Array(12).fill(0);
    deptMonthly[y][k][m]++;
  });

  return {
    years, monthly, quarterly, headcount,
    byBU, byDiv, byType, byCompany,
    divMonthly, deptMonthly,
    totalActive: data.filter(d => isActive(d)).length,
  };
}
