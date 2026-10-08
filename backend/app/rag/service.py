from app.auth.schemas import CurrentUser
from app.documents.store import DocumentStore
from app.rag.model import AnswerModel, SourceContext
from app.rag.schemas import AskResponse, SourceResponse
from app.rag.utils import tokenize

class RagService:
    def __init__(
        self,
        document_store: DocumentStore,
        model: AnswerModel,
    ) -> None:
        self._document_store = document_store
        self._model = model

    def ask(
        self,
        question: str,
        user: CurrentUser,
    ) -> AskResponse:
        allowed_documents = self._document_store.available_to(user)
        question_words = tokenize(question)

        ranked_documents = []

        for document in allowed_documents:
            document_words = tokenize(
                f"{document.title} {document.text}"
            )

            score = len(question_words & document_words)

            if score > 0:
                ranked_documents.append((score, document))

        ranked_documents.sort(
            key=lambda item: (-item[0], item[1].id)
        )

        if not ranked_documents:
            return AskResponse(
                answer="Недостаточно данных",
                sources=[],
            )

        contexts = tuple(
            SourceContext(
                id=document.id,
                title=document.title,
                text=document.text,
            )
            for _, document in ranked_documents
        )

        answer = self._model.generate(
            question=question,
            sources=contexts,
        )

        return AskResponse(
            answer=answer,
            sources=[
                SourceResponse(
                    id=source.id,
                    title=source.title,
                    url=f"/documents/{source.id}",
                )
                for source in contexts
            ],
        )
