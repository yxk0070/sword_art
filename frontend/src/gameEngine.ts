export class Node {
  phase: string;
  is_strong: boolean;
  is_attack: boolean;
  target_part: string;
  value_modifier: number;
  special_effect: string | null;

  constructor(
    phase,
    is_strong,
    is_attack,
    target_part,
    value_modifier = 1.0,
    special_effect = null
  ) {
    this.phase = phase;
    this.is_strong = is_strong;
    this.is_attack = is_attack;
    this.target_part = target_part;
    this.value_modifier = value_modifier;
    this.special_effect = special_effect;
  }

  get_effect_name() {
    switch (this.special_effect) {
      case "lifesteal":
        return "吸血";
      case "pierce":
        return "破甲";
      case "counter":
        return "反震";
      default:
        return "";
    }
  }

  toString() {
    const type_str = this.is_attack ? "攻击" : "防御";
    const str_str = this.is_strong ? "强势" : "弱点";
    const effect_str = this.special_effect ? `|${this.get_effect_name()}` : "";
    return `[${this.phase}|${this.target_part}|${type_str}|${str_str}${effect_str}]`;
  }
}

export class Move {
  name: string;
  duration: number;
  nodes: Record<number, Node>;
  description: string;
  set_name: string;
  level: string;

  constructor(
    name,
    duration,
    nodes,
    description = "",
    set_name = "",
    level = "入门"
  ) {
    this.name = name;
    this.duration = duration;
    this.nodes = nodes;
    this.description = description;
    this.set_name = set_name;
    this.level = level;
  }
}

export class InnerSkill {
  name: string;
  description: string;
  inner_bonus: number;
  mastery_bonus: number;
  special_effect: string | null;
  effect_desc: string | null;
  level: string;

  constructor(
    name,
    description,
    inner_bonus,
    mastery_bonus,
    special_effect = null,
    effect_desc = null,
    level = "入门"
  ) {
    this.name = name;
    this.description = description;
    this.inner_bonus = inner_bonus;
    this.mastery_bonus = mastery_bonus;
    this.special_effect = special_effect;
    this.effect_desc = effect_desc;
    this.level = level;
  }
}

export class AgilitySkill {
  name: string;
  description: string;
  agility_bonus: number;
  special_effect: string | null;
  effect_desc: string | null;
  level: string;

  constructor(
    name,
    description,
    agility_bonus,
    special_effect = null,
    effect_desc = null,
    level = "入门"
  ) {
    this.name = name;
    this.description = description;
    this.agility_bonus = agility_bonus;
    this.special_effect = special_effect;
    this.effect_desc = effect_desc;
    this.level = level;
  }
}

export class Character {
  name: string;
  max_hp: number;
  hp: number;
  base_inner_amount: number;
  base_inner_mastery: number;
  base_agility: number;
  weapon_atk: number;
  armor_def: number;
  move_proficiencies: Record<string, number>;
  equipped_inner_skill: InnerSkill | null;
  equipped_agility_skill: AgilitySkill | null;
  _has_evaded_this_turn?: boolean;

  constructor(
    name,
    hp,
    base_inner_amount,
    base_inner_mastery,
    base_agility,
    weapon_atk,
    armor_def
  ) {
    this.name = name;
    this.max_hp = hp;
    this.hp = hp;
    this.base_inner_amount = base_inner_amount;
    this.base_inner_mastery = base_inner_mastery;
    this.base_agility = base_agility;
    this.weapon_atk = weapon_atk;
    this.armor_def = armor_def;
    this.move_proficiencies = {};

    this.equipped_inner_skill = null;
    this.equipped_agility_skill = null;
  }

  get inner_amount() {
    return (
      this.base_inner_amount +
      (this.equipped_inner_skill ? this.equipped_inner_skill.inner_bonus : 0)
    );
  }

  get inner_mastery() {
    return (
      this.base_inner_mastery +
      (this.equipped_inner_skill ? this.equipped_inner_skill.mastery_bonus : 0)
    );
  }

  get agility() {
    return (
      this.base_agility +
      (this.equipped_agility_skill
        ? this.equipped_agility_skill.agility_bonus
        : 0)
    );
  }

  get inner_power_strength() {
    return this.inner_amount * this.inner_mastery;
  }

  get_attack_val(move_name) {
    const prof = this.move_proficiencies[move_name] || 1.0;
    return this.inner_power_strength * prof + this.weapon_atk;
  }

  get_defense_val() {
    return this.inner_power_strength + this.armor_def;
  }

