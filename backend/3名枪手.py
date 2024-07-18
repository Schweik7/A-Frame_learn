import  pandas as pd
import random
# 定义命中率
hit_rates = [0.8, 0.6, 0.4]

# 定义模拟次数
num_simulations = 100000

# 定义存活次数统计
survival_counts = [0, 0, 0, 0]  # 分别记录A、B、C存活次数和无人存活次数
round_counts = []  # 记录每次模拟的回合数

# 模拟函数
def simulate_shootout():
    # 初始每个人都存活
    alive = [True, True, True]
    rounds = 0
    
    while sum(alive) > 1:
        rounds += 1
        # 存储每个回合的命中结果
        hit_results = [False, False, False]
        
        for i in range(3):
            if alive[i]:
                # 选择对自己威胁最大的对手
                threats = [(j, hit_rates[j]) for j in range(3) if j != i and alive[j]]
                if threats:
                    target = max(threats, key=lambda x: x[1])[0]
                    # 根据命中率决定是否命中
                    if random.random() < hit_rates[i]:
                        hit_results[target] = True
        
        # 更新存活状态
        for i in range(3):
            if hit_results[i]:
                alive[i] = False
                        
    round_counts.append(rounds)
    return alive

# 进行模拟
for _ in range(num_simulations):
    result = simulate_shootout()
    if sum(result) == 0:
        survival_counts[3] += 1  # 无人存活
    else:
        for i in range(3):
            if result[i]:
                survival_counts[i] += 1

# 计算概率
survival_probabilities = [count / num_simulations for count in survival_counts]

# 计算回合数分布
round_distribution = pd.Series(round_counts).value_counts(normalize=True).sort_index()
print(survival_probabilities)
print(round_distribution)
