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
    c.execute("SELECT * FROM 专业信息")
    rows = c.fetchall()
    return rows

# dest_url="https://gaokao.chsi.com.cn/zyk/zybk/" # 专业库首页
crawl=True
if crawl:
    ksyx_url="https://gaokao.chsi.com.cn/zyk/zybk/ksyxPage?specId={}" # ksyx是开设院校
    ksyx_keyword_url="https://gaokao.chsi.com.cn/zyk/zybk/ksyx?"
    kskc_keyword_url="https://gaokao.chsi.com.cn/zyk/zybk/kskc/" # kskc是开设课程
    kskc_url="https://gaokao.chsi.com.cn/zyk/zybk/kskcPage/{}"
    # create_table()
    # data=read_json_from_db() # 获取所有的专业
    data=get_all_zy() # 获取所有的专业,(1, '哲学', '010101', '73381059', '')组成的list
    page = ChromiumPage(addr_driver_opts='127.0.0.1:9222')
    page.listen.start(kskc_keyword_url)
    # page.listen.start(["gaokao.chsi.com.cn/zyk/zybk/specialityesByCategory","gaokao.chsi.com.cn/zyk/zybk/xkCategory/"])

    for zy in tqdm(data): 
        page.get(kskc_url.format(zy[3]))
        packet:DataPacket = page.listen.wait()
        body=packet.response.body # 将会解析为一个Dict
        # print(body)
        # exit()
        try:
            kskc_list=[ item['kcmc'] for item in body['msg']['kskcList']]
            c.execute("update 专业信息 set 开设课程=? where id=?",(json.dumps(kskc_list,ensure_ascii=False),zy[0]))
            conn.commit()
            # exit()
        except Exception as e:
            import traceback
            traceback.print_exc()
            print("error:",zy)
            continue
        sleep(3) # 等待1秒钟
conn.close()
