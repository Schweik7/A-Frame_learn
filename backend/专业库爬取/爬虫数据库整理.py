from sqlmodel import SQLModel, Session, Field, create_engine,MetaData
from loguru import logger
from datetime import datetime
from sqlalchemy import VARCHAR, ForeignKey,TEXT
import sqlite3
import json
import os
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

engine = create_engine("sqlite:///高考爬虫数据库.db")
db_name="高考爬虫数据库.db"
conn = sqlite3.connect(db_name)
c = conn.cursor()

if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    c.execute("SELECT rowid, data FROM json_data where type=3")
    rows=c.fetchall()
    with Session(engine) as session:
        for row in rows:
            data=json.loads(row[1])
            专业
            for 专业 in data['msg']['schSpecList']:
                # logger.info(f"正在录入{专业}")
                专业_info=专业信息(专业名称=专业['zymc'],专业代码=专业['zydm'],专业后缀=专业['specId'])
                session.add(专业_info)
                session.commit()
        logger.info("完成专业录入")
        conn.close()
