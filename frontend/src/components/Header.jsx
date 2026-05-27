export default function Header({
  player,
  enemy,
  animatedHp,
  onBack,
  playerLevel,
}) {
  return (
    <div className="w-full bg-gray-800 border-b border-gray-700 shadow-md p-4 sticky top-0 z-10">
      <div className="container mx-auto max-w-5xl relative">
        <div className="flex justify-between items-center relative">
          {/* 返回按钮 */}
          <button
            onClick={onBack}
            className="absolute -top-3 left-0 text-xs text-gray-400 hover:text-amber-500 flex items-center transition"
          >
            &larr; 返回关卡
          </button>

          {/* 玩家血条 */}
          <div className="flex-1 max-w-sm mt-3">
            <div className="flex justify-between items-end mb-1">
              <h2 className="text-xl font-bold text-blue-400">
                {player?.name}{" "}
                <span className="text-xs text-amber-500 ml-1">
                  Lv.{playerLevel || 1}
                </span>
              </h2>
              <span className="text-sm text-gray-300 font-mono">
                气血: {animatedHp.p1} / {animatedHp.p1Max}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-full health-bar"
                style={{
                  width: `${
                    Math.max(0, animatedHp.p1 / animatedHp.p1Max) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="px-8 text-2xl font-black text-amber-500 italic tracking-widest">
            VS
          </div>

          {/* Enemy HP */}
          <div className="flex-1 max-w-sm">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm text-gray-300 font-mono">
                气血: {animatedHp.p2} / {animatedHp.p2Max}
              </span>
              <h2 className="text-xl font-bold text-red-400">{enemy?.name}</h2>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner overflow-hidden flex justify-end">
              <div
                className="bg-gradient-to-l from-red-600 to-red-400 h-full health-bar"
                style={{
                  width: `${
                    Math.max(0, animatedHp.p2 / animatedHp.p2Max) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
