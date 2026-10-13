import React, { useState, useEffect } from 'react';
import { colors, cardStyle, primaryButton, secondaryButton, statusBadge } from '../theme';

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px',
  boxSizing: 'border-box', fontSize: '14px',
};
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: colors.textSecondary };

const CATEGORIES = [
  ['CONSULTATION', 'Doctor consultation fee'],
  ['WARD_BED', 'Ward / bed charges'],
  ['MEDICINE', 'Medicine'],
  ['LAB', 'Lab test'],
  ['RADIOLOGY', 'Radiology / imaging'],
  ['OT_PROCEDURE', 'Operation theatre / procedure'],
  ['OTHER', 'Other charges'],
];
const categoryLabel = (code) => (CATEGORIES.find(c => c[0] === code) || [null, code])[1];
const LOCKED = ['PAID', 'CANCELLED', 'REFUNDED'];

const daysBetween = (from, to) => {
  if (!from || !to) return 0;
  const hours = (new Date(to) - new Date(from)) / 3600000;
  return hours > 0 ? Math.max(1, Math.ceil(hours / 24)) : 0;
};

const newLine = () => ({
  key: `${Date.now()}-${Math.random()}`, service_id: '', category: 'CONSULTATION',
  description: '', quantity: 1, unit_price: '', service_date: '', end_date: '',
});

const lineAmount = (l) => {
  const price = Number(l.unit_price) || 0;
  if (l.category === 'WARD_BED') return daysBetween(l.service_date, l.end_date) * price;
  return (parseInt(l.quantity, 10) || 1) * price;
};

