import React, { useState, useEffect } from 'react';

const Patients = ({ patients, onFetchPatients, API_URL }) => {
  const [patientsList, setPatientsList] = useState(patients || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPatientsList(patients || []);
  }, [patients]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const patientData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dob'),
      gender: formData.get('gender') || 'Other',
      bloodType: formData.get('blood') || 'O+',
      medicalHistory: formData.get('medicalHistory') || ''
    };

    try {
      console.log('Sending patient data:', patientData);
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok || response.status === 201) {
        // Extract patient data from response
        const newPatient = responseData.data || responseData || {
          id: Math.random(),
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          bloodType: patientData.bloodType,
          medicalHistory: patientData.medicalHistory
        };
        
        // Add to local list
        setPatientsList([...patientsList, newPatient]);
        alert('✅ Patient added successfully!\nName: ' + patientData.name);
        e.target.reset();
        
        // Fetch updated list
        setTimeout(() => {
          onFetchPatients();
        }, 500);
      } else {
        alert('❌ Error: ' + (responseData.message || responseData.error || 'Failed to add patient'));
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      alert('❌ Error: ' + err.message + '\n\nMake sure backend is running at ' + API_URL);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>👥 Patients Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* ADD PATIENT FORM */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>➕ Add New Patient</h3>
          <form onSubmit={handleAddPatient}>
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} 
            />
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone (10 digits)" 
              required 
              pattern="[0-9]{10}"
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} 
            />
            
            <select 
              name="gender" 
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            
            <input 
              type="date" 
              name="dob" 
              required 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} 
            />

            <select 
              name="blood" 
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option>Select Blood Type</option>
              <option>O+</option>
              <option>O-</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>

            <textarea
              name="medicalHistory"
              placeholder="Medical History / Issues (Optional)"
              style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' }}
            />

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Adding Patient...' : '✓ Add Patient'}
            </button>
          </form>
        </div>

        {/* PATIENT LIST */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📋 Patient List ({patientsList.length})</h3>
          {patientsList && patientsList.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {patientsList.map((patient, idx) => (
                <div key={idx} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  borderLeft: '4px solid #2ecc71',
                  border: '1px solid #ddd'
                }}>
                  <p style={{ margin: '5px 0', color: '#2c3e50', fontWeight: '600', fontSize: '15px' }}>👤 {patient.name}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '13px' }}>📧 {patient.email}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '13px' }}>📱 {patient.phone}</p>
                  {patient.gender && <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '13px' }}>👫 {patient.gender}</p>}
                  {patient.bloodType && <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '13px' }}>🩸 {patient.bloodType}</p>}
                  {patient.dateOfBirth && <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '13px' }}>🎂 DOB: {patient.dateOfBirth}</p>}
                  {patient.medicalHistory && <p style={{ margin: '5px 0', color: '#e74c3c', fontSize: '13px', fontWeight: '500' }}>⚠️ Issues: {patient.medicalHistory}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>No patients added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;