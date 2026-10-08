from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.auth.constants import SESSION_COOKIE_NAME, SESSION_TTL_SECONDS
from app.auth.service import (
    AuthService,
)
from app.main import create_app


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client

@pytest.mark.parametrize(
    ("username", "password", "expected_role"),
    [
        ("employee", "demo-user", "user"),
        ("hr", "demo-hr", "hr"),
        ("admin", "demo-admin", "admin"),
    ],
)
def test_login_returns_server_role(
    client: TestClient,
    username: str,
    password: str,
    expected_role: str,
) -> None:
    response = client.post(
        "/auth/login",
        json={
            "username": username,
            "password": password,
        },
    )

    assert response.status_code == 200
    assert response.json()["role"] == expected_role
    assert "password" not in response.json()
    assert SESSION_COOKIE_NAME in client.cookies
    assert "httponly" in response.headers["set-cookie"].lower()
    assert response.headers["cache-control"] == "no-store"

    me = client.get("/auth/me")

    assert me.status_code == 200
    assert me.json() == response.json()


def test_me_requires_session(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401

def test_forged_session_is_rejected(client: TestClient) -> None:
    response = client.get(
        "/auth/me",
        headers={
            "Cookie": f"{SESSION_COOKIE_NAME}=forged-session",
        },
    )

    assert response.status_code == 401

def test_wrong_password_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={
            "username": "employee",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert SESSION_COOKIE_NAME not in client.cookies

def test_login_rejects_role_field(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={
            "username": "employee",
            "password": "demo-user",
            "role": "admin",
        },
    )

    assert response.status_code == 422
    assert SESSION_COOKIE_NAME not in client.cookies

def test_client_role_does_not_change_server_role(
    client: TestClient,
) -> None:
    client.post(
        "/auth/login",
        json={
            "username": "employee",
            "password": "demo-user",
        },
    )

    response = client.get(
        "/auth/me?role=admin",
        headers={"X-Role": "admin"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "user"

def test_logout_revokes_session(client: TestClient) -> None:
    client.post(
        "/auth/login",
        json={
            "username": "employee",
            "password": "demo-user",
        },
    )

    previous_token = client.cookies[SESSION_COOKIE_NAME]

    response = client.post("/auth/logout")

    assert response.status_code == 204
    assert response.content == b""
    assert SESSION_COOKIE_NAME not in client.cookies

    replay_response = client.get(
        "/auth/me",
        headers={
            "Cookie": f"{SESSION_COOKIE_NAME}={previous_token}",
        },
    )

    assert replay_response.status_code == 401

def test_expired_session_is_rejected() -> None:
    clock = [1000.0]

    service = AuthService(clock=lambda: clock[0])

    with TestClient(create_app(service)) as client:
        client.post(
            "/auth/login",
            json={
                "username": "employee",
                "password": "demo-user",
            },
        )

        clock[0] += SESSION_TTL_SECONDS + 1

        response = client.get("/auth/me")

        assert response.status_code == 401

def test_new_login_revokes_previous_session(
    client: TestClient,
) -> None:
    credentials = {
        "username": "employee",
        "password": "demo-user",
    }

    client.post("/auth/login", json=credentials)
    previous_token = client.cookies[SESSION_COOKIE_NAME]

    client.post("/auth/login", json=credentials)
    current_token = client.cookies[SESSION_COOKIE_NAME]

    assert current_token != previous_token

    response = client.get(
        "/auth/me",
        headers={
            "Cookie": f"{SESSION_COOKIE_NAME}={previous_token}",
        },
    )

    assert response.status_code == 401