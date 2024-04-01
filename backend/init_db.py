from pydantic import field_validator
from sqlmodel import SQLModel, Session, Field, create_engine
from loguru import logger


QUESTION_TYPES = [
    "学业成就型抑郁",
    "身心倦怠型抑郁",
    "同伴关系型抑郁",
    "家庭关系型抑郁",
    "网络创伤型抑郁",
    "身心暗示型抑郁"
]

class Quez(SQLModel, table=True):
    id: int =Field(primary_key=True)
    question: str
    question_type: str = Field()

    # 使用 validator 确保 question_type 的值在 QUESTION_TYPES 中
    @field_validator('question_type')
    def check_question_type(cls, v):
        if v not in QUESTION_TYPES:
            raise ValueError(f"question_type must be one of {QUESTION_TYPES}")
        return v

class Answer(SQLModel, table=True):
    id: int = Field(primary_key=True)
    answer: str
    score: int
    quez_id: int = Field(foreign_key="quez.id")

engine = create_engine("sqlite:///backend/quez.sqlite")

if __name__ == '__main__':
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        quez1 = Quez(question="彬彬以前的学习成绩一直很好，但自从课程难度加大后，不管彬彬怎样努力学习，总是达不到自己的预期的分数，成绩排名随之下滑。\n如果你遇到和彬彬一样的情况，在成绩长时间下滑时，你最可能有以下哪种想法？", question_type=QUESTION_TYPES[0])
        quez2 = Quez(question="田田的学习能力不错，但最近发现自己一学习就感到烦躁、无聊和疲惫，没有学习的动力。\n如果你遇到和田田一样的情况，在面对学习任务时，你最可能有以下哪种行为？", question_type=QUESTION_TYPES[1])
        session.add(quez1)
        session.add(quez2)
        session.commit()
        answer1=["一切困难都是可以解决的，我可以尝试改变学习方法或寻求他人帮助","我担心自己的成绩和未来，需要加倍努力","成绩有波动也是正常的，我已经尽了自己最大的努力","我不如以前那么优秀了，提高成绩对于我来说太难了，不知道怎么办","我以前的“优秀”都是假的，现在努力也是徒劳，未来变得黯淡无光"]
        score1=[0,1,1,2,3]
        for answer, score in zip(answer1, score1):
            session.add(Answer(answer=answer, quez_id=quez1.id, score=score))
        answer2=["寻找一些有趣的学习资料，认真完成学习任务","学习注意力不够集中，但尽力完成学习任务","拖延学习任务，得过且过，应付交差","逃避学习，常常请假或逃课","厌恶学习，休学或退学"]
        score2=[0,1,1,2,3]
        for answer, score in zip(answer2, score2):
            session.add(Answer(answer=answer, quez_id=quez2.id, score=score))
        session.commit()
    logger.info("Database initialized")
