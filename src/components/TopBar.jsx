export default function TopBar({ fileName, subtitle, uploadedAt, allYears, activeYrs, onYearChange, onUpdateClick, onClear }) {
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h1>📊 HR Turnover Dashboard <span className="badge">{fileName}</span></h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-bar-right">
        {uploadedAt && <span className="last-updated">Cập nhật: {fmtDate(uploadedAt)}</span>}

        <div className="year-filters">
          <button
            className={`yr-btn${activeYrs.length === 0 ? ' active' : ''}`}
            onClick={() => onYearChange([])}
          >Tất cả</button>
          {allYears.map(y => (
            <button
              key={y}
              className={`yr-btn${activeYrs.includes(y) ? ' active' : ''}`}
              onClick={() => onYearChange([y])}
            >{y}</button>
          ))}
        </div>

        <button className="btn-update" onClick={onUpdateClick}>⬆ Cập nhật file</button>
        <button className="btn-clear"  onClick={() => { if (window.confirm('Xóa toàn bộ dữ liệu?')) onClear(); }} title="Xóa dữ liệu">✕</button>
      </div>
    </div>
  );
}
