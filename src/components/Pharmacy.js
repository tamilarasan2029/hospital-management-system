import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px',
};

// Pharmacy & inventory module - stock levels, low-stock alerts, and
// dispensing with server-side drug-interaction checking.
const Pharmacy = ({ patients, API_URL, authHeaders }) => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDispenseFor, setShowDispenseFor] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const fetchMedications = async () => {
    try {
      const response = await fetch(`${API_URL}/pharmacy/medications`, { headers: authHeaders ? authHeaders() : {} });
      const result = await response.json();
      if (response.ok) setMedications(result.data || []);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  useEffect(() => { fetchMedications(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddMedication = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      category: formData.get('category'),
      unit: formData.get('unit'),
      stock_quantity: parseInt(formData.get('stock_quantity'), 10) || 0,
      reorder_level: parseInt(formData.get('reorder_level'), 10) || 10,
      price: formData.get('price'),
      interacts_with: formData.get('interacts_with') || null,
    };
    try {
      const response = await fetch(`${API_URL}/pharmacy/medications`, {
        method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not add medication', 'error');
        return;
      }
      showToast('Medication added to inventory');
      e.target.reset();
      setShowAddForm(false);
      await fetchMedications();
    } catch (err) {
      console.error('Error adding medication:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const handleDispense = async (e, medicationId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      patient_id: parseInt(formData.get('patient_id'), 10),
      medication_id: medicationId,
      quantity: parseInt(formData.get('quantity'), 10),
    };
    try {
      const response = await fetch(`${API_URL}/pharmacy/dispense`, {
        method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.message || 'Could not dispense', 'error');
        return;
      }
      if (result.data.interaction_warning) {
        showToast(`⚠️ Dispensed, but: ${result.data.interaction_warning}`, 'error');
      } else {
        showToast(`Dispensed ${result.data.quantity}x ${result.data.medication_name}. Stock remaining: ${result.data.remaining_stock}`);
      }
      setShowDispenseFor(null);
      await fetchMedications();
    } catch (err) {
      console.error('Error dispensing:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ color: colors.textPrimary, margin: 0 }}>💊 Pharmacy & Inventory</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={secondaryButton}>
          {showAddForm ? '✕ Cancel' : '➕ Add Medication'}
        </button>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000, maxWidth: '380px',
          background: toast.type === 'error' ? colors.dangerBg : colors.success,
          color: toast.type === 'error' ? colors.danger : 'white',
          padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
        }}>
          {toast.text}
        </div>
      )}

      {showAddForm && (
        <div style={{ ...cardStyle, marginBottom: '20px', maxWidth: '520px' }}>
          <form onSubmit={handleAddMedication}>
            <input name="name" placeholder="Medication name" required style={{ ...inputStyle, marginBottom: '10px' }} />
            <input name="category" placeholder="Category (e.g. Antibiotic)" style={{ ...inputStyle, marginBottom: '10px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input name="unit" placeholder="Unit (tablet, ml...)" style={inputStyle} />
              <input name="price" type="number" step="0.01" placeholder="Price" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input name="stock_quantity" type="number" placeholder="Starting stock" style={inputStyle} />
              <input name="reorder_level" type="number" placeholder="Reorder level" style={inputStyle} />
            </div>
            <input name="interacts_with" placeholder="Interacts with (comma-separated med names, optional)" style={{ ...inputStyle, marginBottom: '14px' }} />
            <button type="submit" style={{ ...primaryButton, width: '100%' }}>Add to Inventory</button>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        {medications.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medications.map(m => {
                const isLow = m.stock_quantity <= m.reorder_level;
                return (
                  <React.Fragment key={m.medication_id}>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '10px' }}>{m.name}</td>
                      <td style={{ padding: '10px', fontSize: '13px', color: colors.textSecondary }}>{m.category || '-'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                          background: isLow ? colors.dangerBg : colors.successBg,
                          color: isLow ? colors.danger : colors.success,
                        }}>
                          {m.stock_quantity} {isLow && '⚠️ Low'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>₹{Number(m.price).toFixed(2)}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => setShowDispenseFor(showDispenseFor === m.medication_id ? null : m.medication_id)} style={{ ...secondaryButton, padding: '6px 10px', fontSize: '12px' }}>
                          💊 Dispense
                        </button>
                      </td>
                    </tr>
                    {showDispenseFor === m.medication_id && (
                      <tr>
                        <td colSpan={5} style={{ padding: '12px', background: colors.bgPage }}>
                          <form onSubmit={(e) => handleDispense(e, m.medication_id)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select name="patient_id" required style={{ ...inputStyle, width: 'auto', flex: 1 }}>
                              <option value="">Select patient</option>
                              {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                            </select>
                            <input name="quantity" type="number" min="1" placeholder="Qty" required style={{ ...inputStyle, width: '100px' }} />
                            <button type="submit" style={{ ...primaryButton, padding: '9px 16px', fontSize: '13px' }}>Confirm</button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: colors.textMuted, textAlign: 'center', padding: '30px' }}>No medications in inventory yet</p>
        )}
      </div>
    </div>
  );
};

export default Pharmacy;
