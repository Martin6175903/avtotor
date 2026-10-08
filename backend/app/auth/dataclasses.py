from dataclasses import dataclass

@dataclass(frozen=True)
class Session:
    user_id: str
    expires_at: float