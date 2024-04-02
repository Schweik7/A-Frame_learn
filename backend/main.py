import fastapi
from .init_db import engine,QUESTION_TYPES,Quez,Answer
from sqlmodel import SQLModel,Session,select
import json

app = fastapi.FastAPI()

SQLModel.metadata.create_all(engine)

@app.get("/quez/{id}")
def get_quez(id: int):
    with Session(engine) as session:
        que_statement=select(Quez).where(Quez.id == id)
        quez = session.exec(que_statement).one_or_none()
        answers_statement=select(Answer).where(Answer.quez_id == id)
        answers=session.exec(answers_statement).all()
        print(quez,answers)
    return {"quez": quez.dict(),"answers": [answer.dict() for answer in answers]}
    # return {"quez": quez.dict(),"answers": [answer.dict() for answer in answers]}

@app.post("/choice/{id}")
def upload_choice(id: int, choice: int):
    with Session(engine) as session:
        pass