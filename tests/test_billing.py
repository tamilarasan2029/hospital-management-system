def _make_patient(client):
    resp = client.post("/api/patients", json={
        "name": "Bill Patient", "email": "billpat@example.com", "phone": "555-3333",
        "date_of_birth": "1990-01-01", "gender": "Male",
    })
    return resp.json()["data"]["patient_id"]


def test_create_bill_and_mark_paid(client):
    patient_id = _make_patient(client)

    resp = client.post("/api/billing", json={
        "patient_id": patient_id, "amount": "150.00", "description": "Consultation",
    })
    assert resp.status_code == 201
    bill_id = resp.json()["data"]["billing_id"]
    assert resp.json()["data"]["status"] == "PENDING"

    resp = client.put(f"/api/billing/{bill_id}/pay")
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "PAID"


def test_negative_amount_rejected(client):
    patient_id = _make_patient(client)
    resp = client.post("/api/billing", json={"patient_id": patient_id, "amount": "-10"})
    assert resp.status_code == 400


def test_double_pay_rejected(client):
    patient_id = _make_patient(client)
    resp = client.post("/api/billing", json={"patient_id": patient_id, "amount": "50"})
    bill_id = resp.json()["data"]["billing_id"]

    client.put(f"/api/billing/{bill_id}/pay")
    resp2 = client.put(f"/api/billing/{bill_id}/pay")
    assert resp2.status_code == 400


def test_bill_pdf_download(client):
    patient_id = _make_patient(client)
    resp = client.post("/api/billing", json={"patient_id": patient_id, "amount": "75"})
    bill_id = resp.json()["data"]["billing_id"]

    resp = client.get(f"/api/billing/{bill_id}/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
