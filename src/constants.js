export const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
export const MONTHS_FULL = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
export const QUARTERS = ['Q1','Q2','Q3','Q4'];

export const YR_COLORS = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316'];
export const CAT_COLORS = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16','#14b8a6','#6366f1','#f43f5e'];

export const DIV_COLORS = {
  'STORE':          '#3b82f6',
  'KITCHEN PASTRY': '#10b981',
  'HO':             '#f59e0b',
};
export const divColor = name => DIV_COLORS[name] || '#8b5cf6';

export const GRID_COLOR = '#1e293b';
export const TICK_COLOR = '#475569';

export const BASE_AXES = {
  x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } } },
  y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
};

export function heatColor(val, max) {
  if (!val || !max) return { bg: '#0f172a', text: '#475569' };
  const t = Math.min(val / max, 1);
  const stops = [[0,[29,78,216]],[0.5,[217,119,6]],[1,[220,38,38]]];
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
  const p = (t - stops[i][0]) / (stops[i+1][0] - stops[i][0]);
  const rgb = stops[i][1].map((v, j) => Math.round(v + p * (stops[i+1][1][j] - v)));
  const br = (rgb[0]*299 + rgb[1]*587 + rgb[2]*114) / 1000;
  return { bg: `rgb(${rgb.join(',')})`, text: br > 130 ? '#111' : '#fff' };
}
