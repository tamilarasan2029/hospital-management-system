import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px',
};

// Operation theatre & ward/bed management module.
const WardManagement = ({ patients, doctors, API_URL, authHeaders }) => {
  const [tab, setTab] = useState('beds'); // 'beds' | 'ot'
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [otBookings, setOtBookings] = useState([]);
  const [showWardForm, setShowWardForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [showOtForm, setShowOtForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const fetchAll = async () => {
    try {
      const [wardsRes, bedsRes, otRes] = await Promise.all([
        fetch(`${API_URL}/wards`, { headers: authHeaders ? authHeaders() : {} }),
        fetch(`${API_URL}/wards/beds`, { headers: authHeaders ? authHeaders() : {} }),
        fetch(`${API_URL}/ot-bookings`, { headers: authHeaders ? authHeaders() : {} }),
      ]);
      const wardsResult = await wardsRes.json();
      const bedsResult = await bedsRes.json();
      const otResult = await otRes.json();
      if (wardsRes.ok) setWards(wardsResult.data || []);
      if (bedsRes.ok) setBeds(bedsResult.data || []);
      if (otRes.ok) setOtBookings(otResult.data || []);
    } catch (err) {
      console.error('Error fetching ward data:', err);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddWard = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(`${API_URL}/wards`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({ name: formData.get('name'), ward_type: formData.get('ward_type'), total_beds: parseInt(formData.get('total_beds'), 10) || 0 }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not add ward', 'error'); return; }
      showToast('Ward added');
      e.target.reset(); setShowWardForm(false);
      await fetchAll();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(`${API_URL}/wards/beds`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({ ward_id: parseInt(formData.get('ward_id'), 10), bed_number: formData.get('bed_number') }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not add bed', 'error'); return; }
      showToast('Bed added');
      e.target.reset(); setShowBedForm(false);
      await fetchAll();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleAdmit = async (bedId, patientId) => {
    if (!patientId) { showToast('Select a patient first', 'error'); return; }
    try {
      const response = await fetch(`${API_URL}/wards/beds/${bedId}/admit`, {
        method: 'PUT', headers: jsonHeaders(), body: JSON.stringify({ patient_id: parseInt(patientId, 10) }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not admit patient', 'error'); return; }
      showToast('Patient admitted');
      await fetchAll();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleDischarge = async (bedId) => {
    if (!window.confirm('Discharge this patient and free the bed?')) return;
    try {
      const response = await fetch(`${API_URL}/wards/beds/${bedId}/discharge`, { method: 'PUT', headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not discharge', 'error'); return; }
      showToast('Patient discharged, bed freed');
      await fetchAll();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleBookOt = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(`${API_URL}/ot-bookings`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({
          patient_id: parseInt(formData.get('patient_id'), 10),
          doctor_id: parseInt(formData.get('doctor_id'), 10),
          ot_room: formData.get('ot_room'),
          procedure_name: formData.get('procedure_name'),
          scheduled_start: new Date(formData.get('start')).toISOString(),
          scheduled_end: new Date(formData.get('end')).toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not book OT', 'error'); return; }
      showToast('Operation theatre booked');
      e.target.reset(); setShowOtForm(false);
      await fetchAll();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>🏥 Ward, Bed & OT Management</h1>

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, background: toast.type === 'error' ? colors.danger : colors.success, color: 'white', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `2px solid ${colors.border}` }}>
        <button onClick={() => setTab('beds')} style={{ padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: tab === 'beds' ? colors.primary : colors.textSecondary, borderBottom: tab === 'beds' ? `3px solid ${colors.primary}` : '3px solid transparent' }}>
          Wards & Beds
        </button>
        <button onClick={() => setTab('ot')} style={{ padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: tab === 'ot' ? colors.primary : colors.textSecondary, borderBottom: tab === 'ot' ? `3px solid ${colors.primary}` : '3px solid transparent' }}>
          Operation Theatre
        </button>
      </div>

      {tab === 'beds' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button onClick={() => setShowWardForm(!showWardForm)} style={secondaryButton}>➕ Add Ward</button>
            <button onClick={() => setShowBedForm(!showBedForm)} style={secondaryButton}>➕ Add Bed</button>
          </div>

          {showWardForm && (
            <div style={{ ...cardStyle, marginBottom: '16px', maxWidth: '480px' }}>
              <form onSubmit={handleAddWard}>
                <input name="name" placeholder="Ward name (e.g. General Ward A)" required style={{ ...inputStyle, marginBottom: '10px' }} />
                <select name="ward_type" style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="GENERAL">General</option>
                  <option value="ICU">ICU</option>
                  <option value="MATERNITY">Maternity</option>
                  <option value="PEDIATRIC">Pediatric</option>
                </select>
                <input name="total_beds" type="number" placeholder="Total bed count" style={{ ...inputStyle, marginBottom: '12px' }} />
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Add Ward</button>
              </form>
            </div>
          )}

          {showBedForm && (
            <div style={{ ...cardStyle, marginBottom: '16px', maxWidth: '480px' }}>
              <form onSubmit={handleAddBed}>
                <select name="ward_id" required style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="">Select ward</option>
                  {wards.map(w => <option key={w.ward_id} value={w.ward_id}>{w.name}</option>)}
                </select>
                <input name="bed_number" placeholder="Bed number (e.g. A-101)" required style={{ ...inputStyle, marginBottom: '12px' }} />
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Add Bed</button>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {beds.map(bed => {
              const ward = wards.find(w => w.ward_id === bed.ward_id);
              const occupied = bed.status === 'OCCUPIED';
              return (
                <div key={bed.bed_id} style={{ ...cardStyle, borderLeft: `4px solid ${occupied ? colors.danger : colors.success}` }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Bed {bed.bed_number}</p>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: colors.textSecondary }}>{ward?.name || 'Unknown ward'}</p>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: occupied ? colors.dangerBg : colors.successBg, color: occupied ? colors.danger : colors.success, marginBottom: '10px' }}>
                    {bed.status}
                  </span>
                  {occupied ? (
                    <button onClick={() => handleDischarge(bed.bed_id)} style={{ ...secondaryButton, width: '100%', fontSize: '12px' }}>Discharge</button>
                  ) : (
                    <select onChange={(e) => e.target.value && handleAdmit(bed.bed_id, e.target.value)} defaultValue="" style={{ ...inputStyle, fontSize: '12px' }}>
                      <option value="">Admit patient...</option>
                      {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
            {beds.length === 0 && <p style={{ color: colors.textMuted }}>No beds added yet</p>}
          </div>
        </>
      )}

      {tab === 'ot' && (
        <>
          <button onClick={() => setShowOtForm(!showOtForm)} style={{ ...secondaryButton, marginBottom: '16px' }}>➕ Book OT</button>

          {showOtForm && (
            <div style={{ ...cardStyle, marginBottom: '16px', maxWidth: '520px' }}>
              <form onSubmit={handleBookOt}>
                <select name="patient_id" required style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="">Select patient</option>
                  {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                </select>
                <select name="doctor_id" required style={{ ...inputStyle, marginBottom: '10px' }}>
                  <option value="">Select surgeon</option>
                  {doctors?.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name}</option>)}
                </select>
                <input name="ot_room" placeholder="OT room (e.g. OT-1)" required style={{ ...inputStyle, marginBottom: '10px' }} />
                <input name="procedure_name" placeholder="Procedure name" style={{ ...inputStyle, marginBottom: '10px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <input name="start" type="datetime-local" required style={inputStyle} />
                  <input name="end" type="datetime-local" required style={inputStyle} />
                </div>
                <button type="submit" style={{ ...primaryButton, width: '100%' }}>Book Operation Theatre</button>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            {otBookings.length > 0 ? otBookings.map(b => (
              <div key={b.ot_booking_id} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{b.ot_room} — {b.procedure_name || 'Procedure TBD'}</p>
                <p style={{ margin: '4px 0', fontSize: '13px', color: colors.textSecondary }}>{b.patient_name} with Dr. {b.doctor_name}</p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: colors.textMuted }}>{new Date(b.scheduled_start).toLocaleString()} → {new Date(b.scheduled_end).toLocaleString()}</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: colors.primary }}>{b.status}</span>
              </div>
            )) : <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>No OT bookings yet</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default WardManagement;
