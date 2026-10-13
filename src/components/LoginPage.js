import React, { useState } from 'react';

const inputStyle = {
  width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
  fontSize: '14px', boxSizing: 'border-box',
};

const PASSWORD_HINT = 'At least 8 characters, with one uppercase letter, one number, and one special character.';

function passwordChecks(pw) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/.test(pw),
  };
}

const LoginPage = ({ onLogin, API_URL }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 'login' | 'forgot-email' | 'forgot-reset' | 'forgot-done' | 'signup' | 'signup-done'
  const [view, setView] = useState('login');
  const [signupData, setSignupData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const { access_token, user } = result.data;
      const normalizedUser = {
        email: user.email,
        name: user.display_name || user.username,
        role: user.role.toLowerCase(),
        userId: user.user_id,
        doctorId: user.doctor_id || null,
        specialization: user.specialization || null,
      };

      onLogin(normalizedUser, access_token);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const result = await response.json();
      if (!response.ok) {
        setResetError(result.message || 'Something went wrong');
        setResetLoading(false);
        return;
      }
      setResetMsg(result.message);
      setView('forgot-reset');
    } catch (err) {
      console.error('Forgot password error:', err);
      setResetError('Could not reach the server');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp, new_password: newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        setResetError(result.message || 'Could not reset password');
        setResetLoading(false);
        return;
      }
      setView('forgot-done');
    } catch (err) {
      console.error('Reset password error:', err);
      setResetError('Could not reach the server');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    setSignupLoading(true);
    try {
      const username = signupData.email.split('@')[0] + Math.floor(Math.random() * 1000);
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: signupData.email,
          password: signupData.password,
          role: 'PATIENT',
        }),
      });
      const registerResult = await registerRes.json();
      if (!registerRes.ok) {
        setSignupError(registerResult.message || 'Could not create account');
        setSignupLoading(false);
        return;
      }

      // Log in immediately so we have a token, then save the name/phone they
      // entered - otherwise those fields would be silently thrown away,
      // since /auth/register itself only stores username/email/password.
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: signupData.password }),
      });
      const loginResult = await loginRes.json();
      if (loginRes.ok) {
        await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginResult.data.access_token}` },
          body: JSON.stringify({ display_name: signupData.fullName, phone: signupData.phone }),
        });
      }

      setView('signup-done');
    } catch (err) {
      console.error('Signup error:', err);
      setSignupError('Could not reach the server');
    } finally {
      setSignupLoading(false);
    }
  };

  const backToLogin = () => {
    setView('login');
    setResetEmail(''); setOtp(''); setNewPassword(''); setResetError(''); setResetMsg('');
    setSignupData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setSignupError('');
  };

  const checks = passwordChecks(newPassword);
  const allChecksPass = Object.values(checks).every(Boolean);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a3d6b 0%, #06223d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px', fontSize: '28px' }}>
          🏥 Qwen Hospital
        </h1>
        <p style={{ textAlign: 'center', color: '#999', marginBottom: '30px', fontSize: '14px' }}>
          Management System
        </p>

        {/* ---------- STEP 1: LOGIN ---------- */}
        {view === 'login' && (
          <>
            {error && (
              <div style={{ background: '#ffe5e5', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hospital.com" required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button type="button" onClick={() => setView('forgot-email')} style={{ background: 'none', border: 'none', color: '#0a3d6b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0a3d6b 0%, #06223d 100%)',
                color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            
          </>
        )}

        {/* ---------- STEP 2: REQUEST OTP ---------- */}
        {view === 'forgot-email' && (
          <>
            <h3 style={{ color: '#333', marginTop: 0 }}>Reset your password</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
              Enter your account email and we'll send a 6-digit code.
            </p>
            {resetError && (
              <div style={{ background: '#ffe5e5', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                ❌ {resetError}
              </div>
            )}
            <form onSubmit={handleSendOtp}>
              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@email.com" required style={{ ...inputStyle, marginBottom: '16px' }} />
              <button type="submit" disabled={resetLoading} style={{
                width: '100%', padding: '12px', background: '#0a3d6b', color: 'white', border: 'none',
                borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: resetLoading ? 'not-allowed' : 'pointer', opacity: resetLoading ? 0.7 : 1,
              }}>
                {resetLoading ? 'Sending...' : 'Send Code'}
              </button>
            </form>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer', marginTop: '16px', width: '100%' }}>
              ← Back to login
            </button>
          </>
        )}

        {/* ---------- STEP 3: ENTER OTP + NEW PASSWORD ---------- */}
        {view === 'forgot-reset' && (
          <>
            <h3 style={{ color: '#333', marginTop: 0 }}>Enter code & new password</h3>
            {resetMsg && (
              <div style={{ background: '#e8f3fb', color: '#0a3d6b', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
                ℹ️ {resetMsg}<br />
                <span style={{ fontStyle: 'italic' }}>No email server is configured yet - check the backend terminal window for the code.</span>
              </div>
            )}
            {resetError && (
              <div style={{ background: '#ffe5e5', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                ❌ {resetError}
              </div>
            )}
            <form onSubmit={handleResetPassword}>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" required maxLength={6} style={{ ...inputStyle, marginBottom: '14px', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }} />

              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required style={{ ...inputStyle, marginBottom: '8px' }} />

              <div style={{ fontSize: '11px', marginBottom: '16px', lineHeight: 1.8 }}>
                <div style={{ color: checks.length ? '#059669' : '#94a3b8' }}>{checks.length ? '✓' : '○'} At least 8 characters</div>
                <div style={{ color: checks.upper ? '#059669' : '#94a3b8' }}>{checks.upper ? '✓' : '○'} One uppercase letter</div>
                <div style={{ color: checks.number ? '#059669' : '#94a3b8' }}>{checks.number ? '✓' : '○'} One number</div>
                <div style={{ color: checks.special ? '#059669' : '#94a3b8' }}>{checks.special ? '✓' : '○'} One special character</div>
              </div>

              <button type="submit" disabled={resetLoading || !allChecksPass} style={{
                width: '100%', padding: '12px', background: allChecksPass ? '#059669' : '#a7f3d0', color: 'white', border: 'none',
                borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: (resetLoading || !allChecksPass) ? 'not-allowed' : 'pointer',
              }}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer', marginTop: '16px', width: '100%' }}>
              ← Back to login
            </button>
          </>
        )}

        {/* ---------- STEP 4: DONE ---------- */}
        {view === 'forgot-done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: '#333' }}>Password reset!</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>You can now log in with your new password.</p>
            <button onClick={backToLogin} style={{
              width: '100%', padding: '12px', background: '#0a3d6b', color: 'white', border: 'none',
              borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>
              Go to Login
            </button>
          </div>
        )}

        {/* ---------- SIGN UP ---------- */}
        {view === 'signup' && (
          <>
            <h3 style={{ color: '#333', marginTop: 0 }}>Create an account</h3>
            {signupError && (
              <div style={{ background: '#ffe5e5', color: '#c0392b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                ❌ {signupError}
              </div>
            )}
            <form onSubmit={handleSignup}>
              <input type="text" placeholder="Full Name" required value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                style={{ ...inputStyle, marginBottom: '12px' }} />
              <input type="email" placeholder="Email Address" required value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                style={{ ...inputStyle, marginBottom: '12px' }} />
              <input type="tel" placeholder="Phone Number" required value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                style={{ ...inputStyle, marginBottom: '12px' }} />
              <input type="password" placeholder="Password" required value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                style={{ ...inputStyle, marginBottom: '4px' }} />
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>{PASSWORD_HINT}</p>
              <input type="password" placeholder="Confirm Password" required value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                style={{ ...inputStyle, marginBottom: '18px' }} />

              <button type="submit" disabled={signupLoading} style={{
                width: '100%', padding: '12px', background: '#0a3d6b', color: 'white', border: 'none',
                borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: signupLoading ? 'not-allowed' : 'pointer', opacity: signupLoading ? 0.7 : 1,
              }}>
                {signupLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer', marginTop: '16px', width: '100%' }}>
              ← Back to login
            </button>
          </>
        )}

        {view === 'signup-done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: '#333' }}>Account created!</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>You can now log in with your email and password.</p>
            <button onClick={backToLogin} style={{
              width: '100%', padding: '12px', background: '#0a3d6b', color: 'white', border: 'none',
              borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
