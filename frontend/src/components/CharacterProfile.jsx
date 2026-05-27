import { useState } from "react";
import { getPlayerBaseStats } from "../gameEngine";
import swordManImg from "../assets/role/侠客头像.png";

export default function CharacterProfile({
  innerSkills,
  agilitySkills,
  moves,
  equippedInner,
  setEquippedInner,
  equippedAgility,
  setEquippedAgility,
  playerLevel,
  playerExp,
  playerName,
  setPlayerName,
  onBack,
}) {
  const baseStats = getPlayerBaseStats(playerLevel);
  const expNeeded = playerLevel * 100;

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleNameSave = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    } else {
      setTempName(playerName);
    }
    setIsEditingName(false);
  };

  const selectedInner =
    innerSkills.find((s) => s.name === equippedInner) || innerSkills[0];
  const selectedAgility =
    agilitySkills.find((s) => s.name === equippedAgility) || agilitySkills[0];

  const totalInnerAmount = baseStats.inner_amount + selectedInner.inner_bonus;
  const totalAgility = baseStats.agility + selectedAgility.agility_bonus;

  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-4xl relative">
        <button
          onClick={onBack}
          className="absolute -top-2 left-0 text-gray-400 hover:text-amber-500 flex items-center transition"
        >
          &larr; 返回
        </button>
        <div className="flex flex-col items-center justify-center mb-8 mt-8">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-gray-800 border border-amber-500 rounded px-3 py-1 text-xl font-bold text-amber-500 focus:outline-none w-48 text-center"
                autoFocus
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                maxLength={10}
              />
              <button
                onClick={handleNameSave}
                className="text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded transition"
              >
                保存
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 group">
              <h1
                className="text-3xl font-bold text-amber-500 tracking-widest cursor-pointer"
                onClick={() => setIsEditingName(true)}
              >
                {playerName}
              </h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition"
                title="修改尊姓大名"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 动态头像 */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* 动态光环 */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-[spin_10s_linear_infinite] border-t-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
          <div className="absolute inset-2 rounded-full border-4 border-blue-500/30 animate-[spin_7s_linear_infinite_reverse] border-b-blue-500"></div>

          {/* 头像本体 */}
          <div className="absolute inset-4 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-700 shadow-inner group">
            <img
              src={swordManImg}
              alt="角色头像"
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* 等级与经验条 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-bold text-blue-400">
              等级：{playerLevel}
            </h2>
            <span className="text-sm text-gray-400">
              经验：{playerExp} / {expNeeded}
            </span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (playerExp / expNeeded) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* 属性面板 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-gray-700 pb-2">
            基础属性
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-400">气血：</span>
              {baseStats.hp}
            </div>
            <div>
              <span className="text-gray-400">基础内力：</span>
              {baseStats.inner_amount}
            </div>
            <div>
              <span className="text-gray-400">基础轻功：</span>
              {baseStats.agility}
            </div>
            <div>
              <span className="text-gray-400">基础造诣：</span>
              {baseStats.inner_mastery}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <span className="text-amber-400 font-bold">总内力：</span>
              {totalInnerAmount}{" "}
              <span className="text-xs text-green-400">
                (+{selectedInner.inner_bonus})
              </span>
            </div>
            <div>
              <span className="text-amber-400 font-bold">总轻功：</span>
              {totalAgility}{" "}
              <span className="text-xs text-green-400">
                (+{selectedAgility.agility_bonus})
              </span>
            </div>
          </div>
        </div>

        {/* 装备面板 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 内功选择 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-blue-400 mb-4">内功心法</h2>
            <div className="space-y-3">
              {innerSkills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => setEquippedInner(skill.name)}
                  className={`p-3 rounded border cursor-pointer transition ${
                    equippedInner === skill.name
                      ? "bg-blue-900/30 border-blue-500"
                      : "bg-gray-900 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="font-bold text-gray-200 mb-1">
                    {skill.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {skill.description}
                  </div>
                  <div className="text-xs text-blue-300 mb-1">
                    内力+{skill.inner_bonus} | 造诣+{skill.mastery_bonus}
                  </div>
                  {skill.effect_desc && (
                    <div className="text-xs text-purple-400 font-bold mt-1">
                      ✨ 特效：{skill.effect_desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 轻功选择 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-green-400 mb-4">轻功身法</h2>
            <div className="space-y-3">
              {agilitySkills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => setEquippedAgility(skill.name)}
                  className={`p-3 rounded border cursor-pointer transition ${
                    equippedAgility === skill.name
                      ? "bg-green-900/30 border-green-500"
                      : "bg-gray-900 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="font-bold text-gray-200 mb-1">
                    {skill.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {skill.description}
                  </div>
                  <div className="text-xs text-green-300 mb-1">
                    轻功+{skill.agility_bonus}
                  </div>
                  {skill.effect_desc && (
                    <div className="text-xs text-purple-400 font-bold mt-1">
                      ✨ 特效：{skill.effect_desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 招式列表 */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg md:col-span-2">
            <h2 className="text-xl font-bold text-amber-400 mb-4">
              已领悟招式
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {moves.map((move) => (
                <div
                  key={move.name}
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-sm"
                >
                  <div className="font-bold text-gray-200 mb-1">
                    {move.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    耗时: {move.duration} 息
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {move.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
