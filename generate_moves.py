import re

sets_data = {
    "太祖长拳": ("入门", [
        ("太祖长拳-冲步双掌", 3, '{0: new Node("起", true, true, "胸", 1.0), 1: new Node("承", false, false, "臂", 0.8), 2: new Node("结", true, true, "头", 1.5)}', "太祖长拳基础招式。"),
        ("太祖长拳-十字踢腿", 3, '{0: new Node("起", true, false, "胸", 1.2), 1: new Node("承", true, true, "腿", 1.0), 2: new Node("结", false, true, "胸", 1.3)}', "守中带攻的招式。"),
        ("太祖长拳-双抄封天", 3, '{0: new Node("起", true, false, "胸", 1.5), 1: new Node("承", true, false, "头", 1.2), 2: new Node("结", true, true, "臂", 1.0)}', "防守招式。")
    ]),
    "黑风刀法": ("入门", [
        ("黑风刀法-力劈华山", 3, '{0: new Node("起", true, true, "胸", 1.2), 1: new Node("承", true, true, "头", 1.5), 2: new Node("结", false, true, "臂", 1.8)}', "黑风寨狠辣刀法，起手攻胸，顺势劈头。"),
        ("黑风刀法-横扫千军", 3, '{0: new Node("起", false, true, "腿", 1.0), 1: new Node("承", true, true, "胸", 1.2), 2: new Node("结", true, true, "头", 1.6)}', "大范围横扫，威力惊人。"),
        ("黑风刀法-黑风夜泣", 2, '{0: new Node("起", false, false, "臂", 1.5), 1: new Node("结", false, true, "头", 2.0)}', "阴险的奇招，专攻破绽。")
    ]),
    "飞刀绝技": ("进阶", [
        ("飞刀绝技-流星赶月", 2, '{0: new Node("起", false, true, "头", 1.0), 1: new Node("结", false, true, "胸", 1.5, "pierce")}', "暗器绝技，速度极快，附带【破甲】。"),
        ("飞刀绝技-小李飞刀", 2, '{0: new Node("起", true, false, "胸", 1.2), 1: new Node("结", true, true, "头", 2.5, "pierce")}', "例无虚发，致命一击，附带【破甲】。"),
        ("飞刀绝技-满天星雨", 3, '{0: new Node("起", false, true, "臂", 0.8), 1: new Node("承", false, true, "腿", 0.8), 2: new Node("结", false, true, "胸", 1.2)}', "飞刀如雨，防不胜防。")
    ]),
    "罗汉拳": ("进阶", [
        ("罗汉拳-黑虎掏心", 4, '{0: new Node("起", true, false, "头", 1.0), 1: new Node("承", true, true, "胸", 1.1), 2: new Node("转", false, false, "腿", 0.5), 3: new Node("结", true, true, "头", 1.8)}', "少林罗汉拳经典杀招。"),
        ("罗汉拳-罗汉撞钟", 3, '{0: new Node("起", true, true, "胸", 1.5), 1: new Node("承", true, false, "臂", 1.5), 2: new Node("结", true, true, "胸", 2.0)}', "刚猛撞击。"),
        ("罗汉拳-金刚捣碓", 3, '{0: new Node("起", true, false, "头", 1.5), 1: new Node("承", false, true, "头", 1.2), 2: new Node("结", true, true, "腿", 2.2)}', "势大力沉的攻击。")
    ]),
    "大金刚拳": ("绝学", [
        ("大金刚拳-金刚怒目", 3, '{0: new Node("起", true, false, "胸", 2.0), 1: new Node("承", true, true, "胸", 2.0), 2: new Node("结", true, true, "头", 2.5, "counter")}', "少林绝学，结印附带【反震】。"),
        ("大金刚拳-降魔印", 3, '{0: new Node("起", true, true, "头", 2.2), 1: new Node("承", true, false, "臂", 2.0, "counter"), 2: new Node("结", true, true, "胸", 2.8)}', "大开大合的镇派之宝。"),
        ("大金刚拳-须弥山掌", 4, '{0: new Node("起", true, false, "胸", 1.5), 1: new Node("承", true, false, "头", 1.5), 2: new Node("转", true, false, "腿", 1.5), 3: new Node("结", true, true, "胸", 3.5)}', "积蓄力量，爆发出山崩地裂的一击。")
    ]),
    "武当绵掌": ("进阶", [
        ("武当绵掌-白鹤亮翅", 5, '{0: new Node("起", true, false, "胸", 1.2), 1: new Node("承", true, false, "臂", 1.2), 2: new Node("转", false, true, "腕", 1.0), 3: new Node("收", true, false, "胸", 1.5), 4: new Node("结", true, true, "胸", 2.0)}', "武当绝学，连绵不绝。"),
        ("武当绵掌-野马分鬃", 3, '{0: new Node("起", true, false, "臂", 1.5), 1: new Node("承", false, true, "胸", 1.5), 2: new Node("结", true, false, "头", 2.0)}', "以柔克刚的防守反击。"),
        ("武当绵掌-如封似闭", 3, '{0: new Node("起", true, false, "胸", 1.8), 1: new Node("承", true, false, "头", 1.8), 2: new Node("结", true, false, "腿", 1.8)}', "密不透风的纯防守招式。")
    ]),
    "太极拳": ("绝学", [
        ("太极拳-揽雀尾", 5, '{0: new Node("起", true, false, "胸", 2.0, "counter"), 1: new Node("承", true, false, "臂", 2.0, "counter"), 2: new Node("转", true, false, "腕", 2.0, "counter"), 3: new Node("收", true, false, "腿", 2.0, "counter"), 4: new Node("结", true, true, "胸", 2.0)}', "前四息防守均附带【反震】效果。"),
        ("太极拳-单鞭", 3, '{0: new Node("起", true, false, "臂", 2.0, "counter"), 1: new Node("承", true, true, "胸", 1.5), 2: new Node("结", true, true, "头", 2.5)}', "太极杀招，柔中带刚。"),
        ("太极拳-云手", 4, '{0: new Node("起", true, false, "胸", 2.0), 1: new Node("承", true, false, "头", 2.0), 2: new Node("转", true, true, "腕", 1.5), 3: new Node("结", true, false, "胸", 2.5, "counter")}', "圆转如意，攻守兼备。")
    ]),
    "降龙十八掌": ("绝学", [
        ("降龙十八掌-亢龙有悔", 4, '{0: new Node("起", true, false, "胸", 1.5), 1: new Node("承", true, true, "臂", 1.2), 2: new Node("转", true, true, "胸", 1.5), 3: new Node("结", true, true, "胸", 2.5, "pierce")}', "丐帮绝学，刚猛天下第一。结印一击附带【破甲】效果。"),
        ("降龙十八掌-飞龙在天", 3, '{0: new Node("起", true, true, "头", 2.0), 1: new Node("承", false, true, "胸", 1.5), 2: new Node("结", true, true, "头", 3.0)}', "自上而下，气势磅礴。"),
        ("降龙十八掌-神龙摆尾", 3, '{0: new Node("起", false, false, "背", 1.0), 1: new Node("承", true, true, "腿", 2.0), 2: new Node("结", true, true, "胸", 2.5)}', "出其不意的反击杀招。")
    ]),
    "九阴白骨爪": ("绝学", [
        ("九阴白骨爪-九阴神抓", 4, '{0: new Node("起", true, true, "头", 1.2), 1: new Node("承", false, true, "腕", 1.5, "lifesteal"), 2: new Node("转", false, false, "胸", 0.5), 3: new Node("结", true, true, "头", 1.8, "lifesteal")}', "承与结节点附带【吸血】效果。"),
        ("九阴白骨爪-摧心爪", 3, '{0: new Node("起", true, true, "胸", 1.5), 1: new Node("承", false, true, "心", 2.0, "pierce"), 2: new Node("结", true, true, "心", 2.5, "lifesteal")}', "极其狠辣，直取要害。"),
        ("九阴白骨爪-白骨如山", 5, '{0: new Node("起", false, true, "臂", 1.0, "lifesteal"), 1: new Node("承", false, true, "腿", 1.0, "lifesteal"), 2: new Node("转", false, true, "胸", 1.0, "lifesteal"), 3: new Node("收", false, true, "头", 1.0, "lifesteal"), 4: new Node("结", true, true, "头", 2.0, "lifesteal")}', "连绵不绝的抓击，每一击都能吸血。")
    ]),
    "七伤拳": ("绝学", [
        ("七伤拳-一练七伤", 4, '{0: new Node("起", false, true, "胸", 2.0), 1: new Node("承", false, true, "臂", 2.0), 2: new Node("转", false, true, "头", 2.0), 3: new Node("结", false, true, "胸", 3.0)}', "威力奇大但全是弱点节点，伤敌一千自损八百。"),
        ("七伤拳-摧肝肠", 3, '{0: new Node("起", false, true, "腹", 2.5), 1: new Node("承", false, true, "胸", 2.5), 2: new Node("结", false, true, "头", 3.5)}', "极端的爆发力，放弃一切防御。"),
        ("七伤拳-损心诀", 2, '{0: new Node("起", false, true, "心", 3.0), 1: new Node("结", false, true, "心", 4.0, "pierce")}', "破釜沉舟的致命一击。")
    ]),
    "狂风快剑": ("进阶", [
        ("狂风快剑-风卷残云", 4, '{0: new Node("起", true, true, "臂", 1.2), 1: new Node("承", false, true, "腕", 1.2), 2: new Node("转", true, true, "腿", 1.2), 3: new Node("结", false, true, "头", 1.5)}', "剑法如狂风骤雨，连绵不绝。"),
        ("狂风快剑-狂风过境", 3, '{0: new Node("起", false, true, "胸", 1.5), 1: new Node("承", false, true, "胸", 1.5), 2: new Node("结", false, true, "胸", 2.0)}', "速度极快的三连刺。"),
        ("狂风快剑-剑刃风暴", 5, '{0: new Node("起", false, true, "臂", 1.0), 1: new Node("承", false, true, "腿", 1.0), 2: new Node("转", false, true, "胸", 1.0), 3: new Node("收", false, true, "头", 1.0), 4: new Node("结", true, true, "胸", 2.0)}', "剑影重重，让人无法防备。")
    ]),
    "铁掌功": ("绝学", [
        ("铁掌功-水上狂飙", 4, '{0: new Node("起", true, false, "胸", 1.5), 1: new Node("承", true, true, "胸", 1.5), 2: new Node("转", true, true, "头", 1.5), 3: new Node("结", true, true, "胸", 2.0)}', "铁掌帮绝学，掌力刚猛无俦。"),
        ("铁掌功-铁沙掌", 3, '{0: new Node("起", true, true, "胸", 2.0), 1: new Node("承", true, false, "臂", 1.5), 2: new Node("结", true, true, "头", 2.5)}', "掌力沉重，中之必伤。"),
        ("铁掌功-排山倒海", 3, '{0: new Node("起", true, false, "胸", 2.0), 1: new Node("承", true, false, "胸", 2.0), 2: new Node("结", true, true, "胸", 3.0, "pierce")}', "掌势如浪，破甲无情。")
    ]),
    "血刀大法": ("绝学", [
        ("血刀大法-血海深仇", 3, '{0: new Node("起", false, true, "头", 1.5), 1: new Node("承", false, true, "胸", 1.5, "lifesteal"), 2: new Node("结", false, true, "头", 2.0, "lifesteal")}', "魔教邪功，刀法凶残，附带【吸血】。"),
        ("血刀大法-刀头舔血", 3, '{0: new Node("起", true, false, "臂", 1.5), 1: new Node("承", false, true, "腹", 2.0, "lifesteal"), 2: new Node("结", true, true, "胸", 2.5, "lifesteal")}', "阴险狠毒的招式。"),
        ("血刀大法-血战到底", 4, '{0: new Node("起", false, true, "头", 1.5, "lifesteal"), 1: new Node("承", false, true, "胸", 1.5, "lifesteal"), 2: new Node("转", false, true, "腿", 1.5, "lifesteal"), 3: new Node("结", false, true, "头", 2.5, "lifesteal")}', "疯狂的乱劈，每一击都渴求鲜血。")
    ]),
    "蛤蟆功": ("绝学", [
        ("蛤蟆功-推窗望月", 3, '{0: new Node("起", true, false, "胸", 3.0, "counter"), 1: new Node("承", true, false, "胸", 3.0, "counter"), 2: new Node("结", true, true, "胸", 4.0, "pierce")}', "西毒绝学，防守附带【反震】，反击附带【破甲】。"),
        ("蛤蟆功-金蟾倒立", 3, '{0: new Node("起", true, false, "头", 2.5, "counter"), 1: new Node("承", true, false, "腿", 2.5, "counter"), 2: new Node("结", true, true, "头", 3.5)}', "诡异的身法，强力的反击。"),
        ("蛤蟆功-蛤蟆飞扑", 2, '{0: new Node("起", true, false, "腿", 2.0), 1: new Node("结", true, true, "胸", 4.5, "pierce")}', "蓄力一跃，惊天动地。")
    ]),
    "弹指神通": ("绝学", [
        ("弹指神通-漫天花雨", 2, '{0: new Node("起", true, true, "腕", 1.5, "pierce"), 1: new Node("结", true, true, "头", 1.5, "pierce")}', "东邪绝学，指力惊人，附带【破甲】。"),
        ("弹指神通-九宫连环", 3, '{0: new Node("起", false, true, "胸", 1.0, "pierce"), 1: new Node("承", false, true, "腿", 1.0, "pierce"), 2: new Node("结", false, true, "头", 1.5, "pierce")}', "连点数穴，防不胜防。"),
        ("弹指神通-破甲弹指", 1, '{0: new Node("起", true, true, "心", 3.0, "pierce")}', "凝聚全身功力的一指，无视防御。")
    ]),
    "乾坤大挪移": ("绝学", [
        ("乾坤大挪移-颠倒乾坤", 4, '{0: new Node("起", true, false, "头", 2.0, "counter"), 1: new Node("承", true, false, "胸", 2.0, "counter"), 2: new Node("转", true, false, "臂", 2.0, "counter"), 3: new Node("结", true, true, "胸", 2.5)}', "牵引挪移敌方攻击，附带【反震】。"),
        ("乾坤大挪移-移花接木", 3, '{0: new Node("起", true, false, "胸", 2.5, "counter"), 1: new Node("承", true, false, "腿", 2.5, "counter"), 2: new Node("结", true, false, "头", 2.5, "counter")}', "纯粹的防守反震。"),
        ("乾坤大挪移-斗转星移", 3, '{0: new Node("起", true, false, "胸", 2.0, "counter"), 1: new Node("承", true, true, "胸", 1.5), 2: new Node("结", true, true, "头", 3.0)}', "化解攻势后转为强力反击。")
    ])
}

