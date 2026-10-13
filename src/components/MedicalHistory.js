import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px',
};

// The EHR/EMR module: wires up the medical_records backend that already
// existed but had no frontend page. Doctors/admins pick a patient, see
// their full medical record timeline, and add new entries.
const MedicalHistory = ({ patients, API_URL, authHeaders }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const loadData = async (patientId) => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [recRes, presRes] = await Promise.all([
        fetch(`${API_URL}/medical-records/patient/${patientId}`, { headers: authHeaders ? authHeaders() : {} }),
        fetch(`${API_URL}/prescriptions/patient/${patientId}`, { headers: authHeaders ? authHeaders() : {} }),
      ]);
      const recResult = await recRes.json();
      const presResult = await presRes.json();
      if (recRes.ok) setRecords(recResult.data || []);
      if (presRes.ok) setPrescriptions(presResult.data || []);
    } catch (err) {
      console.error('Error loading medical history:', err);
      showToast('Could not reach the server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) loadData(selectedPatientId);
    else { setRecords([]); setPrescriptions([]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      patient_id: parseInt(selectedPatientId, 10),
      record_type: formData.get('record_type'),
      content: formData.get('content'),
    };
    try {
      const response = await fetch(`${API_URL}/medical-records`, {
        method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not save record', 'error');
        return;
      }
      showToast('Medical record added');
      e.target.reset();
      setShowForm(false);
      await loadData(selectedPatientId);
    } catch (err) {
      console.error('Error adding record:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const selectedPatient = patients?.find(p => String(p.patient_id) === String(selectedPatientId));

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>📋 Medical History (EHR)</h1>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: toast.type === 'error' ? colors.danger : colors.success,
          color: 'white', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: colors.textSecondary }}>Select Patient</label>
        <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} style={{ ...inputStyle, maxWidth: '400px' }}>
          <option value="">-- Choose a patient --</option>
          {patients?.map(p => (
            <option key={p.patient_id} value={p.patient_id}>{p.name} ({p.email})</option>
          ))}
        </select>
      </div>

      {selectedPatientId && (
        <>
          {selectedPatient?.medical_history && (
            <div style={{ ...cardStyle, marginBottom: '20px', borderLeft: `4px solid ${colors.warning}` }}>
              <p style={{ margin: 0, fontWeight: 600, color: colors.textSecondary, fontSize: '13px' }}>⚠️ On-file medical history (from patient record)</p>
              <p style={{ margin: '8px 0 0 0', color: colors.textPrimary }}>{selectedPatient.medical_history}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: colors.textPrimary }}>Record Timeline</h3>
            <button onClick={() => setShowForm(!showForm)} style={secondaryButton}>
              {showForm ? '✕ Cancel' : '➕ Add Entry'}
            </button>
          </div>

          {showForm && (
            <div style={{ ...cardStyle, marginBottom: '20px', maxWidth: '520px' }}>
              <form onSubmit={handleAddRecord}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Type</label>
                <select name="record_type" required style={{ ...inputStyle, marginBottom: '12px' }}>
                  <option value="Checkup">Checkup</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Doctor Note">Doctor Note</option>
                </select>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Details</label>
                <textarea name="content" required rows={3} style={{ ...inputStyle, marginBottom: '14px' }} placeholder="What was checked, diagnosed, or treated..." />
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Save Entry</button>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            {loading ? (
              <p style={{ color: colors.textMuted }}>Loading...</p>
            ) : records.length > 0 ? (
              records.map(r => (
                <div key={r.record_id} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: colors.primary, fontSize: '13px' }}>{r.record_type}</span>
                    <span style={{ color: colors.textMuted, fontSize: '12px' }}>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '6px 0 0 0', color: colors.textPrimary, fontSize: '14px' }}>{r.content}</p>
                </div>
              ))
            ) : (
              <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>No medical history entries yet</p>
            )}
          </div>

          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Prescriptions</h3>
            {prescriptions.length > 0 ? (
              prescriptions.map(p => (
                <div key={p.prescription_id} style={{ padding: '10px', borderBottom: `1px solid ${colors.border}` }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{p.medication} — {p.dosage}</p>
                  <p style={{ margin: '4px 0 0 0', color: colors.textSecondary, fontSize: '12px' }}>{p.frequency}, {p.duration}</p>
                </div>
              ))
            ) : (
              <p style={{ color: colors.textMuted, fontSize: '13px' }}>No prescriptions on file</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalHistory;
