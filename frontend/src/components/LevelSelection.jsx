import { useState, useEffect, useRef, useMemo } from "react";

export default function LevelSelection({
  levels,
  onSelect,
  completedLevels = [],
  onProfileClick,
}) {
  const unlockedLevels = useMemo(() => {
    const unlocked = new Set([1]); // 第一关默认解锁
    // 根据 completedLevels 计算已解锁关卡
    levels.forEach((level) => {
      if (completedLevels.includes(level.id)) {
        (level.next || []).forEach((nextId) => unlocked.add(nextId));
      }
    });
    return unlocked;
  }, [levels, completedLevels]);

  // Build Tiers for Tree layout
  const tiers = [];
  let currentTier = [1];
  let processed = new Set([1]);
  while (currentTier.length > 0) {
    tiers.push(currentTier.map((id) => levels.find((l) => l.id === id)));
    let nextTier = [];
    currentTier.forEach((id) => {
      const lvl = levels.find((l) => l.id === id);
      (lvl.next || []).forEach((nextId) => {
        if (!processed.has(nextId)) {
          processed.add(nextId);
          nextTier.push(nextId);
        }
      });
    });
    currentTier = nextTier;
  }
  tiers.reverse(); // Bottom to Top

  const containerRef = useRef(null);
  const nodeRefs = useRef({});
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const newConnections = [];
      const containerRect = containerRef.current.getBoundingClientRect();

      levels.forEach((level) => {
        const startNode = nodeRefs.current[level.id];
        if (!startNode) return;
        (level.next || []).forEach((nextId) => {
          const endNode = nodeRefs.current[nextId];
          if (!endNode) return;

          const startRect = startNode.getBoundingClientRect();
          const endRect = endNode.getBoundingClientRect();

          newConnections.push({
            id: `${level.id}-${nextId}`,
            x1: startRect.left + startRect.width / 2 - containerRect.left,
            y1: startRect.top + startRect.height / 2 - containerRect.top,
            x2: endRect.left + endRect.width / 2 - containerRect.left,
            y2: endRect.top + endRect.height / 2 - containerRect.top,
            isActive: unlockedLevels.has(nextId),
          });
        });
      });
      setConnections(newConnections);
    };

    updateLines();
    // slight delay to ensure DOM is settled
    const timeoutId = setTimeout(updateLines, 50);
    window.addEventListener("resize", updateLines);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateLines);
    };
  }, [levels, completedLevels, unlockedLevels]);

  const resetProgress = () => {
    if (
      window.confirm("确定要重置所有游戏进度吗？这将清空已解锁的关卡和武学。")
    ) {
      localStorage.removeItem("sword_art_completed_levels");
      localStorage.removeItem("sword_art_unlocked_inner");
      localStorage.removeItem("sword_art_unlocked_agility");
      localStorage.removeItem("sword_art_unlocked_moves");
      localStorage.removeItem("sword_art_equipped_inner");
      localStorage.removeItem("sword_art_equipped_agility");
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen flex flex-col items-center p-8 relative overflow-x-hidden">
      <div className="absolute top-8 right-8 z-20 flex space-x-4">
        <button
          onClick={resetProgress}
          className="px-4 py-2 bg-red-800/80 hover:bg-red-700 text-white font-bold rounded shadow border border-red-600 transition text-sm flex items-center"
        >
          重置进度
        </button>
        <button
          onClick={onProfileClick}
          className="bg-blue-800 hover:bg-blue-700 text-blue-100 font-bold py-2 px-6 rounded shadow border border-blue-600 transition"
        >
          人物属性
        </button>
      </div>

      <h1 className="text-4xl font-bold text-amber-500 mb-2 tracking-widest mt-10 z-20">
        江湖路远
      </h1>
      <p className="text-gray-400 mb-10 z-20">选择你要挑战的对手</p>

      <div
        ref={containerRef}
        className="relative w-full max-w-5xl flex-1 flex flex-col justify-end items-center pb-20"
      >
        {/* SVG Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {connections.map((conn) => (
            <line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={conn.isActive ? "#d97706" : "#374151"}
              strokeWidth="4"
              strokeDasharray={conn.isActive ? "none" : "8, 8"}
              className="transition-all duration-500"
            />
          ))}
        </svg>

        {/* Tiers */}
        {tiers.map((tier, tierIdx) => (
          <div
            key={tierIdx}
            className="flex justify-center gap-x-16 w-full my-8 z-20"
          >
            {tier.map((level) => {
              const isCompleted = completedLevels.includes(level.id);
              const isUnlocked = unlockedLevels.has(level.id);
              const isLocked = !isUnlocked;

              return (
                <div
                  key={level.id}
                  ref={(el) => (nodeRefs.current[level.id] = el)}
                  className={`w-64 border rounded-xl p-4 flex flex-col relative transition-all duration-300 transform group hover:z-50 ${
                    isLocked
                      ? "bg-gray-900 border-gray-800 opacity-60 grayscale"
                      : isCompleted
                      ? "bg-gray-800 border-green-600 shadow-green-900/40 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                      : "bg-gray-800 border-amber-600 shadow-amber-900/40 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isLocked) onSelect(level.id);
                  }}
                >
                  {/* Status Badges */}
                  {isCompleted && (
                    <div className="absolute -top-3 -right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                      已通关
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute -top-3 -right-3 bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                      未解锁
                    </div>
                  )}
                  {!isCompleted && !isLocked && (
                    <div className="absolute -top-3 -right-3 bg-red-700 text-white text-xs px-2 py-1 rounded-full font-bold shadow animate-pulse">
                      激战
                    </div>
                  )}

                  <div className="text-center mb-2">
                    <h2
                      className={`text-lg font-bold ${
                        isLocked
                          ? "text-gray-500"
                          : isCompleted
                          ? "text-green-400"
                          : "text-amber-400"
                      }`}
                    >
                      {isLocked
                        ? "???"
                        : level.name.split("：")[1] || level.name}
                    </h2>
                    {!isLocked && (
                      <div className="text-xs text-gray-400 mt-1">
                        {level.enemyName} | HP: {level.hp}
                      </div>
                    )}
                  </div>

                  {/* Rewards Section */}
                  {!isLocked && level.rewards && level.rewards.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="text-xs font-bold text-purple-400 mb-1">
                        🎁 关卡收益：
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1 pl-1">
                        {level.rewards.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tooltip on hover (CSS only) */}
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-56 bg-gray-900 border border-gray-600 rounded-lg p-4 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl hidden md:block scale-95 group-hover:scale-100">
                    <div className="text-sm font-bold text-amber-500 mb-2 border-b border-gray-700 pb-2">
                      {isLocked ? "未知关卡" : level.name}
                    </div>

                    {!isLocked && (
                      <>
                        <div className="text-xs text-gray-400 mb-2">
                          {level.description}
                        </div>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>内功: {level.inner_skill}</div>
                          <div>轻功: {level.agility_skill}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
