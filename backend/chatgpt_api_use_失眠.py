from openai import OpenAI, RateLimitError, BadRequestError
import json
import pandas as pd
from tqdm import tqdm
import traceback
import httpx
import dotenv
import os
dotenv.load_dotenv(".env", verbose=True)
# proxy_url = {
#     "http://": "http://127.0.0.1:10809",
#     "https://": "http://127.0.0.1:10809",
# }
proxy_url = None
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.chatanywhere.tech/v1",
    http_client=httpx.Client(proxies=proxy_url) if proxy_url else None,
)

system_instruction = {
    "role": "system",
    "content": """请作为失眠评估专家，分析以下文本中描述的失眠情况，评估失眠的症状和原因，使用json格式返回以下值:{'main_behavior':xxx,'main_reason':xxx,'other_behavior':xxx,'other_reason':xxx,'p.s.':xxx}}。
            要求：
            ①`main_behavior`为表示失眠症状的最可能的值，为[`纠结过往`(表示睡前对过去已发生的事受控制的总结，并有反刍、懊悔、自责等表现)、`担忧未来`(表示睡前对即将发生的事不受控制的反复梳理、预演，像过电影一样)、`入睡困难`、`易醒`(可表现为醒后不易入睡)、`噩梦/梦多`、`白天困倦`、`无法判断`(由于文本信息量太少)]这些值之一；
            ②其中`main_reason`为表示失眠原因的最可能的值，为[`环境不适`、`躯体疼痛/身体疾病`、`生物节律紊乱`、`药物影响`、`工作压力`、`学业压力`、`经济压力`、`创伤经历`、`社交孤立`、`婚姻家庭困扰`、`朋友关系困扰`、`恋爱关系困扰`、`同伴关系困扰`、`社会道德怀疑`、`鬼神恐惧`、`不良行为`、`心理疾病`、`无法判断`(由于文本信息量太少)]这些值之中的一个；
            ③在`other_reason`中写明其他次要的原因，或者一个你认为应该纳入的其他原因类型，可为空；`other_behavior`同理；
            ④`p.s.`中填写一些你认为应该备注说明的东西；
            ⑤不需要返回json以外的文字。""",
}


def get_json_response(user_input):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106",  # 1106模型才能生成json格式的response，单纯turbo不支持type设为json_object参数
        response_format={
            "type": "json_object"
        },  # 使用 JSON 模式时，请始终指示模型通过对话中的某些消息（例如通过系统消息）生成 JSON
        messages=[
            system_instruction,
            {
                "role": "user",
                "content": user_input,
            },
        ],
    )
    return json.loads(response.choices[0].message.content)


input_file = r"C:\Users\M\Desktop\副本失眠.xlsx"
df = pd.read_excel(input_file, sheet_name="Sheet1")
# 为了该项目长久发展，免费API Key限制150请求/24小时/IP&Key调用频率，
# 也就是说你如果在一个IP下使用多个Key，所有Key的每24小时请求数总和不能超过150；
# 同理，你如果将一个Key用于多个IP，这个Key的每24小时请求数也不能超过150
for index, question in tqdm(enumerate(df["问题描述"])):
    if not 125 < index < 429:
        continue
    question = question.strip()
    print(question)
    try:
        response = get_json_response(question)
        print(response)
        # 将response写入excel
        df.loc[index, "main_behavior"] = response["main_behavior"]
        df.loc[index, "main_reason"] = response["main_reason"]
        df.loc[index, "other_behavior"] = response["other_behavior"]
        df.loc[index, "other_reason"] = response["other_reason"]
        df.loc[index, "p.s."] = response["p.s."]
    except (RateLimitError, BadRequestError) as e:
        print("Rate Limit Error", e.message)
        break
    except AttributeError as e:
        print("Attribute Error", e.args)
        continue
    # except:
    #     traceback.print_exc()
    #     print("Error")
    # if index > 3:
    #     break

df.to_excel(input_file, sheet_name="Sheet1", index=False)
print("Done")
