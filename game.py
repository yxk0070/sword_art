import random
import time

class Node:
    def __init__(self, phase, is_strong, is_attack, target_part, value_modifier=1.0):
        self.phase = phase
        self.is_strong = is_strong
        self.is_attack = is_attack
        self.target_part = target_part
        self.value_modifier = value_modifier

    def __str__(self):
        type_str = "攻击" if self.is_attack else "防御"
        str_str = "强势" if self.is_strong else "弱点"
        return f"[{self.phase}|{self.target_part}|{type_str}|{str_str}]"
        
    def to_dict(self):
        return {
            "phase": self.phase,
            "is_strong": self.is_strong,
            "is_attack": self.is_attack,
            "target_part": self.target_part,
            "value_modifier": self.value_modifier
        }

class Move:
    def __init__(self, name, duration, nodes, description=""):
        self.name = name
        self.duration = duration
        self.nodes = nodes
        self.description = description
        
    def to_dict(self):
        return {
            "name": self.name,
            "duration": self.duration,
            "description": self.description,
            "nodes": {k: v.to_dict() for k, v in self.nodes.items()}
        }

class Character:
    def __init__(self, name, hp, inner_amount, inner_mastery, agility, weapon_atk, armor_def):
        self.name = name
        self.max_hp = hp
        self.hp = hp
        self.inner_amount = inner_amount
        self.inner_mastery = inner_mastery
        self.agility = agility
        self.weapon_atk = weapon_atk
        self.armor_def = armor_def
        self.move_proficiencies = {}
        
    @property
    def inner_power_strength(self):
        return self.inner_amount * self.inner_mastery
        
    def get_attack_val(self, move_name):
        prof = self.move_proficiencies.get(move_name, 1.0)
        return self.inner_power_strength * prof + self.weapon_atk
        
    def get_defense_val(self):
        return self.inner_power_strength + self.armor_def

    def is_alive(self):
        return self.hp > 0
        
    def to_dict(self):
        return {
            "name": self.name,
            "hp": self.hp,
            "max_hp": self.max_hp,
            "agility": self.agility,
            "inner_amount": self.inner_amount
        }

class BattleEngine:
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.turn = 1
        self.logs = []
        
    def log(self, msg):
        self.logs.append(msg)
        print(msg)
        
    def resolve_interval(self, interval, p1_action, p2_action):
        first, second = self.p1, self.p2
        act_first, act_second = p1_action, p2_action
        
        if self.p2.agility > self.p1.agility:
            first, second = self.p2, self.p1
            act_first, act_second = p2_action, p1_action
        elif self.p1.agility == self.p2.agility:
            if random.choice([True, False]):
                first, second = self.p2, self.p1
                act_first, act_second = p2_action, p1_action

        self.execute_node(first, second, act_first, act_second)
        if second.is_alive():
            self.execute_node(second, first, act_second, act_first)

    def execute_node(self, attacker, defender, atk_action, def_action):
        if not atk_action:
            return
            
        move, node, combo_bonus = atk_action
        self.log(f"[{attacker.name}] 施展 {move.name} {node}")
        
        agility_diff = attacker.agility - defender.agility
        if agility_diff < -20 and random.random() < 0.3:
            self.log(f"  -> {defender.name} 凭借绝顶轻功，完美闪避了攻击！")
            return
            
        if node.is_attack:
            atk_val = attacker.get_attack_val(move.name) * node.value_modifier * combo_bonus
            def_val = defender.get_defense_val()
            target_strong = True
            is_weakness_break = False
            
            if def_action:
                def_move, def_node, _ = def_action
                def_val = defender.get_defense_val() * def_node.value_modifier
                target_strong = def_node.is_strong
                
                if not def_node.is_attack and def_node.target_part == node.target_part:
                    def_val *= 1.5
                    self.log(f"  -> {defender.name} 的防守节点成功护住了 {node.target_part}！")
            
            damage = max(1, int(atk_val - def_val))
            
            if not target_strong:
                damage = int(damage * 1.5 + 20)
                is_weakness_break = True
                self.log(f"  -> 击中弱势节点！【弱点击破】触发！")
            elif target_strong and def_action:
                damage = int(damage * 0.7)
                self.log(f"  -> 击中强势节点，伤害被化解部分。")
                
            defender.hp -= damage
            self.log(f"  -> 造成了 {damage} 点伤害！ (剩余HP: {defender.hp}/{defender.max_hp})")
            
            if is_weakness_break:
                self.log(f"  -> 额外效果：{defender.name} 气血翻涌，内力运转受阻！")
        else:
            self.log(f"  -> {attacker.name} 严阵以待，防护 {node.target_part}。")

    def play_turn(self, p1_moves, p2_moves):
        self.logs = []
        self.log(f"=== 第 {self.turn} 回合 ===")
        
        p1_timeline = [None] * 12
        p2_timeline = [None] * 12
        
        # New: Track HP at each tick
        hp_history = []
        
        def build_timeline(moves, timeline):
            idx = 0
            prev_phase = None
            for m in moves:
                combo_bonus = 1.0
                for i in range(m.duration):
                    if idx + i < 12:
                        node = m.nodes.get(i)
                        if node:
                            if node.phase == '起' and prev_phase == '承':
                                combo_bonus = 1.5
                                self.log(f"【Combo触发!】 起承转合连绵不绝，招式威力提升！")
                            timeline[idx + i] = (m, node, combo_bonus)
                            prev_phase = node.phase
                idx += m.duration
                if idx >= 12:
                    break
                    
        build_timeline(p1_moves, p1_timeline)
        build_timeline(p2_moves, p2_timeline)
        
        for i in range(12):
            p1_act = p1_timeline[i]
            p2_act = p2_timeline[i]
            if p1_act or p2_act:
                self.log(f"\n[第 {i+1} 息]")
                self.resolve_interval(i, p1_act, p2_act)
            
            # Record HP state after this tick
            hp_history.append({
                'tick': i,
                'p1_hp': self.p1.hp,
                'p2_hp': self.p2.hp
            })
            
            if not self.p1.is_alive() or not self.p2.is_alive():
                break
                    
        self.turn += 1
        return self.logs, hp_history

