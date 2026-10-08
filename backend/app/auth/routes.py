from fastapi import (
    APIRouter,
    HTTPException,
    Request,
    Response,
    status,
)

from app.auth.dependencies import (
    AuthServiceDependency,
    CurrentUserDependency,
)
from app.auth.schemas import CurrentUser, LoginRequest
from app.auth.constants import (
    SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS,
)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login", response_model=CurrentUser)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    auth_service: AuthServiceDependency,
) -> CurrentUser:
    user = auth_service.authenticate(
        username=data.username,
        password=data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль.",
        )

    previous_session = request.cookies.get(SESSION_COOKIE_NAME)
    auth_service.revoke_session(previous_session)

    session_id = auth_service.create_session(user.id)

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=SESSION_TTL_SECONDS,
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return user

@router.get("/me", response_model=CurrentUser)
async def get_me(
    current_user: CurrentUserDependency,
) -> CurrentUser:
    return current_user

@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def logout(
    request: Request,
    auth_service: AuthServiceDependency,
) -> Response:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    auth_service.revoke_session(session_id)

    response = Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return response