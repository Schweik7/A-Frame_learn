from DrissionPage import SessionPage,ChromiumPage
import json
from pathlib import Path
import sqlite3
from datetime import datetime
import os
os.chdir(os.path.dirname(__file__))
def create_table():
    conn = sqlite3.connect('高考爬虫数据库.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS json_data
                 (timestamp TEXT, data TEXT)''')
    conn.commit()
    conn.close()

def save_json_to_db(json_data):
    conn = sqlite3.connect('高考爬虫数据库.db')
    c = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute("INSERT INTO json_data (timestamp, data) VALUES (?, ?)", (timestamp, json.dumps(json_data)))
    conn.commit()
    conn.close()

def update_existing_data():
    conn = sqlite3.connect('高考爬虫数据库.db')
    c = conn.cursor()
    # 读取所有记录
    c.execute("SELECT rowid, data FROM json_data")
    rows = c.fetchall()
    for row in rows:
        rowid = row[0]
        data = row[1]
        # 解析 JSON 数据
        json_data = json.loads(data)
        # 重新序列化 JSON 数据，确保中文字符未转义
        updated_data = json.dumps(json_data, ensure_ascii=False)
        # 更新数据库中的记录
        c.execute("UPDATE json_data SET data = ? WHERE rowid = ?", (updated_data, rowid))

    conn.commit()
    conn.close()

dest_url="https://gaokao.chsi.com.cn/zyk/zybk/"
create_table()
page = ChromiumPage(addr_driver_opts='127.0.0.1:9222')
page.listen.start(["gaokao.chsi.com.cn/zyk/zybk/specialityesByCategory","gaokao.chsi.com.cn/zyk/zybk/xkCategory/"])
page.get(dest_url)
data=[]
for packet in page.listen.steps():
    print(packet.response.body)
    save_json_to_db(packet.response.body)
        