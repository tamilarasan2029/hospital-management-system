import React, { useState } from 'react';
import { colors, cardStyle } from '../theme';

const Doctors = ({ doctors }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  if (selectedDoctor) {
    return (
      <div>
        <button
          onClick={() => setSelectedDoctor(null)}
          style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}
        >
          ← Back to all doctors
        </button>

        <div style={{ ...cardStyle, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: 'white', flexShrink: 0,
            }}>
              ⚕️
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', color: colors.textPrimary }}>Dr. {selectedDoctor.name}</h2>
              <p style={{ margin: 0, color: colors.primary, fontWeight: 600 }}>{selectedDoctor.specialization}</p>
              <span style={{
                display: 'inline-block', marginTop: '6px', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: selectedDoctor.status === 'AVAILABLE' ? colors.successBg : colors.dangerBg,
                color: selectedDoctor.status === 'AVAILABLE' ? colors.success : colors.danger,
              }}>
                {selectedDoctor.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <DetailRow label="Phone" value={selectedDoctor.phone} />
            <DetailRow label="Email" value={selectedDoctor.email} />
            <DetailRow label="Experience" value={`${selectedDoctor.years_of_experience} years`} />
            <DetailRow label="Consultation Fee" value={`₹${selectedDoctor.consultation_fee}`} />
            <DetailRow label="Office" value={selectedDoctor.office || 'Not assigned'} />
            <DetailRow label="Qualifications" value={selectedDoctor.qualifications || 'Not listed'} />
          </div>

          {selectedDoctor.bio && (
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: colors.textSecondary, fontSize: '13px' }}>About</p>
              <p style={{ margin: 0, color: colors.textPrimary, lineHeight: 1.6 }}>{selectedDoctor.bio}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>⚕️ Our Doctors</h1>

      <div style={cardStyle}>
        {doctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {doctors.map((doctor) => (
              <div
                key={doctor.doctor_id}
                onClick={() => setSelectedDoctor(doctor)}
                style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Dr. {doctor.name}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>{doctor.specialization}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>📞 {doctor.phone}</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                  Experience: {doctor.years_of_experience} years
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', opacity: 0.8, textDecoration: 'underline' }}>
                  View full profile →
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.textMuted }}>No doctors available</p>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p style={{ margin: '0 0 3px 0', fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>{label}</p>
    <p style={{ margin: 0, fontSize: '14px', color: colors.textPrimary }}>{value}</p>
  </div>
);

export default Doctors;
