from collections.abc import Callable
from secrets import compare_digest, token_urlsafe
from time import monotonic

from app.auth.constants import SESSION_TTL_SECONDS
from app.auth.schemas import CurrentUser
from app.auth.dataclasses import Session

_USERS: dict[str, CurrentUser] = {
    "user-1": CurrentUser(
        id="user-1",
        name="Тестовый сотрудник",
        role="user",
    ),
    "hr-1": CurrentUser(
        id="hr-1",
        name="Тестовый HR",
        role="hr",
    ),
    "admin-1": CurrentUser(
        id="admin-1",
        name="Тестовый администратор",
        role="admin",
    ),
}

_DEMO_CREDENTIALS: dict[str, tuple[str, str]] = {
    "employee": ("demo-user", "user-1"),
    "hr": ("demo-hr", "hr-1"),
    "admin": ("demo-admin", "admin-1"),
}

class AuthService:
    def __init__(
        self,
        clock: Callable[[], float] = monotonic,
    ) -> None:
        self._clock = clock
        self._sessions: dict[str, Session] = {}

    def authenticate(
        self,
        username: str,
        password: str,
    ) -> CurrentUser | None:
        credentials = _DEMO_CREDENTIALS.get(username)

        if credentials is None:
            return None

        expected_password, user_id = credentials

        if not compare_digest(
            password.encode("utf-8"),
            expected_password.encode("utf-8"),
        ):
            return None

        return _USERS[user_id]

    def create_session(self, user_id: str) -> str:
        now = self._clock()

        expired_tokens = [
            token
            for token, session in self._sessions.items()
            if session.expires_at <= now
        ]

        for token in expired_tokens:
            self._sessions.pop(token, None)

        token = token_urlsafe(32)

        self._sessions[token] = Session(
            user_id=user_id,
            expires_at=now + SESSION_TTL_SECONDS,
        )

        return token

    def get_user(
        self,
        session_id: str | None,
    ) -> CurrentUser | None:
        if session_id is None:
            return None

        session = self._sessions.get(session_id)

        if session is None:
            return None

        if session.expires_at <= self._clock():
            self.revoke_session(session_id)
            return None

        return _USERS.get(session.user_id)

    def revoke_session(self, session_id: str | None) -> None:
        if session_id is not None:
            self._sessions.pop(session_id, None)