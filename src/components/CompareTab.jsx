import { Doughnut, Bar } from 'react-chartjs-2';
import { MONTHS, CAT_COLORS, BASE_AXES, divColor } from '../constants';
import StoreHeatmap from './StoreHeatmap';

const noLabels = { display: false };

export default function CompareTab({ metrics, activeYrs }) {
  const { byDiv, divMonthly } = metrics;
  const ck = activeYrs.join(',');

  const divKeys = Object.keys(byDiv);

  // Totals per division
  const divTotals = Object.fromEntries(
    divKeys.map(d => [d, activeYrs.reduce((s,y) => s+(byDiv[d][y]||0), 0)])
  );
  const grandTotal = Object.values(divTotals).reduce((a,b)=>a+b,0) || 1;

  // Stacked bar: combined months across selected years
  const stackedDs = divKeys.map(div => {
    const monthly12 = Array(12).fill(0);
    activeYrs.forEach(y => {
      (divMonthly[y]?.[div] || []).forEach((v,m) => { monthly12[m] += v; });
    });
    return { label:div, data:monthly12, backgroundColor:divColor(div)+'cc', borderColor:divColor(div), borderWidth:1, borderRadius:3 };
  });

  const donutLabels = divKeys.filter(d => divTotals[d] > 0);
  const donutData = donutLabels.map(d => divTotals[d]);

  return (
    <>
      {/* Division ratio */}
      <div className="card mb">
        <div className="card-title"><span className="dot" style={{background:'#f97316'}} />Tỷ lệ Back Office vs Store vs Kitchen Pastry</div>

        {/* Ratio cards */}
        <div className="div-ratio-row">
          {Object.entries(divTotals).sort((a,b)=>b[1]-a[1]).map(([div, cnt]) => {
            const pct = (cnt/grandTotal*100).toFixed(1);
            return (
              <div key={div} className="div-ratio-card">
                <div className="drc-name">{div}</div>
                <div className="drc-count">{cnt}</div>
                <div className="drc-pct">{pct}% tổng turnover</div>
                <div className="drc-bar" style={{background:divColor(div), width:`${Math.max(+pct,2)}%`}} />
              </div>
            );
          })}
        </div>

        <div className="g2">
          <div>
            <p style={{fontSize:12,color:'var(--sub)',marginBottom:8}}>Tỷ lệ theo khối</p>
            <div className="chart-h240">
              <Doughnut
                key={ck+'dd'}
                data={{ labels:donutLabels, datasets:[{ data:donutData, backgroundColor:donutLabels.map(d=>divColor(d)+'cc'), borderColor:'#1e293b', borderWidth:2 }] }}
                options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'right', labels:{ color:'#94a3b8', font:{size:12}, padding:14, boxWidth:12 } }, datalabels:{ display:true, color:'#fff', font:{size:13,weight:'700'}, formatter:(v,c)=>{ const t=c.chart.data.datasets[0].data.reduce((a,b)=>a+b,0); return v>0?`${(v/t*100).toFixed(0)}%`:''; } } } }}
              />
            </div>
          </div>
          <div>
            <p style={{fontSize:12,color:'var(--sub)',marginBottom:8}}>Turnover từng tháng theo khối (stacked)</p>
            <div className="chart-h240">
              <Bar
                key={ck+'ds'}
                data={{ labels:MONTHS, datasets:stackedDs }}
                options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'top', labels:{ color:'#94a3b8', font:{size:11}, boxWidth:10 } }, datalabels:noLabels, tooltip:{ mode:'index', intersect:false } }, scales:{ x:{ ...BASE_AXES.x, stacked:true }, y:{ ...BASE_AXES.y, stacked:true } } }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Store heatmap */}
      <div className="card">
        <div className="card-title">
          <span className="dot" style={{background:'#06b6d4'}} />
          Heatmap turnover từng cửa hàng theo tháng
          <span style={{marginLeft:'auto',fontSize:11,color:'var(--sub)',fontWeight:400}}>đậm đỏ = nhiều người nghỉ hơn</span>
        </div>
        <StoreHeatmap deptMonthly={metrics.deptMonthly} activeYrs={activeYrs} />
        <div className="hmap-legend">
          <span>Ít</span>
          <div className="hmap-legend-scale" />
          <span>Nhiều</span>
        </div>
      </div>
    </>
  );
}
