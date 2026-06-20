import { MONTHS_FULL, QUARTERS } from '../constants';

function DiffPill({ a, b }) {
  if (b == null) return null;
  const d = b - a;
  if (d > 0) return <span className="pill pill-up">▲{d}</span>;
  if (d < 0) return <span className="pill pill-down">▼{Math.abs(d)}</span>;
  return <span className="pill pill-eq">=</span>;
}

function PctPill({ a, b }) {
  if (!a || b == null) return null;
  const pct = Math.round((b - a) / a * 100);
  return <span className={`pill ${pct > 0 ? 'pill-up' : 'pill-down'}`}>{pct > 0 ? `▲${pct}%` : `▼${Math.abs(pct)}%`}</span>;
}

export default function TableTab({ metrics, activeYrs }) {
  const { monthly, quarterly, byBU, byType } = metrics;
  const showDiff = activeYrs.length === 2;

  return (
    <div className="g2 mb" style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>

      {/* Monthly + Quarterly side by side */}
      <div className="g2 mb">
        <div className="card">
          <div className="card-title">📋 Chi tiết theo tháng</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tháng</th>
                  {activeYrs.map(y => <th key={y}>{y}</th>)}
                  {showDiff && <th>Chênh lệch</th>}
                </tr>
              </thead>
              <tbody>
                {MONTHS_FULL.map((mn, i) => {
                  const vals = activeYrs.map(y => monthly[y]?.[i] || 0);
                  return (
                    <tr key={mn}>
                      <td>{mn}</td>
                      {vals.map((v, j) => <td key={j}>{v || '—'}</td>)}
                      {showDiff && <td><DiffPill a={vals[0]} b={vals[1]} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📋 Tổng hợp theo quý</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quý</th>
                  {activeYrs.map(y => <th key={y}>{y}</th>)}
                  {showDiff && <th>% thay đổi</th>}
                </tr>
              </thead>
              <tbody>
                {QUARTERS.map((q, i) => {
                  const vals = activeYrs.map(y => quarterly[y]?.[i] || 0);
                  return (
                    <tr key={q}>
                      <td><strong>{q}</strong></td>
                      {vals.map((v, j) => <td key={j}>{v || '—'}</td>)}
                      {showDiff && <td><PctPill a={vals[0]} b={vals[1]} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BU + Type side by side */}
      <div className="g2">
        <div className="card">
          <div className="card-title">📋 Theo BU</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>BU</th>
                  {activeYrs.map(y => <th key={y}>{y}</th>)}
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(byBU).slice(0, 15).map(k => {
                  const vals = activeYrs.map(y => byBU[k][y] || 0);
                  return (
                    <tr key={k}>
                      <td>{k}</td>
                      {vals.map((v, j) => <td key={j}>{v || '—'}</td>)}
                      <td><strong>{vals.reduce((a,b)=>a+b,0)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📋 Theo Loại nhân viên</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Loại NV</th>
                  {activeYrs.map(y => <th key={y}>{y}</th>)}
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(byType).map(k => {
                  const vals = activeYrs.map(y => byType[k][y] || 0);
                  return (
                    <tr key={k}>
                      <td>{k}</td>
                      {vals.map((v, j) => <td key={j}>{v || '—'}</td>)}
                      <td><strong>{vals.reduce((a,b)=>a+b,0)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
