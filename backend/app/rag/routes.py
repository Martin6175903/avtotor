from fastapi import APIRouter, HTTPException, status

from app.auth.dependencies import CurrentUserDependency
from app.dependencies import (
    AnswerModelDependency,
    DocumentStoreDependency,
)
from app.rag.model import ModelUnavailableError
from app.rag.schemas import AskRequest, AskResponse
from app.rag.service import RagService

router = APIRouter(tags=["rag"])

@router.post("/ask", response_model=AskResponse)
async def ask(
    data: AskRequest,
    current_user: CurrentUserDependency,
    document_store: DocumentStoreDependency,
    model: AnswerModelDependency,
) -> AskResponse:
    service = RagService(
        document_store=document_store,
        model=model,
    )

    try:
        return service.ask(
            question=data.question,
            user=current_user,
        )
    except ModelUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Сервис ответов временно недоступен.",
        ) from None