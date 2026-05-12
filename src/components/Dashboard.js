import React, { useState, useEffect } from 'react';

const Dashboard = ({ patients, doctors, appointments, user }) => {
  const [appointmentsList, setAppointmentsList] = useState([]);

  useEffect(() => {
    // Load from localStorage first (to get updated statuses from Appointments page)
    const saved = localStorage.getItem('qwenAppointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setAppointmentsList(parsed);
          return;
        }
      } catch (e) {}
    }
    if (appointments && Array.isArray(appointments)) {
      setAppointmentsList(appointments);
    }
  }, [appointments]);

  const handleStatusChange = (index, newStatus) => {
    const updated = appointmentsList.map((apt, i) =>
      i === index ? { ...apt, status: newStatus } : apt
    );
    setAppointmentsList(updated);
    localStorage.setItem('qwenAppointments', JSON.stringify(updated));
  };

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: '👥', color: '#3498db' },
    { label: 'Total Doctors', value: doctors.length, icon: '⚕️', color: '#2ecc71' },
    { label: 'Appointments', value: appointmentsList.length, icon: '📅', color: '#e74c3c' },
    { label: 'Pending Tasks', value: 5, icon: '⚠️', color: '#f39c12' }
  ];

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>Welcome, {user?.name}</h1>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ fontSize: '40px' }}>{stat.icon}</div>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{stat.label}</p>
              <h3 style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '24px' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT APPOINTMENTS TABLE */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Recent Appointments</h3>
        {appointmentsList.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Patient</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Doctor</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Date & Time</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsList.slice(0, 5).map((apt, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '10px' }}>{apt.patientName || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{apt.doctorName || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(apt.appointmentDateTime).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={apt.status || 'SCHEDULED'}
                      onChange={(e) => handleStatusChange(idx, e.target.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: apt.status === 'CLOSED' ? '#d5f4e6' : '#dbeafe',
                        color: apt.status === 'CLOSED' ? '#27ae60' : '#2980b9',
                        outline: 'none'
                      }}
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#7f8c8d' }}>No appointments yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;