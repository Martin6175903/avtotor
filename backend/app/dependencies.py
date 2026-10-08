from typing import Annotated

from fastapi import Depends, Request

from app.documents.store import DocumentStore
from app.rag.model import AnswerModel

async def get_document_store(
    request: Request,
) -> DocumentStore:
    return request.app.state.document_store

async def get_answer_model(
    request: Request,
) -> AnswerModel:
    return request.app.state.answer_model

DocumentStoreDependency = Annotated[
    DocumentStore,
    Depends(get_document_store),
]

AnswerModelDependency = Annotated[
    AnswerModel,
    Depends(get_answer_model),
]