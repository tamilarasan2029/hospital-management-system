import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = {
  width: '100%', padding: '11px', border: '1px solid #e2e8f0', borderRadius: '8px',
  boxSizing: 'border-box', fontSize: '15px',
};

// Guest appointment booking - no login, no account, no password. A visitor
// picks a doctor, sees real open slots (pulled from the same conflict-aware
// backend that powers the admin booking page), fills in their own details,
// and gets a confirmation. Behind the scenes this creates a real Patient
// row and a real Appointment row, so it shows up in Admin immediately -
// same database, same tables, nothing fake or separate.
const PublicBooking = ({ doctors, API_URL, onDone }) => {
  const [step, setStep] = useState(1); // 1 doctor, 2 date/time, 3 details, 4 confirmed
  const [specialization, setSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', gender: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const specializations = [...new Set((doctors || []).map(d => d.specialization))].sort();
  const filteredDoctors = specialization ? doctors.filter(d => d.specialization === specialization) : doctors;

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor || !date) { setSlots([]); return; }
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await fetch(`${API_URL}/doctors/${selectedDoctor.doctor_id}/available-slots?day=${date}&slot_minutes=30`);
        const result = await res.json();
        if (res.ok) setSlots(result.data || []);
        else setSlots([]);
      } catch (err) {
        console.error('Error loading slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDoctor, date, API_URL]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.dob || !form.gender) {
      setError('Please fill in your name, email, phone, date of birth, and gender.');
      return;
    }
    setSubmitting(true);
    try {
      // Step 1: find-or-create the patient by email, so a returning guest
      // doesn't end up with a duplicate record every time they book.
      const apptRes = await fetch(`${API_URL}/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          date_of_birth: form.dob,
          gender: form.gender,
          doctor_id: selectedDoctor.doctor_id,
          appointment_date_time: selectedSlot,
          reason: form.reason.trim() || 'Not specified',
        }),
      });
      const apptResult = await apptRes.json();
      if (!apptRes.ok) {
        setError(apptResult.message || 'Please check your details and try again.');
        setSubmitting(false);
        return;
      }

      setConfirmation(apptResult.data);
      setStep(4);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4 && confirmation) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ ...cardStyle, maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <h2 style={{ color: colors.textPrimary, margin: '0 0 4px 0' }}>Appointment Confirmed</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px' }}>Appointment ID: APT-{String(confirmation.appointment_id).padStart(5, '0')}</p>

          <div style={{ background: colors.bgPage, padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '20px' }}>
            <p style={{ margin: '4px 0' }}><strong>Patient:</strong> {confirmation.patient_name}</p>
            <p style={{ margin: '4px 0' }}><strong>Doctor:</strong> Dr. {confirmation.doctor_name}</p>
            <p style={{ margin: '4px 0' }}><strong>Date & Time:</strong> {new Date(confirmation.appointment_date_time).toLocaleString()}</p>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> {confirmation.status}</p>
          </div>

          <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '20px' }}>
            Please save this Appointment ID. The hospital front desk can look up your booking using it.
          </p>

          <button onClick={() => window.print()} style={{ ...secondaryButton, width: '100%', marginBottom: '10px' }}>🖨️ Print Confirmation</button>
          <button onClick={onDone} style={{ ...primaryButton, width: '100%' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bgPage, padding: '30px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontWeight: 600, marginBottom: '16px' }}>← Back to Home</button>
        <h1 style={{ color: colors.textPrimary }}>📅 Book an Appointment</h1>
        <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>No account needed — book as a guest in under a minute.</p>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= n ? colors.primary : colors.border }} />
          ))}
        </div>

        {error && (
          <div style={{ background: colors.dangerBg, color: colors.danger, padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Step 1 — Choose a Doctor</h3>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Specialization</label>
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={{ ...inputStyle, marginBottom: '18px' }}>
              <option value="">All specializations</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredDoctors.map(d => (
                <div
                  key={d.doctor_id}
                  onClick={() => { setSelectedDoctor(d); setStep(2); }}
                  style={{
                    padding: '14px', borderRadius: '8px', border: `1px solid ${colors.border}`,
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: colors.textPrimary }}>Dr. {d.name}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                      {d.specialization} · {d.years_of_experience} yrs experience · ₹{d.consultation_fee}
                    </p>
                  </div>
                  <span style={{ color: colors.primary, fontWeight: 600, fontSize: '13px' }}>Select →</span>
                </div>
              ))}
              {filteredDoctors.length === 0 && <p style={{ color: colors.textMuted }}>No doctors found for this specialization.</p>}
            </div>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Step 2 — Pick Date & Time</h3>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '-8px' }}>Dr. {selectedDoctor.name} — {selectedDoctor.specialization}</p>

            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: colors.textSecondary }}>Date</label>
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: '18px', maxWidth: '220px' }} />

            {date && (
              loadingSlots ? (
                <p style={{ color: colors.textMuted }}>Checking availability...</p>
              ) : slots.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '18px' }}>
                  {slots.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      style={{
                        padding: '10px', borderRadius: '6px', border: `1px solid ${selectedSlot === s ? colors.primary : colors.border}`,
                        background: selectedSlot === s ? colors.primary : 'white', color: selectedSlot === s ? 'white' : colors.textPrimary,
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      }}
                    >
                      {new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.warning, marginBottom: '18px' }}>No open slots this day — try another date.</p>
              )
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={{ ...secondaryButton, flex: 1 }}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedSlot} style={{ ...primaryButton, flex: 1, opacity: selectedSlot ? 1 : 0.5 }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Step 3 — Your Details</h3>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '-8px' }}>
              Dr. {selectedDoctor.name} · {new Date(selectedSlot).toLocaleString()}
            </p>
            <form onSubmit={handleConfirm}>
              <div style={{ marginBottom: '12px' }}>
                <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                <input type="tel" placeholder="Mobile Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input type="date" placeholder="Date of Birth" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={inputStyle}>
                  <option value="">Gender *</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <textarea placeholder="Reason for visit / symptoms" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ ...inputStyle, marginBottom: '18px' }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(2)} disabled={submitting} style={{ ...secondaryButton, flex: 1 }}>← Back</button>
                <button type="submit" disabled={submitting} style={{ ...primaryButton, flex: 1, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
