from collections import Counter
from pathlib import Path

from pydantic import TypeAdapter

from app.auth.schemas import CurrentUser
from app.documents.schemas import Document

DEFAULT_DOCUMENTS_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "documents.json"
)

class DocumentStore:
    def __init__(self, documents: list[Document]) -> None:
        document_ids = [document.id for document in documents]

        if len(document_ids) != len(set(document_ids)):
            raise ValueError("Document IDs must be unique.")

        self._documents = tuple(documents)

    @classmethod
    def from_file(cls, path: Path) -> "DocumentStore":
        documents = TypeAdapter(list[Document]).validate_json(
            path.read_text(encoding="utf-8"),
        )

        counts = Counter(
            document.access_role
            for document in documents
        )

        if counts != {"public": 3, "hr": 2, "admin": 1}:
            raise ValueError(
                "Expected 3 public, 2 HR and 1 admin document."
            )

        return cls(documents)

    def available_to(
        self,
        user: CurrentUser,
    ) -> tuple[Document, ...]:
        return tuple(
            document
            for document in self._documents
            if document.access_role == "public"
            or document.access_role == user.role
        )

    def get_available(
        self,
        document_id: str,
        user: CurrentUser,
    ) -> Document | None:
        return next(
            (
                document
                for document in self.available_to(user)
                if document.id == document_id
            ),
            None,
        )
