import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Email and password are required!');
      setLoading(false);
      return;
    }

    if (role !== 'admin' && role !== 'doctor') {
      setError('Only Admin and Doctor can login!');
      setLoading(false);
      return;
    }

    // Demo credentials (in production, validate with backend)
    const validCredentials = {
      admin: { email: 'admin@hospital.com', password: 'admin123' },
      doctor: { email: 'doctor@hospital.com', password: 'doctor123' }
    };

    const credential = validCredentials[role];

    if (email === credential.email && password === credential.password) {
      onLogin(email, role);
      setEmail('');
      setPassword('');
    } else {
      setError(`Invalid credentials! For ${role}:\nEmail: ${credential.email}\nPassword: ${credential.password}`);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px', fontSize: '28px' }}>
          🏥 Qwen Hospital
        </h1>
        <p style={{ textAlign: 'center', color: '#999', marginBottom: '30px', fontSize: '14px' }}>
          Management System
        </p>

        {error && (
          <div style={{
            background: '#ffe5e5',
            color: '#c0392b',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '13px',
            whiteSpace: 'pre-wrap'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hospital.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{
          background: '#f0f0f0',
          padding: '15px',
          borderRadius: '6px',
          marginTop: '20px',
          fontSize: '12px',
          color: '#555'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>Demo Credentials:</p>
          <p style={{ margin: '5px 0' }}><strong>Admin:</strong> admin@hospital.com / admin123</p>
          <p style={{ margin: '5px 0' }}><strong>Doctor:</strong> doctor@hospital.com / doctor123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;