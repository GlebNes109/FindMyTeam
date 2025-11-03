import pytest


@pytest.mark.asyncio
async def test_signup_returns_tokens_and_cookie(client):
    payload = {
        "login": "John",
        "password": "Rfhytub1!)",
        "email": "john@example.com",
        "tg_nickname": "johnny"
    }
    resp = await client.post("/users/signup", json=payload)
    assert resp.status_code == 200

    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 20
    assert "refresh_token" in resp.cookies



@pytest.mark.asyncio
async def test_signin_returns_tokens_and_cookie(client):
    payload = {"login": "John", "password": "Rfhytub1!)"}
    resp = await client.post("/users/signin", json=payload)
    assert resp.status_code == 200

    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "refresh_token" in resp.cookies

