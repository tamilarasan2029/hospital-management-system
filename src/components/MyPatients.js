import React, { useState, useMemo } from 'react';

// Finds each patient's most recent appointment, since "treated" is tracked
// on the appointment (status COMPLETED), not on the patient record itself -
// this is what makes the status survive a page refresh, unlike before.
function latestAppointmentFor(patientId, appointments) {
  const matches = (appointments || []).filter(a => a.patient_id === patientId);
  if (matches.length === 0) return null;
  return matches.sort(
    (a, b) => new Date(b.appointment_date_time) - new Date(a.appointment_date_time)
  )[0];
}

const MyPatients = ({ patients, appointments, user, API_URL, onFetchAppointments, authHeaders, setCurrentPage }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});   // { [appointmentId]: draftText }
  const [editingNoteId, setEditingNoteId] = useState(null); // which appointment's note is currently unlocked
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);           // { text, type }

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const patientList = useMemo(() => {
    const withLatest = (patients || []).map(p => ({
      ...p,
      _latestAppointment: latestAppointmentFor(p.patient_id, appointments),
    }));

    // If this login is linked to a real Doctor record, only show patients
    // who actually have an appointment with THIS doctor - previously every
    // doctor account saw every patient in the system regardless of who
    // they were actually treating.
    if (user?.doctorId) {
      return withLatest.filter(p =>
        (appointments || []).some(a => a.patient_id === p.patient_id && a.doctor_id === user.doctorId)
      );
    }
    return withLatest;
  }, [patients, appointments, user]);

  const [statusMenuFor, setStatusMenuFor] = useState(null); // which patient's status badge is open
  const [listFilter, setListFilter] = useState('all'); // 'all' | 'pending' | 'treated' | 'noAppointment' - set by clicking a stat card

  const changeStatus = async (appointment, newStatus) => {
    if (!appointment) return;
    setSavingId(appointment.appointment_id);
    try {
      const response = await fetch(`${API_URL}/appointments/${appointment.appointment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not update appointment', 'error');
        return;
      }
      // Re-fetch from the backend so every screen reflects the real, saved state -
      // this is the fix for the "resets after refresh" bug.
      if (onFetchAppointments) await onFetchAppointments();
      showToast(newStatus === 'COMPLETED' ? 'Patient marked as treated' : 'Status updated to Pending');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Could not reach the server', 'error');
    } finally {
      setSavingId(null);
      setStatusMenuFor(null);
    }
  };

  // Kept for the "Mark Treated" button used elsewhere in this file.
  const markTreated = (appointment) => changeStatus(appointment, 'COMPLETED');

  const saveNotes = async (appointment) => {
    if (!appointment) return;
    const text = (noteDrafts[appointment.appointment_id] ?? '').trim();

    if (!text) {
      showToast('Please enter a note before saving.', 'error');
      return;
    }

    setSavingId(appointment.appointment_id);
    try {
      const response = await fetch(`${API_URL}/appointments/${appointment.appointment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify({ diagnosis: text }),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not save notes', 'error');
        return;
      }
      if (onFetchAppointments) await onFetchAppointments();
      setEditingNoteId(null);
      showToast('Note saved successfully.');
    } catch (err) {
      console.error('Error saving notes:', err);
      showToast('Could not reach the server', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const treatedCount = patientList.filter(p => p._latestAppointment?.status === 'COMPLETED').length;
  const noAppointmentCount = patientList.filter(p => !p._latestAppointment).length;
  const pendingCount = patientList.length - treatedCount - noAppointmentCount;

  const visiblePatientList = patientList.filter(p => {
    if (listFilter === 'pending') return p._latestAppointment && p._latestAppointment.status !== 'COMPLETED';
    if (listFilter === 'treated') return p._latestAppointment?.status === 'COMPLETED';
    if (listFilter === 'noAppointment') return !p._latestAppointment;
    return true;
  });

  return (
    <div>
      <h1 style={{ color: '#1a3a2a' }}>👨‍⚕️ My Patients - Dr. {user?.name}</h1>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: toast.type === 'error' ? '#fdecea' : '#e6f7ec',
          color: toast.type === 'error' ? '#c0392b' : '#1e7e34',
          border: `1px solid ${toast.type === 'error' ? '#f5c6cb' : '#b7e4c7'}`,
          padding: '12px 18px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          fontSize: '14px', fontWeight: 600,
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      {/* STATS - each card is clickable and filters the list below */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '10px' }}>
        <div
          onClick={() => setListFilter('all')}
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', outline: listFilter === 'all' ? '3px solid #333' : 'none' }}
        >
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Total Patients</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{patientList.length}</h2>
        </div>
        <div
          onClick={() => setListFilter('pending')}
          style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', outline: listFilter === 'pending' ? '3px solid #333' : 'none' }}
        >
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Pending</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{pendingCount}</h2>
        </div>
        <div
          onClick={() => setListFilter('treated')}
          style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', outline: listFilter === 'treated' ? '3px solid #333' : 'none' }}
        >
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Treated</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{treatedCount}</h2>
        </div>
        <div
          onClick={() => setListFilter('noAppointment')}
          style={{ background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', outline: listFilter === 'noAppointment' ? '3px solid #333' : 'none' }}
        >
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>No Appointment</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{noAppointmentCount}</h2>
        </div>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '25px' }}>
        "No Appointment" means the patient is on your list but has no appointment booked with you yet - book one before you can record treatment or mark them as treated. Click any card above to filter the list below.
      </p>

      {/* PATIENT LIST */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a3a2a', marginTop: 0 }}>
          Patients Assigned to You
          {listFilter !== 'all' && (
            <button onClick={() => setListFilter('all')} style={{ marginLeft: '12px', fontSize: '12px', background: '#f0f0f0', border: 'none', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontWeight: 600, color: '#555' }}>
              Showing: {listFilter === 'pending' ? 'Pending' : listFilter === 'treated' ? 'Treated' : 'No Appointment'} ✕
            </button>
          )}
        </h3>

        {visiblePatientList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {visiblePatientList.map((patient) => {
              const appt = patient._latestAppointment;
              const isTreated = appt?.status === 'COMPLETED';
              const isSelected = selectedPatient === patient.patient_id;
              const isSaving = savingId === appt?.appointment_id;
              const draft = noteDrafts[appt?.appointment_id] ?? appt?.diagnosis ?? '';

              return (
                <div
                  key={patient.patient_id}
                  onClick={() => setSelectedPatient(isSelected ? null : patient.patient_id)}
                  style={{
                    background: isSelected ? '#dcfce7' : '#f9f9f9',
                    padding: '20px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #15803d' : '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1a3a2a', fontSize: '16px' }}>👤 {patient.name}</h4>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{patient.email}</p>
                    </div>
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <span
                        onClick={() => setStatusMenuFor(statusMenuFor === patient.patient_id ? null : patient.patient_id)}
                        style={{
                          background: !appt ? '#eceff1' : isTreated ? '#d4edda' : '#fff3cd',
                          color: !appt ? '#546e7a' : isTreated ? '#155724' : '#856404',
                          padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          cursor: 'pointer', userSelect: 'none',
                        }}
                      >
                        {!appt ? 'No appointment' : isTreated ? '✓ Treated' : '⏳ Pending'} ▾
                      </span>

                      {statusMenuFor === patient.patient_id && (
                        <div style={{
                          position: 'absolute', top: '28px', right: 0, background: 'white',
                          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 20,
                          width: '190px', overflow: 'hidden', border: '1px solid #eee',
                        }}>
                          {!appt ? (
                            <button
                              onClick={() => { setStatusMenuFor(null); setCurrentPage && setCurrentPage('bookAppointment'); }}
                              style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                            >
                              📅 Book Appointment
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => changeStatus(appt, 'SCHEDULED')}
                                disabled={!isTreated}
                                style={{
                                  width: '100%', textAlign: 'left', padding: '10px 14px', background: !isTreated ? '#f8f9fa' : 'none',
                                  border: 'none', cursor: !isTreated ? 'default' : 'pointer', fontSize: '13px', color: !isTreated ? '#aaa' : '#333',
                                }}
                              >
                                ⏳ Pending
                              </button>
                              <button
                                onClick={() => changeStatus(appt, 'COMPLETED')}
                                disabled={isTreated}
                                style={{
                                  width: '100%', textAlign: 'left', padding: '10px 14px', background: isTreated ? '#f8f9fa' : 'none',
                                  border: 'none', cursor: isTreated ? 'default' : 'pointer', fontSize: '13px', color: isTreated ? '#aaa' : '#333',
                                }}
                              >
                                ✓ Treated
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #ecf0f1', paddingTop: '15px', marginBottom: '15px' }}>
                    <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}><strong>📞</strong> {patient.phone}</p>
                    <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}><strong>🎂</strong> {patient.date_of_birth}</p>
                    <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}><strong>👫</strong> {patient.gender}</p>
                    <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}><strong>🩸</strong> {patient.blood_type || 'Unknown'}</p>
                  </div>

                  {patient.medical_history && (
                    <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginBottom: '15px', borderLeft: '3px solid #ffc107' }}>
                      <p style={{ margin: '0 0 8px 0', color: '#856404', fontWeight: 600, fontSize: '13px' }}>⚠️ Medical History:</p>
                      <p style={{ margin: 0, color: '#856404', fontSize: '13px', lineHeight: 1.5 }}>{patient.medical_history}</p>
                    </div>
                  )}

                  {appt ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
                        Diagnosis / Treatment Notes
                      </label>
                      {(() => {
                        const hasSavedNote = !!appt.diagnosis;
                        const isUnlocked = !hasSavedNote || editingNoteId === appt.appointment_id;
                        return (
                          <>
                            <textarea
                              value={draft}
                              onChange={(e) => setNoteDrafts(prev => ({ ...prev, [appt.appointment_id]: e.target.value }))}
                              placeholder="Add diagnosis or treatment notes..."
                              rows={2}
                              readOnly={!isUnlocked}
                              style={{
                                width: '100%', padding: '8px',
                                border: `1px solid ${isUnlocked ? '#ddd' : '#eee'}`, borderRadius: '6px',
                                fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                                marginBottom: '10px', background: isUnlocked ? 'white' : '#f8f9fa',
                                color: isUnlocked ? '#000' : '#555',
                              }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: isTreated ? '1fr' : '1fr 1fr', gap: '10px' }}>
                              {isUnlocked ? (
                                <button
                                  onClick={() => saveNotes(appt)}
                                  disabled={isSaving}
                                  style={{
                                    padding: '8px', background: '#15803d', color: 'white', border: 'none',
                                    borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer',
                                    fontSize: '12px', fontWeight: 600, opacity: isSaving ? 0.6 : 1,
                                  }}
                                >
                                  {isSaving ? 'Saving...' : '📝 Save Note'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingNoteId(appt.appointment_id)}
                                  style={{
                                    padding: '8px', background: '#f0f0f0', color: '#333', border: '1px solid #ddd',
                                    borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                  }}
                                >
                                  ✏️ Edit Note
                                </button>
                              )}
                              {!isTreated && (
                                <button
                                  onClick={() => markTreated(appt)}
                                  disabled={isSaving}
                                  style={{
                                    padding: '8px', background: '#16a34a', color: 'white', border: 'none',
                                    borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer',
                                    fontSize: '12px', fontWeight: 600, opacity: isSaving ? 0.6 : 1,
                                  }}
                                >
                                  {isSaving ? 'Saving...' : '✓ Mark Treated'}
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                      No appointment on file yet - book one before marking as treated.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
            {listFilter === 'all' ? 'No patients assigned' : 'No patients match this filter'}
          </p>
        )}
      </div>

      {/* SUMMARY TABLE */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#1a3a2a', marginTop: 0 }}>Patient Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: 600 }}>Patient Name</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: 600 }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: 600 }}>Medical History</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {patientList.map((patient) => {
              const isTreated = patient._latestAppointment?.status === 'COMPLETED';
              return (
                <tr key={patient.patient_id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', color: '#1a3a2a' }}>{patient.name}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{patient.phone}</td>
                  <td style={{ padding: '12px', color: '#e74c3c', fontSize: '13px' }}>{patient.medical_history || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      background: !patient._latestAppointment ? '#eceff1' : isTreated ? '#d4edda' : '#fff3cd',
                      color: !patient._latestAppointment ? '#546e7a' : isTreated ? '#155724' : '#856404',
                    }}>
                      {!patient._latestAppointment ? 'No appointment' : isTreated ? '✓ Treated' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPatients;
