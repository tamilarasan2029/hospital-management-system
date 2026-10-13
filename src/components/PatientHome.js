import React from 'react';
import { colors, cardStyle } from '../theme';

// A real, honest landing page for PATIENT-role accounts (created via Sign Up).
// This is NOT the full patient portal (viewing your own appointments/bills/
// medical records) - that's a bigger, separate feature that reuses the
// already-built /api/portal backend and still needs to be built. This page
// exists so a patient login actually goes somewhere instead of silently
// bouncing back to the login screen, which was the reported bug.
const PatientHome = ({ user, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', background: colors.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ ...cardStyle, maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>👋</div>
        <h2 style={{ color: colors.textPrimary, marginBottom: '6px' }}>Welcome, {user?.name}</h2>
        <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>{user?.email}</p>

        <div style={{ background: colors.bgPage, padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary }}>
            Your account is active and your login is working correctly. The full
            patient portal - viewing your own appointments, bills, and medical
            history - is still being built and will appear here soon.
          </p>
        </div>

        <button
          onClick={() => { if (window.confirm('Are you sure you want to log out?')) onLogout(); }}
          style={{ width: '100%', padding: '12px', background: colors.danger, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PatientHome;
