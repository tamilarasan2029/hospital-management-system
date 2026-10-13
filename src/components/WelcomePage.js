import React, { useState, useEffect } from 'react';

// Apollo-style hospital homepage: utility bar, header with a strong booking
// CTA, hero, quick actions, specialities, live doctor cards, stats, footer.
// Colours: deep navy-blue for trust, red for booking/emergency actions,
// light ice-blue section backgrounds, red footer as requested.

const NAVY = '#0a3d6b';
const BLUE = '#0b6bb8';
const ICE = '#e8f3fb';
const RED = '#d7262e';
const RED_DARK = '#b91c1c';

const SPECIALITIES = [
  { name: 'Cardiology', icon: '❤️' },
  { name: 'Neurology', icon: '🧠' },
  { name: 'Orthopedics', icon: '🦴' },
  { name: 'General Medicine', icon: '🩺' },
  { name: 'Gastroenterology', icon: '🫃' },
  { name: 'Dermatology', icon: '🧴' },
  { name: 'Endocrinology', icon: '🧪' },
  { name: 'Pulmonology', icon: '🫁' },
  { name: 'ENT', icon: '👂' },
  { name: 'Gynecology', icon: '🌸' },
  { name: 'Pediatrics', icon: '👶' },
  { name: 'General Surgery', icon: '🔬' },
];

