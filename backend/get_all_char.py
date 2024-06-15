from init_db import engine, Quez, Answer
from sqlmodel import Session, select

# 定义所有 ASCII 字符
ASCII_CHARACTERS = (
    "0123456789"
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
)


def get_all_unique_char():
    unique_chars = set()
    session = Session(engine)

    # 获取所有的 Quez 和 Answer 数据
    quzes = session.exec(select(Quez)).all()
    answers = session.exec(select(Answer)).all()

    # 提取 Quez 表中的所有字符
    for quez in quzes:
        unique_chars.update(quez.question)
        # print(quez.question)
        # break
        unique_chars.update(quez.question_type)

    # 提取 Answer 表中的所有字符
    for answer in answers:
        unique_chars.update(answer.answer)
        # print(answer.answer)
        # break

    # 添加所有 ASCII 字符
    unique_chars.update(ASCII_CHARACTERS)

    return unique_chars


# 调用函数并打印结果
if __name__ == "__main__":
    unique_chars = get_all_unique_char()
    print(len(unique_chars))
    with open("unique_chars.txt", "w", encoding="utf-8") as f:
        for char in unique_chars:
            f.write(char)
