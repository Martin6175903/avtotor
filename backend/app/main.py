from fastapi import FastAPI, Request, Response
from starlette.middleware.base import RequestResponseEndpoint

from app.auth.routes import router as auth_router
from app.auth.service import AuthService
from app.documents.routes import router as documents_router
from app.documents.store import (
    DEFAULT_DOCUMENTS_PATH,
    DocumentStore,
)
from app.rag.model import DeterministicMockModel
from app.rag.routes import router as rag_router

def create_app(
    auth_service: AuthService | None = None,
) -> FastAPI:
    app = FastAPI(
        title="Local RAG API",
        version="0.1.0",
    )

    app.state.auth_service = (
        auth_service if auth_service is not None else AuthService()
    )
    app.state.document_store = DocumentStore.from_file(
        DEFAULT_DOCUMENTS_PATH,
    )
    app.state.answer_model = DeterministicMockModel()

    @app.middleware("http")
    async def disable_caching(
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(documents_router)
    app.include_router(rag_router)

    return app


app = create_app()