  is_alive() {
    return this.hp > 0;
  }
}

export class BattleEngine {
  p1: Character;
  p2: Character;
  turn: number;
  logs: string[];

  constructor(p1: Character, p2: Character) {
    this.p1 = p1;
    this.p2 = p2;
    this.turn = 1;
    this.logs = [];
  }

  log(msg) {
    this.logs.push(msg);
  }

  resolve_interval(
    interval: number,
    p1_action: any,
    p2_action: any,
    tick_results: any
  ) {
    let first = this.p1;
    let second = this.p2;
    let act_first = p1_action;
    let act_second = p2_action;
    let first_key = "p1";
    let second_key = "p2";

    if (this.p2.agility > this.p1.agility) {
      first = this.p2;
      second = this.p1;
      act_first = p2_action;
      act_second = p1_action;
      first_key = "p2";
      second_key = "p1";
    } else if (this.p1.agility === this.p2.agility) {
      if (Math.random() < 0.5) {
        first = this.p2;
        second = this.p1;
        act_first = p2_action;
        act_second = p1_action;
        first_key = "p2";
        second_key = "p1";
      }
    }

    this.execute_node(
      first,
      second,
      act_first,
      act_second,
      tick_results,
      first_key,
      second_key
    );
    if (second.is_alive()) {
      this.execute_node(
        second,
        first,
        act_second,
        act_first,
        tick_results,
        second_key,
        first_key
      );
    }
  }

  execute_node(
    attacker: Character,
    defender: Character,
    atk_action: any,
    def_action: any,
    tick_results: any,
    attacker_key: string,
    defender_key: string
  ) {
    if (!atk_action) return;

    const [move, node, combo_bonus] = atk_action;
    this.log(`[${attacker.name}] 施展 ${move.name} ${node.toString()}`);

    const agility_diff = defender.agility - attacker.agility;

    // Linear evasion logic:
    // If defender is faster, base chance is 0% at 0 diff.
    // Every 1 point of agility difference adds 1% evasion chance.
    // Cap maximum evasion chance at 50% to avoid invincible characters.
    let evasion_chance = 0;
    if (agility_diff > 0) {
      evasion_chance = Math.min(0.5, agility_diff * 0.01);
    }

    // Check for minor_evasion
    if (defender.equipped_agility_skill?.special_effect === "minor_evasion") {
      evasion_chance += 0.05;
    }

    // Check for Tiyunzong special effect: guaranteed evasion for the very first attack received in a turn
    let trigger_guaranteed_evasion = false;
    if (
      defender.equipped_agility_skill?.special_effect ===
        "guaranteed_evasion_first_hit" &&
      !defender._has_evaded_this_turn
    ) {
      trigger_guaranteed_evasion = true;
      defender._has_evaded_this_turn = true; // Mark that the effect has been used this turn
    }

    if (
      trigger_guaranteed_evasion ||
      (evasion_chance > 0 && Math.random() < evasion_chance)
    ) {
      if (trigger_guaranteed_evasion) {
        this.log(
          `  -> ${defender.name} 施展【梯云纵】，身形拔地而起，必定闪避了本次攻击！`
        );
      } else {
        this.log(
          `  -> ${defender.name} 凭借高超轻功(差值:${agility_diff})，身形一晃完美闪避了攻击！`
        );
      }
      tick_results[defender_key].push("闪避");
      return;
    }

    if (node.is_attack) {
      if (combo_bonus > 1.0) {
        tick_results[attacker_key].push("连击");
      }
      const atk_val =
        attacker.get_attack_val(move.name) * node.value_modifier * combo_bonus;
      let def_val = defender.get_defense_val();
      let target_strong = true;
      let is_weakness_break = false;

      if (def_action) {
        const [, def_node] = def_action;
        def_val = defender.get_defense_val() * def_node.value_modifier;
        target_strong = def_node.is_strong;

        if (!def_node.is_attack && def_node.target_part === node.target_part) {
          def_val *= 1.5;
          this.log(
            `  -> ${defender.name} 的防守节点成功护住了 ${node.target_part}！`
          );
          tick_results[defender_key].push("招架");
        }
      }

      if (node.special_effect === "pierce") {
        def_val = Math.floor(def_val * 0.5);
        this.log(`  -> 【破甲】生效，招式凌厉，无视了敌人一半防御！`);
        tick_results[attacker_key].push("破甲");
      }

      let damage = Math.max(1, Math.floor(atk_val - def_val));

      if (!target_strong) {
        damage = Math.floor(damage * 1.5 + 20);
        is_weakness_break = true;
        this.log(`  -> 击中弱势节点！【弱点击破】触发！`);
        tick_results[defender_key].push("破绽");
      } else if (target_strong && def_action) {
        damage = Math.floor(damage * 0.7);
        this.log(`  -> 击中强势节点，伤害被化解部分。`);
      }

      defender.hp -= damage;
      this.log(
        `  -> 造成了 ${damage} 点伤害！ (剩余HP: ${defender.hp}/${defender.max_hp})`
      );
      tick_results[defender_key].push(`-${damage}`);

      if (node.special_effect === "lifesteal") {
        const heal = Math.floor(damage * 0.3);
        attacker.hp = Math.min(attacker.max_hp, attacker.hp + heal);
        this.log(`  -> 【吸血】生效，${attacker.name} 恢复了 ${heal} 点气血！`);
        tick_results[attacker_key].push(`+${heal}`);
      }

      if (def_action) {
        const [, def_node] = def_action;
        if (!def_node.is_attack && def_node.special_effect === "counter") {
          const reflect = Math.max(1, Math.floor(damage * 0.3));
          attacker.hp -= reflect;
          this.log(
            `  -> 【反震】生效，${defender.name} 的防守节点将 ${reflect} 点伤害反弹给了 ${attacker.name}！`
          );
          tick_results[attacker_key].push(`反震 -${reflect}`);
        }
      }

      if (is_weakness_break) {
        this.log(`  -> 额外效果：${defender.name} 气血翻涌，内力运转受阻！`);
      }
    } else {
      this.log(`  -> ${attacker.name} 严阵以待，防护 ${node.target_part}。`);
    }
  }

