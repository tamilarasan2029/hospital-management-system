import React, { useState, useEffect } from 'react';

const Billing = ({ user, API_URL }) => {
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedBills = localStorage.getItem('qwenHospitalBills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    } else {
      const defaultBills = [
        { billId: 'BILL-001', date: '2026-04-10', doctor: 'Dr. Rajesh Kumar', service: 'Cardiology Consultation', amount: 500, status: 'Paid' },
        { billId: 'BILL-002', date: '2026-03-15', doctor: 'Dr. Priya Sharma', service: 'Neurology Checkup', amount: 450, status: 'Paid' },
        { billId: 'BILL-003', date: '2026-04-05', doctor: 'Dr. Amit Patel', service: 'Orthopedics Treatment', amount: 1200, status: 'Pending' }
      ];
      setBills(defaultBills);
      localStorage.setItem('qwenHospitalBills', JSON.stringify(defaultBills));
    }
  }, []);

  const updateBills = (newBills) => {
    setBills(newBills);
    localStorage.setItem('qwenHospitalBills', JSON.stringify(newBills));
  };

  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);

  const handleAddBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const newBill = {
      billId: `BILL-${String(bills.length + 1).padStart(3, '0')}`,
      date: formData.get('date'),
      doctor: formData.get('doctor'),
      service: formData.get('service'),
      amount: parseInt(formData.get('amount')),
      status: 'Pending'
    };
    updateBills([...bills, newBill]);
    alert('✅ Bill added successfully!');
    e.target.reset();
    setShowForm(false);
    setLoading(false);
  };

  const handleChangeStatus = (billId, newStatus) => {
    const updatedBills = bills.map(bill =>
      bill.billId === billId ? { ...bill, status: newStatus } : bill
    );
    updateBills(updatedBills);
    alert(`✅ Bill ${billId} marked as ${newStatus}!`);
  };

  // ✅ PDF DOWNLOAD - Color page
  const handleDownloadBill = (bill) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Invoice - ${bill.billId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #f0f4f8; padding: 30px; }

          .page { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

          /* HEADER */
          .header { background: linear-gradient(135deg, #1a73e8, #0d47a1); color: white; padding: 35px 40px; text-align: center; }
          .header .logo { font-size: 50px; margin-bottom: 10px; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 5px; letter-spacing: 1px; }
          .header p { font-size: 13px; opacity: 0.85; }

          /* BADGE */
          .badge-row { display: flex; justify-content: space-between; align-items: center; background: #e8f0fe; padding: 15px 40px; border-bottom: 2px solid #c5d5f9; }
          .badge-row .bill-id { font-size: 16px; font-weight: 700; color: #1a73e8; }
          .badge-row .status-badge { padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; }
          .badge-paid { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .badge-pending { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }

          /* BODY */
          .body { padding: 30px 40px; }

          .section { margin-bottom: 25px; }
          .section-title { font-size: 13px; font-weight: 700; color: #1a73e8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e8f0fe; }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .info-item label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }
          .info-item span { font-size: 14px; color: #2c3e50; font-weight: 600; }

          /* AMOUNT BOX */
          .amount-box { background: linear-gradient(135deg, #1a73e8, #0d47a1); color: white; padding: 20px 30px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
          .amount-box .label { font-size: 14px; opacity: 0.9; }
          .amount-box .value { font-size: 30px; font-weight: 700; }

          /* STAMP */
          .stamp-area { text-align: right; margin-bottom: 20px; }
          .stamp { display: inline-block; border: 3px solid; padding: 8px 20px; border-radius: 6px; font-size: 18px; font-weight: 700; transform: rotate(-8deg); }
          .stamp-paid { border-color: #27ae60; color: #27ae60; }
          .stamp-pending { border-color: #f39c12; color: #f39c12; }

          /* TERMS */
          .terms { background: #f8f9fa; padding: 15px 20px; border-radius: 8px; font-size: 12px; color: #666; line-height: 1.6; margin-bottom: 25px; }

          /* FOOTER */
          .footer { background: #2c3e50; color: white; padding: 20px 40px; text-align: center; }
          .footer p { font-size: 12px; opacity: 0.85; margin-bottom: 4px; }
          .footer .copy { font-size: 11px; opacity: 0.6; margin-top: 8px; }

          @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">

          <!-- HEADER -->
          <div class="header">
            <div class="logo">🏥</div>
            <h1>QWEN HOSPITAL</h1>
            <p>Quality Healthcare Services | Est. 2024</p>
          </div>

          <!-- BILL ID + STATUS BADGE -->
          <div class="badge-row">
            <span class="bill-id">📄 ${bill.billId}</span>
            <span class="status-badge ${bill.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">
              ${bill.status === 'Paid' ? '✓ PAID' : '⏳ PENDING'}
            </span>
          </div>

          <!-- BODY -->
          <div class="body">

            <!-- INVOICE DETAILS -->
            <div class="section">
              <div class="section-title">📋 Invoice Details</div>
              <div class="info-grid">
                <div class="info-item">
                  <label>Invoice ID</label>
                  <span>${bill.billId}</span>
                </div>
                <div class="info-item">
                  <label>Date</label>
                  <span>${bill.date}</span>
                </div>
                <div class="info-item">
                  <label>Doctor</label>
                  <span>${bill.doctor}</span>
                </div>
                <div class="info-item">
                  <label>Service</label>
                  <span>${bill.service}</span>
                </div>
              </div>
            </div>

            <!-- AMOUNT -->
            <div class="amount-box">
              <span class="label">💰 Total Amount</span>
              <span class="value">₹ ${bill.amount.toLocaleString()}</span>
            </div>

            <!-- STAMP -->
            <div class="stamp-area">
              <div class="stamp ${bill.status === 'Paid' ? 'stamp-paid' : 'stamp-pending'}">
                ${bill.status === 'Paid' ? '✓ PAID' : '⏳ PENDING'}
              </div>
            </div>

            <!-- TERMS -->
            <div class="terms">
              <strong>Terms & Conditions:</strong><br/>
              This invoice is valid for 30 days from the date of issue. Please retain this document for your records.
              For payment queries, contact our billing department. Thank you for trusting Qwen Hospital for your healthcare needs.
            </div>

          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p>📍 Qwen Hospital, Medical District, Tamil Nadu, India</p>
            <p>📞 +91-1234567890 &nbsp;|&nbsp; ✉️ billing@qwenhospital.com</p>
            <p class="copy">© 2026 Qwen Hospital. All Rights Reserved.</p>
          </div>

        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div>
      <h1 style={{ color: '#2c3e50' }}>💳 Billing & Invoices</h1>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #2ecc71' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>Total Paid</p>
          <h3 style={{ margin: '10px 0 0 0', color: '#2ecc71', fontSize: '24px' }}>₹{totalPaid.toLocaleString()}</h3>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>Total Pending</p>
          <h3 style={{ margin: '10px 0 0 0', color: '#e74c3c', fontSize: '24px' }}>₹{totalPending.toLocaleString()}</h3>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #3498db' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>Total Bills</p>
          <h3 style={{ margin: '10px 0 0 0', color: '#3498db', fontSize: '24px' }}>{bills.length}</h3>
        </div>
      </div>

      {/* ADD NEW BILL BUTTON */}
      {user?.role === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 25px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            {showForm ? '✕ Cancel' : '+ Add New Bill'}
          </button>
        </div>
      )}

      {/* ADD NEW BILL FORM */}
      {showForm && user?.role === 'admin' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Create New Bill</h3>
          <form onSubmit={handleAddBill}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Date</label>
                <input type="date" name="date" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Doctor Name</label>
                <input type="text" name="doctor" placeholder="Dr. Name" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Service</label>
                <input type="text" name="service" placeholder="e.g., Consultation, Surgery" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Amount (₹)</label>
                <input type="number" name="amount" placeholder="500" required min="1" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: '15px', padding: '10px 25px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Adding...' : 'Add Bill'}
            </button>
          </form>
        </div>
      )}

      {/* BILLS TABLE */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>All Invoices ({bills.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Bill ID</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Doctor</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Service</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '15px', color: '#7f8c8d', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '600' }}>{bill.billId}</td>
                  <td style={{ padding: '15px', color: '#555' }}>{bill.date}</td>
                  <td style={{ padding: '15px', color: '#555' }}>{bill.doctor}</td>
                  <td style={{ padding: '15px', color: '#555' }}>{bill.service}</td>
                  <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '600' }}>₹{bill.amount.toLocaleString()}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      background: bill.status === 'Paid' ? '#d5f4e6' : '#ffe5e5',
                      color: bill.status === 'Paid' ? '#27ae60' : '#c0392b'
                    }}>
                      {bill.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {user?.role === 'admin' && bill.status === 'Pending' && (
                        <button onClick={() => handleChangeStatus(bill.billId, 'Paid')} style={{ padding: '6px 12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          ✓ Paid
                        </button>
                      )}
                      {/* ✅ PDF DOWNLOAD BUTTON */}
                      <button onClick={() => handleDownloadBill(bill)} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        📥 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT SECTION */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Online Payment</h3>
        {totalPending > 0 ? (
          <div>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Outstanding Balance: <strong style={{ color: '#e74c3c', fontSize: '20px' }}>₹{totalPending.toLocaleString()}</strong>
            </p>
            <button style={{ padding: '12px 30px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
              💳 Pay Now
            </button>
          </div>
        ) : (
          <p style={{ color: '#27ae60', fontSize: '16px' }}>✅ All bills are paid. Thank you!</p>
        )}
      </div>
    </div>
  );
};

export default Billing;