js_code = "  const moves = [\n"
for set_name, (level, moves_list) in sets_data.items():
    for move in moves_list:
        js_code += f'    new Move("{move[0]}", {move[1]}, {move[2]}, "{move[3]}", "{set_name}", "{level}"),\n'
js_code += "  ];\n"

# Inner skills
inner_skills = [
    ('吐纳法', '入门', '江湖中最基础的呼吸法，胜在平稳。', 2, 1, 'minor_heal', '每回合结束恢复 2% 最大气血。'),
    ('紫霞神功', '进阶', '华山派高深内功，绵延不绝。', 4, 3, 'minor_heal', '每回合结束恢复 3% 最大气血。'),
    ('少林纯阳功', '进阶', '少林阳刚内功，刚猛无俦。', 2, 5, 'combo_bonus_up', '触发连招 Combo 时，加成系数提升至 2.0 倍。'),
    ('武当九阳功', '绝学', '武当基础内功，绵长醇厚。', 5, 2, 'heal_per_turn', '每回合结束恢复 5% 最大气血。'),
    ('易筋经', '绝学', '少林至高无上内功，生生不息。', 6, 6, 'heal_per_turn', '每回合结束恢复 8% 最大气血。')
]

js_code += "  const inner_skills = [\n"
for s in inner_skills:
    special = f'"{s[5]}"' if s[5] else 'null'
    effect = f'"{s[6]}"' if s[6] else 'null'
    js_code += f'    new InnerSkill("{s[0]}", "{s[2]}", {s[3]}, {s[4]}, {special}, {effect}, "{s[1]}"),\n'
