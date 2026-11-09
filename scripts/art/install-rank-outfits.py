"""Export selected image_gen PNGs into the existing cosmetic slots, retaining alpha."""
import json,hashlib,sys,uuid
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[2]
rows=json.loads(Path(sys.argv[1]).read_text())
manifest_path=root/'dist/assets/rank-outfits/art-manifest.json'
manifest=json.loads(manifest_path.read_text());entries={(x['job'],x['rank']):x for x in manifest['assets']}
for row in rows:
    source=Path(row['png']);image=Image.open(source).convert('RGBA');bbox=image.getchannel('A').getbbox()
    if not bbox:raise ValueError('Blank image: '+str(source))
    art=ImageOps.contain(image.crop(bbox),(480,736),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(art.width+32,art.height+32));canvas.alpha_composite(art,(16,16))
    relative=f"assets/rank-outfits/{row['job']}-{row['rank']}.webp";target=root/'dist'/relative
    temporary=target.with_name(target.name+'.'+uuid.uuid4().hex+'.tmp')
    canvas.save(temporary,'WEBP',quality=91,method=6);temporary.replace(target)
    entry=entries[(row['job'],row['rank'])];entry.update(prompt=row['prompt'],path=relative,width=canvas.width,height=canvas.height,transparentMargin=16,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),alphaMin=0,alphaMax=canvas.getchannel('A').getextrema()[1],artRevision='6.5.0-structural-tiers',sourcePngSha256=hashlib.sha256(source.read_bytes()).hexdigest(),sourceName=source.name)
manifest['version']='6.5.0';manifest['generator']='built-in image_gen';manifest['tierCriteria']='S basic occupational uniform; SS different armor/garment/headgear construction; SSS ultimate signature silhouette and weapon, not color or aura variants.'
temporary=manifest_path.with_name(manifest_path.name+'.'+uuid.uuid4().hex+'.tmp');temporary.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');temporary.replace(manifest_path)
audit_path=root/'docs/art-assets-v630.json';audit=json.loads(audit_path.read_text())
for entry in audit['assets']:
    path=root/entry['path']
    if '/rank-outfits/' not in entry['path']:continue
    with Image.open(path) as art:entry.update(width=art.width,height=art.height,alphaMin=art.getchannel('A').getextrema()[0],alphaMax=art.getchannel('A').getextrema()[1],sha256=hashlib.sha256(path.read_bytes()).hexdigest())
audit['outfitRefreshVersion']='6.5.0';temporary=audit_path.with_name(audit_path.name+'.'+uuid.uuid4().hex+'.tmp');temporary.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n');temporary.replace(audit_path)
print('Installed',len(rows),'outfits with alpha, prompts and SHA256 provenance')
