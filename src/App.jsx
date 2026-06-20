import { useState, useCallback, useRef, useEffect } from 'react';
import { loadStored, saveToStore, clearStore } from './store';
import { openExcel, parseSheet } from './utils/parser';
import Dashboard from './components/Dashboard';

// Path to the pre-bundled Excel file in /public
const BUNDLED_FILE = '/master-data.xlsx';
const BUNDLED_NAME = 'MASTER DATA';

export default function App() {
  const [stored, setStored]       = useState(() => loadStored());
  const [loading, setLoading]     = useState(!loadStored()); // show loading on first visit
  const [loadMsg, setLoadMsg]     = useState('Đang tải dữ liệu...');
  const [toast, setToast]         = useState(null);
  const [confirm, setConfirm]     = useState(null);
  const [sheetPicker, setSheetPicker] = useState(null);
  const pendingWb = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const applyData = useCallback((fileName, employees) => {
    const ok = saveToStore(fileName, employees);
    const next = loadStored();
    setStored(next);
    if (!ok) showToast('Lưu dữ liệu thất bại (bộ nhớ đầy)', 'error');
    else showToast(`✓ Đã tải ${employees.length} nhân viên từ "${fileName}"`);
  }, []);

  // Auto-load bundled file on first visit (no stored data yet)
  useEffect(() => {
    if (loadStored()) { setLoading(false); return; }
    (async () => {
      try {
        setLoadMsg('Đang tải dữ liệu từ server...');
        const res = await fetch(BUNDLED_FILE);
        if (!res.ok) throw new Error('Không tìm thấy file bundled');
        const blob = await res.blob();
        const file = new File([blob], 'master-data.xlsx');
        setLoadMsg('Đang phân tích dữ liệu...');
        const { wb, sheetName, needsPicker, sheetNames } = await openExcel(file);
        if (needsPicker) {
          pendingWb.current = { wb, fileName: BUNDLED_NAME, isUpdate: false };
          setLoading(false);
          setSheetPicker({ names: sheetNames });
          return;
        }
        const employees = parseSheet(wb, sheetName);
        applyData(BUNDLED_NAME, employees);
      } catch (e) {
        showToast('⚠ Không tải được dữ liệu: ' + e.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processFile = useCallback(async (file, isUpdate = false) => {
    setLoading(true);
    setLoadMsg('Đang đọc file...');
    try {
      const { wb, sheetName, needsPicker, sheetNames } = await openExcel(file);
      setLoadMsg('Đang phân tích...');

      if (needsPicker) {
        pendingWb.current = { wb, fileName: file.name.replace(/\.\w+$/, ''), isUpdate };
        setLoading(false);
        setSheetPicker({ names: sheetNames });
        return;
      }

      const employees = parseSheet(wb, sheetName);
      const fileName  = file.name.replace(/\.\w+$/, '');

      if (isUpdate && stored) {
        setLoading(false);
        setConfirm({ msg: `Tìm thấy ${employees.length} nhân viên trong file mới. Dữ liệu hiện tại sẽ được thay thế.`, parsed: { fileName, employees } });
        return;
      }

      applyData(fileName, employees);
    } catch (e) {
      showToast('⚠ ' + e.message, 'error');
    } finally {
      setLoading(false);
      setLoadMsg('');
    }
  }, [stored, applyData]);

  const handlePickSheet = useCallback((sheetName) => {
    setSheetPicker(null);
    const { wb, fileName, isUpdate } = pendingWb.current;
    setLoading(true);
    setLoadMsg('Đang xử lý...');
    try {
      const employees = parseSheet(wb, sheetName);
      if (isUpdate && stored) {
        setLoading(false);
        setConfirm({ msg: `Tìm thấy ${employees.length} nhân viên. Dữ liệu hiện tại sẽ được thay thế.`, parsed: { fileName, employees } });
        return;
      }
      applyData(fileName, employees);
    } catch (e) {
      showToast('⚠ ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [stored, applyData]);

  const handleClear = useCallback(() => {
    clearStore();
    setStored(null);
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-msg">{loadMsg}</p>
    </div>
  );

  return (
    <>
      {stored
        ? <Dashboard
            stored={stored}
            onUpdate={f => processFile(f, true)}
            onClear={handleClear}
          />
        : <div className="loading-screen">
            <p className="loading-msg" style={{color:'var(--sub)'}}>Không có dữ liệu. Vui lòng tải file qua nút "Cập nhật file".</p>
          </div>
      }

      {/* Sheet picker modal */}
      {sheetPicker && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Chọn sheet dữ liệu nhân sự</h3>
            <p>File có nhiều sheet — chọn sheet chứa danh sách nhân viên.</p>
            <div className="modal-sheet-list">
              {sheetPicker.names.map(n => (
                <button key={n} className="modal-sheet-opt" onClick={() => handlePickSheet(n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm replace modal */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Xác nhận cập nhật dữ liệu</h3>
            <p>{confirm.msg}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>Hủy</button>
              <button className="btn-primary" onClick={() => { applyData(confirm.parsed.fileName, confirm.parsed.employees); setConfirm(null); }}>
                Xác nhận thay thế
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
