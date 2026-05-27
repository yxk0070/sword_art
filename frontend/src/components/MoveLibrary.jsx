import { useState } from "react";

export default function MoveLibrary({ moves, addMove, currentDuration }) {
  const [hoveredMove, setHoveredMove] = useState(null);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-bold text-amber-500 mb-3">武功招式库</h3>
      <div className="space-y-2">
        {moves?.map((m, index) => (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredMove(index)}
            onMouseLeave={() => setHoveredMove(null)}
          >
            <button
              onClick={() => addMove(m.name)}
              disabled={currentDuration + m.duration > 12}
              className="w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition border border-gray-600"
            >
              <div className="font-bold">{m.name}</div>
              <div className="text-xs text-gray-400">耗时: {m.duration} 息</div>
            </button>

            {/* Tooltip */}
            {hoveredMove === index && (
              <div className="absolute z-50 left-full top-0 ml-2 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 pointer-events-none transform transition-all duration-200 opacity-100 scale-100">
                <h4 className="font-bold text-amber-500 mb-1">{m.name}</h4>
                <p className="text-xs text-gray-300 mb-3">
                  {m.description || "暂无说明"}
                </p>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 font-semibold mb-1">
                    招式拆解 (共 {m.duration} 息):
                  </div>
                  <div className="flex bg-gray-900 rounded border border-gray-700 h-14 overflow-hidden">
                    {Array.from({ length: m.duration }).map((_, i) => {
                      const node = m.nodes[i];
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center justify-center border-r border-gray-800 last:border-r-0 py-1"
                        >
                          {node ? (
                            <>
                              <span className="text-[10px] font-bold leading-tight">
                                {node.phase}
                              </span>
                              <span
                                className={`text-[9px] leading-tight ${
                                  node.is_attack
                                    ? "text-red-300"
                                    : "text-blue-300"
                                }`}
                              >
                                {node.target_part}
                              </span>
                              <span className="text-[8px] text-gray-400 leading-tight mt-0.5">
                                强度:{node.value_modifier}
                              </span>
                              {node.special_effect && (
                                <span className="text-[8px] text-purple-400 font-bold leading-tight">
                                  {node.get_effect_name()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