const Billing = ({ user, API_URL, authHeaders, patients }) => {
  const [bills, setBills] = useState([]);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [lines, setLines] = useState([newLine()]);
  const [toast, setToast] = useState(null);
  const [payingBillId, setPayingBillId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [openBillId, setOpenBillId] = useState(null);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    category: 'CONSULTATION', description: '', quantity: 1, unit_price: '', service_date: '', end_date: '',
  });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };
  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) });

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_URL}/billing`, { headers: authHeaders ? authHeaders() : {} });
      const result = await res.json();
      if (res.ok) setBills(result.data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`, { headers: authHeaders ? authHeaders() : {} });
      const result = await res.json();
      if (res.ok) setServices(result.data || []);
    } catch (err) {
      console.error('Error fetching service catalog:', err);
    }
  };

  const fetchItems = async (billId) => {
    try {
      const res = await fetch(`${API_URL}/billing/${billId}/items`, { headers: authHeaders ? authHeaders() : {} });
      const result = await res.json();
      if (res.ok) setItems(result.data || []);
    } catch (err) {
      console.error('Error fetching charges:', err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPaid = bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status === 'PENDING').reduce((sum, b) => sum + Number(b.amount), 0);
  const openBill = bills.find(b => b.billing_id === openBillId);
  const openBillLocked = openBill ? LOCKED.includes(openBill.status) : false;
  const newBillTotal = lines.reduce((sum, l) => sum + lineAmount(l), 0);

  const updateLine = (key, patch) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key) => setLines(prev => (prev.length > 1 ? prev.filter(l => l.key !== key) : prev));

  const pickService = (key, serviceId) => {
    const svc = services.find(s => String(s.service_id) === String(serviceId));
    if (!svc) {
      updateLine(key, { service_id: '' });
      return;
    }
    updateLine(key, { service_id: serviceId, description: svc.name, unit_price: svc.cost ?? '' });
  };

  const resetNewBill = () => {
    setPatientId('');
    setTitle('');
    setLines([newLine()]);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!patientId) { showToast('Choose a patient.', 'error'); return; }
    if (!title.trim()) { showToast('Enter a bill title.', 'error'); return; }
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.description.trim()) { showToast(`Charge ${i + 1}: enter a description.`, 'error'); return; }
      if (l.unit_price === '') { showToast(`Charge ${i + 1}: enter the price.`, 'error'); return; }
      if (l.category === 'WARD_BED' && (!l.service_date || !l.end_date)) {
        showToast(`Charge ${i + 1}: enter the admission and discharge date.`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/billing/with-items`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          patient_id: parseInt(patientId, 10),
          description: title.trim(),
          lines: lines.map(l => ({
            category: l.category,
            description: l.description.trim(),
            quantity: parseInt(l.quantity, 10) || 1,
            unit_price: String(l.unit_price),
            service_date: l.service_date || null,
            end_date: l.end_date || null,
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || 'Could not create the bill', 'error');
        return;
      }
      showToast(`Bill #${result.data.billing_id} created with ${lines.length} charge(s).`);
      resetNewBill();
      setShowForm(false);
      await fetchBills();
    } catch (err) {
      console.error('Error creating bill:', err);
      showToast('Could not reach the server', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (billingId) => {
    try {
      const res = await fetch(`${API_URL}/billing/${billingId}/pay`, {
        method: 'PUT', headers: jsonHeaders(), body: JSON.stringify({ payment_method: paymentMethod }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || 'Could not update bill', 'error');
        return;
      }
      showToast(`Bill marked as paid via ${paymentMethod}`);
      setPayingBillId(null);
      await fetchBills();
    } catch (err) {
      console.error('Error marking paid:', err);
      showToast('Could not reach the server', 'error');
    }
  };
  const handleDownloadPdf = async (billingId) => {
    try {
      const res = await fetch(`${API_URL}/billing/${billingId}/pdf`, { headers: authHeaders ? authHeaders() : {} });
      if (!res.ok) {
        showToast('Could not download the invoice', 'error');
        return;
      }
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${billingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showToast('Could not reach the server', 'error');
    }
  };

  const toggleCharges = async (billId) => {
    if (openBillId === billId) {
      setOpenBillId(null);
      setItems([]);
      return;
    }
    setOpenBillId(billId);
    setItems([]);
    await fetchItems(billId);
  };

  const handleAddItem = async () => {
    if (!itemForm.description.trim() || itemForm.unit_price === '') {
      showToast('Enter a description and a price for the charge.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/billing/${openBillId}/items`, {
        method: 'POST', headers: jsonHeaders(),
        body: JSON.stringify({
          category: itemForm.category,
          description: itemForm.description,
          quantity: parseInt(itemForm.quantity, 10) || 1,
          unit_price: String(itemForm.unit_price),
          service_date: itemForm.service_date || null,
          end_date: itemForm.end_date || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || 'Could not add the charge', 'error');
        return;
      }
      showToast('Charge added');
      setItemForm({ category: itemForm.category, description: '', quantity: 1, unit_price: '', service_date: '', end_date: '' });
      await fetchItems(openBillId);
      await fetchBills();
    } catch (err) {
      console.error('Error adding charge:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this charge from the bill?')) return;
    try {
      const res = await fetch(`${API_URL}/billing/items/${itemId}`, {
        method: 'DELETE', headers: authHeaders ? authHeaders() : {},
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || 'Could not remove the charge', 'error');
        return;
      }
      showToast('Charge removed');
      await fetchItems(openBillId);
      await fetchBills();
    } catch (err) {
      console.error('Error removing charge:', err);
      showToast('Could not reach the server', 'error');
    }
  };

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }}>💳 Billing</h1>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000, maxWidth: '380px',
          background: toast.type === 'error' ? colors.danger : colors.success,
          color: 'white', padding: '12px 18px', borderRadius: '8px', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          fontSize: '14px', fontWeight: 600,
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '25px' }}>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${colors.success}` }}>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '13px' }}>Total Collected</p>
          <h2 style={{ margin: '8px 0 0 0', color: colors.success }}>₹{totalPaid.toFixed(2)}</h2>
        </div>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${colors.warning}` }}>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '13px' }}>Pending</p>
          <h2 style={{ margin: '8px 0 0 0', color: colors.warning }}>₹{totalPending.toFixed(2)}</h2>
        </div>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${colors.primary}` }}>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '13px' }}>Total Bills</p>
          <h2 style={{ margin: '8px 0 0 0', color: colors.primary }}>{bills.length}</h2>
        </div>
      </div>

      <button onClick={() => setShowForm(!showForm)} style={{ ...primaryButton, marginBottom: '20px' }}>
        {showForm ? '✕ Cancel' : '➕ Create New Bill'}
      </button>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>New Bill</h3>
          <form onSubmit={handleCreateBill}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Patient</label>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required style={inputStyle}>
                  <option value="">Select patient</option>
                  {patients?.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bill title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Admission and treatment" required style={inputStyle} />
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px 0', color: colors.textPrimary }}>Charges in this bill</h4>

            {lines.map((l, idx) => (
              <div key={l.key} style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: colors.textPrimary }}>Charge {idx + 1}</strong>
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(l.key)}
                      style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 700 }}>
                      ✕ Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Service (optional)</label>
                    <select value={l.service_id} onChange={(e) => pickService(l.key, e.target.value)} style={inputStyle}>
                      <option value="">-- Choose a service --</option>
                      {services.map(s => <option key={s.service_id} value={s.service_id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Charge type</label>
                    <select value={l.category} onChange={(e) => updateLine(l.key, { category: e.target.value })} style={inputStyle}>
                      {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <input type="text" value={l.description} onChange={(e) => updateLine(l.key, { description: e.target.value })}
                      placeholder="e.g. Dr. Rajesh consultation" style={inputStyle} />
                  </div>
                  {l.category !== 'WARD_BED' && (
                    <div>
                      <label style={labelStyle}>Quantity</label>
                      <input type="number" min="1" value={l.quantity} onChange={(e) => updateLine(l.key, { quantity: e.target.value })} style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>{l.category === 'WARD_BED' ? 'Rate per day (₹)' : 'Unit price (₹)'}</label>
                    <input type="number" min="0" step="0.01" value={l.unit_price} onChange={(e) => updateLine(l.key, { unit_price: e.target.value })} style={inputStyle} />
                  </div>
                  {l.category === 'WARD_BED' && (
                    <>
                      <div>
                        <label style={labelStyle}>Admitted on</label>
                        <input type="datetime-local" value={l.service_date} onChange={(e) => updateLine(l.key, { service_date: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Discharged on</label>
                        <input type="datetime-local" value={l.end_date} onChange={(e) => updateLine(l.key, { end_date: e.target.value })} style={inputStyle} />
                      </div>
                    </>
                  )}
                </div>
                <p style={{ margin: '8px 0 0 0', textAlign: 'right', fontWeight: 700 }}>
                  {l.category === 'WARD_BED' && `${daysBetween(l.service_date, l.end_date)} day(s) × ₹${l.unit_price || 0} = `}
                  ₹{lineAmount(l).toFixed(2)}
                </p>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" onClick={() => setLines(prev => [...prev, newLine()])} title="Add another service"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: colors.primary, color: 'white', fontSize: '24px', fontWeight: 700, cursor: 'pointer', lineHeight: '40px', padding: 0 }}>
                  +
                </button>
                <span style={{ color: colors.textSecondary, fontSize: '14px' }}>Add another service</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: colors.textPrimary }}>Bill total: ₹{newBillTotal.toFixed(2)}</span>
            </div>

            <button type="submit" disabled={saving} style={{ ...primaryButton, width: '100%', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creating bill...' : '✓ Create Bill with these charges'}
            </button>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: colors.textPrimary }}>All Bills</h3>
        {bills.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={thStyle}>Bill No.</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Payment Method</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const canMarkPaid = !LOCKED.includes(bill.status);
                return (
                  <tr key={bill.billing_id} style={{ borderBottom: `1px solid ${colors.border}`, background: openBillId === bill.billing_id ? '#eff6ff' : 'transparent' }}>
                    <td style={tdStyle}>#{bill.billing_id}</td>
                    <td style={tdStyle}>{bill.patient_name}</td>
                    <td style={tdStyle}>{bill.description || '-'}</td>
                    <td style={tdStyle}>₹{Number(bill.amount).toFixed(2)}</td>
                    <td style={tdStyle}><span style={statusBadge(bill.status)}>{bill.status.replace('_', ' ')}</span></td>
                    <td style={tdStyle}>{bill.payment_method || '-'}</td>
                    <td style={tdStyle}>
                      {payingBillId === bill.billing_id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: '5px', borderRadius: '4px', border: `1px solid ${colors.border}`, fontSize: '12px' }}>
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="GPAY">GPay</option>
                            <option value="CARD">Card</option>
                            <option value="ONLINE">Online</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <button onClick={() => handleMarkPaid(bill.billing_id)} style={{ ...primaryButton, padding: '5px 10px', fontSize: '12px' }}>✓ Confirm</button>
                          <button onClick={() => setPayingBillId(null)} style={{ ...secondaryButton, padding: '5px 10px', fontSize: '12px' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => toggleCharges(bill.billing_id)} style={{ ...secondaryButton, padding: '6px 10px', fontSize: '12px' }}>
                            📋 {openBillId === bill.billing_id ? 'Hide' : 'Charges'}
                          </button>
                          {canMarkPaid && (
                            <button onClick={() => { setPayingBillId(bill.billing_id); setPaymentMethod('CASH'); }} style={{ ...secondaryButton, padding: '6px 10px', fontSize: '12px' }}>
                              ✓ Mark Paid
                            </button>
                          )}
                          <button onClick={() => handleDownloadPdf(bill.billing_id)} style={{ ...primaryButton, padding: '6px 10px', fontSize: '12px' }}>
                            ⬇ PDF
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>No bills yet</p>
        )}
      </div>

      {openBill && (
        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>
            Charges for {openBill.patient_name} · Bill #{openBill.billing_id}
          </h3>

          {items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Units</th>
                  <th style={thStyle}>Rate</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.item_id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={tdStyle}>{categoryLabel(it.category)}</td>
                    <td style={tdStyle}>
                      {it.description}
                      {it.service_date && (
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          {new Date(it.service_date).toLocaleString()}{it.end_date ? ` → ${new Date(it.end_date).toLocaleString()}` : ''}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{it.quantity}</td>
                    <td style={tdStyle}>₹{Number(it.unit_price).toFixed(2)}</td>
                    <td style={tdStyle}>₹{Number(it.amount).toFixed(2)}</td>
                    <td style={tdStyle}>
                      {!openBillLocked && (
                        <button onClick={() => handleDeleteItem(it.item_id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: colors.textMuted }}>No charge lines on this bill. Its total is the amount it was created with.</p>
          )}

          <p style={{ textAlign: 'right', fontSize: '18px', fontWeight: 700, color: colors.textPrimary }}>
            Total: ₹{Number(openBill.amount).toFixed(2)}
          </p>

          {openBillLocked ? (
            <p style={{ color: colors.textSecondary, fontSize: '13px' }}>This bill is {openBill.status.toLowerCase()} and can't be changed.</p>
          ) : (
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: colors.textPrimary }}>Add a charge</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input type="text" placeholder="Description" value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} style={inputStyle} />
                {itemForm.category !== 'WARD_BED' && (
                  <input type="number" min="1" placeholder="Qty" value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} style={inputStyle} />
                )}
                <input type="number" min="0" step="0.01" placeholder={itemForm.category === 'WARD_BED' ? 'Rate per day (₹)' : 'Unit price (₹)'}
                  value={itemForm.unit_price} onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })} style={inputStyle} />
                {itemForm.category === 'WARD_BED' && (
                  <>
                    <input type="datetime-local" value={itemForm.service_date}
                      onChange={(e) => setItemForm({ ...itemForm, service_date: e.target.value })} style={inputStyle} />
                    <input type="datetime-local" value={itemForm.end_date}
                      onChange={(e) => setItemForm({ ...itemForm, end_date: e.target.value })} style={inputStyle} />
                  </>
                )}
              </div>
              {itemForm.category === 'WARD_BED' && (
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 10px 0' }}>
                  Days stayed: <strong>{daysBetween(itemForm.service_date, itemForm.end_date)}</strong>
                </p>
              )}
              <button onClick={handleAddItem} style={primaryButton}>+ Add charge</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const thStyle = { textAlign: 'left', padding: '10px', color: colors.textSecondary, fontSize: '13px' };
const tdStyle = { padding: '10px', fontSize: '14px', color: colors.textPrimary };

export default Billing;
