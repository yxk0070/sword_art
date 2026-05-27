with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/CharacterProfile.tsx', 'r') as f:
    content = f.read()

# Add level tag to inner skill
content = content.replace(
    '{skill.name}\n                  </div>',
    '{skill.name} <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded text-amber-500">{skill.level}</span>\n                  </div>'
)

# Group moves logic
# Find the start of moves rendering
old_moves_render = """            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
            </div>"""

new_moves_render = """            <div className="space-y-6">
              {Object.entries(
                moves.reduce((acc, move) => {
                  if (!acc[move.set_name]) acc[move.set_name] = [];
                  acc[move.set_name].push(move);
                  return acc;
                }, {})
              ).map(([setName, setMoves]) => (
                <div key={setName}>
                  <div className="flex items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-300">{setName}</h3>
                    {setMoves[0] && (
                      <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded text-amber-500">
                        {setMoves[0].level}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {setMoves.map((move) => (
                      <div
                        key={move.name}
                        className="p-3 bg-gray-900 border border-gray-700 rounded text-sm"
                      >
                        <div className="font-bold text-gray-200 mb-1">
                          {move.name.split("-")[1] || move.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          耗时: {move.duration} 息
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-2" title={move.description}>
                          {move.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>"""

content = content.replace(old_moves_render, new_moves_render)

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/CharacterProfile.tsx', 'w') as f:
    f.write(content)
