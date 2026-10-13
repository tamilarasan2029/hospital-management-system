import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' };

// Lab & radiology test ordering and result routing.
const LabOrders = ({ patients, doctors, API_URL, authHeaders }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [resultDraftId, setResultDraftId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => { setToast({ text, type }); setTimeout(() => setToast(null), 3000); };
  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const loadOrders = async (patientId) => {
    if (!patientId) { setOrders([]); return; }
    try {
      const response = await fetch(`${API_URL}/lab-orders/patient/${patientId}`, { headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (response.ok) setOrders(result.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadOrders(selectedPatientId); }, [selectedPatientId]); // eslint-disable-line

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(`${API_URL}/lab-orders`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({
          patient_id: parseInt(selectedPatientId, 10),
          doctor_id: parseInt(formData.get('doctor_id'), 10),
          test_type: formData.get('test_type'),
          test_name: formData.get('test_name'),
        }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not create order', 'error'); return; }
      showToast('Test ordered');
      e.target.reset(); setShowForm(false);
      await loadOrders(selectedPatientId);
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleSaveResult = async (orderId, resultText) => {
    try {
      const response = await fetch(`${API_URL}/lab-orders/${orderId}/result`, {
        method: 'PUT', headers: jsonHeaders(),
        body: JSON.stringify({ status: 'COMPLETED', result_text: resultText }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not save result', 'error'); return; }
      showToast('Result saved and routed to the record');
      setResultDraftId(null);
      await loadOrders(selectedPatientId);
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>🧪 Lab & Radiology Orders</h1>

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, background: toast.type === 'error' ? colors.danger : colors.success, color: 'white', padding: '12px 18px', borderRadius: '8px', fontWeight: 600 }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: colors.textSecondary }}>Select Patient</label>
        <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} style={{ ...inputStyle, maxWidth: '400px' }}>
          <option value="">-- Choose a patient --</option>
          {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
        </select>
      </div>

      {selectedPatientId && (
        <>
          <button onClick={() => setShowForm(!showForm)} style={{ ...secondaryButton, marginBottom: '16px' }}>{showForm ? '✕ Cancel' : '➕ Order Test'}</button>

          {showForm && (
            <div style={{ ...cardStyle, marginBottom: '16px', maxWidth: '480px' }}>
              <form onSubmit={handleCreate}>
                <select name="doctor_id" required style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="">Ordering doctor</option>
                  {doctors?.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name}</option>)}
                </select>
                <select name="test_type" required style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="LAB">Lab Test</option>
                  <option value="RADIOLOGY">Radiology</option>
                </select>
                <input name="test_name" placeholder="Test name (e.g. Complete Blood Count, Chest X-Ray)" required style={{ ...inputStyle, marginBottom: '12px' }} />
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Order Test</button>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            {orders.length > 0 ? orders.map(o => (
              <div key={o.order_id} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{o.test_type === 'RADIOLOGY' ? '🩻' : '🧪'} {o.test_name}</p>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: o.status === 'COMPLETED' ? colors.success : colors.warning }}>{o.status}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '12px', color: colors.textMuted }}>Ordered {new Date(o.ordered_at).toLocaleString()}</p>
                {o.result_text ? (
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', background: colors.bgPage, padding: '8px', borderRadius: '6px' }}>{o.result_text}</p>
                ) : resultDraftId === o.order_id ? (
                  <div style={{ marginTop: '8px' }}>
                    <textarea id={`result-${o.order_id}`} rows={2} placeholder="Enter result..." style={{ ...inputStyle, marginBottom: '8px' }} />
                    <button onClick={() => handleSaveResult(o.order_id, document.getElementById(`result-${o.order_id}`).value)} style={{ ...primaryButton, fontSize: '12px', padding: '7px 14px' }}>Save Result</button>
                  </div>
                ) : (
                  <button onClick={() => setResultDraftId(o.order_id)} style={{ ...secondaryButton, fontSize: '12px', padding: '6px 12px', marginTop: '8px' }}>Enter Result</button>
                )}
              </div>
            )) : <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>No lab/radiology orders for this patient</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default LabOrders;
