export default function DamageCalculationGuide() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 mt-6">
      <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        战斗结算说明
      </h3>
      <div className="space-y-3 text-xs text-gray-300">
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <h4 className="font-bold text-blue-400 mb-1">基础攻防</h4>
          <p>攻击 = (内力数量 × 内功造诣) × 招式熟练度 + 武器攻击</p>
          <p>防御 = (内力数量 × 内功造诣) + 防具防御</p>
        </div>
        
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <h4 className="font-bold text-red-400 mb-1">伤害结算</h4>
          <p>最终伤害 = (基础攻击 × 招式强度 × 连招加成) - (基础防御 × 防守强度)</p>
          <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-400">
            <li><span className="text-orange-400">弱点击破</span>：若击中对方弱点(非强势节点)，伤害变为 1.5 倍并附加 20 点真实伤害，且附带阻碍内力运转效果。</li>
            <li><span className="text-blue-300">强势招架</span>：若击中对方强势节点，伤害削减 30%。</li>
            <li><span className="text-blue-400">精准防守</span>：若防守节点与被攻击部位一致，防守方获得 1.5 倍防御加成。</li>
          </ul>
        </div>
        
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <h4 className="font-bold text-purple-400 mb-1">特殊机制</h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-400">
            <li><span className="font-bold text-gray-300">连招 Combo</span>：当前招式的起手节点【起】紧接上个招式的收尾节点【结】时，本次招式获得 1.5 倍伤害加成。</li>
            <li><span className="font-bold text-green-400">完美闪避</span>：当防守方轻功高于攻击方时，每高出 1 点轻功增加 1% 的闪避率（最高上限 50%），触发时规避该节点所有伤害。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}