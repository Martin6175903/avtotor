from pydantic import BaseModel, ConfigDict, Field, field_validator

class AskRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        strict=True,
    )

    question: str = Field(
        min_length=1,
        max_length=2000,
    )

    @field_validator("question", mode="before")
    @classmethod
    def trim_question(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()

        return value

class SourceResponse(BaseModel):
    id: str
    title: str
    url: str

class AskResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]
