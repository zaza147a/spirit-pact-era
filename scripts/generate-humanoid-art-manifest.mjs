import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TRUE_FORMS} from '../dist/pet-true-form.js';

const stages=['S','SS','SSS'];
const assets=[];
for(const stage of stages)for(const [key,name] of Object.entries(TRUE_FORMS)){
 const path=`assets/true-forms/${stage}/${key}.webp`;
 const bytes=readFileSync(new URL('../dist/'+path,import.meta.url));
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error(path+' is not WebP');
 assets.push({id:key,name,stage,path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
if(new Set(assets.map(a=>a.sha256)).size!==36)throw Error('All 36 stage sprites must be unique');
const report={version:'6.4.x-unreleased',kind:'permanent-humanoid-evolution',stages,format:'WebP with alpha',generator:'built-in image generation + WebP optimization',assets};
writeFileSync(new URL('../dist/assets/true-forms/stages-manifest.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('Verified '+assets.length+' independent humanoid stage sprites');