const WelcomePage = ({ onLoginClick, onBookClick, API_URL }) => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/doctors`);
        const result = await res.json();
        if (res.ok) setDoctors(result.data || []);
      } catch (err) {
        console.error('Could not load doctors for homepage:', err);
      }
    };
    load();
  }, [API_URL]);

  const sectionTitle = { fontSize: '30px', fontWeight: 700, color: NAVY, margin: '0 0 8px 0' };
  const sectionSub = { fontSize: '15px', color: '#475569', margin: '0 0 28px 0' };
  const wrap = { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#1e293b', background: 'white' }}>

      {/* UTILITY BAR */}
      <div style={{ background: NAVY, color: 'white', fontSize: '13px' }}>
        <div style={{ ...wrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '38px' }}>
          <span>🚑 Emergency: <strong>108</strong> &nbsp;|&nbsp; ☎️ Appointments: <strong>+91 98765 43210</strong></span>
          <button onClick={onLoginClick} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Staff Login
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ ...wrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '76px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: RED, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800 }}>+</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: NAVY }}>Qwen Hospital</div>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.5px' }}>MULTI-SPECIALITY CARE</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
            {[['#specialities', 'Specialities'], ['#doctors', 'Doctors'], ['#about', 'About'], ['#contact', 'Contact']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: NAVY, textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{label}</a>
            ))}
            <button onClick={onBookClick} style={{ background: RED, color: 'white', border: 'none', padding: '11px 22px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>
              Book Appointment
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${BLUE} 100%)`, color: 'white', padding: '84px 0' }}>
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px', opacity: 0.85, margin: '0 0 12px 0' }}>Trusted care, every day</p>
            <h1 style={{ fontSize: '50px', lineHeight: 1.15, fontWeight: 800, margin: '0 0 18px 0' }}>Expert doctors.<br />Compassionate care.</h1>
            <p style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.92, maxWidth: '560px', margin: '0 0 32px 0' }}>
              Book an appointment with our specialists in under a minute. No account needed — just choose a doctor and a time that suits you.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={onBookClick} style={{ background: RED, color: 'white', border: 'none', padding: '16px 34px', borderRadius: '6px', fontWeight: 700, fontSize: '17px', cursor: 'pointer' }}>
                Book Appointment
              </button>
              <a href="#doctors" style={{ background: 'white', color: NAVY, padding: '16px 34px', borderRadius: '6px', fontWeight: 700, fontSize: '17px', textDecoration: 'none' }}>
                Find a Doctor
              </a>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '28px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ margin: '0 0 14px 0', fontWeight: 700, fontSize: '18px' }}>Quick booking</p>
            {['Choose a speciality', 'Pick your doctor', 'Select a time slot', 'Confirm in seconds'].map((step, i) => (
              <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: '15px' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={{ background: 'white', marginTop: '-40px', position: 'relative' }}>
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          {[
            { icon: '📅', title: 'Book Appointment', text: 'Online, as a guest', action: onBookClick },
            { icon: '🔍', title: 'Find a Doctor', text: 'Browse by speciality', action: () => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: '🚑', title: 'Emergency 24/7', text: 'Call 108 immediately', action: () => window.location.href = 'tel:108' },
            { icon: '🧪', title: 'Lab & Diagnostics', text: 'Reports and imaging', action: () => document.getElementById('specialities')?.scrollIntoView({ behavior: 'smooth' }) },
          ].map(card => (
            <div key={card.title} onClick={card.action} style={{ background: 'white', borderRadius: '10px', padding: '22px', boxShadow: '0 8px 24px rgba(10,61,107,0.12)', cursor: 'pointer', borderTop: `4px solid ${RED}` }}>
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: '16px' }}>{card.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{card.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALITIES */}
      <section id="specialities" style={{ padding: '70px 0 40px 0' }}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Our Specialities</h2>
          <p style={sectionSub}>Dedicated departments staffed by experienced specialists.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px' }}>
            {SPECIALITIES.map(s => (
              <div key={s.name} onClick={onBookClick} style={{ background: ICE, borderRadius: '10px', padding: '20px 16px', textAlign: 'center', cursor: 'pointer', border: '1px solid #cfe3f3' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: '15px' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS - live from the database */}
      <section id="doctors" style={{ background: ICE, padding: '70px 0' }}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Meet Our Doctors</h2>
          <p style={sectionSub}>Experienced consultants. Book directly with the doctor of your choice.</p>
          {doctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
              {doctors.map(d => (
                <div key={d.doctor_id} style={{ background: 'white', borderRadius: '12px', padding: '22px', boxShadow: '0 6px 18px rgba(10,61,107,0.10)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '12px' }}>👨‍⚕️</div>
                  <div style={{ fontWeight: 800, color: NAVY, fontSize: '17px' }}>Dr. {d.name}</div>
                  <div style={{ color: RED, fontWeight: 600, fontSize: '14px', marginTop: '2px' }}>{d.specialization}</div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '10px', lineHeight: 1.7 }}>
                    {d.qualifications && <div>🎓 {d.qualifications}</div>}
                    <div>⏳ {d.years_of_experience} years experience</div>
                    <div>💰 Consultation ₹{d.consultation_fee}</div>
                  </div>
                  <button onClick={onBookClick} style={{ marginTop: '16px', width: '100%', background: NAVY, color: 'white', border: 'none', padding: '11px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    Book with Dr. {d.name.split(' ')[0]}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>Our doctors will appear here shortly.</p>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: `linear-gradient(120deg, ${NAVY}, ${BLUE})`, color: 'white', padding: '54px 0' }}>
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
          {[['50+', 'Expert Doctors'], ['100K+', 'Patients Served'], ['20+', 'Specialities'], ['24/7', 'Emergency Care']].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: '42px', fontWeight: 800 }}>{num}</div>
              <div style={{ fontSize: '15px', opacity: 0.9, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: '70px 0' }}>
        <div style={{ ...wrap, maxWidth: '820px', textAlign: 'center' }}>
          <h2 style={sectionTitle}>About Qwen Hospital</h2>
          <p style={{ fontSize: '17px', lineHeight: 1.8, color: '#334155' }}>
            Qwen Hospital brings together specialist doctors, modern diagnostics and a patient-first approach. From routine check-ups to complex procedures, our teams work together so that every patient gets the right care at the right time.
          </p>
        </div>
      </section>

      {/* FOOTER - red */}
      <footer id="contact" style={{ background: '#06223d', color: 'white', padding: '50px 0 24px 0' }}>
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '30px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Qwen Hospital</div>
            <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.92, margin: 0 }}>Multi-speciality care you can trust. Open 24 hours, every day.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>Contact</div>
            <div style={{ fontSize: '14px', lineHeight: 1.9, opacity: 0.95 }}>☎️ +91 98765 43210<br />✉️ care@qwenhospital.com<br />🚑 Emergency: 108</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>Quick Links</div>
            <div style={{ fontSize: '14px', lineHeight: 1.9 }}>
              <a href="#specialities" style={{ color: 'white', display: 'block' }}>Specialities</a>
              <a href="#doctors" style={{ color: 'white', display: 'block' }}>Doctors</a>
              <a href="#about" style={{ color: 'white', display: 'block' }}>About</a>
            </div>
          </div>
        </div>
        <div style={{ ...wrap, marginTop: '34px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.25)', fontSize: '13px', opacity: 0.9 }}>
          © 2026 Qwen Hospital. All rights reserved. | Privacy Policy | Terms & Conditions
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
