import React, { useState, useEffect } from 'react';

const MyPatients = ({ patients, user, API_URL }) => {
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // For demo: Show all patients (in real app, filter by doctor's ID)
    setDoctorPatients(patients || []);
  }, [patients]);

  const handleMarkTreated = (patientId) => {
    const updatedPatients = doctorPatients.map(p => 
      (p.id === patientId || p.email === patientId) 
        ? { ...p, status: 'Treated', treatedDate: new Date().toLocaleDateString() }
        : p
    );
    setDoctorPatients(updatedPatients);
    alert('✅ Patient marked as treated!');
  };

  const handleAddNotes = (patientId) => {
    const notes = prompt('Add treatment notes for this patient:');
    if (notes) {
      const updatedPatients = doctorPatients.map(p => 
        (p.id === patientId || p.email === patientId)
          ? { ...p, treatmentNotes: notes }
          : p
      );
      setDoctorPatients(updatedPatients);
      alert('✅ Notes added!');
    }
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>👨‍⚕️ My Patients - Dr. {user?.name}</h1>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Total Patients</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{doctorPatients.length}</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Pending</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{doctorPatients.filter(p => !p.status || p.status !== 'Treated').length}</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Treated</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{doctorPatients.filter(p => p.status === 'Treated').length}</h2>
        </div>
      </div>

      {/* PATIENT LIST */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Patients Assigned to You</h3>

        {doctorPatients && doctorPatients.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {doctorPatients.map((patient, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedPatient(selectedPatient?.email === patient.email ? null : patient)}
                style={{
                  background: selectedPatient?.email === patient.email ? '#e8f4f8' : '#f9f9f9',
                  padding: '20px',
                  borderRadius: '8px',
                  border: selectedPatient?.email === patient.email ? '2px solid #3498db' : '1px solid #ddd',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: selectedPatient?.email === patient.email ? '0 4px 12px rgba(52, 152, 219, 0.2)' : 'none'
                }}
              >
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '16px' }}>👤 {patient.name}</h4>
                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{patient.email}</p>
                  </div>
                  <span style={{
                    background: !patient.status || patient.status !== 'Treated' ? '#fff3cd' : '#d4edda',
                    color: !patient.status || patient.status !== 'Treated' ? '#856404' : '#155724',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {patient.status === 'Treated' ? '✓ Treated' : '⏳ Pending'}
                  </span>
                </div>

                {/* BASIC INFO */}
                <div style={{ borderTop: '1px solid #ecf0f1', paddingTop: '15px', marginBottom: '15px' }}>
                  <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}>
                    <strong>📞</strong> {patient.phone}
                  </p>
                  <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}>
                    <strong>🎂</strong> {patient.dateOfBirth}
                  </p>
                  <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}>
                    <strong>👫</strong> {patient.gender}
                  </p>
                  <p style={{ margin: '8px 0', color: '#555', fontSize: '13px' }}>
                    <strong>🩸</strong> {patient.bloodType}
                  </p>
                </div>

                {/* MEDICAL ISSUES */}
                {patient.medicalHistory && (
                  <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', marginBottom: '15px', borderLeft: '3px solid #ffc107' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#856404', fontWeight: '600', fontSize: '13px' }}>⚠️ Medical Issues:</p>
                    <p style={{ margin: 0, color: '#856404', fontSize: '13px', lineHeight: '1.5' }}>{patient.medicalHistory}</p>
                  </div>
                )}

                {/* TREATMENT NOTES */}
                {patient.treatmentNotes && (
                  <div style={{ background: '#d4edda', padding: '12px', borderRadius: '6px', marginBottom: '15px', borderLeft: '3px solid #28a745' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#155724', fontWeight: '600', fontSize: '13px' }}>📝 Treatment Notes:</p>
                    <p style={{ margin: 0, color: '#155724', fontSize: '13px', lineHeight: '1.5' }}>{patient.treatmentNotes}</p>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {(!patient.status || patient.status !== 'Treated') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNotes(patient.email || patient.id);
                      }}
                      style={{
                        padding: '8px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      📝 Add Notes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkTreated(patient.email || patient.id);
                      }}
                      style={{
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
                      ✓ Mark Treated
                    </button>
                  </div>
                )}

                {patient.treatedDate && (
                  <p style={{ margin: '15px 0 0 0', color: '#27ae60', fontSize: '12px', textAlign: 'center', fontWeight: '600' }}>
                    ✅ Treated on {patient.treatedDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>No patients assigned</p>
        )}
      </div>

      {/* SUMMARY TABLE */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Patient Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: '600' }}>Patient Name</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: '600' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: '600' }}>Medical Issue</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#7f8c8d', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {doctorPatients.map((patient, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '12px', color: '#2c3e50' }}>{patient.name}</td>
                <td style={{ padding: '12px', color: '#555' }}>{patient.phone}</td>
                <td style={{ padding: '12px', color: '#e74c3c', fontSize: '13px' }}>
                  {patient.medicalHistory || 'N/A'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: patient.status === 'Treated' ? '#d4edda' : '#fff3cd',
                    color: patient.status === 'Treated' ? '#155724' : '#856404'
                  }}>
                    {patient.status === 'Treated' ? '✓ Treated' : '⏳ Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPatients;