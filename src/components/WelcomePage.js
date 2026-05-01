import React, { useState, useEffect } from 'react';

const WelcomePage = ({ onLoginClick, API_URL }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/doctors`);
      const data = await response.json();
      const doctorsList = Array.isArray(data) ? data : data.data || [];
      setDoctors(doctorsList.slice(0, 6));
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333' }}>
      {/* NAVBAR */}
      <nav style={{
        background: 'white',
        padding: '15px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
          🏥 Qwen Hospital
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#services" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: '500' }}>Services</a>
          <a href="#doctors" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: '500' }}>Doctors</a>
          <a href="#about" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: '500' }}>About</a>
          <a href="#contact" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: '500' }}>Contact</a>
          <button
            onClick={onLoginClick}
            style={{
              padding: '10px 25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 50px',
        textAlign: 'center',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
          Welcome to Qwen Hospital
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '30px', maxWidth: '700px', lineHeight: '1.6' }}>
          Providing excellence in healthcare with state-of-the-art facilities and compassionate care
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={onLoginClick}
            style={{
              padding: '15px 40px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Book Appointment
          </button>
          <button
            style={{
              padding: '15px 40px',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" style={{ padding: '80px 50px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px', color: '#2c3e50' }}>
          Our Services
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {[
            { icon: '🏥', title: 'Emergency Care', description: '24/7 Emergency Department with advanced trauma care' },
            { icon: '🔬', title: 'Diagnostic Labs', description: 'State-of-the-art laboratory testing facilities' },
            { icon: '🏨', title: 'In-Patient Care', description: 'Comfortable rooms with modern amenities' },
            { icon: '💊', title: 'Pharmacy', description: 'Complete pharmaceutical services' },
            { icon: '👶', title: 'Maternity Care', description: 'Specialized obstetric and pediatric services' },
            { icon: '🧠', title: 'Neurology', description: 'Expert neurology and neurosurgery services' }
          ].map((service, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>{service.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{service.title}</h3>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTORS SECTION */}
      <section id="doctors" style={{ padding: '80px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px', color: '#2c3e50' }}>
          Our Expert Doctors
        </h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading doctors...</p>
        ) : doctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {doctors.map((doctor, idx) => (
              <div key={idx} style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚕️</div>
                <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{doctor.name}</h3>
                <p style={{ marginBottom: '10px', fontSize: '14px', opacity: 0.9 }}>{doctor.specialization}</p>
                <p style={{ marginBottom: '15px', fontSize: '13px', opacity: 0.8 }}>
                  Experience: {doctor.yearsOfExperience} years
                </p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>📞 {doctor.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>No doctors available</p>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{ padding: '80px 50px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '30px', color: '#2c3e50' }}>
          About Qwen Hospital
        </h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', marginBottom: '20px' }}>
            Qwen Hospital is a leading healthcare institution committed to providing exceptional medical services 
            with a patient-centered approach. Our state-of-the-art facilities, experienced medical professionals, 
            and advanced technology ensure that our patients receive the highest quality care.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
            With multiple specialties and a dedicated team of healthcare professionals, we are here to serve your 
            health needs with compassion, expertise, and excellence.
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '60px 50px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>50+</div>
            <p style={{ fontSize: '16px' }}>Expert Doctors</p>
          </div>
          <div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>100K+</div>
            <p style={{ fontSize: '16px' }}>Happy Patients</p>
          </div>
          <div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>20+</div>
            <p style={{ fontSize: '16px' }}>Specialties</p>
          </div>
          <div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>24/7</div>
            <p style={{ fontSize: '16px' }}>Emergency Service</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 50px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '50px', color: '#2c3e50' }}>
          Patient Testimonials
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { name: 'Arjun Singh', text: 'Excellent service and caring staff. Highly recommend!' },
            { name: 'Priya Verma', text: 'Professional doctors and state-of-the-art facilities.' },
            { name: 'Rajesh Gupta', text: 'Best healthcare experience I have ever had.' }
          ].map((testimonial, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{testimonial.text}"
              </p>
              <p style={{ color: '#2c3e50', fontWeight: '600' }}>- {testimonial.name}</p>
              <p style={{ color: '#f39c12', fontSize: '16px' }}>⭐⭐⭐⭐⭐</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 50px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Ready to Book Your Appointment?</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>Schedule a consultation with our expert doctors today</p>
        <button
          onClick={onLoginClick}
          style={{
            padding: '15px 40px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Book Now
        </button>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{
        background: '#2c3e50',
        color: 'white',
        padding: '40px 50px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Contact Us</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>📍 Address</p>
            <p>Taragampatti, Karur District</p>
            <p>Tamil Nadu, India</p>
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>📞 Phone</p>
            <p>+91 98765 43210</p>
            <p>+91 44-2234 5678</p>
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>📧 Email</p>
            <p>info@qwenhospital.com</p>
            <p>appointments@qwenhospital.com</p>
          </div>
        </div>
        <hr style={{ borderColor: '#fff', marginBottom: '20px', opacity: 0.3 }} />
        <p style={{ color: '#bdc3c7' }}>
          © 2026 Qwen Hospital. All rights reserved. | Privacy Policy | Terms & Conditions
        </p>
      </footer>
    </div>
  );
};

export default WelcomePage;