js_code += "  ];\n"

agility_skills = [
    ('水上漂', '入门', '江湖常见轻功，提气轻身，如履薄冰。', 10, 'minor_evasion', '基础闪避率额外提升 5%。'),
    ('飞檐走壁', '进阶', '高超轻功，能于绝壁行走。', 15, 'minor_evasion', '基础闪避率额外提升 8%。'),
    ('一苇渡江', '进阶', '少林轻功。', 18, 'null', 'null'),
    ('神行百变', '绝学', '逍遥派绝顶轻功，变幻莫测。', 25, 'guaranteed_evasion_first_hit', '每回合必定闪避受到的第一次攻击。'),
    ('梯云纵', '绝学', '武当绝顶轻功。', 20, 'guaranteed_evasion_first_hit', '每回合必定闪避受到的第一次攻击。')
]

js_code += "  const agility_skills = [\n"
for s in agility_skills:
    special = f'"{s[4]}"' if s[4] != 'null' else 'null'
    effect = f'"{s[5]}"' if s[5] != 'null' else 'null'
    js_code += f'    new AgilitySkill("{s[0]}", "{s[2]}", {s[3]}, {special}, {effect}, "{s[1]}"),\n'
js_code += "  ];\n"

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'r') as f:
    content = f.read()

# Replace everything from `export function generate_sample_data() {` to the end
import re
new_content = re.sub(r'export function generate_sample_data\(\) \{.*', 'export function generate_sample_data() {\n' + js_code + '  return { moves, inner_skills, agility_skills };\n}', content, flags=re.DOTALL)

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'w') as f:
    f.write(new_content)
