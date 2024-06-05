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
db_name="高考爬虫数据库.db"
conn = sqlite3.connect(db_name)
c = conn.cursor()
def create_table():
    conn = sqlite3.connect(db_name)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS json_data
                 (timestamp TEXT, data TEXT)''')
    conn.commit()


def save_json_to_db(json_data,data_type=1):

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute("INSERT INTO json_data (timestamp, data,type) VALUES (?, ?,?)", (timestamp, json.dumps(json_data,ensure_ascii=False),data_type))
    conn.commit()

def update_existing_data():
    # 读取所有记录
    c.execute("SELECT rowid, data FROM json_data")
    rows = c.fetchall()
    for row in rows:
        rowid = row[0]
        data = row[1]
        # 解析 JSON 数据
        json_data = json.loads(data)
        # 重新序列化 JSON 数据，确保中文字符未转义
        # updated_data = json.dumps(json_data, ensure_ascii=False)
        updated_data = int("zydm" in json_data['msg'][0]) # 这是否一个专业的json
        # 更新数据库中的记录
        c.execute("UPDATE json_data SET type = ? WHERE rowid = ?", (updated_data, rowid))
    conn.commit()

def read_json_from_db():
    all_data=[]
    # 读取所有记录
    c.execute("SELECT rowid, data FROM json_data where type=1 and processed=0")
    rows = c.fetchall()
    for row in rows:
        rowid = row[0]
        json_data = json.loads(row[1])
        all_data.append({rowid:json_data})
        # print(json_data)
    return all_data

def get_all_zy():
    c.execute("SELECT * FROM 专业信息 limit 10")
    rows = c.fetchall()
    return rows
# update_existing_data()
# exit()
# dest_url="https://gaokao.chsi.com.cn/zyk/zybk/" # 专业库首页


crawl=False



if crawl:
    ksyx_url="https://gaokao.chsi.com.cn/zyk/zybk/ksyxPage?specId={}" # ksyx是开设院校
    ksyx_keyword_url="https://gaokao.chsi.com.cn/zyk/zybk/ksyx?"
    # create_table()
    data=read_json_from_db() # 获取所有的专业
    page = ChromiumPage(addr_driver_opts='127.0.0.1:9222')
    page.listen.start(ksyx_keyword_url)
    # page.listen.start(["gaokao.chsi.com.cn/zyk/zybk/specialityesByCategory","gaokao.chsi.com.cn/zyk/zybk/xkCategory/"])

    for 专业类 in tqdm(data): 
        rowid=list(专业类.keys())[0]
        rowdata=list(专业类.values())[0]['msg']
        for index, ksyx in enumerate(rowdata):
            page.get(ksyx_url.format(ksyx['specId']))
            packet:DataPacket = page.listen.wait()
            body=packet.response.body # 将会解析为一个Dict
            save_json_to_db(body,3) # 保存到数据库中
            if index==len(rowdata)-1: # 如果是专业中最后一个专业类
                c.execute("update json_data set processed=1 where rowid=?",(rowid,))
            sleep(3) # 等待1秒钟
conn.close()
