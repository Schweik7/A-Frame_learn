from typing import AsyncGenerator, Optional, Dict, Any
import uuid
from fastapi import Depends, Request
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from fastapi_users import BaseUserManager, UUIDIDMixin, FastAPIUsers, schemas
from loguru import logger


# from sqlalchemy.ext.declarative import DeclarativeMeta,declarative_base # 旧版本
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base,
    DeclarativeMeta,
)  # 2.0之后的版本
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)

logger.add("backend/backend_info.log", rotation="10 MB", level="INFO")
###########数据库配置############
DATABASE_URL = "sqlite+aiosqlite:///./backend/quez.sqlite"
Base: DeclarativeMeta = declarative_base()


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass
    # first_name: str
    # birthdate: Optional[datetime.date]


engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


######################后端定义##############
SECRET = "mengmengisverygood"
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=None)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

###############用户管理器##############


# 由于用户 ID 是完全通用的，因此当它来自 API 请求时（通常作为 URL 路径属性），我们需要一种可靠的方法对其进行解析。
# 这就是添加 UUIDIDMixin 的原因，其中实现了parse_id 方法
# 其他还有IntegerIDMixin ，用于整数 ID；ObjectIDIDMixin （由 fastapi_users_db_beanie 提供），用于 MongoDB ObjectID。
# 包含方法：validate_password
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = "mengmengisveryhappy"
    verification_token_secret = "mengmengisverybeatiful"

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.info(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        # 通常，您需要发送一封包含允许用户重置密码的链接（和令牌）的电子邮件。
        logger.info(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        # 通常您需要发送一封带有链接（和令牌）的电子邮件，以允许用户验证其电子邮件。
        logger.info(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )

    async def on_after_update(
        self, user: User, update_dict: Dict[str, Any], request: Optional[Request] = None
    ):
        logger.info(f"User {user.id} has been updated with {update_dict}")

    async def on_after_reset_password(
        self, user: User, request: Optional[Request] = None
    ):
        # 例如，您可能想向相关用户发送电子邮件，警告他密码已更改
        logger.info(f"User {user.id} has reset their password.")

    async def on_before_delete(self, user: User, request: Optional[Request] = None):
        # 例如，您可能想要验证用户资源完整性，以查看是否需要将任何相关用户资源标记为非活动状态，或者递归删除它们。
        logger.info(f"User {user.id} is going to be deleted")

    async def on_after_delete(self, user: User, request: Optional[Request] = None):
        # 例如，您可能想向管理员发送有关该事件的电子邮件。
        print(f"User {user.id} is successfully deleted")


# 将在运行时使用 FastAPI 依赖项注入。这样，您可以在数据库会话中运行它或在测试期间使用 mock。
async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


############## 用户Schema ##############
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)


# 可以添加一些其他字段，注意需要同步到User中
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass
    # first_name: str
    # birthdate: Optional[datetime.date]


class UserCreate(schemas.BaseUserCreate):
    pass
    # first_name: str
    # birthdate: Optional[datetime.date]


class UserUpdate(schemas.BaseUserUpdate):
    pass
    # first_name: str
    # birthdate: Optional[datetime.date]


################ 可用路由 ###############
# 身份验证路由：为给定身份验证后端提供 /login 和 /logout 路由。
# 注册路由器：提供 /register 路由以允许用户创建新帐户
# 重置密码路由：提供 /forgot-password 和 /reset-password 路由以允许用户重置其密码。
# 验证路由：提供 /request-verify-token 和 /verify 路由来管理用户电子邮件验证。
# 用户路由：提供管理用户的路由。
# OAuth 路由：提供针对服务提供商（例如 Google 或 Facebook）执行 OAuth 身份验证的路由。
