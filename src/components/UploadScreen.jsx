import { useRef, useState } from 'react';

export default function UploadScreen({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div className="upload-screen">
      <div className="upload-card">
        <div className="upload-logo">📊</div>
        <h1>HR Turnover Dashboard</h1>
        <p>Tải lên file Excel — dữ liệu được lưu tự động, không cần upload lại</p>

        <div
          className={`drop-zone${dragging ? ' drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="drop-icon">📂</div>
          <h3>Kéo &amp; thả file Excel vào đây</h3>
          <p>hoặc nhấn để chọn file từ máy tính</p>
          <button className="btn-browse" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
            Chọn file
          </button>
          <p className="file-hint">Hỗ trợ .xlsx · .xls · Tối đa 100MB</p>
        </div>
        <input
          ref={inputRef} type="file" accept=".xlsx,.xls" hidden
          onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = ''; }}
        />

        <div className="format-card">
          <h4>📋 Cột cần có trong file (bắt buộc *)</h4>
          <div className="col-tags" style={{ marginBottom: 8 }}>
            <span className="col-tag req">Tình trạng *</span>
            <span className="col-tag req">Ngày làm việc cuối *</span>
            <span className="col-tag req">Họ và tên *</span>
          </div>
          <div className="col-tags">
            {['Công ty / Entity','Đơn vị / BU','Phòng ban / Division','Bộ phận / Department','Loại nhân viên / Type','Ngày vào công ty'].map(c => (
              <span key={c} className="col-tag">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
