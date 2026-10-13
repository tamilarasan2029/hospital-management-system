def test_create_and_get_patient(client):
    resp = client.post("/api/patients", json={
        "name": "John Doe", "email": "john@example.com", "phone": "555-1234",
        "date_of_birth": "1990-01-01", "gender": "Male", "blood_type": "O+",
    })
    assert resp.status_code == 201
    patient_id = resp.json()["data"]["patient_id"]

    resp = client.get(f"/api/patients/{patient_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "John Doe"


def test_duplicate_email_rejected(client):
    payload = {
        "name": "Jane Doe", "email": "jane@example.com", "phone": "555-5678",
        "date_of_birth": "1985-05-05", "gender": "Female",
    }
    resp1 = client.post("/api/patients", json=payload)
    assert resp1.status_code == 201
    resp2 = client.post("/api/patients", json=payload)
    assert resp2.status_code == 400


def test_get_nonexistent_patient_404(client):
    resp = client.get("/api/patients/99999")
    assert resp.status_code == 404


def test_update_patient(client):
    resp = client.post("/api/patients", json={
        "name": "Mark Lee", "email": "mark@example.com", "phone": "555-9999",
        "date_of_birth": "1992-02-02", "gender": "Male",
    })
    patient_id = resp.json()["data"]["patient_id"]

    resp = client.put(f"/api/patients/{patient_id}", json={"name": "Mark Lee Jr."})
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "Mark Lee Jr."


def test_delete_patient(client):
    resp = client.post("/api/patients", json={
        "name": "Temp Patient", "email": "temp@example.com", "phone": "555-0000",
        "date_of_birth": "2000-01-01", "gender": "Other",
    })
    patient_id = resp.json()["data"]["patient_id"]

    resp = client.delete(f"/api/patients/{patient_id}")
    assert resp.status_code == 200

    resp = client.get(f"/api/patients/{patient_id}")
    assert resp.status_code == 404
