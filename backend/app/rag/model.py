from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

@dataclass(frozen=True)
class SourceContext:
    id: str
    title: str
    text: str

class ModelUnavailableError(Exception):
    pass

class AnswerModel(Protocol):
    def generate(
        self,
        question: str,
        sources: Sequence[SourceContext],
    ) -> str:
        ...

class DeterministicMockModel:
    def generate(
        self,
        question: str,
        sources: Sequence[SourceContext],
    ) -> str:
        return "\n\n".join(
            source.text
            for source in sources
        )
