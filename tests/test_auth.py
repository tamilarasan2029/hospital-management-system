def test_register_and_login(client):
    resp = client.post("/api/auth/register", json={
        "username": "alice", "email": "alice@example.com", "password": "secret123", "role": "ADMIN",
    })
    assert resp.status_code == 201
    assert resp.json()["data"]["role"] == "ADMIN"

    resp = client.post("/api/auth/login", json={"username": "alice", "password": "secret123"})
    assert resp.status_code == 200
    token = resp.json()["data"]["access_token"]
    assert token

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["data"]["username"] == "alice"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "bob", "email": "bob@example.com", "password": "correctpass", "role": "STAFF",
    })
    resp = client.post("/api/auth/login", json={"username": "bob", "password": "wrongpass"})
    assert resp.status_code == 401


def test_duplicate_username_rejected(client):
    payload = {"username": "carol", "email": "carol@example.com", "password": "pass123", "role": "PATIENT"}
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201
    resp2 = client.post("/api/auth/register", json={**payload, "email": "carol2@example.com"})
    assert resp2.status_code == 401


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
