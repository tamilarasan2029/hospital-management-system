import React, { useState, useEffect, useRef } from 'react';

const Appointments = ({ appointments, onFetchAppointments, API_URL, patients, doctors, user }) => {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const initialized = useRef(false);

  // ✅ Load from localStorage first, fallback to props, NEVER reset again
  useEffect(() => {
    if (initialized.current) return;

    const saved = localStorage.getItem('qwenAppointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setAppointmentsList(parsed);
          initialized.current = true;
          return;
        }
      } catch (e) {}
    }

    if (appointments && Array.isArray(appointments) && appointments.length > 0) {
      setAppointmentsList(appointments);
      localStorage.setItem('qwenAppointments', JSON.stringify(appointments));
      initialized.current = true;
    }
  }, [appointments]);

  // ✅ Save to localStorage every time list changes
  const updateList = (newList) => {
    setAppointmentsList(newList);
    localStorage.setItem('qwenAppointments', JSON.stringify(newList));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const patientId = parseInt(e.target.querySelector('select[name="patientId"]').value) || 1;
      const doctorId = parseInt(e.target.querySelector('select[name="doctorId"]').value) || 1;
      const dateTime = formData.get('datetime');
      const reason = formData.get('reason');

      let patientName = 'Patient';
      let doctorName = 'Doctor';

      if (patients?.length > 0) {
        const p = patients.find(x => parseInt(x.id || x.patientId) === patientId);
        if (p) patientName = p.name;
      }
      if (doctors?.length > 0) {
        const d = doctors.find(x => parseInt(x.id || x.doctorId) === doctorId);
        if (d) doctorName = d.name;
      }

      const newAppointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId, doctorId, patientName, doctorName,
        appointmentDateTime: dateTime,
        reason,
        status: 'SCHEDULED'
      };

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });

      if (response.ok) {
        const newList = [...appointmentsList, newAppointment];
        updateList(newList);
        alert('✅ Booked!\n👤 ' + patientName + '\n⚕️ Dr. ' + doctorName);
        e.target.reset();
      } else {
        alert('❌ Error booking');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
    setLoading(false);
  };

  // ✅ DELETE from database AND localStorage
  const handleDelete = async (deleteId) => {
    if (window.confirm('Delete this appointment?')) {
      try {
        await fetch(`${API_URL}/appointments/${deleteId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.log('API delete error:', err);
      }
      // Always remove from local list
      const newList = appointmentsList.filter(apt => apt.id !== deleteId);
      updateList(newList);
      setEditingId(null);
      setEditForm(null);
      alert('✅ Deleted!');
    }
  };

  const handleEditClick = (apt) => {
    setEditingId(apt.id);
    setEditForm({ ...apt });
  };

  // ✅ SAVE EDIT to database AND localStorage
  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;

    try {
      const response = await fetch(`${API_URL}/appointments/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const newList = appointmentsList.map(apt =>
          apt.id === editingId ? { ...editForm } : apt
        );
        updateList(newList);
        setEditingId(null);
        setEditForm(null);
        alert('✅ Updated in database!');
      } else {
        // API failed but still save locally
        const newList = appointmentsList.map(apt =>
          apt.id === editingId ? { ...editForm } : apt
        );
        updateList(newList);
        setEditingId(null);
        setEditForm(null);
        alert('✅ Saved locally!');
      }
    } catch (err) {
      // API error - still save locally
      const newList = appointmentsList.map(apt =>
        apt.id === editingId ? { ...editForm } : apt
      );
      updateList(newList);
      setEditingId(null);
      setEditForm(null);
      alert('✅ Saved locally! (API: ' + err.message + ')');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };



  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>📅 Appointments</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* BOOKING FORM */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Book Appointment</h3>
          <form onSubmit={handleBookAppointment}>
            {user?.role === 'admin' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Patient</label>
                <select name="patientId" required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}>
                  <option value="">Select Patient</option>
                  {patients?.map(p => (
                    <option key={p.id || p.patientId} value={p.id || p.patientId}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date & Time</label>
              <input type="datetime-local" name="datetime" required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Doctor</label>
              <select name="doctorId" required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}>
                <option value="">Select Doctor</option>
                {doctors?.map(d => (
                  <option key={d.id || d.doctorId} value={d.id || d.doctorId}>Dr. {d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Reason</label>
              <input type="text" name="reason" placeholder="Checkup, Surgery, etc" required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
              {loading ? 'Booking...' : '✓ Book'}
            </button>
          </form>
        </div>

        {/* APPOINTMENTS LIST */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Appointments ({appointmentsList.length})</h3>
          {appointmentsList.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {appointmentsList.map((apt) => (
                <div key={apt.id} style={{
                  background: editingId === apt.id ? '#e8f4f8' : '#f8f9fa',
                  padding: '12px', borderRadius: '6px', marginBottom: '10px',
                  border: editingId === apt.id ? '2px solid #3498db' : '1px solid #ddd'
                }}>
                  {editingId === apt.id ? (
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '12px' }}>Patient</label>
                      <input type="text" value={editForm.patientName}
                        onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                        style={{ width: '100%', padding: '6px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />

                      <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '12px' }}>Doctor</label>
                      <input type="text" value={editForm.doctorName}
                        onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })}
                        style={{ width: '100%', padding: '6px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />

                      <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '12px' }}>Reason</label>
                      <input type="text" value={editForm.reason}
                        onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                        style={{ width: '100%', padding: '6px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={handleSaveEdit} style={{ flex: 1, padding: '6px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✓ Save</button>
                        <button onClick={handleCancelEdit} style={{ flex: 1, padding: '6px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '5px 0', fontWeight: '600' }}>👤 {apt.patientName}</p>
                      <p style={{ margin: '5px 0', fontWeight: '600' }}>⚕️ Dr. {apt.doctorName}</p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>📅 {new Date(apt.appointmentDateTime).toLocaleString()}</p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>📝 {apt.reason}</p>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button onClick={() => handleEditClick(apt)} style={{ flex: 1, padding: '6px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(apt.id)} style={{ flex: 1, padding: '6px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No appointments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;