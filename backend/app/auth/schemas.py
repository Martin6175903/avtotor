from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

UserRole = Literal["user", "hr", "admin"]

class LoginRequest(BaseModel):
  model_config = ConfigDict(
    extra="forbid",
    strict=True,
  )

  username: str = Field(min_length=1)
  password: str = Field(min_length=1)

class CurrentUser(BaseModel):
  model_config = ConfigDict(frozen=True)

  id: str
  name: str
  role: UserRole
