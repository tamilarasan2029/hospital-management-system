import React from 'react';

const Dashboard = ({ patients, doctors, appointments, user, setCurrentPage, onFetchAppointments, authHeaders, API_URL }) => {
  const list = appointments || [];

  const pendingCount = list.filter(a => a.status === 'SCHEDULED').length;

  // Real values instead of a hardcoded "5" - Pending Tasks now means
  // actual scheduled appointments waiting to happen.
  const stats = [
    { label: 'Total Patients', value: patients.length, icon: '👥', color: '#15803d', page: 'patients' },
    { label: 'Total Doctors', value: doctors.length, icon: '⚕️', color: '#0d9488', page: 'doctors' },
    { label: 'Appointments', value: list.length, icon: '📅', color: '#65a30d', page: 'appointments' },
    { label: 'Pending Tasks', value: pendingCount, icon: '⚠️', color: '#d97706', page: 'tasks' },
  ];

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok && onFetchAppointments) {
        await onFetchAppointments();
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1a3a2a' }}>Welcome {user?.name}</h1>

      {/* STATS CARDS - now clickable, navigating to the relevant page */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentPage && setCurrentPage(stat.page)}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              cursor: setCurrentPage ? 'pointer' : 'default',
              transition: 'transform 0.15s, box-shadow 0.15s',
              borderLeft: `4px solid ${stat.color}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          >
            <div style={{ fontSize: '40px' }}>{stat.icon}</div>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{stat.label}</p>
              <h3 style={{ margin: '5px 0 0 0', color: '#1a3a2a', fontSize: '24px' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT APPOINTMENTS TABLE - now reads the real field names the backend
          actually sends (patient_name, doctor_name, appointment_date_time),
          and status changes save to the real backend instead of localStorage. */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#1a3a2a', marginTop: 0 }}>
          Recent Appointments
          {list.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: '13px', color: '#94a3b8', marginLeft: '10px' }}>
              (showing all {list.length} - scroll to see more)
            </span>
          )}
        </h3>
        {list.length > 0 ? (
          <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #ecf0f1', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Patient</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Doctor</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Date & Time</th>
                <th style={{ textAlign: 'left', padding: '10px', color: '#7f8c8d' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((apt) => (
                <tr key={apt.appointment_id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '10px' }}>{apt.patient_name || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{apt.doctor_name || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{new Date(apt.appointment_date_time).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={apt.status || 'SCHEDULED'}
                      onChange={(e) => handleStatusChange(apt.appointment_id, e.target.value)}
                      style={{
                        padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd',
                        fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                        background: apt.status === 'COMPLETED' ? '#d5f4e6' : apt.status === 'CANCELLED' ? '#fdecea' : '#ccfbf1',
                        color: apt.status === 'COMPLETED' ? '#16a34a' : apt.status === 'CANCELLED' ? '#c0392b' : '#0f766e',
                        outline: 'none',
                      }}
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p style={{ color: '#7f8c8d' }}>No appointments yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
