import { useMemo } from 'react';
import { MONTHS, heatColor } from '../constants';

export default function StoreHeatmap({ deptMonthly, activeYrs }) {
  const { rows, maxVal, monthTotals } = useMemo(() => {
    const agg = {};
    activeYrs.forEach(y => {
      Object.entries(deptMonthly[y] || {}).forEach(([store, vals]) => {
        if (!agg[store]) agg[store] = Array(12).fill(0);
        vals.forEach((v, m) => { agg[store][m] += v; });
      });
    });

    const rows = Object.entries(agg)
      .map(([store, vals]) => ({ store, vals, total: vals.reduce((a,b)=>a+b,0) }))
      .filter(r => r.total > 0)
      .sort((a,b) => b.total - a.total)
      .slice(0, 35);

    const maxVal = Math.max(...rows.flatMap(r => r.vals), 1);
    const monthTotals = Array(12).fill(0);
    rows.forEach(r => r.vals.forEach((v,m) => { monthTotals[m] += v; }));

    return { rows, maxVal, monthTotals };
  }, [deptMonthly, activeYrs]);

  if (!rows.length) return (
    <p style={{color:'var(--sub)',padding:'20px',fontSize:13}}>
      Không có dữ liệu cửa hàng. Kiểm tra cột "Bộ phận / Department" trong file Excel.
    </p>
  );

  const maxMT = Math.max(...monthTotals, 1);
  const grandTotal = monthTotals.reduce((a,b)=>a+b,0);

  return (
    <div className="hmap-outer">
      <table className="hmap">
        <thead>
          <tr>
            <th>Cửa hàng / Bộ phận</th>
            {MONTHS.map(m => <th key={m}>{m}</th>)}
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ store, vals, total }) => (
            <tr key={store}>
              <td title={store}>{store}</td>
              {vals.map((v, m) => {
                const c = heatColor(v, maxVal);
                return <td key={m} style={{ background: c.bg, color: c.text }}>{v || ''}</td>;
              })}
              <td className="hmap-sum">{total}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr style={{ borderTop: '2px solid var(--border)' }}>
            <td style={{ fontWeight: 800, color: 'var(--bright)', background: '#0b1120', position: 'sticky', left: 0, zIndex: 1 }}>TỔNG</td>
            {monthTotals.map((v, m) => {
              const c = heatColor(v, maxMT);
              return <td key={m} style={{ background: c.bg, color: c.text, fontWeight: 700 }}>{v || ''}</td>;
            })}
            <td className="hmap-sum">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
