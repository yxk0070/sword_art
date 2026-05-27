with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/levels.ts', 'r') as f:
    content = f.read()

# Replace all "招式-XXX-YYY" with "招式-XXX"
import re
new_content = re.sub(r'"招式-([^-]+)-[^"]+"', r'"招式-\1"', content)

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/levels.ts', 'w') as f:
    f.write(new_content)
