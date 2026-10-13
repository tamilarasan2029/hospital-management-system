import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import WelcomePage from './components/WelcomePage';
import PublicBooking from './components/PublicBooking';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import BookAppointment from './components/BookAppointment';
import MedicalHistory from './components/MedicalHistory';
import Pharmacy from './components/Pharmacy';
import WardManagement from './components/WardManagement';
import LabOrders from './components/LabOrders';
import Insurance from './components/Insurance';
import QueueManagement from './components/QueueManagement';
import Doctors from './components/Doctors';
import Patients from './components/Patients';
import Billing from './components/Billing';
import Profile from './components/Profile';
import MyPatients from './components/MyPatients';
import Tasks from './components/Tasks';
import PatientHome from './components/PatientHome';
import Sidebar from './components/Sidebar';

const App = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api';

    // Attach the login token to every request to our API.
    useEffect(() => {
      const originalFetch = window.fetch;
      window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const token = localStorage.getItem('qwenHospitalToken');
        if (url.startsWith(API_URL) && token) {
          const headers = new Headers(init.headers || {});
          if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
          init = { ...init, headers };
        }
        return originalFetch(input, init);
      };
      return () => { window.fetch = originalFetch; };
    }, []);


  // On every fresh page load, ALWAYS show the Home/Welcome page first -
  // this was still auto-skipping straight to the Dashboard/My Patients
  // page for an already-authenticated session, which is exactly what
  // was reported as unwanted. currentPage's default ('welcome') is left
  // Refreshing the page should keep you logged in on the same screen,
  // like any normal web app - it should NOT bounce you back to Home.
  // A brand-new visitor with no saved session still lands on Home/Welcome
  // naturally, since there's nothing to resume in that case.
  useEffect(() => {
    const savedUser = localStorage.getItem('qwenHospitalUser');
    const savedToken = localStorage.getItem('qwenHospitalToken');
    const savedPage = localStorage.getItem('qwenHospitalCurrentPage');

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);

      const validSavedPage = savedPage && savedPage !== 'login' && savedPage !== 'welcome' ? savedPage : null;
      if (validSavedPage) {
        setCurrentPage(validSavedPage);
      } else if (parsedUser.role === 'admin') {
        setCurrentPage('dashboard');
      } else if (parsedUser.role === 'doctor') {
        setCurrentPage('myPatients');
      } else {
        setCurrentPage('patientHome');
      }

      fetchAppointments();
      fetchPatients();
    }

    setLoading(false);
    // Doctor list is public info (no auth needed) - a guest browsing the
    // homepage or booking an appointment needs this before ever logging in.
    fetchDoctors();
  }, []);

  // Save current page whenever it changes
  useEffect(() => {
    if (user && currentPage !== 'welcome') {
      localStorage.setItem('qwenHospitalCurrentPage', currentPage);
    }
  }, [currentPage, user]);

  // onLogin now receives the real user object and JWT token from LoginPage,
  // which got them from a real POST /api/auth/login call - no more fake credentials.
  const handleLogin = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);

    localStorage.setItem('qwenHospitalUser', JSON.stringify(userData));
    localStorage.setItem('qwenHospitalToken', accessToken);

    if (userData.role === 'admin') {
      setCurrentPage('dashboard');
      localStorage.setItem('qwenHospitalCurrentPage', 'dashboard');
    } else if (userData.role === 'doctor') {
      setCurrentPage('myPatients');
      localStorage.setItem('qwenHospitalCurrentPage', 'myPatients');
    } else {
      // PATIENT (or any other role without a dedicated dashboard yet) -
      // previously currentPage was never advanced here, so the app just
      // silently stayed on the Login screen even after a real, successful
      // login. Now everyone lands somewhere real.
      setCurrentPage('patientHome');
      localStorage.setItem('qwenHospitalCurrentPage', 'patientHome');
    }

    fetchDoctors();
    fetchAppointments();
    fetchPatients();
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
    localStorage.removeItem('qwenHospitalCurrentPage');
  };

  // Called by Profile.js after a successful save, so the sidebar/header name
  // updates immediately and the change survives navigating to another page -
  // this is the actual fix for "profile edits don't stick."
  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('qwenHospitalUser', JSON.stringify(updatedUser));
  };

  // Helper: attaches the JWT to any request that needs to know who's calling,
  // for endpoints where that matters (audit logging attributes actions to this user).
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/doctors`);
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      const data = await response.json();
      let doctorsList = [];
      if (Array.isArray(data)) {
        doctorsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        doctorsList = data.data;
      }
      setDoctors(doctorsList);
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);
      setDoctors([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments`);
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      const data = await response.json();
      let appointmentsList = [];
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        appointmentsList = data.data;
      }
      setAppointments(appointmentsList);
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      setAppointments([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients`);
      if (!response.ok) {
        console.error('❌ API Error:', response.status);
        return;
      }
      const data = await response.json();
      let patientsList = [];
      if (Array.isArray(data)) {
        patientsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        patientsList = data.data;
      }
      setPatients(patientsList);
    } catch (err) {
      console.error('❌ Error fetching patients:', err);
      setPatients([]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentPage('welcome');
    localStorage.removeItem('qwenHospitalUser');
    localStorage.removeItem('qwenHospitalToken');
    localStorage.removeItem('qwenHospitalCurrentPage');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f8f4' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#1a3a2a' }}>🏥 Qwen Hospital</h2>
          <p style={{ color: '#7f8c8d' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'welcome') {
    return <WelcomePage onLoginClick={handleGoToLogin} onBookClick={() => setCurrentPage('publicBooking')} API_URL={API_URL} />;
  }

  if (currentPage === 'publicBooking') {
    return <PublicBooking doctors={doctors} API_URL={API_URL} onDone={() => setCurrentPage('welcome')} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} API_URL={API_URL} />;
  }

  if (!user) {
    return <WelcomePage onLoginClick={handleGoToLogin} onBookClick={() => setCurrentPage('publicBooking')} API_URL={API_URL} />;
  }

  if (user.role !== 'admin' && user.role !== 'doctor') {
    return <PatientHome user={user} onLogout={handleLogout} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f8f4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
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
        {user?.role === 'admin' && currentPage === 'dashboard' && <Dashboard patients={patients} doctors={doctors} appointments={appointments} user={user} setCurrentPage={setCurrentPage} onFetchAppointments={fetchAppointments} authHeaders={authHeaders} API_URL={API_URL} />}
        {user?.role === 'admin' && currentPage === 'patients' && <Patients patients={patients} appointments={appointments} onFetchPatients={fetchPatients} API_URL={API_URL} authHeaders={authHeaders} />}
        {(user?.role === 'admin' || user?.role === 'doctor') && currentPage === 'appointments' && <Appointments appointments={appointments} onFetchAppointments={fetchAppointments} API_URL={API_URL} patients={patients} doctors={doctors} user={user} authHeaders={authHeaders} setCurrentPage={setCurrentPage} />}
        {(user?.role === 'admin' || user?.role === 'doctor') && currentPage === 'bookAppointment' && <BookAppointment onFetchAppointments={fetchAppointments} API_URL={API_URL} patients={patients} doctors={doctors} authHeaders={authHeaders} setCurrentPage={setCurrentPage} />}
        {user?.role === 'admin' && currentPage === 'billing' && <Billing user={user} API_URL={API_URL} authHeaders={authHeaders} patients={patients} />}
        {user?.role === 'admin' && currentPage === 'tasks' && <Tasks appointments={appointments} API_URL={API_URL} authHeaders={authHeaders} setCurrentPage={setCurrentPage} />}

        {(user?.role === 'admin' || user?.role === 'doctor') && currentPage === 'medicalHistory' && <MedicalHistory patients={patients} API_URL={API_URL} authHeaders={authHeaders} />}
        {(user?.role === 'admin' || user?.role === 'doctor') && currentPage === 'labOrders' && <LabOrders patients={patients} doctors={doctors} API_URL={API_URL} authHeaders={authHeaders} />}
        {(user?.role === 'admin' || user?.role === 'doctor') && currentPage === 'queue' && <QueueManagement patients={patients} doctors={doctors} API_URL={API_URL} authHeaders={authHeaders} />}
        {user?.role === 'admin' && currentPage === 'pharmacy' && <Pharmacy patients={patients} API_URL={API_URL} authHeaders={authHeaders} />}
        {user?.role === 'admin' && currentPage === 'wardManagement' && <WardManagement patients={patients} doctors={doctors} API_URL={API_URL} authHeaders={authHeaders} />}
        {user?.role === 'admin' && currentPage === 'insurance' && <Insurance API_URL={API_URL} authHeaders={authHeaders} />}

        {user?.role === 'doctor' && currentPage === 'myPatients' && <MyPatients patients={patients} appointments={appointments} onFetchAppointments={fetchAppointments} authHeaders={authHeaders} user={user} API_URL={API_URL} setCurrentPage={setCurrentPage} />}

        {currentPage === 'doctors' && <Doctors doctors={doctors} />}
        {currentPage === 'profile' && <Profile user={user} onLogout={handleLogout} API_URL={API_URL} authHeaders={authHeaders} onProfileUpdated={handleProfileUpdated} />}
      </div>
    </div>
  );
};

export default App;
