"""Technical export only: preserve generated alpha, add safety margins, encode WebP.
Usage: python scripts/homecoming-prepare-art.py /absolute/path/to/source-map.json
The map is {"monsters/furnace": "/.../generated.png", "scenes/attack-magic": "/.../generated.png", ...}.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
sources = json.loads(Path(sys.argv[1]).read_text())
report = []
for key, source in sorted(sources.items()):
    if len(Path(key).parts) != 2 or Path(key).parts[0] not in ('monsters','scenes'):
        raise ValueError('Unexpected asset key: '+key)
    raw = Image.open(source)
    if key.startswith('monsters/'):
        assert raw.mode == 'RGBA' and raw.getchannel('A').getextrema() == (0,255), key+' lacks genuine transparency'
        im = Image.new('RGBA',(768,768),(0,0,0,0))
        scaled = ImageOps.contain(raw,(704,704),Image.Resampling.LANCZOS)
        im.alpha_composite(scaled,((768-scaled.width)//2,(768-scaled.height)//2))
    else:
        assert abs(raw.width/raw.height-1.5)<.02, key+' unexpected composition'
        im = raw.convert('RGB').resize((1152,768),Image.Resampling.LANCZOS)
    target=root/'dist/assets/homecoming'/f'{key}.webp'
    target.parent.mkdir(parents=True,exist_ok=True)
    temporary=target.with_suffix('.export.webp')
    im.save(temporary,'WEBP',quality=88,method=4,exact=True)
    checked=Image.open(temporary);checked.load()
    temporary.replace(target)
    entry={'asset':key,'path':str(target.relative_to(root/'dist')),'width':checked.width,'height':checked.height,'bytes':target.stat().st_size,'alpha':checked.mode=='RGBA'}
    if key.startswith('monsters/'):
        alpha=checked.getchannel('A');box=alpha.getbbox()
        assert box and min(box[0],box[1],768-box[2],768-box[3])>=24, key+' clipped silhouette'
        assert alpha.getextrema()==(0,255)
        entry['silhouetteBounds']=box
        entry['transparentFraction']=round(alpha.histogram()[0]/(768*768),4)
    assert target.stat().st_size<550000, key+' oversized'
    report.append(entry)
audit=root/'docs/homecoming-art/asset-audit.json'
prior=json.loads(audit.read_text()) if audit.exists() else []
merged={x['asset']:x for x in prior}
merged.update({x['asset']:x for x in report})
report=list(sorted(merged.values(),key=lambda x:x['asset']))
audit.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'assets':len(report),'bytes':sum(x['bytes'] for x in report),'alphaSprites':sum(x['alpha'] for x in report)}))