def generate_sample_data():
    taizu_nodes_1 = {
        0: Node('起', True, True, '胸', 1.0),
        1: Node('承', False, False, '臂', 0.8),
        2: Node('结', True, True, '头', 1.5)
    }
    taizu_1 = Move("太祖长拳-冲步双掌", 3, taizu_nodes_1, "太祖长拳基础招式，起手攻胸，承转时双臂回防略显破绽，最终双掌齐出直击面门，威力刚猛。")
    
    taizu_nodes_2 = {
        0: Node('起', True, False, '胸', 1.2),
        1: Node('承', True, True, '腿', 1.0),
        2: Node('结', False, True, '胸', 1.3)
    }
    taizu_2 = Move("太祖长拳-十字踢腿", 3, taizu_nodes_2, "守中带攻的招式。起手严密防护胸前，顺势飞踢下盘，落地时再补一击，但容易被看穿意图。")
    
    luohan_nodes_1 = {
        0: Node('起', True, False, '头', 1.0),
        1: Node('承', True, True, '胸', 1.1),
        2: Node('转', False, False, '腿', 0.5),
        3: Node('结', True, True, '头', 1.8)
    }
    luohan_1 = Move("罗汉拳-黑虎掏心", 4, luohan_nodes_1, "少林罗汉拳经典杀招。护头起手，黑虎掏心直击胸口，转身时下盘不稳露出破绽，最终发力刚猛无比。")
    
    mianzhang_nodes_1 = {
        0: Node('起', True, False, '胸', 1.2),
        1: Node('承', True, False, '臂', 1.2),
        2: Node('转', False, True, '腕', 1.0),
        3: Node('收', True, False, '胸', 1.5),
        4: Node('结', True, True, '胸', 2.0)
    }
    mianzhang_1 = Move("武当绵掌-白鹤亮翅", 5, mianzhang_nodes_1, "武当绝学，连绵不绝。起承两息皆为严密防护，转瞬化柔为刚点腕，收势蓄力，最终爆发出惊人威力。")
    
    return [taizu_1, taizu_2, luohan_1, mianzhang_1]

# For CLI testing
if __name__ == "__main__":
    moves_lib = generate_sample_data()
    player = Character("玩家(少侠)", hp=500, inner_amount=10, inner_mastery=5, agility=50, weapon_atk=10, armor_def=5)
    enemy = Character("山贼头目", hp=600, inner_amount=8, inner_mastery=4, agility=30, weapon_atk=15, armor_def=10)
    engine = BattleEngine(player, enemy)
    
    while player.is_alive() and enemy.is_alive():
        print(f"\n======================================")
        print(f"{player.name} HP: {player.hp}/{player.max_hp}")
        print(f"{enemy.name} HP: {enemy.hp}/{enemy.max_hp}")
        print(f"======================================")
        print("请排列本回合的招式 (每个回合有12个时间间隔):")
        for i, m in enumerate(moves_lib):
            print(f"{i+1}. {m.name} (间隔: {m.duration})")
        choice = input("> ")
        player_moves = []
        total_duration = 0
        try:
            if choice.strip():
                idxs = [int(x)-1 for x in choice.split()]
                for idx in idxs:
                    if 0 <= idx < len(moves_lib):
                        m = moves_lib[idx]
                        if total_duration + m.duration <= 12:
                            player_moves.append(m)
                            total_duration += m.duration
        except:
            pass
            
        enemy_moves = []
        e_dur = 0
        while e_dur < 12:
            m = random.choice(moves_lib)
            if e_dur + m.duration <= 12:
                enemy_moves.append(m)
                e_dur += m.duration
            else:
                break
                
        engine.play_turn(player_moves, enemy_moves)
        time.sleep(1)

    if player.is_alive():
        print("\n=== 战斗胜利！ ===")
    else:
        print("\n=== 胜败乃兵家常事，大侠请重新来过！ ===")
