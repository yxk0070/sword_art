with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Fix ts issues in App.tsx
content = content.replace('const [state, setState] = useState({});', 'const [state, setState] = useState<any>({});')

with open('/Users/bytedance/Documents/trae_projects/sword_art/frontend/src/App.tsx', 'w') as f:
    f.write(content)
