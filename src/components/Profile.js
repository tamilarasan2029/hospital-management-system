import React, { useState } from 'react';

const Profile = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Patient',
    email: user?.email || '',
    phone: '+91-9876543210',
    address: 'Taragampatti, Karur',
    city: 'Karur',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '639109',
    dateOfBirth: '1995-05-15'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>⚙️ My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* LEFT: PROFILE CARD */}
        <div>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '50px'
            }}>
              👤
            </div>
            <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>{formData.name}</h3>
            <p style={{ color: '#7f8c8d', margin: '0 0 20px 0' }}>{user?.role.toUpperCase()}</p>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Email:</strong> {formData.email}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Phone:</strong> {formData.phone}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Member Since:</strong> 2026-01-15
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#2c3e50', marginTop: 0 }}>📊 My Stats</h4>
            <p style={{ margin: '10px 0', color: '#555' }}>
              <strong>Appointments:</strong> 5
            </p>
            <p style={{ margin: '10px 0', color: '#555' }}>
              <strong>Total Visits:</strong> 8
            </p>
            <p style={{ margin: '10px 0', color: '#555' }}>
              <strong>Account Status:</strong> Active
            </p>
          </div>
        </div>

        {/* RIGHT: EDIT FORM */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#2c3e50', margin: 0 }}>Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 15px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Name:</strong> {formData.name}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Email:</strong> {formData.email}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Phone:</strong> {formData.phone}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Date of Birth:</strong> {formData.dateOfBirth}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Address:</strong> {formData.address}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>City:</strong> {formData.city}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>State:</strong> {formData.state}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Country:</strong> {formData.country}
              </p>
              <p style={{ margin: '10px 0', color: '#555' }}>
                <strong>Pincode:</strong> {formData.pincode}
              </p>
            </div>
          )}

          {/* LOGOUT BUTTON */}
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              marginTop: '30px',
              padding: '12px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;