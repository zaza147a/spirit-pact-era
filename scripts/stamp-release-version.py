"""Stamp browser/worker module URLs together so a release cannot mix cached runtimes."""
import json,re,sys
from pathlib import Path
version=sys.argv[1]
if not re.fullmatch(r'\d+\.\d+\.\d+',version):raise SystemExit('Expected semantic version')
root=Path(__file__).resolve().parents[1];changed=[]
for path in (root/'dist').glob('*.js'):
    old=path.read_text();new=re.sub(r"((?:from\s+|import\s+)['\"])(\./[^'\"?]+\.js)(?:\?v=[^'\"]+)?(['\"])",lambda m:m[1]+m[2]+'?v='+version+m[3],old)
    new=re.sub(r'\?v=\d+\.\d+\.\d+', '?v='+version,new)
    if new!=old:path.write_text(new);changed.append(path.name)
index=root/'dist/index.html';text=index.read_text();match=re.search(r'<script type="importmap">(.*?)</script>',text)
if match:
    data=json.loads(match[1]);data['imports']={k:v.split('?')[0]+'?v='+version if v.split('?')[0].endswith('.js') else v for k,v in data['imports'].items()}
    for name in ['shared-warehouse','rank-outfits']:data['imports']['./'+name+'.js']='./'+name+'.js?v='+version
    text=text[:match.start(1)]+json.dumps(data,ensure_ascii=False)+text[match.end(1):]
text=re.sub(r'V\d+\.\d+\.\d+', 'V'+version,text);text=re.sub(r'\?v=\d+\.\d+\.\d+', '?v='+version,text)
text=re.sub(r'(href="[^"?]+\.css)(?:\?v=[^"]+)?"',r'\1?v='+version+'"',text)
index.write_text(text);print('Stamped',len(changed),'modules, styles and entry import map to',version)
