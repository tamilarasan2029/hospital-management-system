import React from 'react';

const Sidebar = ({ currentPage, setCurrentPage, user, onLogout, sidebarOpen, setSidebarOpen, onFetchPatients, onFetchDoctors }) => {
  // Different menu items based on role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', icon: '📊', key: 'dashboard' },
        { name: 'Patients', icon: '👥', key: 'patients' },
        { name: 'Doctors', icon: '⚕️', key: 'doctors' },
        { name: 'Appointments', icon: '📅', key: 'appointments' },
        { name: 'Billing', icon: '💳', key: 'billing' },
        { name: 'My Profile', icon: '⚙️', key: 'profile' }
      ];
    } else if (user?.role === 'doctor') {
      return [
        { name: 'My Patients', icon: '👨‍⚕️', key: 'myPatients' },
        { name: 'Doctors List', icon: '⚕️', key: 'doctors' },
        { name: 'My Profile', icon: '⚙️', key: 'profile' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div style={{
      width: sidebarOpen ? '250px' : '60px',
      background: '#2c3e50',
      color: 'white',
      padding: '20px',
      transition: 'width 0.3s',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      minHeight: '100vh'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        {sidebarOpen && <h2 style={{ margin: 0 }}>Qwen</h2>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* ROLE BADGE */}
      {sidebarOpen && (
        <div style={{
          background: user?.role === 'admin' ? '#e74c3c' : '#3498db',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {user?.role === 'admin' ? '👨‍💼 ADMIN' : '👨‍⚕️ DOCTOR'}
        </div>
      )}

      <nav>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => {
              setCurrentPage(item.key);
              if (item.key === 'patients') onFetchPatients();
              if (item.key === 'doctors') onFetchDoctors();
            }}
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0',
              background: currentPage === item.key ? '#3498db' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              transition: 'background 0.3s'
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {sidebarOpen && item.name}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        style={{
          width: '100%',
          marginTop: '30px',
          padding: '12px',
          background: '#e74c3c',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>
        {sidebarOpen && 'Logout'}
      </button>
    </div>
  );
};

export default Sidebar;