import { useState } from "react";

export default function StartScreen({
  innerSkills,
  agilitySkills,
  moves,
  onStartGame,
}: any) {
  const [name, setName] = useState("小虾米");

  // Filter only "入门" level
  const starterInner = innerSkills.filter((s) => s.level === "入门");
  const starterAgility = agilitySkills.filter((s) => s.level === "入门");

  // Group moves by set_name
  const starterMoves = moves.filter((m) => m.level === "入门");
  const moveSets = Array.from(new Set(starterMoves.map((m) => m.set_name)));

  const [selectedInner, setSelectedInner] = useState(
    starterInner[0]?.name || ""
  );
  const [selectedAgility, setSelectedAgility] = useState(
    starterAgility[0]?.name || ""
  );
  const [selectedMoveSet, setSelectedMoveSet] = useState(moveSets[0] || "");

  const handleStart = () => {
    if (!name.trim()) {
      alert("请输入大侠尊姓大名！");
      return;
    }

    onStartGame({
      name: name.trim(),
      inner: selectedInner,
      agility: selectedAgility,
      moveSet: selectedMoveSet,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-amber-500 mb-8 tracking-widest">
          江湖路远
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">
              大侠尊姓大名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-amber-500"
              placeholder="请输入名字"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">
              选择初始内功 (入门)
            </label>
            <select
              value={selectedInner}
              onChange={(e) => setSelectedInner(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-amber-500"
            >
              {starterInner.map((skill) => (
                <option key={skill.name} value={skill.name}>
                  {skill.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {starterInner.find((s) => s.name === selectedInner)?.description}
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">
              选择初始轻功 (入门)
            </label>
            <select
              value={selectedAgility}
              onChange={(e) => setSelectedAgility(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-amber-500"
            >
              {starterAgility.map((skill) => (
                <option key={skill.name} value={skill.name}>
                  {skill.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {
                starterAgility.find((s) => s.name === selectedAgility)
                  ?.description
              }
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">
              选择初始招法 (入门)
            </label>
            <select
              value={selectedMoveSet as string}
              onChange={(e) => setSelectedMoveSet(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-amber-500"
            >
              {(moveSets as string[]).map((setName) => (
                <option key={setName} value={setName}>
                  {setName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              包含招式:{" "}
              {starterMoves
                .filter((m) => m.set_name === selectedMoveSet)
                .map((m) => m.name.split("-")[1] || m.name)
                .join("、")}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded shadow transition mt-8"
          >
            踏入江湖
          </button>
        </div>
      </div>
    </div>
  );
}
