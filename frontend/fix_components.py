import os

# Fix StartScreen.tsx
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/StartScreen.tsx', 'r') as f:
    content = f.read()
content = content.replace('export default function StartScreen({', 'export default function StartScreen({\n  innerSkills,\n  agilitySkills,\n  moves,\n  onStartGame,\n}: any) {')
content = content.replace('          <div key={setName}>', '          <div key={setName as string}>')
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/StartScreen.tsx', 'w') as f:
    f.write(content)

# Fix MoveLibrary.tsx
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/MoveLibrary.tsx', 'r') as f:
    content = f.read()
content = content.replace('export default function MoveLibrary({ moves, addMove, currentDuration }) {', 'export default function MoveLibrary({ moves, addMove, currentDuration }: any) {')
content = content.replace('          <div key={setName} className="space-y-2">', '          <div key={setName as string} className="space-y-2">')
content = content.replace('{setMoves.map((m) => (', '{setMoves.map((m: any) => (')
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/MoveLibrary.tsx', 'w') as f:
    f.write(content)

# Fix CharacterProfile.tsx
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/CharacterProfile.tsx', 'r') as f:
    content = f.read()
content = content.replace('export default function CharacterProfile({', 'export default function CharacterProfile({\n  innerSkills,\n  agilitySkills,\n  moves,\n  equippedInner,\n  setEquippedInner,\n  equippedAgility,\n  setEquippedAgility,\n  playerLevel,\n  playerExp,\n  playerName,\n  setPlayerName,\n  onBack,\n  onRestart,\n}: any) {')
content = content.replace('              {Object.entries(', '              {Object.entries<any[]>(')
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/components/CharacterProfile.tsx', 'w') as f:
    f.write(content)

# Add globals.d.ts for image and css imports
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/globals.d.ts', 'w') as f:
    f.write('''declare module '*.png' {
  const value: any;
  export default value;
}
declare module '*.css' {
  const value: any;
  export default value;
}
''')

# Fix App.tsx event typing
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace('onError={(e) => {', 'onError={(e: any) => {')
with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/App.tsx', 'w') as f:
    f.write(content)
