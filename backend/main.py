import fastapi
from fastapi import Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from init_db import engine, QUESTION_TYPES, Quez, Answer, UserAnswers
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
import datetime
import uvicorn

current_user = fastapi_users.current_user()
current_active_user = fastapi_users.current_user(active=True)
current_active_verified_user = fastapi_users.current_user(active=True, verified=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)

origins = ["http://localhost:5500", "*"]

app = fastapi.FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的域列表
    allow_credentials=True,  # 支持cookies跨域
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
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
    if quez is None:
        return {"error": "quez not found"}
    return {"quez": quez.dict(), "answers": [answer.dict() for answer in answers]}


@app.put("/choice/{quez_id}")
def upload_choice(
    quez_id: int,
    answer_id: int = Form(...),
    score: int = Form(...),
    user: User = Depends(current_user),
):
    logger.info(
        f"User {user.id} chose answer {answer_id} for quez {quez_id},user id:{user.id}"
    )
    with Session(engine) as session:
        # 查询数据库看是否已存在这样的记录
        statement = select(UserAnswers).where(
            UserAnswers.user_id == str(user.id),  # 这里的user.id是UUID
            UserAnswers.quez_id == quez_id,
        )
        existing_record = session.exec(statement).first()

        if existing_record:
            # 如果记录存在，则更新记录
            existing_record.answer_id = answer_id
            existing_record.score = score
            existing_record.created_at = datetime.datetime.now()
            session.commit()
            return {"success": "Choice updated"}
        else:
            # 如果记录不存在，创建新的记录
            new_user_answer = UserAnswers(
                user_id=str(user.id), quez_id=quez_id, answer_id=answer_id, score=score
            )
            session.add(new_user_answer)
            session.commit()
            return {"success": "Choice added"}


# @app.on_event("startup")
# async def on_startup():
#     # Not needed if you setup a migration system like Alembic
#     logger.info("Creating database tables")
#     await create_db_and_tables()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", log_level="info", reload=True, port=8000)
