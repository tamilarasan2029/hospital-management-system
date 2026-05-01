import React, { useState, useEffect } from 'react';

const Appointments = ({ appointments, onFetchAppointments, API_URL, patients, doctors, user }) => {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Update list when appointments prop changes
  useEffect(() => {
    if (appointments && Array.isArray(appointments) && appointments.length > 0) {
      console.log('Updated appointments from API:', appointments);
      setAppointmentsList([...appointments]);
    }
  }, [appointments]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    
    // Get selected values from form
    const patientSelectValue = formData.get('patientId');
    const doctorSelectValue = formData.get('doctorId');
    const dateTime = formData.get('datetime');
    const reason = formData.get('reason');
    const notes = formData.get('notes');

    console.log('Form values:', { patientSelectValue, doctorSelectValue, dateTime, reason });

    // Find patient and doctor from the selected values
    let selectedPatient = null;
    let selectedDoctor = null;

    // Try to find patient
    if (patients && patients.length > 0) {
      selectedPatient = patients.find(p => 
        String(p.id) === String(patientSelectValue) || 
        p.email === patientSelectValue ||
        String(p.id) === String(parseInt(patientSelectValue))
      );
    }

    // Try to find doctor
    if (doctors && doctors.length > 0) {
      selectedDoctor = doctors.find(d => 
        String(d.id) === String(doctorSelectValue) ||
        String(d.id) === String(parseInt(doctorSelectValue))
      );
    }

    const patientName = selectedPatient?.name || 'Patient ' + patientSelectValue;
    const doctorName = selectedDoctor?.name || 'Doctor ' + doctorSelectValue;

    console.log('Selected patient:', selectedPatient?.name, 'Selected doctor:', selectedDoctor?.name);

    const appointmentData = {
      patientId: parseInt(patientSelectValue) || 1,
      doctorId: parseInt(doctorSelectValue) || 1,
      patientName: patientName,
      doctorName: doctorName,
      appointmentDateTime: dateTime,
      reason: reason,
      notes: notes || '',
      durationInMinutes: 30,
      status: 'SCHEDULED',
      id: Date.now()
    };

    try {
      console.log('Booking appointment:', appointmentData);
      
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        // Add to local list
        const updatedList = [...appointmentsList, appointmentData];
        console.log('Updated list after adding:', updatedList);
        setAppointmentsList(updatedList);
        
        alert('✅ Appointment booked!\n👤 ' + patientName + '\n⚕️ Dr. ' + doctorName);
        e.target.reset();
        
        // Fetch fresh data
        setTimeout(() => {
          onFetchAppointments();
        }, 300);
      } else {
        alert('❌ Error booking appointment');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    console.log('Deleting appointment with ID:', appointmentId);
    console.log('Current list before delete:', appointmentsList);

    if (window.confirm('Delete this appointment?')) {
      // Filter out ONLY the appointment with matching ID
      const updatedList = appointmentsList.filter(apt => {
        console.log('Comparing:', apt.id, '!==', appointmentId, '=', apt.id !== appointmentId);
        return apt.id !== appointmentId;
      });

      console.log('List after delete:', updatedList);
      setAppointmentsList(updatedList);
      alert('✅ Appointment deleted!');
    }
  };

  const handleEditAppointment = (apt) => {
    setEditingId(apt.id);
    setEditForm({ ...apt });
  };

  const handleSaveEdit = (appointmentId) => {
    const updatedList = appointmentsList.map(apt => 
      apt.id === appointmentId ? editForm : apt
    );
    setAppointmentsList(updatedList);
    setEditingId(null);
    setEditForm(null);
    alert('✅ Appointment updated!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>📅 Appointments Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* BOOK APPOINTMENT FORM */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📅 Book New Appointment</h3>
          <form onSubmit={handleBookAppointment}>
            
            {/* PATIENT SELECTOR */}
            {user?.role === 'admin' && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Patient Name</label>
                <select 
                  name="patientId" 
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Patient --</option>
                  {patients && patients.length > 0 ? (
                    patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No patients found</option>
                  )}
                </select>
              </div>
            )}

            {/* DATE & TIME */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Date & Time</label>
              <input
                type="datetime-local"
                name="datetime"
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            {/* DOCTOR SELECTOR */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Doctor Name</label>
              <select 
                name="doctorId" 
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="">-- Select Doctor --</option>
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} ({doctor.specialization})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Dr. Rajesh Kumar (Cardiology)</option>
                    <option value="2">Dr. Priya Sharma (Neurology)</option>
                    <option value="3">Dr. Amit Patel (Orthopedics)</option>
                    <option value="4">Dr. Neha Gupta (Pediatrics)</option>
                    <option value="5">Dr. Vikram Singh (General Surgery)</option>
                    <option value="6">Dr. Anjali Verma (Gynecology)</option>
                  </>
                )}
              </select>
            </div>

            {/* REASON */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Reason</label>
              <input
                type="text"
                name="reason"
                placeholder="e.g., Checkup, Surgery, Follow-up"
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            {/* NOTES */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Notes (Optional)</label>
              <textarea
                name="notes"
                placeholder="Additional notes..."
                style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Booking...' : '✓ Book Appointment'}
            </button>
          </form>
        </div>

        {/* APPOINTMENTS LIST */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📋 Total Appointments: {appointmentsList.length}</h3>
          
          {appointmentsList && appointmentsList.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {appointmentsList.map((apt, idx) => (
                <div key={apt.id} style={{
                  background: editingId === apt.id ? '#e8f4f8' : '#f8f9fa',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  borderLeft: '4px solid #3498db',
                  border: editingId === apt.id ? '2px solid #3498db' : '1px solid #ddd'
                }}>
                  {editingId === apt.id ? (
                    // EDIT MODE
                    <div>
                      <input
                        type="text"
                        value={editForm.patientName}
                        onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        value={editForm.doctorName}
                        onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="datetime-local"
                        value={editForm.appointmentDateTime}
                        onChange={(e) => setEditForm({ ...editForm, appointmentDateTime: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        value={editForm.reason}
                        onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleSaveEdit(apt.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: '#2ecc71',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div>
                      <p style={{ margin: '8px 0', color: '#2c3e50', fontWeight: '600', fontSize: '15px' }}>👤 {apt.patientName}</p>
                      <p style={{ margin: '8px 0', color: '#2c3e50', fontWeight: '600', fontSize: '15px' }}>⚕️ Dr. {apt.doctorName}</p>
                      <p style={{ margin: '8px 0', color: '#7f8c8d', fontSize: '13px' }}>📅 {new Date(apt.appointmentDateTime).toLocaleString()}</p>
                      <p style={{ margin: '8px 0', color: '#7f8c8d', fontSize: '13px' }}>📝 {apt.reason}</p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '10px',
                        marginBottom: '10px',
                        background: '#d5f4e6',
                        color: '#27ae60',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {apt.status}
                      </span>

                      {/* BUTTONS */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleEditAppointment(apt)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px', fontSize: '14px' }}>No appointments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;