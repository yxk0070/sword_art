import re

# Read the file
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'r') as f:
    content = f.read()

# We need to add set_name and level to the Move class
content = content.replace(
    'constructor(name, duration, nodes, description = "") {',
    'constructor(name, duration, nodes, description = "", set_name = "", level = "入门") {'
)
content = content.replace(
    'this.description = description;',
    'this.description = description;\n    this.set_name = set_name;\n    this.level = level;'
)

content = content.replace(
    'effect_desc = null\n  ) {',
    'effect_desc = null,\n    level = "入门"\n  ) {'
)
content = content.replace(
    'this.effect_desc = effect_desc;',
    'this.effect_desc = effect_desc;\n    this.level = level;'
)

# Save it back
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/gameEngine.ts', 'w') as f:
    f.write(content)
