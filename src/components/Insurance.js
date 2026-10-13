import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' };

// Insurance claims processing, linked to real bills.
const Insurance = ({ API_URL, authHeaders }) => {
  const [claims, setClaims] = useState([]);
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => { setToast({ text, type }); setTimeout(() => setToast(null), 3000); };
  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const fetchData = async () => {
    try {
      const [claimsRes, billsRes] = await Promise.all([
        fetch(`${API_URL}/insurance-claims`, { headers: authHeaders ? authHeaders() : {} }),
        fetch(`${API_URL}/billing`, { headers: authHeaders ? authHeaders() : {} }),
      ]);
      const claimsResult = await claimsRes.json();
      const billsResult = await billsRes.json();
      if (claimsRes.ok) setClaims(claimsResult.data || []);
      if (billsRes.ok) setBills(billsResult.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bill = bills.find(b => String(b.billing_id) === formData.get('billing_id'));
    try {
      const response = await fetch(`${API_URL}/insurance-claims`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({
          billing_id: parseInt(formData.get('billing_id'), 10),
          patient_id: bill.patient_id,
          insurance_provider: formData.get('insurance_provider'),
          policy_number: formData.get('policy_number'),
          claim_amount: formData.get('claim_amount'),
          notes: formData.get('notes'),
        }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not submit claim', 'error'); return; }
      showToast('Claim submitted');
      e.target.reset(); setShowForm(false);
      await fetchData();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  const handleStatusChange = async (claimId, status) => {
    try {
      const response = await fetch(`${API_URL}/insurance-claims/${claimId}`, {
        method: 'PUT', headers: jsonHeaders(), body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) { showToast(result.message || 'Could not update claim', 'error'); return; }
      showToast(`Claim marked ${status}`);
      await fetchData();
    } catch (err) { showToast('Could not reach the server', 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ color: colors.textPrimary, margin: 0 }}>🛡️ Insurance Claims</h1>
        <button onClick={() => setShowForm(!showForm)} style={secondaryButton}>{showForm ? '✕ Cancel' : '➕ Submit Claim'}</button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, background: toast.type === 'error' ? colors.danger : colors.success, color: 'white', padding: '12px 18px', borderRadius: '8px', fontWeight: 600 }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px', maxWidth: '520px' }}>
          <form onSubmit={handleCreate}>
            <select name="billing_id" required style={{ ...inputStyle, marginBottom: '10px' }}>
              <option value="">Select bill to claim against</option>
              {bills.map(b => <option key={b.billing_id} value={b.billing_id}>#{b.billing_id} — {b.patient_name} — ₹{Number(b.amount).toFixed(2)}</option>)}
            </select>
            <input name="insurance_provider" placeholder="Insurance provider (e.g. Star Health)" required style={{ ...inputStyle, marginBottom: '10px' }} />
            <input name="policy_number" placeholder="Policy number" required style={{ ...inputStyle, marginBottom: '10px' }} />
            <input name="claim_amount" type="number" step="0.01" placeholder="Claim amount" required style={{ ...inputStyle, marginBottom: '10px' }} />
            <textarea name="notes" placeholder="Notes (optional)" rows={2} style={{ ...inputStyle, marginBottom: '14px' }} />
            <button type="submit" style={{ ...primaryButton, width: '100%' }}>Submit Claim</button>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        {claims.length > 0 ? claims.map(c => (
          <div key={c.claim_id} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{c.insurance_provider} — ₹{Number(c.claim_amount).toFixed(2)}</p>
              <select value={c.status} onChange={(e) => handleStatusChange(c.claim_id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: `1px solid ${colors.border}`, fontSize: '12px', fontWeight: 700 }}>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <p style={{ margin: '4px 0', fontSize: '12px', color: colors.textSecondary }}>Policy #{c.policy_number} · Bill #{c.billing_id}</p>
            {c.notes && <p style={{ margin: '4px 0', fontSize: '12px', color: colors.textMuted }}>{c.notes}</p>}
          </div>
        )) : <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>No insurance claims submitted yet</p>}
      </div>
    </div>
  );
};

export default Insurance;
