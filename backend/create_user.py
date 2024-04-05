import contextlib

from app import get_async_session, get_user_db
from app import UserCreate
from app import get_user_manager
from app import logger
from fastapi_users.exceptions import UserAlreadyExists
import asyncio

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_user_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(email: str, password: str, is_superuser: bool = False):
    try:
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    user = await user_manager.create(
                        UserCreate(
                            email=email,
                            password=password,
                            is_superuser=is_superuser,
                        )
                    )
                    logger.info(f"User created {user}")
    except UserAlreadyExists:
        logger.error(f"User {email} already exists")


if __name__ == "__main__":
  asyncio.run(create_user("weibidewo0@gmail.com", "qweasd123",is_superuser=True))
