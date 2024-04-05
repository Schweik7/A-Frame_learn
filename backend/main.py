import fastapi
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from init_db import engine, QUESTION_TYPES, Quez, Answer
from sqlmodel import SQLModel, Session, select
from app import (
    auth_backend,
    UserRead,
    UserCreate,
    UserUpdate,
    fastapi_users,
    User,
    create_db_and_tables,
    logger,
)
import uvicorn

current_user = fastapi_users.current_user()
current_active_user = fastapi_users.current_user(active=True)
current_active_verified_user = fastapi_users.current_user(active=True, verified=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)

origins = [
    "http://localhost:5500",
]

app = fastapi.FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的域列表
    allow_credentials=True, # 支持cookies跨域
    allow_methods=["*"],    # 允许所有方法
    allow_headers=["*"],    # 允许所有头
)
app.include_router(
    fastapi_users.get_auth_router(
        auth_backend
    ),  # 可以添加requires_verification=True参数
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

SQLModel.metadata.create_all(engine)


@app.get("/quez/{id}")
def get_quez(id: int, user: User = Depends(current_user)):
    with Session(engine) as session:
        que_statement = select(Quez).where(Quez.id == id)
        quez = session.exec(que_statement).one_or_none()
        answers_statement = select(Answer).where(Answer.quez_id == id)
        answers = session.exec(answers_statement).all()
        print(quez, answers)
    return {"quez": quez.dict(), "answers": [answer.dict() for answer in answers]}
    # return {"quez": quez.dict(),"answers": [answer.dict() for answer in answers]}


@app.post("/choice/{id}")
def upload_choice(id: int, choice: int):
    with Session(engine) as session:
        pass


@app.on_event("startup")
async def on_startup():
    # Not needed if you setup a migration system like Alembic
    logger.info("Creating database tables")
    await create_db_and_tables()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", log_level="info", reload=True)
