import { useEffect } from 'react';

const getLogColor = (log) => {
  if (log.includes("=== 第"))
    return "text-amber-400 font-bold mt-4 mb-2 text-lg";
  if (log.includes("[第"))
    return "text-gray-400 mt-2 border-b border-gray-800 pb-1";
  if (log.includes("Combo触发!")) return "text-purple-400 font-bold";
  if (log.includes("弱点击破")) return "text-red-400 font-bold";
  if (log.includes("完美闪避")) return "text-green-400 font-bold";
  if (log.includes("造成了")) return "text-red-300";
  if (log.includes("化解部分")) return "text-blue-300";
  if (log.includes("护住了")) return "text-blue-400";
  if (log.includes("额外效果")) return "text-orange-400";
  if (log.startsWith("[")) return "text-gray-100 font-bold";
  return "text-gray-300 ml-4";
};

export default function BattleLog({ turn, displayedLogs, logBoxRef }) {
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [displayedLogs, logBoxRef]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-bold text-amber-500 mb-3">
        第 {turn || 1} 回合 - 战斗记录
      </h3>
      <div
        className="log-container bg-gray-900 p-4 rounded font-mono text-sm leading-relaxed"
        id="logBox"
        ref={logBoxRef}
      >
        {displayedLogs.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            战斗尚未开始...
          </div>
        ) : (
          displayedLogs.map((log, i) => (
            <div
              key={i}
              className={`log-item mb-1 ${getLogColor(log)}`}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}