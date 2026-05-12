import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Doctors from './components/Doctors';
import Patients from './components/Patients';
import Billing from './components/Billing';
import Profile from './components/Profile';
import MyPatients from './components/MyPatients';
import Sidebar from './components/Sidebar';

const App = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api';

  // Load user and page from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('qwenHospitalUser');
    const savedPage = localStorage.getItem('qwenHospitalCurrentPage');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // If there's a saved page, go to it
      if (savedPage) {
        setCurrentPage(savedPage);
      } else {
        // Otherwise go to default page based on role
        if (parsedUser.role === 'admin') {
          setCurrentPage('dashboard');
        } else if (parsedUser.role === 'doctor') {
          setCurrentPage('myPatients');
        }
      }

      // Fetch data automatically
      fetchDoctors();
      fetchAppointments();
      fetchPatients();
    }
    
    setLoading(false);
  }, []);

  // Save current page whenever it changes
  useEffect(() => {
    if (user && currentPage !== 'welcome') {
      localStorage.setItem('qwenHospitalCurrentPage', currentPage);
    }
  }, [currentPage, user]);

  const handleLogin = (email, role) => {
    const userData = { email, role, name: email.split('@')[0] };
    setUser(userData);
    
    // Save user to localStorage
    localStorage.setItem('qwenHospitalUser', JSON.stringify(userData));
    
    // Set initial page based on role
    if (role === 'admin') {
      setCurrentPage('dashboard');
      localStorage.setItem('qwenHospitalCurrentPage', 'dashboard');
    } else if (role === 'doctor') {
      setCurrentPage('myPatients');
      localStorage.setItem('qwenHospitalCurrentPage', 'myPatients');
    }
    
    fetchDoctors();
    fetchAppointments();
    fetchPatients();
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
    localStorage.removeItem('qwenHospitalCurrentPage');
  };

  const fetchDoctors = async () => {
    try {
      console.log('🔄 Fetching doctors from:', `${API_URL}/doctors`);
      const response = await fetch(`${API_URL}/doctors`);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      // Parse response - API returns {data: [...], message: "...", status: 200}
      let doctorsList = [];
      
      if (Array.isArray(data)) {
        doctorsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        doctorsList = data.data;
      } else if (data && Array.isArray(data)) {
        doctorsList = data;
      }
      
      console.log('✅ Parsed doctors:', doctorsList);
      setDoctors(doctorsList);
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);
      setDoctors([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log('🔄 Fetching appointments from:', `${API_URL}/appointments`);
      const response = await fetch(`${API_URL}/appointments`);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Appointments API Response:', data);
      
      let appointmentsList = [];
      
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        appointmentsList = data.data;
      } else if (data && Array.isArray(data)) {
        appointmentsList = data;
      }
      
      console.log('✅ Parsed appointments:', appointmentsList);
      setAppointments(appointmentsList);
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      setAppointments([]);
    }
  };

  const fetchPatients = async () => {
    try {
      console.log('🔄 Fetching patients from:', `${API_URL}/patients`);
      const response = await fetch(`${API_URL}/patients`);
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Patients API Response:', data);
      
      let patientsList = [];
      
      if (Array.isArray(data)) {
        patientsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        patientsList = data.data;
      } else if (data && Array.isArray(data)) {
        patientsList = data;
      }
      
      console.log('✅ Parsed patients:', patientsList);
      setPatients(patientsList);
    } catch (err) {
      console.error('❌ Error fetching patients:', err);
      setPatients([]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('welcome');
    // Clear from localStorage
    localStorage.removeItem('qwenHospitalUser');
    localStorage.removeItem('qwenHospitalCurrentPage');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2c3e50' }}>🏥 Qwen Hospital</h2>
          <p style={{ color: '#7f8c8d' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Welcome Page
  if (currentPage === 'welcome') {
    return <WelcomePage onLoginClick={handleGoToLogin} API_URL={API_URL} />;
  }

  // Login Page
  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Dashboard Pages (with Sidebar) - Only show if user is logged in
  if (!user) {
    return <WelcomePage onLoginClick={handleGoToLogin} API_URL={API_URL} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onFetchPatients={fetchPatients}
        onFetchDoctors={fetchDoctors}
      />
      
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {/* ADMIN PAGES */}
        {user?.role === 'admin' && currentPage === 'dashboard' && <Dashboard patients={patients} doctors={doctors} appointments={appointments} user={user} />}
        {user?.role === 'admin' && currentPage === 'patients' && <Patients patients={patients} onFetchPatients={fetchPatients} API_URL={API_URL} />}
        {user?.role === 'admin' && currentPage === 'appointments' && <Appointments appointments={appointments} onFetchAppointments={fetchAppointments} API_URL={API_URL} patients={patients} doctors={doctors} user={user} />}
        {user?.role === 'admin' && currentPage === 'billing' && <Billing user={user} API_URL={API_URL} />}
        
        {/* DOCTOR PAGES */}
        {user?.role === 'doctor' && currentPage === 'myPatients' && <MyPatients patients={patients} user={user} API_URL={API_URL} />}
        
        {/* SHARED PAGES */}
        {currentPage === 'doctors' && <Doctors doctors={doctors} />}
        {currentPage === 'profile' && <Profile user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
};

export default App;