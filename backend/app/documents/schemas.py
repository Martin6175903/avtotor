from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DocumentAccessRole = Literal["public", "hr", "admin"]

class Document(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
    )

    id: str = Field(
        min_length=1,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    title: str = Field(min_length=1)
    text: str = Field(min_length=1)
    access_role: DocumentAccessRole

class DocumentResponse(BaseModel):
    id: str
    title: str
    text: str
