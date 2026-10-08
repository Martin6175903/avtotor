from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.auth.constants import SESSION_COOKIE_NAME
from app.auth.schemas import CurrentUser
from app.auth.service import AuthService

async def get_auth_service(request: Request) -> AuthService:
    return request.app.state.auth_service

AuthServiceDependency = Annotated[
    AuthService,
    Depends(get_auth_service),
]

async def get_current_user(
    request: Request,
    auth_service: AuthServiceDependency,
) -> CurrentUser:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    user = auth_service.get_user(session_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необходимо войти в систему.",
        )

    return user

CurrentUserDependency = Annotated[
    CurrentUser,
    Depends(get_current_user),
]