  play_turn(p1_moves, p2_moves) {
    this.logs = [];
    this.log(`=== 第 ${this.turn} 回合 ===`);

    // Reset turn-based states
    this.p1._has_evaded_this_turn = false;
    this.p2._has_evaded_this_turn = false;

    const p1_timeline = new Array(12).fill(null);
    const p2_timeline = new Array(12).fill(null);
    const hp_history = [];

    const build_timeline = (moves, timeline, character) => {
      let idx = 0;
      let prev_move_last_phase = null;

      for (const m of moves) {
        let combo_bonus = 1.0;
        for (let i = 0; i < m.duration; i++) {
          if (idx + i < 12) {
            const node = m.nodes[i];
            if (node) {
              // Trigger combo if this is the first node ('起') and it follows the previous move's '结'
              if (
                i === 0 &&
                node.phase === "起" &&
                prev_move_last_phase === "结"
              ) {
                // Apply special effect from Shaolin Chunyang
                if (
                  character.equipped_inner_skill?.special_effect ===
                  "combo_bonus_up"
                ) {
                  combo_bonus = 2.0;
                  this.log(
                    `【Combo触发!】 起结相连，配合【少林纯阳功】刚猛内劲，招式威力极其惊人！(x2.0)`
                  );
                } else {
                  combo_bonus = 1.5;
                  this.log(`【Combo触发!】 起结相连，招式威力大增！`);
                }
              }
              timeline[idx + i] = [m, node, combo_bonus];
            }
          }
        }
        // Store the last phase of this move to check for combo with the next move
        if (m.duration > 0 && m.nodes[m.duration - 1]) {
          prev_move_last_phase = m.nodes[m.duration - 1].phase;
        } else {
          prev_move_last_phase = null;
        }
        idx += m.duration;
        if (idx >= 12) break;
      }
    };

    build_timeline(p1_moves, p1_timeline, this.p1);
    build_timeline(p2_moves, p2_timeline, this.p2);

    const tick_results: Record<number, { p1: string[]; p2: string[] }> = {};

    for (let i = 0; i < 12; i++) {
      tick_results[i] = { p1: [], p2: [] };
      const p1_act = p1_timeline[i];
      const p2_act = p2_timeline[i];
      if (p1_act || p2_act) {
        this.log(`\n[第 ${i + 1} 息]`);
        this.resolve_interval(i, p1_act, p2_act, tick_results[i]);
      }

      hp_history.push({
        tick: i,
        p1_hp: this.p1.hp,
        p2_hp: this.p2.hp,
      });

      if (!this.p1.is_alive() || !this.p2.is_alive()) {
        break;
      }
    }

    // Apply end of turn effects
    const applyEndOfTurnEffects = (char) => {
      if (!char.is_alive()) return;

      const effect = char.equipped_inner_skill?.special_effect;
      if (effect === "heal_per_turn") {
        const heal_amount = Math.floor(char.max_hp * 0.05);
        char.hp = Math.min(char.max_hp, char.hp + heal_amount);
        this.log(
          `\n[回合结算] ${char.name} 运转【${char.equipped_inner_skill.name}】，绵长内力流转全身，恢复了 ${heal_amount} 点气血。`
        );
      } else if (effect === "minor_heal") {
        const heal_amount = Math.floor(char.max_hp * 0.02);
        char.hp = Math.min(char.max_hp, char.hp + heal_amount);
        this.log(
          `\n[回合结算] ${char.name} 运转【${char.equipped_inner_skill.name}】，平心静气，恢复了 ${heal_amount} 点气血。`
        );
      }
    };

    if (this.p1.is_alive() && this.p2.is_alive()) {
      applyEndOfTurnEffects(this.p1);
      applyEndOfTurnEffects(this.p2);

      // Add one final HP record if healing happened
      hp_history.push({
        tick: 12,
        p1_hp: this.p1.hp,
        p2_hp: this.p2.hp,
      });
    }

    this.turn += 1;
    return { logs: this.logs, hp_history, tick_results };
  }
}

