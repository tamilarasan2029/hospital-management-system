import React, { useState } from 'react';
import { colors } from '../theme';

// A real three-line (hamburger) icon as crisp SVG - reliable across every
// browser/zoom level, unlike a Unicode glyph or tiny CSS divs.
const HamburgerIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <rect y="0" width="20" height="2.4" rx="1.2" fill="white" />
    <rect y="6.8" width="20" height="2.4" rx="1.2" fill="white" />
    <rect y="13.6" width="20" height="2.4" rx="1.2" fill="white" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <line x1="1" y1="1" x2="17" y2="17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="17" y1="1" x2="1" y2="17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// This sidebar actually PUSHES OPEN (widens in place, part of the normal
// page flow) rather than floating a dropdown over the content - closer to
// a real mobile/desktop nav drawer, and it works the same way on both.
const Sidebar = ({ currentPage, setCurrentPage, user, onLogout, onFetchPatients, onFetchDoctors }) => {
  const [expanded, setExpanded] = useState(false);

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', key: 'dashboard' },
        { name: 'Patients', key: 'patients' },
        { name: 'Doctors', key: 'doctors' },
        { name: 'Book Appointment', key: 'bookAppointment' },
        { name: 'All Appointments', key: 'appointments' },
        { name: 'Medical History (EHR)', key: 'medicalHistory' },
        { name: 'Lab & Radiology', key: 'labOrders' },
        { name: 'Pharmacy', key: 'pharmacy' },
        { name: 'Wards & OT', key: 'wardManagement' },
        { name: 'Queue', key: 'queue' },
        { name: 'Billing', key: 'billing' },
        { name: 'Insurance Claims', key: 'insurance' },
        { name: 'Main Tasks', key: 'tasks' },
        { name: 'My Profile', key: 'profile' },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { name: 'My Patients', key: 'myPatients' },
        { name: 'Medical History (EHR)', key: 'medicalHistory' },
        { name: 'Lab & Radiology', key: 'labOrders' },
        { name: 'Queue', key: 'queue' },
        { name: 'Doctors List', key: 'doctors' },
        { name: 'My Profile', key: 'profile' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const goTo = (key) => {
    setCurrentPage(key);
    if (key === 'patients' && onFetchPatients) onFetchPatients();
    if (key === 'doctors' && onFetchDoctors) onFetchDoctors();
  };

  const displayTitle = user?.role === 'doctor' ? `Dr. ${user?.name}` : (user?.name || 'Admin');
  const displaySubtitle = user?.role === 'doctor' ? (user?.specialization || 'Doctor') : 'Administrator';

  return (
    <div style={{
      width: expanded ? '250px' : '64px',
      background: colors.bgSidebar,
      color: 'white',
      padding: '16px 0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: expanded ? 'flex-end' : 'center', padding: '0 16px', marginBottom: '20px' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse menu' : 'Expand menu'}
          style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
            cursor: 'pointer', width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {expanded ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {expanded && (
        <>
          <div style={{ padding: '0 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: '10px', whiteSpace: 'nowrap' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{displayTitle}</p>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', opacity: 0.8 }}>{displaySubtitle}</p>
          </div>

          <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => goTo(item.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '11px 12px', marginBottom: '2px',
                  background: currentPage === item.key ? colors.bgSidebarActive : 'transparent',
                  border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                  fontSize: '14px', fontWeight: currentPage === item.key ? 600 : 400, whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (currentPage !== item.key) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if (currentPage !== item.key) e.currentTarget.style.background = 'transparent'; }}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div style={{ padding: '10px' }}>
            <button
              onClick={() => { if (window.confirm('Are you sure you want to log out?')) onLogout(); }}
              style={{
                width: '100%', textAlign: 'left', padding: '11px 12px', background: '#0c4a6e',
                border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
