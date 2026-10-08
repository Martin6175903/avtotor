from fastapi import APIRouter, HTTPException, status

from app.auth.dependencies import CurrentUserDependency
from app.dependencies import DocumentStoreDependency
from app.documents.schemas import DocumentResponse

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
async def get_document(
    document_id: str,
    current_user: CurrentUserDependency,
    document_store: DocumentStoreDependency,
) -> DocumentResponse:
    document = document_store.get_available(
        document_id,
        current_user,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден или недоступен.",
        )

    return DocumentResponse(
        id=document.id,
        title=document.title,
        text=document.text,
    )