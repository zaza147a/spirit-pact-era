// Playwright's own protocol session forces visibility. A separate CDP session cannot
// clear that session's override. Configure the runner itself before importing it.
const fs=require('node:fs'),path=require('node:path');
const root=path.dirname(require.resolve('playwright-core/package.json'));
let count=0;
for(const relative of ['lib/server/chromium/crPage.js','lib/coreBundle.js']){
 const file=path.join(root,relative);if(!fs.existsSync(file))continue;const source=fs.readFileSync(file,'utf8');
 const updated=source.replace(/(send\(["']Emulation\.setFocusEmulationEnabled["'],\s*\{\s*enabled:\s*)true/g,(_,prefix)=>{count++;return prefix+'false';});
 if(updated!==source)fs.writeFileSync(file,updated);
}
if(!count)throw Error('Focus override configuration did not match installed Playwright');
console.log('Configured native page visibility in '+count+' runner location(s)');
