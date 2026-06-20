import { Bar, Line } from 'react-chartjs-2';
import { MONTHS, QUARTERS, YR_COLORS, BASE_AXES } from '../constants';

const noLabels = { display: false };
const baseLegend = (show) => show
  ? { display: true, labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10 } }
  : { display: false };

export default function TrendTab({ metrics, activeYrs }) {
  const { monthly, quarterly, headcount } = metrics;
  const ck = activeYrs.join(',');

  // ── Monthly bar ────────────────────────────────────────────────────────────
  const monthlyDs = activeYrs.flatMap((y, i) => {
    const arr = monthly[y] || Array(12).fill(0);
    const avg = Math.round(arr.filter(v=>v>0).reduce((a,b)=>a+b,0) / (arr.filter(v=>v>0).length||1));
    return [
      { label: String(y), type:'bar', data: arr.map(v=>v||null), backgroundColor: YR_COLORS[i%YR_COLORS.length]+'aa', borderColor: YR_COLORS[i%YR_COLORS.length], borderWidth:2, borderRadius:4 },
      { label:`TB ${y}`, type:'line', data: Array(12).fill(avg), borderColor: YR_COLORS[i%YR_COLORS.length]+'66', borderDash:[6,3], borderWidth:1.5, pointRadius:0, fill:false },
    ];
  });

  // ── Rate line ──────────────────────────────────────────────────────────────
  const rateDs = activeYrs.map((y, i) => ({
    label: `Rate ${y} (%)`,
    data: (monthly[y]||[]).map((v,m) => headcount[y]?.[m] > 0 ? +(v/headcount[y][m]*100).toFixed(1) : null),
    borderColor: YR_COLORS[i%YR_COLORS.length],
    backgroundColor: YR_COLORS[i%YR_COLORS.length]+'22',
    fill:true, tension:0.4, pointRadius:3, pointBackgroundColor: YR_COLORS[i%YR_COLORS.length],
  }));

  // ── Cumulative ─────────────────────────────────────────────────────────────
  const cumulDs = activeYrs.map((y, i) => {
    let cum = 0;
    return {
      label: String(y),
      data: (monthly[y]||[]).map(v => { cum += v; return cum || null; }),
      borderColor: YR_COLORS[i%YR_COLORS.length],
      backgroundColor: YR_COLORS[i%YR_COLORS.length]+'15',
      fill:true, tension:0.4, pointRadius:3, pointBackgroundColor: YR_COLORS[i%YR_COLORS.length],
    };
  });

  // ── Quarterly ─────────────────────────────────────────────────────────────
  const qDs = activeYrs.map((y, i) => ({
    label: String(y),
    data: quarterly[y] || Array(4).fill(0),
    backgroundColor: YR_COLORS[i%YR_COLORS.length]+'cc',
    borderRadius: 5,
  }));

  const tip = fn => ({ callbacks: { label: fn } });

  return (
    <>
      <div className="card mb">
        <div className="card-title"><span className="dot" style={{background:'#3b82f6'}} />Turnover theo tháng</div>
        <div className="chart-h290"><Bar key={ck} data={{ labels:MONTHS, datasets:monthlyDs }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, datalabels:noLabels, tooltip:tip(c=>` ${c.dataset.label}: ${c.raw??0} người`) }, scales:BASE_AXES }} /></div>
        <div className="leg">{activeYrs.map((y,i)=><div key={y} className="leg-item"><div className="leg-swatch" style={{background:YR_COLORS[i%YR_COLORS.length]}} />{y}</div>)}</div>
      </div>

      <div className="g2 mb">
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#10b981'}} />Turnover theo quý</div>
          <div className="chart-h250"><Bar key={ck+'q'} data={{ labels:QUARTERS, datasets:qDs }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:baseLegend(activeYrs.length>1), datalabels:{ display:true, color:'#e2e8f0', font:{size:11,weight:'700'}, anchor:'end', align:'top', formatter:v=>v||'' } }, scales:BASE_AXES }} /></div>
        </div>
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#8b5cf6'}} />Turnover Rate (%/tháng)</div>
          <div className="chart-h250"><Line key={ck+'r'} data={{ labels:MONTHS, datasets:rateDs }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:baseLegend(activeYrs.length>1), datalabels:noLabels, tooltip:tip(c=>` ${c.dataset.label}: ${c.raw}%`) }, scales:{ ...BASE_AXES, y:{ ...BASE_AXES.y, ticks:{ ...BASE_AXES.y.ticks, callback:v=>v+'%' } } } }} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><span className="dot" style={{background:'#ec4899'}} />Tích lũy nghỉ việc theo tháng</div>
        <div className="chart-h230"><Line key={ck+'c'} data={{ labels:MONTHS, datasets:cumulDs }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:baseLegend(activeYrs.length>1), datalabels:noLabels }, scales:BASE_AXES }} /></div>
      </div>
    </>
  );
}
