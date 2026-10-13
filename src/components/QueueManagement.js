import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' };

// Walk-in / same-day queue management, separate from scheduled appointments.
const QueueManagement = ({ patients, doctors, API_URL, authHeaders }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [queue, setQueue] = useState([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => { setToast({ text, type }); setTimeout(() => setToast(null), 3000); };
  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const loadQueue = async (doctorId) => {
    if (!doctorId) { setQueue([]); return; }
    try {
      const response = await fetch(`${API_URL}/queue/doctor/${doctorId}`, { headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (response.ok) setQueue(result.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadQueue(selectedDoctorId); }, [selectedDoctorId]); // eslint-disable-line

  const handleCheckIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(`${API_URL}/queue/check-in`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({ patient_id: parseInt(formData.get('patient_id'), 10), doctor_id: parseInt(selectedDoctorId, 10) }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not check in', 'error'); return; }
      showToast(`Checked in — token #${result.data.token_number}`);
      e.target.reset(); setShowCheckIn(false);
      await loadQueue(selectedDoctorId);
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleCallNext = async () => {
    try {
      const response = await fetch(`${API_URL}/queue/doctor/${selectedDoctorId}/call-next`, { method: 'PUT', headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'No one waiting', 'error'); return; }
      showToast(`Now calling: ${result.data.patient_name} (token #${result.data.token_number})`);
      await loadQueue(selectedDoctorId);
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleComplete = async (queueId) => {
    try {
      const response = await fetch(`${API_URL}/queue/${queueId}/status?status=COMPLETED`, { method: 'PUT', headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not update', 'error'); return; }
      showToast('Marked as completed');
      await loadQueue(selectedDoctorId);
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const waiting = queue.filter(q => q.status === 'WAITING');
  const called = queue.find(q => q.status === 'CALLED');

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>🎫 Queue Management</h1>

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, background: toast.type === 'error' ? colors.danger : colors.success, color: 'white', padding: '12px 18px', borderRadius: '8px', fontWeight: 600 }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: colors.textSecondary }}>Select Doctor</label>
        <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} style={{ ...inputStyle, maxWidth: '400px' }}>
          <option value="">-- Choose a doctor --</option>
          {doctors?.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name}</option>)}
        </select>
      </div>

      {selectedDoctorId && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setShowCheckIn(!showCheckIn)} style={secondaryButton}>➕ Check In Patient</button>
            <button onClick={handleCallNext} style={primaryButton}>📢 Call Next</button>
          </div>

          {showCheckIn && (
            <div style={{ ...cardStyle, marginBottom: '20px', maxWidth: '420px' }}>
              <form onSubmit={handleCheckIn}>
                <select name="patient_id" required style={{ ...inputStyle, marginBottom: '12px' }}>
                  <option value="">Select patient</option>
                  {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                </select>
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Check In</button>
              </form>
            </div>
          )}

          {called && (
            <div style={{ ...cardStyle, marginBottom: '16px', background: colors.primary, color: 'white', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>NOW SERVING</p>
              <h2 style={{ margin: '8px 0' }}>Token #{called.token_number} — {called.patient_name}</h2>
              <button onClick={() => handleComplete(called.queue_id)} style={{ ...secondaryButton, background: 'white' }}>✓ Mark Completed</button>
            </div>
          )}

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Waiting ({waiting.length})</h3>
            {waiting.length > 0 ? waiting.map(q => (
              <div key={q.queue_id} style={{ padding: '10px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <span>Token #{q.token_number} — {q.patient_name}</span>
                <span style={{ color: colors.textMuted, fontSize: '12px' }}>{new Date(q.checked_in_at).toLocaleTimeString()}</span>
              </div>
            )) : <p style={{ color: colors.textMuted, fontSize: '13px' }}>No one waiting</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default QueueManagement;
