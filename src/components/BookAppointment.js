import React, { useState } from 'react';
import { colors, cardStyle, primaryButton } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px',
};

// Dedicated booking page, separate from the list of existing appointments,
// as requested - this used to live combined with the list on one screen.
const BookAppointment = ({ onFetchAppointments, API_URL, patients, doctors, authHeaders, setCurrentPage }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      patient_id: parseInt(formData.get('patientId'), 10),
      doctor_id: parseInt(formData.get('doctorId'), 10),
      appointment_date_time: new Date(formData.get('datetime')).toISOString(),
      reason: formData.get('reason'),
    };

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        showToast(result.message || `Could not book (HTTP ${response.status})`, 'error');
        setLoading(false);
        return;
      }

      showToast(`Booked with Dr. ${result.data.doctor_name} for ${result.data.patient_name}`);
      e.target.reset();
      await onFetchAppointments();
    } catch (err) {
      console.error('Booking error:', err);
      showToast('Could not reach the server. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>📅 Book Appointment</h1>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: toast.type === 'error' ? colors.danger : colors.success,
          color: 'white', padding: '12px 18px', borderRadius: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: 600, maxWidth: '360px',
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ ...cardStyle, maxWidth: '520px' }}>
        <form onSubmit={handleBookAppointment}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: colors.textSecondary }}>Patient</label>
            <select name="patientId" required style={inputStyle}>
              <option value="">Select Patient</option>
              {patients?.map(p => (
                <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: colors.textSecondary }}>Doctor</label>
            <select name="doctorId" required style={inputStyle}>
              <option value="">Select Doctor</option>
              {doctors?.map(d => (
                <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: colors.textSecondary }}>Date & Time</label>
            <input type="datetime-local" name="datetime" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: colors.textSecondary }}>Reason</label>
            <input type="text" name="reason" placeholder="Checkup, follow-up, etc." required style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{ ...primaryButton, width: '100%', opacity: loading ? 0.6 : 1, marginBottom: '10px' }}>
            {loading ? 'Booking...' : '✓ Book Appointment'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage && setCurrentPage('appointments')}
            style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            View All Appointments →
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
