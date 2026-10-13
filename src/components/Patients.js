import React, { useState } from 'react';
import { colors, cardStyle, primaryButton } from '../theme';
import PatientDetail from './PatientDetail';

const inputStyle = {
  width: '100%', padding: '10px', marginBottom: '12px',
  border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px',
};

const Patients = ({ patients, appointments, onFetchPatients, API_URL, authHeaders }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'add'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const patientData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      date_of_birth: formData.get('dob'),
      gender: formData.get('gender') || 'Other',
      blood_type: formData.get('blood') || null,
      medical_history: formData.get('medicalHistory') || '',
    };

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify(patientData),
      });
      const result = await response.json();

      if (!response.ok) {
        alert(
          `❌ Could not add patient (HTTP ${response.status})\n\n` +
          (result.message || 'Unknown error') +
          (response.status === 400 ? '\n\nMost likely cause: a patient with this email already exists.' : '')
        );
        setLoading(false);
        return;
      }

      alert('✅ Patient added successfully!\nName: ' + patientData.name);
      e.target.reset();
      await onFetchPatients();
      setActiveTab('all');
    } catch (err) {
      console.error('Error adding patient:', err);
      alert('❌ Could not reach the server. Is the backend running at ' + API_URL + '?');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = (patients || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        appointments={appointments}
        API_URL={API_URL}
        authHeaders={authHeaders}
        onBack={() => setSelectedPatient(null)}
        onChanged={onFetchPatients}
      />
    );
  }

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>👥 Patients Management</h1>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `2px solid ${colors.border}` }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '15px',
            color: activeTab === 'all' ? colors.primary : colors.textSecondary,
            borderBottom: activeTab === 'all' ? `3px solid ${colors.primary}` : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          📋 All Patients ({(patients || []).length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '15px',
            color: activeTab === 'add' ? colors.primary : colors.textSecondary,
            borderBottom: activeTab === 'add' ? `3px solid ${colors.primary}` : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          ➕ Add New Patient
        </button>
      </div>

      {activeTab === 'add' ? (
        <div style={{ ...cardStyle, maxWidth: '520px' }}>
          <h3 style={{ color: colors.textPrimary, marginTop: 0 }}>New Patient Details</h3>
          <form onSubmit={handleAddPatient}>
            <input type="text" name="name" placeholder="Full Name" required style={inputStyle} />
            <input type="email" name="email" placeholder="Email" required style={inputStyle} />
            <input type="tel" name="phone" placeholder="Phone (10 digits)" required pattern="[0-9]{10}" style={inputStyle} />

            <select name="gender" required style={inputStyle}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input type="date" name="dob" required style={inputStyle} />

            <select name="blood" style={inputStyle}>
              <option value="">Select Blood Type</option>
              <option>O+</option><option>O-</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
            </select>

            <textarea
              name="medicalHistory"
              placeholder="Medical History / Issues (Optional)"
              style={{ ...inputStyle, minHeight: '80px' }}
            />

            <button type="submit" disabled={loading} style={{ ...primaryButton, width: '100%', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Adding Patient...' : '✓ Add Patient'}
            </button>
          </form>
        </div>
      ) : (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: '20px', maxWidth: '400px' }}
          />

          {filteredPatients.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.patient_id}
                  onClick={() => setSelectedPatient(patient)}
                  style={{
                    background: colors.bgPage, padding: '16px', borderRadius: '8px',
                    borderLeft: `4px solid ${colors.primary}`, border: `1px solid ${colors.border}`,
                    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <p style={{ margin: '4px 0', color: colors.textPrimary, fontWeight: 600, fontSize: '15px' }}>👤 {patient.name}</p>
                  <p style={{ margin: '4px 0', color: colors.textSecondary, fontSize: '13px' }}>📧 {patient.email}</p>
                  <p style={{ margin: '4px 0', color: colors.textSecondary, fontSize: '13px' }}>📱 {patient.phone}</p>
                  {patient.gender && <p style={{ margin: '4px 0', color: colors.textSecondary, fontSize: '13px' }}>👫 {patient.gender}</p>}
                  {patient.blood_type && <p style={{ margin: '4px 0', color: colors.textSecondary, fontSize: '13px' }}>🩸 {patient.blood_type}</p>}
                  {patient.date_of_birth && <p style={{ margin: '4px 0', color: colors.textSecondary, fontSize: '13px' }}>🎂 {patient.date_of_birth}</p>}
                  {patient.medical_history && (
                    <p style={{ margin: '4px 0', color: colors.danger, fontSize: '13px', fontWeight: 500 }}>⚠️ {patient.medical_history}</p>
                  )}
                  <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: colors.primary, fontWeight: 600 }}>View / edit details →</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
              {search ? 'No patients match your search' : 'No patients added yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;
