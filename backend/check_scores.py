import json
with open('r1.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
for m in d['females']:
    print(f"ID: {m['memberId']}, Score: {m['diffScore']}")
