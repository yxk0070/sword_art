import { useState, useEffect, useRef } from "react";
import {
  generate_sample_data,
  Character,
  BattleEngine,
  getPlayerBaseStats,
} from "./gameEngine";
import Header from "./components/Header";
import MoveLibrary from "./components/MoveLibrary";
import Timelines from "./components/Timelines";
import BattleLog from "./components/BattleLog";
import DamageCalculationGuide from "./components/DamageCalculationGuide";
import LevelSelection from "./components/LevelSelection";
import CharacterProfile from "./components/CharacterProfile";
import StartScreen from "./components/StartScreen";
import Arena from "./components/Arena";
import { LEVELS } from "./levels";
import enemyImg from "./assets/role/侠客头像.png";

const STATIC_DATA = generate_sample_data();
const { moves: moves_lib, inner_skills, agility_skills } = STATIC_DATA;

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const started = localStorage.getItem("sword_art_has_started");
    return started ? "levelSelect" : "start";
  });
  const [currentLevel, setCurrentLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem("sword_art_completed_levels");
    return saved ? JSON.parse(saved) : [];
  });

  const [unlockedInnerSkills, setUnlockedInnerSkills] = useState(() => {
    const saved = localStorage.getItem("sword_art_unlocked_inner");
    return saved ? JSON.parse(saved) : ["吐纳法"];
  });

  const [unlockedAgilitySkills, setUnlockedAgilitySkills] = useState(() => {
    const saved = localStorage.getItem("sword_art_unlocked_agility");
    return saved ? JSON.parse(saved) : ["水上漂"];
  });

  const [unlockedMoves, setUnlockedMoves] = useState(() => {
    const saved = localStorage.getItem("sword_art_unlocked_moves");
    return saved
      ? JSON.parse(saved)
      : ["太祖长拳-冲步双掌", "太祖长拳-十字踢腿", "太祖长拳-双抄封天"];
  });

  const [playerLevel, setPlayerLevel] = useState(() => {
    const saved = localStorage.getItem("sword_art_player_level");
    return saved ? parseInt(saved) : 1;
  });

  const [playerExp, setPlayerExp] = useState(() => {
    const saved = localStorage.getItem("sword_art_player_exp");
    return saved ? parseInt(saved) : 0;
  });

  const [playerName, setPlayerName] = useState(() => {
    const saved = localStorage.getItem("sword_art_player_name");
    return saved || "小虾米";
  });

  const [equippedInner, setEquippedInner] = useState(
    () => localStorage.getItem("sword_art_equipped_inner") || "吐纳法"
  );
  const [equippedAgility, setEquippedAgility] = useState(
    () => localStorage.getItem("sword_art_equipped_agility") || "水上漂"
  );

  const [state, setState] = useState<any>({});

  useEffect(() => {
    localStorage.setItem(
      "sword_art_completed_levels",
      JSON.stringify(completedLevels)
    );
    localStorage.setItem(
      "sword_art_unlocked_inner",
      JSON.stringify(unlockedInnerSkills)
    );
    localStorage.setItem(
      "sword_art_unlocked_agility",
      JSON.stringify(unlockedAgilitySkills)
    );
    localStorage.setItem(
      "sword_art_unlocked_moves",
      JSON.stringify(unlockedMoves)
    );
    localStorage.setItem("sword_art_player_level", playerLevel.toString());
    localStorage.setItem("sword_art_player_exp", playerExp.toString());
    localStorage.setItem("sword_art_player_name", playerName);
  }, [
    completedLevels,
    unlockedInnerSkills,
    unlockedAgilitySkills,
    unlockedMoves,
    playerLevel,
    playerExp,
    playerName,
  ]);

  useEffect(() => {
    localStorage.setItem("sword_art_equipped_inner", equippedInner);
    localStorage.setItem("sword_art_equipped_agility", equippedAgility);
  }, [equippedInner, equippedAgility]);
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTick, setCurrentTick] = useState(-1);
  const [animatedHp, setAnimatedHp] = useState({
    p1: 0,
    p2: 0,
    p1Max: 0,
    p2Max: 0,
  });
  const logBoxRef = useRef(null);

  const getEnemyImgPath = (enemyName: string) => {
    return new URL(`./assets/enemies/${enemyName}.png`, import.meta.url).href;
  };

  // Game instance ref to persist engine state across renders
  const engineRef = useRef(null);

  const initGame = (levelId) => {
    const levelDef = LEVELS.find((l) => l.id === levelId);

    const pStats = getPlayerBaseStats(playerLevel);
    const player = new Character(
      playerName,
      pStats.hp,
      pStats.inner_amount,
      pStats.inner_mastery,
      pStats.agility,
      pStats.weapon_atk,
      pStats.armor_def
    );
    player.equipped_inner_skill =
      inner_skills.find((s) => s.name === equippedInner) || inner_skills[0];
    player.equipped_agility_skill =
      agility_skills.find((s) => s.name === equippedAgility) ||
      agility_skills[0];

    const enemy = new Character(
      levelDef.enemyName,
      levelDef.hp,
      levelDef.inner_amount,
      levelDef.inner_mastery,
      levelDef.agility,
      levelDef.weapon_atk,
      levelDef.armor_def
    );
    enemy.equipped_inner_skill =
      inner_skills.find((s) => s.name === levelDef.inner_skill) ||
      inner_skills[2];
    enemy.equipped_agility_skill =
      agility_skills.find((s) => s.name === levelDef.agility_skill) ||
      agility_skills[2];

    const engine = new BattleEngine(player, enemy);

    engineRef.current = engine;

    // Generate initial enemy intent
    const initial_enemy_moves = [];
    let initial_enemy_duration = 0;
    const enemy_move_pool = levelDef.enemy_moves
      ? levelDef.enemy_moves
          .map((name) => moves_lib.find((m) => m.name === name))
          .filter(Boolean)
      : moves_lib;

    while (initial_enemy_duration < 12) {
      const move =
        enemy_move_pool[Math.floor(Math.random() * enemy_move_pool.length)];
      if (initial_enemy_duration + move.duration <= 12) {
        initial_enemy_moves.push(move);
        initial_enemy_duration += move.duration;
      } else {
        break;
      }
    }

    return {
      player,
      enemy,
      turn: engine.turn,
      game_over: false,
      winner: null,
      moves: moves_lib,
      inner_skills,
      agility_skills,
      enemy_intent: initial_enemy_moves.map((m) => m.name),
    };
  };

  const startLevel = (levelId) => {
    const initialState = initGame(levelId);
    setCurrentLevel(levelId);
    setState(initialState);
    setAnimatedHp({
      p1: initialState.player.hp,
      p2: initialState.enemy.hp,
      p1Max: initialState.player.max_hp,
      p2Max: initialState.enemy.max_hp,
    });
    setDisplayedLogs([]);
    setSelectedMoves([]);
    setCurrentTick(-1);
    setIsPlaying(false);
    setCurrentView("battle");
    window.scrollTo(0, 0);
  };

  const returnToLevelSelect = () => {
    setCurrentView("levelSelect");
    setState({});
    window.scrollTo(0, 0);
  };

  const handleStartGame = (startData) => {
    setPlayerName(startData.name);
    setEquippedInner(startData.inner);
    setEquippedAgility(startData.agility);

    // Unlock all moves in the selected set
    const initialMoves = moves_lib
      .filter((m) => m.set_name === startData.moveSet)
      .map((m) => m.name);
    setUnlockedMoves(initialMoves);

    setUnlockedInnerSkills([startData.inner]);
    setUnlockedAgilitySkills([startData.agility]);
    setCompletedLevels([]);
    setPlayerLevel(1);
    setPlayerExp(0);
    localStorage.setItem("sword_art_has_started", "true");
    setCurrentView("levelSelect");
    window.scrollTo(0, 0);
  };

  const handleUnlockAll = () => {
    if (window.confirm("确定要一键解锁所有关卡吗（Debug）？")) {
      setCompletedLevels(LEVELS.map((l) => l.id));
    }
  };

  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  const currentDuration = selectedMoves.reduce((total, idx) => {
    if (!state.moves) return total;
    return total + state.moves[idx].duration;
  }, 0);

  const addMove = (moveName) => {
    if (state.moves) {
      const idx = state.moves.findIndex((m) => m.name === moveName);
      if (idx !== -1 && currentDuration + state.moves[idx].duration <= 12) {
        setSelectedMoves([...selectedMoves, idx]);
      }
    }
  };

  const removeMove = (index) => {
    const newMoves = [...selectedMoves];
    newMoves.splice(index, 1);
    setSelectedMoves(newMoves);
  };

  const clearMoves = () => {
    setSelectedMoves([]);
  };

  const submitTurn = async () => {
    if (selectedMoves.length === 0 || isPlaying) return;
    setIsPlaying(true);
    setDisplayedLogs([]);
    setCurrentTick(0);

    try {
      const engine = engineRef.current;
      const playerMoves = selectedMoves.map((idx) => state.moves[idx]);
      const levelDef = LEVELS.find((l) => l.id === currentLevel);
      const enemy_move_pool = levelDef.enemy_moves
        ? levelDef.enemy_moves
            .map((name) => state.moves.find((m) => m.name === name))
            .filter(Boolean)
        : state.moves;

      // Generate enemy moves for this turn if not already generated
      let enemyMoves = [];
      if (state.enemy_intent) {
        enemyMoves = state.enemy_intent.map((name) =>
          state.moves.find((m) => m.name === name)
        );
      } else {
        let enemyDuration = 0;
        while (enemyDuration < 12) {
          const move =
            enemy_move_pool[Math.floor(Math.random() * enemy_move_pool.length)];
          if (enemyDuration + move.duration <= 12) {
            enemyMoves.push(move);
            enemyDuration += move.duration;
          } else {
            break;
          }
        }
      }

      // Run engine locally
      const { logs, hp_history, tick_results } = engine.play_turn(
        playerMoves,
        enemyMoves
      );

      setState((s: any) => ({
        ...s,
        tick_results,
      }));

      // Determine game state
      let game_over = false;
      let winner = null;
      if (!engine.p1.is_alive() && !engine.p2.is_alive()) {
        game_over = true;
        winner = "Draw";
      } else if (!engine.p1.is_alive()) {
        game_over = true;
        winner = engine.p2.name;
      } else if (!engine.p2.is_alive()) {
        game_over = true;
        winner = engine.p1.name;
      }

      if (winner === engine.p1.name) {
        setCompletedLevels((prev) => {
          if (!prev.includes(currentLevel)) {
            return [...prev, currentLevel];
          }
          return prev;
        });

        // Handle rewards
        const levelDef = LEVELS.find((l) => l.id === currentLevel);
        let expGained = 0;

        if (levelDef && levelDef.rewards) {
          levelDef.rewards.forEach((reward) => {
            if (reward.includes("经验+")) {
              expGained += parseInt(reward.split("+")[1], 10) || 0;
            } else if (reward.includes("内功-")) {
              const skillName = reward.split("-")[1];
              setUnlockedInnerSkills((prev) =>
                prev.includes(skillName) ? prev : [...prev, skillName]
              );
            } else if (reward.includes("轻功-")) {
              const skillName = reward.split("-")[1];
              setUnlockedAgilitySkills((prev) =>
                prev.includes(skillName) ? prev : [...prev, skillName]
              );
            } else if (reward.includes("招式-")) {
              const setName = reward.split("-")[1];
              // Add all moves with this set_name
              const newMoves = state.moves
                .filter((m) => m.set_name === setName)
                .map((m) => m.name);
              setUnlockedMoves((prev) => {
                const combined = [...new Set([...prev, ...newMoves])];
                return combined;
              });
            }
          });
        }

        // Apply EXP and Level Up
        if (expGained > 0) {
          setPlayerExp((prevExp) => {
            let newExp = prevExp + expGained;
            setPlayerLevel((prevLevel) => {
              let newLevel = prevLevel;
              let expNeeded = newLevel * 100;
              while (newExp >= expNeeded) {
                newExp -= expNeeded;
                newLevel += 1;
                expNeeded = newLevel * 100;
              }
              return newLevel;
            });
            return newExp;
          });
        }
      }

      // Generate intent for next turn if game is not over
      let new_enemy_intent = null;
      if (!game_over) {
        const new_enemy_moves = [];
        let new_enemy_duration = 0;
        while (new_enemy_duration < 12) {
          const move =
            enemy_move_pool[Math.floor(Math.random() * enemy_move_pool.length)];
          if (new_enemy_duration + move.duration <= 12) {
            new_enemy_moves.push(move);
            new_enemy_duration += move.duration;
          } else {
            break;
          }
        }
        new_enemy_intent = new_enemy_moves.map((m) => m.name);
      }

      // Construct data object to mimic API response structure
      const data = {
        logs,
        hp_history,
        player: { ...engine.p1, hp: engine.p1.hp, max_hp: engine.p1.max_hp }, // Simplified dict mapping
        enemy: { ...engine.p2, hp: engine.p2.hp, max_hp: engine.p2.max_hp },
        turn: engine.turn,
        game_over,
        winner,
        enemy_intent: new_enemy_intent,
      };

      // Play logs tick by tick
      let currentLogIndex = 0;
      const interval = setInterval(() => {
        if (currentLogIndex < data.logs.length) {
          // Batch process logs for the current tick
          const currentLogsBatch = [];
          let nextLog = data.logs[currentLogIndex];
          let foundTickHeader = false;
          let parsedTick = currentTick;

          // If the current log is a tick header, process all logs until the next tick header or end
          if (
            nextLog.match(/\[第 (\d+) 息\]/) ||
            nextLog.match(/=== 第 \d+ 回合 ===/)
          ) {
            if (nextLog.match(/\[第 (\d+) 息\]/)) {
              parsedTick = parseInt(nextLog.match(/\[第 (\d+) 息\]/)[1]) - 1;
            }
            currentLogsBatch.push(nextLog);
            currentLogIndex++;

            while (currentLogIndex < data.logs.length) {
              const peekLog = data.logs[currentLogIndex];
              if (
                peekLog.match(/\[第 (\d+) 息\]/) ||
                peekLog.match(/=== 第 \d+ 回合 ===/)
              ) {
                break; // Stop before the next tick header
              }
              currentLogsBatch.push(peekLog);
              currentLogIndex++;
            }
          } else {
            // For any stray logs (shouldn't happen often, but just in case)
            currentLogsBatch.push(nextLog);
            currentLogIndex++;
          }

          setDisplayedLogs((prev) => [...prev, ...currentLogsBatch]);

          if (parsedTick !== currentTick) {
            setCurrentTick(parsedTick);
            // Sync HP for this tick
            const tickHp = data.hp_history.find((h) => h.tick === parsedTick);
            if (tickHp) {
              setAnimatedHp((prev) => ({
                ...prev,
                p1: tickHp.p1_hp,
                p2: tickHp.p2_hp,
              }));
            }
          }
        } else {
          clearInterval(interval);
          setState((prev) => ({
            ...prev,
            player: data.player,
            enemy: data.enemy,
            turn: data.turn,
            game_over: data.game_over,
            winner: data.winner,
            enemy_intent: data.enemy_intent,
          }));
          setAnimatedHp((prev) => ({
            ...prev,
            p1: data.player.hp,
            p2: data.enemy.hp,
          }));
          setSelectedMoves([]);
          setIsPlaying(false);
          setCurrentTick(-1);
        }
      }, 500); // 500ms per tick
    } catch (err) {
      console.error("Failed to submit turn:", err);
      setIsPlaying(false);
      setCurrentTick(-1);
    }
  };

  const resetGame = () => {
    startLevel(currentLevel);
  };

  if (currentView === "start") {
    return (
      <StartScreen
        innerSkills={inner_skills}
        agilitySkills={agility_skills}
        moves={moves_lib}
        onStartGame={handleStartGame}
      />
    );
  }

  if (currentView === "profile") {
    const availableInner = inner_skills.filter((s) =>
      unlockedInnerSkills.includes(s.name)
    );
    const availableAgility = agility_skills.filter((s) =>
      unlockedAgilitySkills.includes(s.name)
    );
    const availableMoves = moves_lib.filter((m) =>
      unlockedMoves.includes(m.name)
    );

    return (
      <CharacterProfile
        innerSkills={availableInner}
        agilitySkills={availableAgility}
        moves={availableMoves}
        equippedInner={equippedInner}
        setEquippedInner={setEquippedInner}
        equippedAgility={equippedAgility}
        setEquippedAgility={setEquippedAgility}
        playerLevel={playerLevel}
        playerExp={playerExp}
        playerName={playerName}
        setPlayerName={setPlayerName}
        onBack={() => {
          setCurrentView("levelSelect");
          window.scrollTo(0, 0);
        }}
        onRestart={() => {
          localStorage.removeItem("sword_art_has_started");
          setCurrentView("start");
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  if (currentView === "levelSelect") {
    return (
      <LevelSelection
        levels={LEVELS}
        onSelect={startLevel}
        completedLevels={completedLevels}
        onProfileClick={() => {
          setCurrentView("profile");
          window.scrollTo(0, 0);
        }}
        onUnlockAll={handleUnlockAll}
      />
    );
  }

  if (!state.player) {
    return (
      <div className="bg-gray-900 text-gray-100 font-sans min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen flex flex-col">
      <Header
        player={state.player}
        enemy={state.enemy}
        animatedHp={animatedHp}
        playerLevel={playerLevel}
        onBack={returnToLevelSelect}
      />

      <div className="container mx-auto p-4 max-w-7xl flex-1 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：玩家状态与招式选择 */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            {/* 玩家状态 */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
              <div className="flex flex-col items-center mb-4 border-b border-gray-700 pb-4">
                <div className="w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden mb-2 shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-gray-900 group relative">
                  <img
                    src={enemyImg}
                    alt="玩家头像"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h2 className="text-xl font-bold text-blue-400">
                  {state.player?.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <span className="text-gray-400">
                  基础轻功: {state.player?.base_agility}
                </span>
                <span className="text-gray-400">
                  基础内力: {state.player?.base_inner_amount}
                </span>
                <span className="text-green-400 font-bold">
                  总轻功: {state.player?.agility}
                </span>
                <span className="text-blue-400 font-bold">
                  总内力: {state.player?.inner_amount}
                </span>
              </div>

              <div className="space-y-2 mt-2 pt-2 border-t border-gray-700">
                <div className="relative group cursor-help">
                  <span className="text-gray-400 text-xs">内功:</span>{" "}
                  {state.player?.equipped_inner_skill?.name}
                  {state.player?.equipped_inner_skill?.special_effect && (
                    <div className="absolute hidden group-hover:block z-50 left-0 top-full mt-1 w-64 bg-gray-800 border border-gray-600 rounded shadow-xl p-2 text-xs text-gray-300">
                      <div>{state.player.equipped_inner_skill.description}</div>
                      <div className="text-purple-400 font-bold mt-1">
                        ✨ 特效：{state.player.equipped_inner_skill.effect_desc}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative group cursor-help">
                  <span className="text-gray-400 text-xs">轻功:</span>{" "}
                  {state.player?.equipped_agility_skill?.name}
                  {state.player?.equipped_agility_skill?.special_effect && (
                    <div className="absolute hidden group-hover:block z-50 left-0 top-full mt-1 w-64 bg-gray-800 border border-gray-600 rounded shadow-xl p-2 text-xs text-gray-300">
                      <div>
                        {state.player.equipped_agility_skill.description}
                      </div>
                      <div className="text-purple-400 font-bold mt-1">
                        ✨ 特效：
                        {state.player.equipped_agility_skill.effect_desc}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 招式选择 */}
            {!state.game_over && (
              <MoveLibrary
                moves={state.moves.filter((m) =>
                  unlockedMoves.includes(m.name)
                )}
                addMove={addMove}
                currentDuration={currentDuration}
              />
            )}
          </div>

          {/* 中间：时间线与战斗日志 */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* 擂台动图展示 */}
            <Arena
              levelName={LEVELS.find((l) => l.id === currentLevel)?.name}
              playerHp={animatedHp.p1}
              enemyHp={animatedHp.p2}
              playerMaxHp={animatedHp.p1Max}
              enemyMaxHp={animatedHp.p2Max}
              isPlaying={isPlaying}
              currentTick={currentTick}
              tickResults={state.tick_results}
            />

            {/* 时间线编排 */}
            <Timelines
              currentDuration={currentDuration}
              selectedMoves={selectedMoves}
              moves={state.moves}
              removeMove={removeMove}
              clearMoves={clearMoves}
              submitTurn={submitTurn}
              isPlaying={isPlaying}
              currentTick={currentTick}
              gameOver={state.game_over}
              enemyIntent={state.enemy_intent}
              tickResults={state.tick_results}
            />

            {/* 战斗日志 */}
            <BattleLog
              turn={state.turn}
              displayedLogs={displayedLogs}
              logBoxRef={logBoxRef}
            />
          </div>

          {/* 右侧：敌人状态 */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            {/* 敌人状态 */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
              <div className="flex flex-col items-center mb-4 border-b border-gray-700 pb-4">
                <div className="w-24 h-24 rounded-full border-2 border-red-500 overflow-hidden mb-2 shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-gray-900 group relative">
                  <img
                    src={
                      state.enemy?.name
                        ? getEnemyImgPath(state.enemy.name)
                        : enemyImg
                    }
                    alt={state.enemy?.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = enemyImg; // 回退到默认头像
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold text-red-400">
                  {state.enemy?.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <span className="text-gray-400">
                  基础轻功: {state.enemy?.base_agility}
                </span>
                <span className="text-gray-400">
                  基础内力: {state.enemy?.base_inner_amount}
                </span>
                <span className="text-green-400 font-bold">
                  总轻功: {state.enemy?.agility}
                </span>
                <span className="text-blue-400 font-bold">
                  总内力: {state.enemy?.inner_amount}
                </span>
              </div>
              <div className="space-y-2 mt-2 pt-2 border-t border-gray-700 text-sm">
                <div className="relative group cursor-help">
                  <span className="text-gray-400 text-xs">内功:</span>{" "}
                  {state.enemy?.equipped_inner_skill?.name}
                  {state.enemy?.equipped_inner_skill?.special_effect && (
                    <div className="absolute hidden group-hover:block z-50 left-0 top-full mt-1 w-64 bg-gray-800 border border-gray-600 rounded shadow-xl p-2 text-xs text-gray-300">
                      <div>{state.enemy.equipped_inner_skill.description}</div>
                      <div className="text-purple-400 font-bold mt-1">
                        ✨ 特效：{state.enemy.equipped_inner_skill.effect_desc}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative group cursor-help">
                  <span className="text-gray-400 text-xs">轻功:</span>{" "}
                  {state.enemy?.equipped_agility_skill?.name}
                  {state.enemy?.equipped_agility_skill?.special_effect && (
                    <div className="absolute hidden group-hover:block z-50 left-0 top-full mt-1 w-64 bg-gray-800 border border-gray-600 rounded shadow-xl p-2 text-xs text-gray-300">
                      <div>
                        {state.enemy.equipped_agility_skill.description}
                      </div>
                      <div className="text-purple-400 font-bold mt-1">
                        ✨ 特效：
                        {state.enemy.equipped_agility_skill.effect_desc}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部：战斗说明 */}
        {!state.game_over && (
          <div className="mt-6">
            <DamageCalculationGuide />
          </div>
        )}
      </div>

      {/* 战斗结算弹窗 */}
      {state.game_over && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`bg-gray-800 border-2 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center transform transition-all ${
              state.winner === state.player?.name
                ? "border-amber-500 shadow-amber-900/50"
                : "border-red-600 shadow-red-900/50"
            }`}
          >
            <h2
              className={`text-3xl font-bold mb-2 ${
                state.winner === state.player?.name
                  ? "text-amber-400"
                  : "text-red-500"
              }`}
            >
              {state.winner === state.player?.name ? "战斗胜利" : "战斗失败"}
            </h2>
            <p className="text-gray-400 mb-6">
              {state.winner === state.player?.name
                ? "大侠武艺高强，令人钦佩！"
                : "胜败乃兵家常事，大侠请重新来过。"}
            </p>

            {state.winner === state.player?.name &&
              LEVELS.find((l) => l.id === currentLevel)?.rewards && (
                <div className="mb-6 bg-gray-900 rounded p-4 border border-gray-700">
                  <div className="text-sm text-purple-400 font-bold mb-2">
                    🎁 获得战利品：
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {LEVELS.find((l) => l.id === currentLevel).rewards.map(
                      (r, i) => (
                        <li key={i}>{r}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            <div className="flex flex-col space-y-3">
              {state.winner !== state.player?.name && (
                <button
                  onClick={resetGame}
                  className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded shadow transition"
                >
                  再次挑战
                </button>
              )}
              <button
                onClick={returnToLevelSelect}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow transition"
              >
                返回江湖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
