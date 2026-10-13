import React, { useState, useMemo } from 'react';
import { colors, cardStyle, secondaryButton, statusBadge } from '../theme';

const inputStyle = {
  padding: '9px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px',
};

// Pure list page now - booking moved to its own BookAppointment page.
// Adds search/filter by patient, doctor, date, and status as requested.
const Appointments = ({ appointments, onFetchAppointments, API_URL, user, authHeaders, setCurrentPage }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: authHeaders ? authHeaders() : {},
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not cancel appointment', 'error');
        return;
      }
      showToast('Appointment cancelled');
      await onFetchAppointments();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const handleEditClick = (apt) => {
    setEditingId(apt.appointment_id);
    setEditForm({ reason: apt.reason || '', notes: apt.notes || '', status: apt.status });
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;
    try {
      const response = await fetch(`${API_URL}/appointments/${editingId}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(editForm),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not update appointment', 'error');
        return;
      }
      showToast('Appointment updated');
      setEditingId(null);
      setEditForm(null);
      await onFetchAppointments();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const filteredList = useMemo(() => {
    return (appointments || []).filter(a => {
      if (searchText) {
        const t = searchText.toLowerCase();
        const matches = a.patient_name?.toLowerCase().includes(t) || a.doctor_name?.toLowerCase().includes(t);
        if (!matches) return false;
      }
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter) {
        const aptDate = new Date(a.appointment_date_time).toISOString().slice(0, 10);
        if (aptDate !== dateFilter) return false;
      }
      return true;
    });
  }, [appointments, searchText, statusFilter, dateFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ color: colors.textPrimary, margin: 0 }}>📋 All Appointments</h1>
        <button onClick={() => setCurrentPage && setCurrentPage('bookAppointment')} style={secondaryButton}>
          ➕ Book New Appointment
        </button>
      </div>

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

      {/* SEARCH & FILTER */}
      <div style={{ ...cardStyle, marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px' }}>
        <input
          type="text" placeholder="🔍 Search patient or doctor..."
          value={searchText} onChange={(e) => setSearchText(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 200px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, flex: '1 1 140px' }}>
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 160px' }}
        />
        {(searchText || statusFilter || dateFilter) && (
          <button onClick={() => { setSearchText(''); setStatusFilter(''); setDateFilter(''); }} style={{ ...secondaryButton, flex: '0 0 auto' }}>
            Clear
          </button>
        )}
      </div>

      <div style={cardStyle}>
        <p style={{ color: colors.textSecondary, fontSize: '13px', marginTop: 0 }}>
          Showing {filteredList.length} of {(appointments || []).length} appointments
        </p>
        {filteredList.length > 0 ? (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredList.map((apt) => (
              <div key={apt.appointment_id} style={{
                background: editingId === apt.appointment_id ? '#f0fdf4' : colors.bgPage,
                padding: '14px', borderRadius: '8px', marginBottom: '10px',
                border: editingId === apt.appointment_id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
              }}>
                {editingId === apt.appointment_id ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontWeight: 600, fontSize: '12px' }}>Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: '8px' }}>
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <label style={{ display: 'block', marginBottom: '3px', fontWeight: 600, fontSize: '12px' }}>Reason</label>
                    <input type="text" value={editForm.reason}
                      onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                      style={{ ...inputStyle, width: '100%', marginBottom: '8px' }} />

                    <label style={{ display: 'block', marginBottom: '3px', fontWeight: 600, fontSize: '12px' }}>Notes</label>
                    <input type="text" value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      style={{ ...inputStyle, width: '100%', marginBottom: '10px' }} />

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleSaveEdit} style={{ padding: '8px', flex: 1, background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>✓ Save</button>
                      <button onClick={() => { setEditingId(null); setEditForm(null); }} style={{ ...secondaryButton, flex: 1, fontSize: '12px', padding: '8px' }}>✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <p style={{ margin: '2px 0', fontWeight: 600, color: colors.textPrimary }}>👤 {apt.patient_name}</p>
                        <p style={{ margin: '2px 0', fontWeight: 600, color: colors.textPrimary }}>⚕️ Dr. {apt.doctor_name}</p>
                      </div>
                      <span style={statusBadge(apt.status)}>{apt.status}</span>
                    </div>
                    <p style={{ margin: '6px 0 2px 0', color: colors.textSecondary, fontSize: '12px' }}>
                      📅 {new Date(apt.appointment_date_time).toLocaleString()}
                    </p>
                    {apt.reason && <p style={{ margin: '2px 0', color: colors.textSecondary, fontSize: '12px' }}>📝 {apt.reason}</p>}

                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button onClick={() => handleEditClick(apt)} style={{ ...secondaryButton, flex: 1, fontSize: '12px', padding: '6px' }}>✏️ Edit / View</button>
                      <button onClick={() => handleDelete(apt.appointment_id)} style={{ flex: 1, padding: '6px', background: colors.dangerBg || '#fdecea', color: colors.danger, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🗑️ Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>No appointments match your filters</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
