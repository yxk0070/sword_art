import re

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'r') as f:
    content = f.read()

# Add types to Node
content = content.replace(
    'export class Node {',
    'export class Node {\n  phase: string;\n  is_strong: boolean;\n  is_attack: boolean;\n  target_part: string;\n  value_modifier: number;\n  special_effect: string | null;\n'
)

# Add types to Move
content = content.replace(
    'export class Move {',
    'export class Move {\n  name: string;\n  duration: number;\n  nodes: Record<number, Node>;\n  description: string;\n  set_name: string;\n  level: string;\n'
)

# Add types to InnerSkill
content = content.replace(
    'export class InnerSkill {',
    'export class InnerSkill {\n  name: string;\n  description: string;\n  inner_bonus: number;\n  mastery_bonus: number;\n  special_effect: string | null;\n  effect_desc: string | null;\n  level: string;\n'
)

# Add types to AgilitySkill
content = content.replace(
    'export class AgilitySkill {',
    'export class AgilitySkill {\n  name: string;\n  description: string;\n  agility_bonus: number;\n  special_effect: string | null;\n  effect_desc: string | null;\n  level: string;\n'
)

# Add types to Character
content = content.replace(
    'export class Character {',
    'export class Character {\n  name: string;\n  max_hp: number;\n  hp: number;\n  base_inner_amount: number;\n  base_inner_mastery: number;\n  base_agility: number;\n  weapon_atk: number;\n  armor_def: number;\n  move_proficiencies: Record<string, number>;\n  equipped_inner_skill: InnerSkill | null;\n  equipped_agility_skill: AgilitySkill | null;\n  _has_evaded_this_turn?: boolean;\n'
)

# Add types to BattleEngine
content = content.replace(
    'export class BattleEngine {',
    'export class BattleEngine {\n  p1: Character;\n  p2: Character;\n  turn: number;\n  logs: string[];\n'
)

# Fix JS specific syntax
content = content.replace('constructor(name, duration, nodes, description = "", set_name = "", level = "入门") {', 'constructor(name: string, duration: number, nodes: Record<number, Node>, description = "", set_name = "", level = "入门") {')
content = content.replace('constructor(p1, p2) {', 'constructor(p1: Character, p2: Character) {')

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'w') as f:
    f.write(content)

