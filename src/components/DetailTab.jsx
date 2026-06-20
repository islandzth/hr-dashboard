import { Bar, Doughnut } from 'react-chartjs-2';
import { YR_COLORS, CAT_COLORS, BASE_AXES, GRID_COLOR, TICK_COLOR } from '../constants';

const noLabels = { display: false };
const hBarAxes = {
  x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
  y: { grid: { color: 'transparent' }, ticks: { color: '#cbd5e1', font: { size: 11 } } },
};
const legend = (show) => show
  ? { display:true, position:'top', labels:{ color:'#94a3b8', font:{size:11}, boxWidth:10 } }
  : { display: false };

function HBarChart({ id, dimData, activeYrs }) {
  const labels = Object.keys(dimData).slice(0, 15);
  const ds = activeYrs.map((y,i) => ({
    label: String(y),
    data: labels.map(l => dimData[l][y] || 0),
    backgroundColor: YR_COLORS[i%YR_COLORS.length]+'cc',
    borderRadius: 3,
  }));
  return (
    <Bar
      key={id + activeYrs.join(',')}
      data={{ labels, datasets: ds }}
      options={{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:legend(activeYrs.length>1), datalabels:noLabels }, scales:hBarAxes }}
    />
  );
}

function DonutChart({ id, dimData, activeYrs }) {
  const labels = Object.keys(dimData);
  const combined = labels.map(l => activeYrs.reduce((s,y) => s+(dimData[l][y]||0), 0));
  return (
    <Doughnut
      key={id + activeYrs.join(',')}
      data={{ labels, datasets:[{ data:combined, backgroundColor:CAT_COLORS.map(c=>c+'cc'), borderColor:'#1e293b', borderWidth:2 }] }}
      options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'bottom', labels:{ color:'#94a3b8', font:{size:11}, padding:10 } }, datalabels:{ display:true, color:'#fff', font:{size:11,weight:'700'}, formatter:(v,c)=>{ const t=c.chart.data.datasets[0].data.reduce((a,b)=>a+b,0); return v>0?`${v}\n(${(v/t*100).toFixed(0)}%)`:''; } } } }}
    />
  );
}

export default function DetailTab({ metrics, activeYrs }) {
  const { byBU, byDiv, byType, byCompany } = metrics;
  return (
    <>
      <div className="g2 mb">
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#06b6d4'}} />Theo BU</div>
          <div className="chart-h320"><HBarChart id="bu" dimData={byBU} activeYrs={activeYrs} /></div>
        </div>
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#f97316'}} />Theo Phòng ban</div>
          <div className="chart-h320"><HBarChart id="div" dimData={byDiv} activeYrs={activeYrs} /></div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#ec4899'}} />Theo Loại nhân viên</div>
          <div className="chart-h280"><DonutChart id="type" dimData={byType} activeYrs={activeYrs} /></div>
        </div>
        <div className="card">
          <div className="card-title"><span className="dot" style={{background:'#10b981'}} />Theo Công ty</div>
          <div className="chart-h280"><HBarChart id="company" dimData={byCompany} activeYrs={activeYrs} /></div>
        </div>
      </div>
    </>
  );
}
