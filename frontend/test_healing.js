import { generate_sample_data, Character, BattleEngine } from './src/gameEngine.js';

function runHealingTest() {
  console.log("=== 开始测试武当九阳功回血特效 ===\n");
  
  const { moves, inner_skills, agility_skills } = generate_sample_data();
  
  // 1. 初始化玩家，装备武当九阳功
  const player = new Character("测试玩家", 500, 10, 5, 50, 10, 5);
  player.equipped_inner_skill = inner_skills.find(s => s.name === "武当九阳功"); // heal_per_turn
  player.equipped_agility_skill = agility_skills[0];
  
  // 2. 初始化敌人
  const enemy = new Character("测试沙袋", 1000, 1, 1, 10, 0, 0); 
  
  // 3. 人为扣除玩家一些血量，以观察回血效果
  player.hp = 300; 
  console.log(`初始状态：`);
  console.log(`玩家气血: ${player.hp} / ${player.max_hp}`);
  console.log(`玩家内功: ${player.equipped_inner_skill.name} (${player.equipped_inner_skill.special_effect})\n`);
  
  const engine = new BattleEngine(player, enemy);
  
  // 4. 随便出个招，打完一回合
  const playerMoves = [moves[0]]; // 冲步双掌
  const enemyMoves = []; // 敌人发呆
  
  const result = engine.play_turn(playerMoves, enemyMoves);
  
  console.log("=== 战斗日志输出 ===");
  let healLogFound = false;
  
  result.logs.forEach(log => {
    console.log(log);
    if (log.includes("武当九阳功") && log.includes("恢复了")) {
      healLogFound = true;
    }
  });
  
  console.log("\n=== 结算状态 ===");
  console.log(`回合结束玩家气血: ${player.hp} / ${player.max_hp}`);
  const expectedHeal = Math.floor(player.max_hp * 0.05); // 500 * 0.05 = 25
  console.log(`预期回血量: ${expectedHeal}`);
  
  console.log("\n=== 测试结论 ===");
  if (healLogFound && player.hp === 300 + expectedHeal) {
    console.log("✅ 测试通过！成功检测到武当九阳功的回血特效及正确的血量变化。");
  } else {
    console.log("❌ 测试失败！未能在日志中找到回血记录或血量计算不正确。");
  }
}

runHealingTest();
