import os

# 1. Update gameEngine.ts
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const tick_results: Record<number, { p1: string[]; p2: string[] }> = {};',
    'const tick_results: Record<number, { p1: {events: string[], move: string | null, is_attack: boolean}; p2: {events: string[], move: string | null, is_attack: boolean} }> = {};'
)
content = content.replace(
    'tick_results[i] = { p1: [], p2: [] };',
    'tick_results[i] = { p1: {events: [], move: null, is_attack: false}, p2: {events: [], move: null, is_attack: false} };'
)
content = content.replace(
    'const [move, node, combo_bonus] = atk_action;',
    'const [move, node, combo_bonus] = atk_action;\n    tick_results[attacker_key].move = move.name;\n    tick_results[attacker_key].is_attack = node.is_attack;'
)
content = content.replace('tick_results[attacker_key].push', 'tick_results[attacker_key].events.push')
content = content.replace('tick_results[defender_key].push', 'tick_results[defender_key].events.push')

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'w') as f:
    f.write(content)

# 2. Update Timelines.tsx
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/Timelines.tsx', 'r') as f:
    content = f.read()

content = content.replace('tickResults[tickIndex]?.p1?.length > 0', 'tickResults[tickIndex]?.p1?.events?.length > 0')
content = content.replace('tickResults[tickIndex].p1.map', 'tickResults[tickIndex].p1.events.map')
content = content.replace('tickResults[tickIndex]?.p2?.length > 0', 'tickResults[tickIndex]?.p2?.events?.length > 0')
content = content.replace('tickResults[tickIndex].p2.map', 'tickResults[tickIndex].p2.events.map')

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/Timelines.tsx', 'w') as f:
    f.write(content)

# 3. Update index.css
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/index.css', 'a') as f:
    f.write('''
@keyframes kiWaveRight {
  0% { left: 25%; opacity: 0.8; transform: translateY(-50%) scale(0.5); }
  100% { left: 75%; opacity: 0; transform: translateY(-50%) scale(1.5); }
}
@keyframes kiWaveLeft {
  0% { right: 25%; opacity: 0.8; transform: translateY(-50%) scale(0.5); }
  100% { right: 75%; opacity: 0; transform: translateY(-50%) scale(1.5); }
}
.animate-ki-right {
  animation: kiWaveRight 0.4s ease-out forwards;
}
.animate-ki-left {
  animation: kiWaveLeft 0.4s ease-out forwards;
}
''')

