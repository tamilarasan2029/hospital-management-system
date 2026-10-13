import React, { useState, useEffect } from 'react';
import { colors, cardStyle, statusBadge } from '../theme';

// Pulls together everything that actually needs someone's attention:
// scheduled appointments still pending, unpaid bills, and system
// notifications (overdue bills, low stock, appointment reminders) - all
// from your real backend, not a static "5" placeholder.
const Tasks = ({ appointments, API_URL, authHeaders, setCurrentPage }) => {
  const [pendingBills, setPendingBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [billsRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/billing?status=PENDING`, { headers: authHeaders ? authHeaders() : {} }),
          fetch(`${API_URL}/notifications?unread_only=true`, { headers: authHeaders ? authHeaders() : {} }),
        ]);
        const billsResult = await billsRes.json();
        const notifResult = await notifRes.json();
        if (billsRes.ok) setPendingBills(billsResult.data || []);
        if (notifRes.ok) setNotifications(notifResult.data || []);
      } catch (err) {
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_URL, authHeaders]);

  const pendingAppointments = (appointments || []).filter(a => a.status === 'SCHEDULED');

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>⚠️ Pending Tasks</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* PENDING APPOINTMENTS */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>📅 Appointments Awaiting ({pendingAppointments.length})</h3>
          {pendingAppointments.length > 0 ? (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {pendingAppointments.map(a => (
                <div key={a.appointment_id} style={{ padding: '10px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
                  onClick={() => setCurrentPage && setCurrentPage('appointments')}>
                  <p style={{ margin: '2px 0', fontWeight: 600, fontSize: '14px' }}>{a.patient_name} → Dr. {a.doctor_name}</p>
                  <p style={{ margin: '2px 0', color: colors.textSecondary, fontSize: '12px' }}>{new Date(a.appointment_date_time).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: colors.textMuted }}>Nothing pending</p>
          )}
        </div>

        {/* PENDING BILLS */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>💳 Unpaid Bills ({pendingBills.length})</h3>
          {loading ? (
            <p style={{ color: colors.textMuted }}>Loading...</p>
          ) : pendingBills.length > 0 ? (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {pendingBills.map(b => (
                <div key={b.billing_id} style={{ padding: '10px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
                  onClick={() => setCurrentPage && setCurrentPage('billing')}>
                  <p style={{ margin: '2px 0', fontWeight: 600, fontSize: '14px' }}>{b.patient_name} - ₹{Number(b.amount).toFixed(2)}</p>
                  <p style={{ margin: '2px 0', color: colors.textSecondary, fontSize: '12px' }}>{b.description || 'No description'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: colors.textMuted }}>No unpaid bills</p>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>🔔 Notifications ({notifications.length})</h3>
          {loading ? (
            <p style={{ color: colors.textMuted }}>Loading...</p>
          ) : notifications.length > 0 ? (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div key={n.notification_id} style={{ padding: '10px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ margin: '2px 0', fontWeight: 600, fontSize: '13px' }}>{n.title}</p>
                    <span style={statusBadge(n.type)}>{n.type.replace(/_/g, ' ')}</span>
                  </div>
                  <p style={{ margin: '2px 0', color: colors.textSecondary, fontSize: '12px' }}>{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: colors.textMuted }}>No notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