export function getPlayerBaseStats(level) {
  return {
    hp: 200 + (level - 1) * 50,
    inner_amount: 5 + (level - 1) * 2,
    inner_mastery: 1 + Math.floor((level - 1) * 0.5),
    agility: 5 + (level - 1) * 5,
    weapon_atk: 5 + (level - 1) * 2,
    armor_def: 2 + (level - 1) * 2,
  };
}

export function generate_sample_data() {
  const moves = [
    new Move(
      "太祖长拳-冲步双掌",
      3,
      {
        0: new Node("起", true, true, "胸", 1.0),
        1: new Node("承", false, false, "臂", 0.8),
        2: new Node("结", true, true, "头", 1.5),
      },
      "太祖长拳基础招式。",
      "太祖长拳",
      "入门"
    ),
    new Move(
      "太祖长拳-十字踢腿",
      3,
      {
        0: new Node("起", true, false, "胸", 1.2),
        1: new Node("承", true, true, "腿", 1.0),
        2: new Node("结", false, true, "胸", 1.3),
      },
      "守中带攻的招式。",
      "太祖长拳",
      "入门"
    ),
    new Move(
      "太祖长拳-双抄封天",
      3,
      {
        0: new Node("起", true, false, "胸", 1.5),
        1: new Node("承", true, false, "头", 1.2),
        2: new Node("结", true, true, "臂", 1.0),
      },
      "防守招式。",
      "太祖长拳",
      "入门"
    ),
    new Move(
      "黑风刀法-力劈华山",
      3,
      {
        0: new Node("起", true, true, "胸", 1.2),
        1: new Node("承", true, true, "头", 1.5),
        2: new Node("结", false, true, "臂", 1.8),
      },
      "黑风寨狠辣刀法，起手攻胸，顺势劈头。",
      "黑风刀法",
      "入门"
    ),
    new Move(
      "黑风刀法-横扫千军",
      3,
      {
        0: new Node("起", false, true, "腿", 1.0),
        1: new Node("承", true, true, "胸", 1.2),
        2: new Node("结", true, true, "头", 1.6),
      },
      "大范围横扫，威力惊人。",
      "黑风刀法",
      "入门"
    ),
    new Move(
      "黑风刀法-黑风夜泣",
      2,
      {
        0: new Node("起", false, false, "臂", 1.5),
        1: new Node("结", false, true, "头", 2.0),
      },
      "阴险的奇招，专攻破绽。",
      "黑风刀法",
      "入门"
    ),
    new Move(
      "飞刀绝技-流星赶月",
      2,
      {
        0: new Node("起", false, true, "头", 1.0),
        1: new Node("结", false, true, "胸", 1.5, "pierce"),
      },
      "暗器绝技，速度极快，附带【破甲】。",
      "飞刀绝技",
      "进阶"
    ),
    new Move(
      "飞刀绝技-小李飞刀",
      2,
      {
        0: new Node("起", true, false, "胸", 1.2),
        1: new Node("结", true, true, "头", 2.5, "pierce"),
      },
      "例无虚发，致命一击，附带【破甲】。",
      "飞刀绝技",
      "进阶"
    ),
    new Move(
      "飞刀绝技-满天星雨",
      3,
      {
        0: new Node("起", false, true, "臂", 0.8),
        1: new Node("承", false, true, "腿", 0.8),
        2: new Node("结", false, true, "胸", 1.2),
      },
      "飞刀如雨，防不胜防。",
      "飞刀绝技",
      "进阶"
    ),
    new Move(
      "罗汉拳-黑虎掏心",
      4,
      {
        0: new Node("起", true, false, "头", 1.0),
        1: new Node("承", true, true, "胸", 1.1),
        2: new Node("转", false, false, "腿", 0.5),
        3: new Node("结", true, true, "头", 1.8),
      },
      "少林罗汉拳经典杀招。",
      "罗汉拳",
      "进阶"
    ),
    new Move(
      "罗汉拳-罗汉撞钟",
      3,
      {
        0: new Node("起", true, true, "胸", 1.5),
        1: new Node("承", true, false, "臂", 1.5),
        2: new Node("结", true, true, "胸", 2.0),
      },
      "刚猛撞击。",
      "罗汉拳",
      "进阶"
    ),
    new Move(
      "罗汉拳-金刚捣碓",
      3,
      {
        0: new Node("起", true, false, "头", 1.5),
        1: new Node("承", false, true, "头", 1.2),
        2: new Node("结", true, true, "腿", 2.2),
      },
      "势大力沉的攻击。",
      "罗汉拳",
      "进阶"
    ),
    new Move(
      "大金刚拳-金刚怒目",
      3,
      {
        0: new Node("起", true, false, "胸", 2.0),
        1: new Node("承", true, true, "胸", 2.0),
        2: new Node("结", true, true, "头", 2.5, "counter"),
      },
      "少林绝学，结印附带【反震】。",
      "大金刚拳",
      "绝学"
    ),
    new Move(
      "大金刚拳-降魔印",
      3,
      {
        0: new Node("起", true, true, "头", 2.2),
        1: new Node("承", true, false, "臂", 2.0, "counter"),
        2: new Node("结", true, true, "胸", 2.8),
      },
      "大开大合的镇派之宝。",
      "大金刚拳",
      "绝学"
    ),
    new Move(
      "大金刚拳-须弥山掌",
      4,
      {
        0: new Node("起", true, false, "胸", 1.5),
        1: new Node("承", true, false, "头", 1.5),
        2: new Node("转", true, false, "腿", 1.5),
        3: new Node("结", true, true, "胸", 3.5),
      },
      "积蓄力量，爆发出山崩地裂的一击。",
      "大金刚拳",
      "绝学"
    ),
    new Move(
      "武当绵掌-白鹤亮翅",
      5,
      {
        0: new Node("起", true, false, "胸", 1.2),
        1: new Node("承", true, false, "臂", 1.2),
        2: new Node("转", false, true, "腕", 1.0),
        3: new Node("收", true, false, "胸", 1.5),
        4: new Node("结", true, true, "胸", 2.0),
      },
      "武当绝学，连绵不绝。",
      "武当绵掌",
      "进阶"
    ),
    new Move(
      "武当绵掌-野马分鬃",
      3,
      {
        0: new Node("起", true, false, "臂", 1.5),
        1: new Node("承", false, true, "胸", 1.5),
        2: new Node("结", true, false, "头", 2.0),
      },
      "以柔克刚的防守反击。",
      "武当绵掌",
      "进阶"
    ),
    new Move(
      "武当绵掌-如封似闭",
      3,
      {
        0: new Node("起", true, false, "胸", 1.8),
        1: new Node("承", true, false, "头", 1.8),
        2: new Node("结", true, false, "腿", 1.8),
      },
      "密不透风的纯防守招式。",
      "武当绵掌",
      "进阶"
    ),
    new Move(
      "太极拳-揽雀尾",
      5,
      {
        0: new Node("起", true, false, "胸", 2.0, "counter"),
        1: new Node("承", true, false, "臂", 2.0, "counter"),
        2: new Node("转", true, false, "腕", 2.0, "counter"),
        3: new Node("收", true, false, "腿", 2.0, "counter"),
        4: new Node("结", true, true, "胸", 2.0),
      },
      "前四息防守均附带【反震】效果。",
      "太极拳",
      "绝学"
    ),
    new Move(
      "太极拳-单鞭",
      3,
      {
        0: new Node("起", true, false, "臂", 2.0, "counter"),
        1: new Node("承", true, true, "胸", 1.5),
        2: new Node("结", true, true, "头", 2.5),
      },
      "太极杀招，柔中带刚。",
      "太极拳",
      "绝学"
    ),
    new Move(
      "太极拳-云手",
      4,
      {
        0: new Node("起", true, false, "胸", 2.0),
        1: new Node("承", true, false, "头", 2.0),
        2: new Node("转", true, true, "腕", 1.5),
        3: new Node("结", true, false, "胸", 2.5, "counter"),
      },
      "圆转如意，攻守兼备。",
      "太极拳",
      "绝学"
    ),
    new Move(
      "降龙十八掌-亢龙有悔",
      4,
      {
        0: new Node("起", true, false, "胸", 1.5),
        1: new Node("承", true, true, "臂", 1.2),
        2: new Node("转", true, true, "胸", 1.5),
        3: new Node("结", true, true, "胸", 2.5, "pierce"),
      },
      "丐帮绝学，刚猛天下第一。结印一击附带【破甲】效果。",
      "降龙十八掌",
      "绝学"
    ),
    new Move(
      "降龙十八掌-飞龙在天",
      3,
      {
        0: new Node("起", true, true, "头", 2.0),
        1: new Node("承", false, true, "胸", 1.5),
        2: new Node("结", true, true, "头", 3.0),
      },
      "自上而下，气势磅礴。",
      "降龙十八掌",
      "绝学"
    ),
    new Move(
      "降龙十八掌-神龙摆尾",
      3,
      {
        0: new Node("起", false, false, "背", 1.0),
        1: new Node("承", true, true, "腿", 2.0),
        2: new Node("结", true, true, "胸", 2.5),
      },
      "出其不意的反击杀招。",
      "降龙十八掌",
      "绝学"
    ),
    new Move(
      "九阴白骨爪-九阴神抓",
      4,
      {
        0: new Node("起", true, true, "头", 1.2),
        1: new Node("承", false, true, "腕", 1.5, "lifesteal"),
        2: new Node("转", false, false, "胸", 0.5),
        3: new Node("结", true, true, "头", 1.8, "lifesteal"),
      },
      "承与结节点附带【吸血】效果。",
      "九阴白骨爪",
      "绝学"
    ),
    new Move(
      "九阴白骨爪-摧心爪",
      3,
      {
        0: new Node("起", true, true, "胸", 1.5),
        1: new Node("承", false, true, "心", 2.0, "pierce"),
        2: new Node("结", true, true, "心", 2.5, "lifesteal"),
      },
      "极其狠辣，直取要害。",
      "九阴白骨爪",
      "绝学"
    ),
    new Move(
      "九阴白骨爪-白骨如山",
      5,
      {
        0: new Node("起", false, true, "臂", 1.0, "lifesteal"),
        1: new Node("承", false, true, "腿", 1.0, "lifesteal"),
        2: new Node("转", false, true, "胸", 1.0, "lifesteal"),
        3: new Node("收", false, true, "头", 1.0, "lifesteal"),
        4: new Node("结", true, true, "头", 2.0, "lifesteal"),
      },
      "连绵不绝的抓击，每一击都能吸血。",
      "九阴白骨爪",
      "绝学"
    ),
    new Move(
      "七伤拳-一练七伤",
      4,
      {
        0: new Node("起", false, true, "胸", 2.0),
        1: new Node("承", false, true, "臂", 2.0),
        2: new Node("转", false, true, "头", 2.0),
        3: new Node("结", false, true, "胸", 3.0),
      },
      "威力奇大但全是弱点节点，伤敌一千自损八百。",
      "七伤拳",
      "绝学"
    ),
    new Move(
      "七伤拳-摧肝肠",
      3,
      {
        0: new Node("起", false, true, "腹", 2.5),
        1: new Node("承", false, true, "胸", 2.5),
        2: new Node("结", false, true, "头", 3.5),
      },
      "极端的爆发力，放弃一切防御。",
      "七伤拳",
      "绝学"
    ),
    new Move(
      "七伤拳-损心诀",
      2,
      {
        0: new Node("起", false, true, "心", 3.0),
        1: new Node("结", false, true, "心", 4.0, "pierce"),
      },
      "破釜沉舟的致命一击。",
      "七伤拳",
      "绝学"
    ),
    new Move(
      "狂风快剑-风卷残云",
      4,
      {
        0: new Node("起", true, true, "臂", 1.2),
        1: new Node("承", false, true, "腕", 1.2),
        2: new Node("转", true, true, "腿", 1.2),
        3: new Node("结", false, true, "头", 1.5),
      },
      "剑法如狂风骤雨，连绵不绝。",
      "狂风快剑",
      "进阶"
    ),
    new Move(
      "狂风快剑-狂风过境",
      3,
      {
        0: new Node("起", false, true, "胸", 1.5),
        1: new Node("承", false, true, "胸", 1.5),
        2: new Node("结", false, true, "胸", 2.0),
      },
      "速度极快的三连刺。",
      "狂风快剑",
      "进阶"
    ),
    new Move(
      "狂风快剑-剑刃风暴",
      5,
      {
        0: new Node("起", false, true, "臂", 1.0),
        1: new Node("承", false, true, "腿", 1.0),
        2: new Node("转", false, true, "胸", 1.0),
        3: new Node("收", false, true, "头", 1.0),
        4: new Node("结", true, true, "胸", 2.0),
      },
      "剑影重重，让人无法防备。",
      "狂风快剑",
      "进阶"
    ),
    new Move(
      "铁掌功-水上狂飙",
      4,
      {
        0: new Node("起", true, false, "胸", 1.5),
        1: new Node("承", true, true, "胸", 1.5),
        2: new Node("转", true, true, "头", 1.5),
        3: new Node("结", true, true, "胸", 2.0),
      },
      "铁掌帮绝学，掌力刚猛无俦。",
      "铁掌功",
      "绝学"
    ),
    new Move(
      "铁掌功-铁沙掌",
      3,
      {
        0: new Node("起", true, true, "胸", 2.0),
        1: new Node("承", true, false, "臂", 1.5),
        2: new Node("结", true, true, "头", 2.5),
      },
      "掌力沉重，中之必伤。",
      "铁掌功",
      "绝学"
    ),
    new Move(
      "铁掌功-排山倒海",
      3,
      {
        0: new Node("起", true, false, "胸", 2.0),
        1: new Node("承", true, false, "胸", 2.0),
        2: new Node("结", true, true, "胸", 3.0, "pierce"),
      },
      "掌势如浪，破甲无情。",
      "铁掌功",
      "绝学"
    ),
    new Move(
      "血刀大法-血海深仇",
      3,
      {
        0: new Node("起", false, true, "头", 1.5),
        1: new Node("承", false, true, "胸", 1.5, "lifesteal"),
        2: new Node("结", false, true, "头", 2.0, "lifesteal"),
      },
      "魔教邪功，刀法凶残，附带【吸血】。",
      "血刀大法",
      "绝学"
    ),
    new Move(
      "血刀大法-刀头舔血",
      3,
      {
        0: new Node("起", true, false, "臂", 1.5),
        1: new Node("承", false, true, "腹", 2.0, "lifesteal"),
        2: new Node("结", true, true, "胸", 2.5, "lifesteal"),
      },
      "阴险狠毒的招式。",
      "血刀大法",
      "绝学"
    ),
    new Move(
      "血刀大法-血战到底",
      4,
      {
        0: new Node("起", false, true, "头", 1.5, "lifesteal"),
        1: new Node("承", false, true, "胸", 1.5, "lifesteal"),
        2: new Node("转", false, true, "腿", 1.5, "lifesteal"),
        3: new Node("结", false, true, "头", 2.5, "lifesteal"),
      },
      "疯狂的乱劈，每一击都渴求鲜血。",
      "血刀大法",
      "绝学"
    ),
    new Move(
      "蛤蟆功-推窗望月",
      3,
      {
        0: new Node("起", true, false, "胸", 3.0, "counter"),
        1: new Node("承", true, false, "胸", 3.0, "counter"),
        2: new Node("结", true, true, "胸", 4.0, "pierce"),
      },
      "西毒绝学，防守附带【反震】，反击附带【破甲】。",
      "蛤蟆功",
      "绝学"
    ),
    new Move(
      "蛤蟆功-金蟾倒立",
      3,
      {
        0: new Node("起", true, false, "头", 2.5, "counter"),
        1: new Node("承", true, false, "腿", 2.5, "counter"),
        2: new Node("结", true, true, "头", 3.5),
      },
      "诡异的身法，强力的反击。",
      "蛤蟆功",
      "绝学"
    ),
    new Move(
      "蛤蟆功-蛤蟆飞扑",
      2,
      {
        0: new Node("起", true, false, "腿", 2.0),
        1: new Node("结", true, true, "胸", 4.5, "pierce"),
      },
      "蓄力一跃，惊天动地。",
      "蛤蟆功",
      "绝学"
    ),
    new Move(
      "弹指神通-漫天花雨",
      2,
      {
        0: new Node("起", true, true, "腕", 1.5, "pierce"),
        1: new Node("结", true, true, "头", 1.5, "pierce"),
      },
      "东邪绝学，指力惊人，附带【破甲】。",
      "弹指神通",
      "绝学"
    ),
    new Move(
      "弹指神通-九宫连环",
      3,
      {
        0: new Node("起", false, true, "胸", 1.0, "pierce"),
        1: new Node("承", false, true, "腿", 1.0, "pierce"),
        2: new Node("结", false, true, "头", 1.5, "pierce"),
      },
      "连点数穴，防不胜防。",
      "弹指神通",
      "绝学"
    ),
    new Move(
      "弹指神通-破甲弹指",
      1,
      { 0: new Node("起", true, true, "心", 3.0, "pierce") },
      "凝聚全身功力的一指，无视防御。",
      "弹指神通",
      "绝学"
    ),
    new Move(
      "乾坤大挪移-颠倒乾坤",
      4,
      {
        0: new Node("起", true, false, "头", 2.0, "counter"),
        1: new Node("承", true, false, "胸", 2.0, "counter"),
        2: new Node("转", true, false, "臂", 2.0, "counter"),
        3: new Node("结", true, true, "胸", 2.5),
      },
      "牵引挪移敌方攻击，附带【反震】。",
      "乾坤大挪移",
      "绝学"
    ),
    new Move(
      "乾坤大挪移-移花接木",
      3,
      {
        0: new Node("起", true, false, "胸", 2.5, "counter"),
        1: new Node("承", true, false, "腿", 2.5, "counter"),
        2: new Node("结", true, false, "头", 2.5, "counter"),
      },
      "纯粹的防守反震。",
      "乾坤大挪移",
      "绝学"
    ),
    new Move(
      "乾坤大挪移-斗转星移",
      3,
      {
        0: new Node("起", true, false, "胸", 2.0, "counter"),
        1: new Node("承", true, true, "胸", 1.5),
        2: new Node("结", true, true, "头", 3.0),
      },
      "化解攻势后转为强力反击。",
      "乾坤大挪移",
      "绝学"
    ),
  ];
  const inner_skills = [
    new InnerSkill(
      "吐纳法",
      "江湖中最基础的呼吸法，胜在平稳。",
      2,
      1,
      "minor_heal",
      "每回合结束恢复 2% 最大气血。",
      "入门"
    ),
    new InnerSkill(
      "紫霞神功",
      "华山派高深内功，绵延不绝。",
      4,
      3,
      "minor_heal",
      "每回合结束恢复 3% 最大气血。",
      "进阶"
    ),
    new InnerSkill(
      "少林纯阳功",
      "少林阳刚内功，刚猛无俦。",
      2,
      5,
      "combo_bonus_up",
      "触发连招 Combo 时，加成系数提升至 2.0 倍。",
      "进阶"
    ),
    new InnerSkill(
      "武当九阳功",
      "武当基础内功，绵长醇厚。",
      5,
      2,
      "heal_per_turn",
      "每回合结束恢复 5% 最大气血。",
      "绝学"
    ),
    new InnerSkill(
      "易筋经",
      "少林至高无上内功，生生不息。",
      6,
      6,
      "heal_per_turn",
      "每回合结束恢复 8% 最大气血。",
      "绝学"
    ),
  ];
  const agility_skills = [
    new AgilitySkill(
      "水上漂",
      "江湖常见轻功，提气轻身，如履薄冰。",
      10,
      "minor_evasion",
      "基础闪避率额外提升 5%。",
      "入门"
    ),
    new AgilitySkill(
      "飞檐走壁",
      "高超轻功，能于绝壁行走。",
      15,
      "minor_evasion",
      "基础闪避率额外提升 8%。",
      "进阶"
    ),
    new AgilitySkill("一苇渡江", "少林轻功。", 18, null, null, "进阶"),
    new AgilitySkill(
      "神行百变",
      "逍遥派绝顶轻功，变幻莫测。",
      25,
      "guaranteed_evasion_first_hit",
      "每回合必定闪避受到的第一次攻击。",
      "绝学"
    ),
    new AgilitySkill(
      "梯云纵",
      "武当绝顶轻功。",
      20,
      "guaranteed_evasion_first_hit",
      "每回合必定闪避受到的第一次攻击。",
      "绝学"
    ),
  ];
  return { moves, inner_skills, agility_skills };
}
