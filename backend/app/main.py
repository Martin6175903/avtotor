from fastapi import FastAPI, Request, Response
from starlette.middleware.base import RequestResponseEndpoint

from app.auth.routes import router as auth_router
from app.auth.service import AuthService

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

    return app


app = create_app()