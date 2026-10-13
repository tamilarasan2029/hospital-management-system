import React, { useState, useEffect } from 'react';

const Profile = ({ user, onLogout, API_URL, authHeaders, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    display_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  // Load the real, saved profile from the backend on mount - this replaces
  // hardcoded defaults that used to reset every time this page reloaded.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { ...(authHeaders ? authHeaders() : {}) },
        });
        const result = await response.json();
        if (response.ok) {
          const p = result.data;
          setFormData({
            display_name: p.display_name || user?.name || '',
            email: p.email || '',
            phone: p.phone || '',
            date_of_birth: p.date_of_birth || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            country: p.country || '',
            pincode: p.pincode || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [API_URL, authHeaders, user]);

  const [pwForm, setPwForm] = useState({ oldPw: '', newPw: '', confirmPw: '' });
  const [pwMsg, setPwMsg] = useState(null); // { text, type }
  const [pwSaving, setPwSaving] = useState(false);
  const [showPwPanel, setShowPwPanel] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPw !== pwForm.confirmPw) {
      setPwMsg({ text: 'The new passwords do not match.', type: 'error' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify({ old_password: pwForm.oldPw, new_password: pwForm.newPw }),
      });
      const result = await res.json();
      if (!res.ok) {
        setPwMsg({ text: result.message || 'Could not change password.', type: 'error' });
      } else {
        setPwMsg({ text: 'Password changed successfully.', type: 'success' });
        setPwForm({ oldPw: '', newPw: '', confirmPw: '' });
      }
    } catch (err) {
      setPwMsg({ text: 'Could not reach the server.', type: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log('Profile save response:', response.status, result);

      if (!response.ok) {
        setError(`(HTTP ${response.status}) ${result.message || result.detail || 'Could not save profile'}`);
        setSaving(false);
        return;
      }

      try {
        if (onProfileUpdated) {
          onProfileUpdated({ ...user, name: formData.display_name || user.name, email: formData.email });
        }
      } catch (callbackErr) {
        console.error('onProfileUpdated callback failed (save itself succeeded):', callbackErr);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Could not reach the server (' + err.message + ')');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#7f8c8d', padding: '40px' }}>Loading profile...</p>;
  }

  const fields = [
    { name: 'display_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    { name: 'address', label: 'Address', type: 'text' },
  ];

  return (
    <div>
      <h1 style={{ color: '#1a3a2a' }}>⚙️ My Profile</h1>

      {error && (
        <div style={{ background: '#fdecea', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '50px', color: 'white',
            }}>
              👤
            </div>
            <h3 style={{ color: '#1a3a2a', margin: '0 0 10px 0' }}>{formData.display_name || user?.name}</h3>
            <p style={{ color: '#7f8c8d', margin: '0 0 20px 0' }}>{user?.role?.toUpperCase()}</p>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Email:</strong> {formData.email}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Phone:</strong> {formData.phone || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#1a3a2a', margin: 0 }}>Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ padding: '8px 15px', background: '#15803d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={(e) => e.preventDefault()}>
              {fields.map((f) => (
                <div style={{ marginBottom: '15px' }} key={f.name}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  style={{ flex: 1, padding: '10px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Name:</strong> {formData.display_name || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Email:</strong> {formData.email}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Phone:</strong> {formData.phone || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Date of Birth:</strong> {formData.date_of_birth || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Address:</strong> {formData.address || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>City:</strong> {formData.city || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>State:</strong> {formData.state || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Country:</strong> {formData.country || 'Not set'}</p>
              <p style={{ margin: '10px 0', color: '#555' }}><strong>Pincode:</strong> {formData.pincode || 'Not set'}</p>
            </div>
          )}

          <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button
              type="button"
              onClick={() => { setShowPwPanel(!showPwPanel); setPwMsg(null); }}
              style={{
                width: '100%', padding: '12px 16px', background: '#e8f3fb', color: '#0a3d6b',
                border: '1px solid #bcd9ee', borderRadius: '6px', fontWeight: '700', fontSize: '15px',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>🔑 Change Password</span>
              <span>{showPwPanel ? '▲' : '▼'}</span>
            </button>
            {showPwPanel && (<>
            {pwMsg && (
              <div style={{
                background: pwMsg.type === 'error' ? '#fdecea' : '#e8f3fb',
                color: pwMsg.type === 'error' ? '#b91c1c' : '#0a3d6b',
                padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px',
              }}>
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <input type="password" placeholder="Current password" required value={pwForm.oldPw}
                onChange={(e) => setPwForm({ ...pwForm, oldPw: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }} />
              <input type="password" placeholder="New password" required value={pwForm.newPw}
                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '4px' }} />
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
                At least 8 characters, with one uppercase letter, one number and one special character.
              </p>
              <input type="password" placeholder="Confirm new password" required value={pwForm.confirmPw}
                onChange={(e) => setPwForm({ ...pwForm, confirmPw: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '12px' }} />
              <button type="submit" disabled={pwSaving} style={{ width: '100%', padding: '11px', background: '#0a3d6b', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: pwSaving ? 'not-allowed' : 'pointer', opacity: pwSaving ? 0.6 : 1 }}>
                {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
            </>)}
          </div>

          <button
            onClick={onLogout}
            style={{ width: '100%', marginTop: '30px', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
