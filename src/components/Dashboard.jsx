import { useState, useMemo, useRef } from 'react';
import { buildMetrics, isLeaver } from '../utils/metrics';
import TopBar    from './TopBar';
import KPIRow    from './KPIRow';
import TrendTab  from './TrendTab';
import DetailTab from './DetailTab';
import CompareTab from './CompareTab';
import TableTab  from './TableTab';

const TABS = [
  { id: 'trend',   label: 'Xu hướng' },
  { id: 'detail',  label: 'Phân tích chi tiết' },
  { id: 'compare', label: 'Khối & Cửa hàng' },
  { id: 'table',   label: 'Bảng số liệu' },
];

export default function Dashboard({ stored, onUpdate, onClear }) {
  const { employees, fileName, uploadedAt } = stored;
  const [activeYrs, setActiveYrs] = useState([]);
  const [activeTab, setActiveTab] = useState('trend');
  const fileRef = useRef(null);

  const metrics = useMemo(() => buildMetrics(employees), [employees]);

  const yrs = activeYrs.length ? activeYrs : metrics.years;

  const subtitle = `${employees.length} nhân viên · ${employees.filter(isLeaver).length} bản ghi turnover`;

  const handleUpdateClick = () => fileRef.current?.click();

  return (
    <>
      <TopBar
        fileName={fileName}
        subtitle={subtitle}
        uploadedAt={uploadedAt}
        allYears={metrics.years}
        activeYrs={activeYrs}
        onYearChange={setActiveYrs}
        onUpdateClick={handleUpdateClick}
        onClear={onClear}
      />
      <input
        ref={fileRef} type="file" accept=".xlsx,.xls" hidden
        onChange={e => { if (e.target.files[0]) { onUpdate(e.target.files[0]); e.target.value = ''; } }}
      />

      <div className="main">
        <KPIRow metrics={metrics} activeYrs={yrs} />

        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {activeTab === 'trend'   && <TrendTab   metrics={metrics} activeYrs={yrs} />}
        {activeTab === 'detail'  && <DetailTab  metrics={metrics} activeYrs={yrs} />}
        {activeTab === 'compare' && <CompareTab metrics={metrics} activeYrs={yrs} />}
        {activeTab === 'table'   && <TableTab   metrics={metrics} activeYrs={yrs} />}
      </div>
    </>
  );
}
