with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/MoveLibrary.tsx', 'r') as f:
    content = f.read()

# Group moves logic
old_render = """      <div className="space-y-2">
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
            </button>"""

new_render = """      <div className="space-y-4">
        {Object.entries(
          (moves || []).reduce((acc, move) => {
            if (!acc[move.set_name]) acc[move.set_name] = [];
            acc[move.set_name].push(move);
            return acc;
          }, {})
        ).map(([setName, setMoves]) => (
          <div key={setName} className="space-y-2">
            <div className="text-sm font-bold text-gray-400 border-b border-gray-700 pb-1 flex items-center">
              {setName}
              {setMoves[0] && (
                <span className="ml-2 text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-amber-500">
                  {setMoves[0].level}
                </span>
              )}
            </div>
            {setMoves.map((m, index) => (
              <div
                key={m.name}
                className="relative"
                onMouseEnter={() => setHoveredMove(m.name)}
                onMouseLeave={() => setHoveredMove(null)}
              >
                <button
                  onClick={() => addMove(m.name)}
                  disabled={currentDuration + m.duration > 12}
                  className="w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition border border-gray-600"
                >
                  <div className="font-bold">{m.name.split("-")[1] || m.name}</div>
                  <div className="text-xs text-gray-400">耗时: {m.duration} 息</div>
                </button>"""

content = content.replace(old_render, new_render)
content = content.replace('hoveredMove === index', 'hoveredMove === m.name')
# Also close the extra map
content = content.replace('        ))}    </div>', '        ))}          </div>        ))}      </div>')
content = content.replace('        ))}      </div>', '        ))}          </div>        ))}      </div>')

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/MoveLibrary.tsx', 'w') as f:
    f.write(content)
