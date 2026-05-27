const COLORS = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-indigo-600",
];

const getColorClass = (i) => COLORS[i % COLORS.length];

export default function Timelines({
  currentDuration,
  selectedMoves,
  moves,
  removeMove,
  clearMoves,
  submitTurn,
  isPlaying,
  currentTick,
  gameOver,
  enemyIntent,
  tickResults,
}: any) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-lg font-bold text-amber-500">
          本回合招式编排 ({currentDuration} / 12 息)
        </h3>
        <div className="space-x-2">
          <button
            onClick={clearMoves}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded transition"
          >
            清空
          </button>
          <button
            onClick={submitTurn}
            disabled={selectedMoves.length === 0 || gameOver || isPlaying}
            className="px-4 py-1 text-sm bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition disabled:opacity-50"
          >
            确认出招
          </button>
        </div>
      </div>

      <div className="flex bg-gray-900 rounded border border-gray-700 overflow-hidden">
        {selectedMoves.map((mIdx, moveListIndex) => {
          const move = moves[mIdx];
          // Calculate the starting tick index for this move
          let startTick = 0;
          for (let i = 0; i < moveListIndex; i++) {
            startTick += moves[selectedMoves[i]].duration;
          }

          return (
            <div
              key={moveListIndex}
              onClick={() => !isPlaying && removeMove(moveListIndex)}
              className={`flex flex-col border-r border-gray-800 transition ${
                !isPlaying ? "cursor-pointer hover:bg-opacity-80" : ""
              } ${getColorClass(moveListIndex)}`}
              style={{ width: `${(move.duration / 12) * 100}%` }}
              title={!isPlaying ? "点击移除" : ""}
            >
              <div className="h-6 flex items-center justify-center text-xs font-bold border-b border-gray-900/30">
                {move.name}
              </div>
              <div className="flex h-12 w-full">
                {Array.from({ length: move.duration }).map((_, tickOffset) => {
                  const tickIndex = startTick + tickOffset;
                  const node = move.nodes[tickOffset];
                  const isHighlighted = isPlaying && currentTick === tickIndex;

                  return (
                    <div
                      key={tickOffset}
                      className={`relative flex-1 flex flex-col items-center justify-center border-r border-gray-900/30 last:border-r-0 ${
                        isHighlighted
                          ? "bg-white/30 shadow-inner"
                          : "bg-black/10"
                      }`}
                    >
                      {node ? (
                        <>
                          <span className="text-[10px] leading-tight font-bold">
                            {node.phase}
                          </span>
                          <span
                            className={`text-[9px] leading-tight ${
                              node.is_attack ? "text-red-200" : "text-blue-200"
                            }`}
                          >
                            {node.target_part}
                          </span>
                          {node.special_effect && (
                            <span className="text-[8px] text-purple-300 font-bold leading-tight mt-0.5">
                              {node.get_effect_name()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400">-</span>
                      )}

                      {tickResults &&
                        tickIndex < currentTick &&
                        tickResults[tickIndex]?.p1?.length > 0 && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center pointer-events-none p-0.5">
                            {tickResults[tickIndex].p1.map(
                              (res: string, idx: number) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] font-bold leading-tight drop-shadow-md ${
                                    res.includes("-")
                                      ? "text-red-400"
                                      : res.includes("+")
                                      ? "text-green-400"
                                      : "text-amber-400"
                                  }`}
                                >
                                  {res}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {currentDuration < 12 && (
          <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
            剩余 {12 - currentDuration} 息
          </div>
        )}
      </div>

      {/* 敌方意图时间线（仅在出招时显示） */}
      {isPlaying && enemyIntent && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-bold text-red-400 mb-3">
            敌方本回合出招
          </h3>
          <div className="flex bg-gray-900 rounded border border-gray-700 overflow-hidden">
            {enemyIntent.map((intentName, moveListIndex) => {
              const moveDef = moves?.find((m) => m.name === intentName);
              const duration = moveDef ? moveDef.duration : 3;

              // Calculate the starting tick index for this move
              let startTick = 0;
              for (let i = 0; i < moveListIndex; i++) {
                const prevMove = moves?.find((m) => m.name === enemyIntent[i]);
                startTick += prevMove ? prevMove.duration : 3;
              }

              return (
                <div
                  key={moveListIndex}
                  className="flex flex-col border-r border-gray-800 bg-red-900/60 text-red-100"
                  style={{ width: `${(duration / 12) * 100}%` }}
                >
                  <div className="h-6 flex items-center justify-center text-xs font-bold border-b border-gray-900/30">
                    {intentName}
                  </div>
                  <div className="flex h-12 w-full">
                    {Array.from({ length: duration }).map((_, tickOffset) => {
                      const tickIndex = startTick + tickOffset;
                      const node = moveDef?.nodes?.[tickOffset];
                      const isHighlighted =
                        isPlaying && currentTick === tickIndex;

                      return (
                        <div
                          key={tickOffset}
                          className={`relative flex-1 flex flex-col items-center justify-center border-r border-gray-900/30 last:border-r-0 ${
                            isHighlighted
                              ? "bg-white/30 shadow-inner"
                              : "bg-black/10"
                          }`}
                        >
                          {node ? (
                            <>
                              <span className="text-[10px] leading-tight font-bold">
                                {node.phase}
                              </span>
                              <span
                                className={`text-[9px] leading-tight ${
                                  node.is_attack
                                    ? "text-red-200"
                                    : "text-blue-200"
                                }`}
                              >
                                {node.target_part}
                              </span>
                              {node.special_effect && (
                                <span className="text-[8px] text-purple-300 font-bold leading-tight mt-0.5">
                                  {node.get_effect_name()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400">-</span>
                          )}

                          {tickResults &&
                            tickIndex < currentTick &&
                            tickResults[tickIndex]?.p2?.length > 0 && (
                              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center pointer-events-none p-0.5">
                                {tickResults[tickIndex].p2.map(
                                  (res: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className={`text-[10px] font-bold leading-tight drop-shadow-md ${
                                        res.includes("-")
                                          ? "text-red-400"
                                          : res.includes("+")
                                          ? "text-green-400"
                                          : "text-amber-400"
                                      }`}
                                    >
                                      {res}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
