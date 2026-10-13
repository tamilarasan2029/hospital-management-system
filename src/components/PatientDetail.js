import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton, statusBadge } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px',
  boxSizing: 'border-box', fontSize: '14px',
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>{label}</p>
    {children}
  </div>
);

// Full-page view for one patient: see everything, edit it, or delete it.
const PatientDetail = ({ patient, appointments, API_URL, authHeaders, onBack, onChanged }) => {
  const [current, setCurrent] = useState(patient);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bills, setBills] = useState([]);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({});

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const startEdit = () => {
    setForm({
      name: current.name || '',
      email: current.email || '',
      phone: current.phone || '',
      gender: current.gender || '',
      date_of_birth: current.date_of_birth || '',
      blood_type: current.blood_type || '',
      medical_history: current.medical_history || '',
    });
    setEditing(true);
  };

  useEffect(() => {
    const loadBills = async () => {
      try {
        const res = await fetch(`${API_URL}/billing/patient/${patient.patient_id}`, { headers: authHeaders ? authHeaders() : {} });
        const result = await res.json();
        if (res.ok) setBills(result.data || []);
      } catch (err) {
        console.error('Error loading bills:', err);
      }
    };
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.patient_id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast('Name, email and phone are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/patients/${current.patient_id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({
          ...form,
          date_of_birth: form.date_of_birth || null,
          blood_type: form.blood_type || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || 'Could not update patient', 'error');
        setSaving(false);
        return;
      }
      setCurrent(result.data);
      setEditing(false);
      showToast('Patient updated successfully.');
      if (onChanged) await onChanged();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Could not reach the server', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${current.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/patients/${current.patient_id}`, {
        method: 'DELETE',
        headers: authHeaders ? authHeaders() : {},
      });
      const result = await res.json();
      if (!res.ok) {
        // Shows the real reason, e.g. "still has 2 appointment(s)"
        showToast(result.message || 'Could not delete patient', 'error');
        return;
      }
      if (onChanged) await onChanged();
      onBack();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const patientAppointments = (appointments || [])
    .filter(a => a.patient_id === current.patient_id)
    .sort((a, b) => new Date(b.appointment_date_time) - new Date(a.appointment_date_time));

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '16px', padding: 0 }}
      >
        ← Back to all patients
      </button>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000, maxWidth: '380px',
          background: toast.type === 'error' ? colors.danger : colors.success,
          color: 'white', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: colors.textPrimary }}>👤 {current.name}</h1>
        {!editing && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={startEdit} style={primaryButton}>✏️ Edit Patient</button>
            <button onClick={handleDelete} style={{ ...secondaryButton, color: colors.danger, borderColor: colors.danger }}>🗑️ Delete</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Patient Information</h3>

          {editing ? (
            <form onSubmit={handleSave}>
              <Field label="Full Name *">
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email *">
                <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone *">
                <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Gender">
                <select style={inputStyle} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" style={inputStyle} value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </Field>
              <Field label="Blood Type">
                <select style={inputStyle} value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })}>
                  <option value="">Unknown</option>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Medical History">
                <textarea rows={3} style={inputStyle} value={form.medical_history} onChange={(e) => setForm({ ...form, medical_history: e.target.value })} />
              </Field>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={saving} style={{ ...primaryButton, flex: 1, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={saving} style={{ ...secondaryButton, flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <Field label="Email"><span>{current.email}</span></Field>
              <Field label="Phone"><span>{current.phone}</span></Field>
              <Field label="Gender"><span>{current.gender || 'Not set'}</span></Field>
              <Field label="Date of Birth"><span>{current.date_of_birth || 'Not set'}</span></Field>
              <Field label="Blood Type"><span>{current.blood_type || 'Unknown'}</span></Field>
              <Field label="Medical History">
                <span style={{ color: current.medical_history ? colors.danger : colors.textMuted }}>
                  {current.medical_history || 'None recorded'}
                </span>
              </Field>
            </>
          )}
        </div>

        <div>
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Appointments ({patientAppointments.length})</h3>
            {patientAppointments.length > 0 ? (
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {patientAppointments.map(a => (
                  <div key={a.appointment_id} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Dr. {a.doctor_name}</span>
                      <span style={statusBadge(a.status)}>{a.status}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                      {new Date(a.appointment_date_time).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textMuted, margin: 0 }}>No appointments yet</p>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Billing ({bills.length})</h3>
            {bills.length > 0 ? (
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {bills.map(b => (
                  <div key={b.billing_id} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>₹{Number(b.amount).toFixed(2)}</span>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>{b.description || 'No description'}</div>
                    </div>
                    <span style={statusBadge(b.status)}>{b.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textMuted, margin: 0 }}>No bills yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
