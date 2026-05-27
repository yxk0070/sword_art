import { generate_sample_data, Character, BattleEngine } from './src/gameEngine.js';

function runTest() {
  console.log("=== 开始测试 Combo 逻辑 ===");
  
  // 1. 初始化角色
  const player = new Character("测试玩家", 500, 10, 5, 50, 10, 5);
  const enemy = new Character("测试沙袋", 1000, 1, 1, 10, 0, 0); // 极低属性确保不会闪避，且防御低
  
  const engine = new BattleEngine(player, enemy);
  
  // 2. 获取招式库
  const { moves } = generate_sample_data();
  // moves[0] = "太祖长拳-冲步双掌" (3息, 结尾是 '结')
  // moves[1] = "太祖长拳-十字踢腿" (3息, 起手是 '起')
  
  const move1 = moves[0];
  const move2 = moves[1];
  
  console.log(`\n使用招式 1: ${move1.name} (最后一息节点: ${move1.nodes[move1.duration - 1].phase})`);
  console.log(`使用招式 2: ${move2.name} (第一息节点: ${move2.nodes[0].phase})`);
  console.log("预期: 招式 2 释放时应该触发 【Combo触发!】 起结相连，招式威力大增！");
  
  // 3. 构造回合输入
  // 玩家连续使用这两个招式
  const playerMoves = [move1, move2];
  // 敌人这回合发呆，不出招
  const enemyMoves = [];
  
  // 4. 执行战斗
  const result = engine.play_turn(playerMoves, enemyMoves);
  
  // 5. 打印并验证结果
  console.log("\n=== 战斗日志输出 ===");
  let comboFound = false;
  
  result.logs.forEach(log => {
    console.log(log);
    if (log.includes("Combo触发!")) {
      comboFound = true;
    }
  });
  
  console.log("\n=== 测试结论 ===");
  if (comboFound) {
    console.log("✅ 测试通过！成功检测到 Combo 触发日志。");
  } else {
    console.log("❌ 测试失败！未能在日志中找到 Combo 触发记录。");
  }
}

runTest();
