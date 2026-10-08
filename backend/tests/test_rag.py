from collections.abc import Iterator, Sequence

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.dependencies import get_answer_model
from app.documents.schemas import Document
from app.documents.store import DEFAULT_DOCUMENTS_PATH
from app.main import create_app
from app.rag.model import (
    DeterministicMockModel,
    ModelUnavailableError,
    SourceContext,
)
from pydantic import TypeAdapter

ACCOUNTS = [
    (
        "employee",
        "demo-user",
        {"public-1", "public-2", "public-3"},
    ),
    (
        "hr",
        "demo-hr",
        {"public-1", "public-2", "public-3", "hr-1", "hr-2"},
    ),
    (
        "admin",
        "demo-admin",
        {"public-1", "public-2", "public-3", "admin-1"},
    ),
]

DOCUMENT_IDS = [
    "public-1",
    "public-2",
    "public-3",
    "hr-1",
    "hr-2",
    "admin-1",
]

ALL_TOPICS = (
    "Компания отпуск техподдержка "
    "подбор премирование резервирование"
)

class RecordingModel(DeterministicMockModel):
    def __init__(self) -> None:
        self.calls: list[
            tuple[str, tuple[SourceContext, ...]]
        ] = []

    def generate(
        self,
        question: str,
        sources: Sequence[SourceContext],
    ) -> str:
        self.calls.append((question, tuple(sources)))

        return super().generate(question, sources)

@pytest.fixture
def model() -> RecordingModel:
    return RecordingModel()


@pytest.fixture
def app(model: RecordingModel) -> FastAPI:
    application = create_app()

    application.dependency_overrides[get_answer_model] = (
        lambda: model
    )

    return application

@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def sign_in(
    client: TestClient,
    username: str = "employee",
    password: str = "demo-user",
) -> None:
    response = client.post(
        "/auth/login",
        json={
            "username": username,
            "password": password,
        },
    )

    assert response.status_code == 200

@pytest.mark.parametrize(
    ("username", "password", "allowed_ids"),
    ACCOUNTS,
)
def test_ask_passes_only_allowed_sources_to_model(
    client: TestClient,
    model: RecordingModel,
    username: str,
    password: str,
    allowed_ids: set[str],
) -> None:
    sign_in(client, username, password)

    response = client.post(
        "/ask",
        json={"question": ALL_TOPICS},
    )

    assert response.status_code == 200

    payload = response.json()

    assert {
        source["id"]
        for source in payload["sources"]
    } == allowed_ids

    assert len(model.calls) == 1

    question, model_sources = model.calls[0]

    assert question == ALL_TOPICS
    assert {
        source.id
        for source in model_sources
    } == allowed_ids

    documents = TypeAdapter(list[Document]).validate_json(
        DEFAULT_DOCUMENTS_PATH.read_text(encoding="utf-8")
    )

    for document in documents:
        if document.id not in allowed_ids:
            assert document.text not in payload["answer"]
            assert document.title not in response.text
            assert f"/documents/{document.id}" not in response.text

            for source in model_sources:
                assert document.text not in source.text


@pytest.mark.parametrize(
    ("username", "password", "allowed_ids"),
    ACCOUNTS,
)
@pytest.mark.parametrize("document_id", DOCUMENT_IDS)
def test_direct_document_access(
    client: TestClient,
    username: str,
    password: str,
    allowed_ids: set[str],
    document_id: str,
) -> None:
    sign_in(client, username, password)

    response = client.get(f"/documents/{document_id}")

    if document_id in allowed_ids:
        assert response.status_code == 200
        assert response.json()["id"] == document_id
        assert response.json()["text"]
    else:
        assert response.status_code == 404
        assert response.json() == {
            "detail": "Документ не найден или недоступен."
        }

def test_ask_requires_session(
    client: TestClient,
    model: RecordingModel,
) -> None:
    response = client.post(
        "/ask",
        json={"question": "Отпуск"},
    )

    assert response.status_code == 401
    assert model.calls == []

@pytest.mark.parametrize(
    "document_id",
    ["public-1", "hr-1", "admin-1"],
)
def test_document_requires_session(
    client: TestClient,
    document_id: str,
) -> None:
    response = client.get(f"/documents/{document_id}")

    assert response.status_code == 401

@pytest.mark.parametrize(
    ("username", "password", "question"),
    [
        ("employee", "demo-user", "Премирование"),
        ("hr", "demo-hr", "Резервирование"),
        ("admin", "demo-admin", "Премирование"),
    ],
)
def test_forbidden_only_match_returns_insufficient_data(
    client: TestClient,
    model: RecordingModel,
    username: str,
    password: str,
    question: str,
) -> None:
    sign_in(client, username, password)

    response = client.post(
        "/ask",
        json={"question": question},
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Недостаточно данных",
        "sources": [],
    }
    assert model.calls == []

def test_no_matches_does_not_call_model(
    client: TestClient,
    model: RecordingModel,
) -> None:
    sign_in(client)

    response = client.post(
        "/ask",
        json={"question": "Астрономия"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Недостаточно данных",
        "sources": [],
    }
    assert model.calls == []

@pytest.mark.parametrize(
    "body",
    [
        {"question": "Отпуск", "role": "admin"},
        {"question": "Отпуск", "user_id": "admin-1"},
        {"question": ""},
        {"question": "   "},
        {"question": "x" * 2001},
        {"question": 123},
    ],
)
def test_invalid_ask_request_is_rejected(
    client: TestClient,
    model: RecordingModel,
    body: dict[str, object],
) -> None:
    sign_in(client)

    response = client.post("/ask", json=body)

    assert response.status_code == 422
    assert model.calls == []

def test_role_in_headers_and_query_does_not_expand_access(
    client: TestClient,
    model: RecordingModel,
) -> None:
    sign_in(client)

    response = client.post(
        "/ask?role=admin",
        headers={"X-Role": "admin"},
        json={"question": "Резервирование"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Недостаточно данных",
        "sources": [],
    }
    assert model.calls == []

def test_answer_is_deterministic(client: TestClient) -> None:
    sign_in(client)

    first = client.post(
        "/ask",
        json={"question": "Отпуск"},
    )
    second = client.post(
        "/ask",
        json={"question": "Отпуск"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
    assert first.json()["sources"]

def test_unavailable_model_returns_safe_error(
    client: TestClient,
    app: FastAPI,
) -> None:
    class UnavailableModel:
        def generate(
            self,
            question: str,
            sources: Sequence[SourceContext],
        ) -> str:
            raise ModelUnavailableError(
                "Internal diagnostic information."
            )

    app.dependency_overrides[get_answer_model] = (
        lambda: UnavailableModel()
    )

    sign_in(client)

    response = client.post(
        "/ask",
        json={"question": "Отпуск"},
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Сервис ответов временно недоступен."
    }
    assert "Internal diagnostic" not in response.text