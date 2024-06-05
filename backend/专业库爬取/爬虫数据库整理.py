from sqlmodel import SQLModel, Session, Field, create_engine,MetaData,select
from loguru import logger
from datetime import datetime
from sqlalchemy import VARCHAR, ForeignKey,TEXT
import sqlite3
import json
import os
from tqdm import tqdm
os.chdir(os.path.dirname(__file__))

class 专业信息(SQLModel, table=True):
    __tablename__ = "专业信息"
    id:int=Field(primary_key=True)
    专业名称:str 
    专业代码 :str 
    专业后缀: str 
    开设课程:str=""
    


class 院校信息(SQLModel, table=True):
    __tablename__ = "院校信息"
    id:int=Field(primary_key=True)
    院校名称 :str 
    院校代码 :str 



class 专业开设院校(SQLModel, table=True):
    __tablename__ = "专业开设院校"
    id:int=Field(primary_key=True)
    专业信息_id:int = Field(foreign_key="专业信息.id",index=True)
    院校信息_id:int = Field(foreign_key="院校信息.id",index=True)

# class 课程信息(SQLModel, table=True):
#     __tablename__ = "课程信息"
#     id:int=Field(primary_key=True)
#     课程名称:str 



def check_school_exists(session, school_name, school_code):
    statement = select(院校信息).where(院校信息.院校名称 == school_name, 院校信息.院校代码 == school_code)
    return session.exec(statement).first()

engine = create_engine("sqlite:///高考爬虫数据库.db")
db_name="高考爬虫数据库.db"
conn = sqlite3.connect(db_name)
c = conn.cursor()

if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    c.execute("SELECT rowid, data FROM json_data where type=3")
    rows=c.fetchall()
    with Session(engine) as session:
        for row in tqdm(rows):
            data=json.loads(row[1]) # 有些时候会没有数据——有些专业是没有院校开设的
            if not data:
                continue
            try:
                zy_name=data['msg']['zymc']
                statement=select(专业信息).where(专业信息.专业名称==zy_name)
                zy_id=session.exec(statement).first().id
                for school in data['msg']['schSpecList']:
                        # 检查是否存在学校信息
                    school_name = school['yxmc']
                    school_code = school['yxdm']                        
                    school_info = check_school_exists(session, school_name, school_code)
                    if not school_info:
                        school_info = 院校信息(院校名称=school_name, 院校代码=school_code)
                        session.add(school_info)
                        session.commit()
                        session.refresh(school_info)
                    zy_school=专业开设院校(专业信息_id=zy_id,院校信息_id=school_info.id)
                    session.add(zy_school)
                    session.commit()
            except Exception as e:
                import traceback
                traceback.print_exc()
                logger.warning(f"录入{data}出现问题")
        logger.info("完成信息录入")
        conn.close()
