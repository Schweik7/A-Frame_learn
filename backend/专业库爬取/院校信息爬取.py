from DrissionPage import SessionPage,ChromiumPage
from DrissionPage._units.listener import DataPacket
import json
from pathlib import Path
import sqlite3
from datetime import datetime
import os
os.chdir(os.path.dirname(__file__))
from time import sleep
from tqdm import tqdm
from sqlmodel import SQLModel, Session, Field, create_engine,MetaData,select
class 院校信息(SQLModel, table=True):
    __tablename__ = "院校信息"
    id:int=Field(primary_key=True)
    院校名称 :str
    院校代码 :str=""
    办学层次: str=""
    院校特性: str=""
    主管部门:str=""
    所在地:str=""
def check_school_exists(session, school_name):
    statement = select(院校信息).where(院校信息.院校名称 == school_name)
    return session.exec(statement).first()
engine = create_engine("sqlite:///高考爬虫数据库.db")

school_template_url="https://gaokao.chsi.com.cn/sch/search--ss-on,option-qg,searchType-1,start-{}.dhtml"
max_page=144
page = ChromiumPage(addr_driver_opts='127.0.0.1:9222')
# page=SessionPage()
with Session(engine) as session:
    try:
        for i in range(max_page):
            page.get(school_template_url.format(i*20))
            eles=page.eles("css:div.info-box")
            print(f"正在爬取第{i+1}页,该页有{len(eles)}个院校")
            for ele in eles:
                school_name=ele.ele("css:div.sch-title").text
                infos=ele.children("css:a")

                school= check_school_exists(session=session, school_name=school_name)
                if not school:
                    school=院校信息(院校名称=school_name)
                    session.add(school)
                    session.commit()
                    session.refresh(school)
                # infos[0] '\ue6a4北京|主管部门：教育部'
                # infos[1] '本科|“双一流”建设高校'
                school.所在地=infos[0].text.split("|")[0][1:].strip() # 第一个字符是'\ue6a4'
                school.主管部门=infos[0].text.split("|")[1].replace("主管部门：","").strip()
                school.办学层次=infos[1].text.split("|")[0].strip()
                school.院校特性=infos[1].text.split("|")[1].strip() if "|" in infos[1].text else "" # 本科、高职等
                session.add(school)
                session.commit()
                # break
            # break
    except Exception as e:
        import traceback
        print(infos[0].text,infos[1].text)
        traceback.print_exc()
        # logger.warning(f"录入{data}出现问题")            


    