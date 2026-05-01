import React from 'react';

const Doctors = ({ doctors }) => {
  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>⚕️ Our Doctors</h1>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {doctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {doctors.map((doctor, idx) => (
              <div key={idx} style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{doctor.name}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>{doctor.specialization}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>📞 {doctor.phone}</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Experience: {doctor.yearsOfExperience} years</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#7f8c8d' }}>No doctors available</p>
        )}
      </div>
    </div>
  );
};

export default Doctors;