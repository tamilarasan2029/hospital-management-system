def _make_patient(client, email="pat1@example.com"):
    resp = client.post("/api/patients", json={
        "name": "Test Patient", "email": email, "phone": "555-1111",
        "date_of_birth": "1990-01-01", "gender": "Male",
    })
    return resp.json()["data"]["patient_id"]


def _make_doctor(client, email="doc1@example.com"):
    resp = client.post("/api/doctors", json={
        "name": "Dr. Test", "email": email, "phone": "555-2222",
        "specialization": "Cardiology", "years_of_experience": 10, "consultation_fee": 100,
    })
    return resp.json()["data"]["doctor_id"]


def test_create_appointment(client):
    patient_id = _make_patient(client)
    doctor_id = _make_doctor(client)

    resp = client.post("/api/appointments", json={
        "patient_id": patient_id, "doctor_id": doctor_id,
        "appointment_date_time": "2026-01-01T10:00:00", "duration_in_minutes": 30,
    })
    assert resp.status_code == 201


def test_overlapping_appointment_rejected(client):
    patient_id = _make_patient(client)
    doctor_id = _make_doctor(client)

    resp1 = client.post("/api/appointments", json={
        "patient_id": patient_id, "doctor_id": doctor_id,
        "appointment_date_time": "2026-01-01T10:00:00", "duration_in_minutes": 30,
    })
    assert resp1.status_code == 201

    # Overlaps: starts 10:15, first appointment runs 10:00-10:30
    resp2 = client.post("/api/appointments", json={
        "patient_id": patient_id, "doctor_id": doctor_id,
        "appointment_date_time": "2026-01-01T10:15:00", "duration_in_minutes": 30,
    })
    assert resp2.status_code == 400


def test_non_overlapping_appointment_allowed(client):
    patient_id = _make_patient(client)
    doctor_id = _make_doctor(client)

    resp1 = client.post("/api/appointments", json={
        "patient_id": patient_id, "doctor_id": doctor_id,
        "appointment_date_time": "2026-01-01T10:00:00", "duration_in_minutes": 30,
    })
    assert resp1.status_code == 201

    # Starts exactly when first one ends - no overlap
    resp2 = client.post("/api/appointments", json={
        "patient_id": patient_id, "doctor_id": doctor_id,
        "appointment_date_time": "2026-01-01T10:30:00", "duration_in_minutes": 30,
    })
    assert resp2.status_code == 201
