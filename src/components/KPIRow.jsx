import { MONTHS } from '../constants';

export default function KPIRow({ metrics, activeYrs }) {
  const { monthly, headcount, totalActive } = metrics;

  const allVals  = activeYrs.flatMap(y => monthly[y] || []);
  const nonZero  = allVals.filter(v => v > 0);
  const total    = nonZero.reduce((a,b) => a+b, 0);
  const avg      = nonZero.length ? (total / nonZero.length).toFixed(1) : 0;
  const peak     = Math.max(...allVals, 0);
  const low      = nonZero.length ? Math.min(...nonZero) : 0;

  let peakLabel = '—', lowLabel = '—';
  activeYrs.forEach(y => {
    (monthly[y] || []).forEach((v, m) => {
      if (v === peak) peakLabel = `${MONTHS[m]}/${y}`;
      if (v === low && v > 0) lowLabel = `${MONTHS[m]}/${y}`;
    });
  });

  const rateVals = activeYrs.flatMap(y =>
    (monthly[y] || []).map((v, m) => (headcount[y]?.[m] > 0 ? v / headcount[y][m] * 100 : null))
  ).filter(v => v !== null);
  const avgRate = rateVals.length ? (rateVals.reduce((a,b)=>a+b,0)/rateVals.length).toFixed(1) : '—';

  const cards = [
    { cls:'c1', icon:'👥', label:'Tổng nghỉ việc',     val: total,          sub: activeYrs.join(' + ') || 'Tất cả năm' },
    { cls:'c2', icon:'📅', label:'TB mỗi tháng',       val: avg,            sub: `${nonZero.length} tháng có dữ liệu` },
    { cls:'c3', icon:'🔴', label:'Tháng cao nhất',     val: peak,           sub: peakLabel },
    { cls:'c4', icon:'🟢', label:'Tháng thấp nhất',    val: low,            sub: lowLabel  },
    { cls:'c5', icon:'📊', label:'Rate TB (%/tháng)',  val: avgRate + '%',  sub: 'trên tổng headcount' },
    { cls:'c6', icon:'🏢', label:'Headcount hiện tại', val: totalActive,    sub: 'nhân viên đang làm' },
  ];

  return (
    <div className="kpi-row">
      {cards.map(c => (
        <div key={c.label} className={`kpi ${c.cls}`}>
          <div className="kpi-icon">{c.icon}</div>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-val">{c.val}</div>
          <div className="kpi-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