# 4. Generate Arena.tsx
arena_content = '''import swordManGif from "../assets/role/sword_man.gif";
import roleAttackGif from "../assets/role/role_attack.gif";
import roleDefenseGif from "../assets/role/role_defense.gif";
import stageBg from "../assets/stage/stage.png";

export default function Arena({
  levelName,
  playerHp,
  enemyHp,
  playerMaxHp,
  enemyMaxHp,
  isPlaying,
  tickResults,
  currentTick,
}: any) {
  // Determine background based on level name
  let bgClass = "bg-gradient-to-b from-blue-900 to-gray-800"; // default
  let envName = "郊外野林";

  if (levelName) {
    if (levelName.includes("黑风寨")) {
      bgClass = "bg-gradient-to-b from-green-900 to-gray-900";
      envName = "黑风密林";
    } else if (
      levelName.includes("少林") ||
      levelName.includes("达摩") ||
      levelName.includes("破戒")
    ) {
      bgClass = "bg-gradient-to-b from-orange-900 to-yellow-900";
      envName = "少林古刹";
    } else if (
      levelName.includes("武当") ||
      levelName.includes("紫霄") ||
      levelName.includes("太极")
    ) {
      bgClass = "bg-gradient-to-b from-cyan-900 to-blue-900";
      envName = "武当金顶";
    } else if (
      levelName.includes("毒") ||
      levelName.includes("邪") ||
      levelName.includes("血刀")
    ) {
      bgClass = "bg-gradient-to-b from-purple-900 to-gray-900";
      envName = "幽暗毒沼";
    } else if (
      levelName.includes("洛阳") ||
      levelName.includes("嵩山") ||
      levelName.includes("金国")
    ) {
      bgClass = "bg-gradient-to-b from-stone-700 to-stone-900";
      envName = "青石校场";
    } else if (levelName.includes("黄河") || levelName.includes("铁掌")) {
      bgClass = "bg-gradient-to-b from-blue-800 to-cyan-900";
      envName = "黄河之畔";
    }
  }

  const p1HpPercent = Math.max(0, (playerHp / playerMaxHp) * 100);
  const p2HpPercent = Math.max(0, (enemyHp / enemyMaxHp) * 100);

  // Check for hit animations based on tick results
  let p1HitClass = "";
  let p2HitClass = "";
  let p1AttackClass = "";
  let p2AttackClass = "";
  let p1Img = swordManGif;
  let p2Img = swordManGif;
  let p1MoveName = "";
  let p2MoveName = "";
  let showKiRight = false;
  let showKiLeft = false;

  if (
    isPlaying &&
    currentTick >= 0 &&
    tickResults &&
    tickResults[currentTick]
  ) {
    const tRes = tickResults[currentTick];

    // Player effects
    if (tRes.p1?.is_attack) {
      p1Img = `${roleAttackGif}?t=${currentTick}`;
      p1AttackClass = "translate-x-[20px] scale-105";
      p1MoveName = tRes.p1.move;
      showKiRight = true;
    } else if (tRes.p2?.is_attack) {
      p1Img = `${roleDefenseGif}?t=${currentTick}`;
      if (tRes.p1?.events?.some((r: string) => r.includes("-"))) {
        p1HitClass =
          "translate-x-[-10px] filter brightness-150 sepia hue-rotate-[-50deg] saturate-200"; // Hit flash red and knockback
      } else if (tRes.p1?.events?.includes("闪避")) {
        p1HitClass = "opacity-30 -translate-y-4"; // Dodge jump
      }
    }

    // Enemy effects
    if (tRes.p2?.is_attack) {
      p2Img = `${roleAttackGif}?t=${currentTick}`;
      p2AttackClass = "translate-x-[-20px] scale-105";
      p2MoveName = tRes.p2.move;
      showKiLeft = true;
    } else if (tRes.p1?.is_attack) {
      p2Img = `${roleDefenseGif}?t=${currentTick}`;
      if (tRes.p2?.events?.some((r: string) => r.includes("-"))) {
        p2HitClass =
          "translate-x-[10px] filter brightness-150 sepia hue-rotate-[-50deg] saturate-200"; // Hit flash red and knockback
      } else if (tRes.p2?.events?.includes("闪避")) {
        p2HitClass = "opacity-30 -translate-y-4"; // Dodge jump
      }
    }
  }

  return (
    <div
      className={`relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-600 shadow-xl mb-6 transition-colors duration-1000 ${bgClass}`}
    >
      {/* Dynamic Stage Background */}
      <div
        className="absolute inset-0 w-full h-full opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${stageBg})` }}
      ></div>

      {/* Background Decor (Moon/Sun) */}
      <div className="absolute top-4 right-1/4 w-16 h-16 rounded-full bg-white opacity-20 blur-sm"></div>

      {/* Environment Name Label */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-gray-300 text-sm font-bold border border-gray-700/50 backdrop-blur-sm z-10">
        {envName}
      </div>

      {/* Ki Waves */}
      {showKiRight && (
        <div key={`ki-r-${currentTick}`} className="absolute top-1/2 w-24 h-24 bg-blue-400 rounded-full blur-xl opacity-0 animate-ki-right z-10 pointer-events-none"></div>
      )}
      {showKiLeft && (
        <div key={`ki-l-${currentTick}`} className="absolute top-1/2 w-24 h-24 bg-red-400 rounded-full blur-xl opacity-0 animate-ki-left z-10 pointer-events-none"></div>
      )}

      {/* Floor */}
      <div
        className="absolute bottom-0 w-full h-1/3 bg-black/40 border-t border-white/10"
        style={{
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      ></div>

      {/* Characters Container */}
      <div className="absolute bottom-4 w-full flex justify-between px-16 items-end z-20">
        {/* Player */}
        <div className="relative flex flex-col items-center group">
          {/* Move Name */}
          {p1MoveName && (
            <div key={`p1-move-${currentTick}`} className="absolute -top-12 text-blue-300 font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce whitespace-nowrap z-30">
              {p1MoveName}
            </div>
          )}
          {/* HP Bar */}
          <div className="absolute -top-6 w-16 h-2 bg-gray-800 rounded border border-gray-600 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${p1HpPercent}%` }}
            ></div>
          </div>
          {/* Character GIF */}
          <div
            className={`transition-all duration-150 ${p1AttackClass} ${p1HitClass}`}
          >
            <img
              src={p1Img}
              alt="Player"
              className="h-32 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              style={{ width: "64px" }}
            />
          </div>
          {/* Shadow */}
          <div className="w-12 h-2 bg-black/50 rounded-[100%] mt-1 blur-[1px]"></div>
        </div>

        {/* Enemy */}
        <div className="relative flex flex-col items-center group">
          {/* Move Name */}
          {p2MoveName && (
            <div key={`p2-move-${currentTick}`} className="absolute -top-12 text-red-300 font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce whitespace-nowrap z-30">
              {p2MoveName}
            </div>
          )}
          {/* HP Bar */}
          <div className="absolute -top-6 w-16 h-2 bg-gray-800 rounded border border-gray-600 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${p2HpPercent}%` }}
            ></div>
          </div>
          {/* Character GIF (Flipped) */}
          <div
            className={`transition-all duration-150 ${p2AttackClass} ${p2HitClass}`}
          >
            <img
              src={p2Img}
              alt="Enemy"
              className="h-32 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              style={{ width: "64px", transform: "scaleX(-1)" }}
            />
          </div>
          {/* Shadow */}
          <div className="w-12 h-2 bg-black/50 rounded-[100%] mt-1 blur-[1px]"></div>
        </div>
      </div>

      {/* VS text in the middle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white/20 italic z-0">
        VS
      </div>
    </div>
  );
}
'''
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/Arena.tsx', 'w') as f:
    f.write(arena_content)

