import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {browserFixtures,continuousFailureFixture} from './fixtures.mjs';
const directory=resolve(process.argv[2]||'browser-qa/device-fixtures');
await mkdir(directory,{recursive:true});
const rows=[];
const fixtures=browserFixtures();fixtures.push(continuousFailureFixture(fixtures[3]));
for(const [slot,fixture] of fixtures.entries()){
 const name=slot===4?'continuous-failure-QA.json':`slot-${slot+1}-${fixture.player.name}.json`,content=JSON.stringify(fixture,null,2)+'\n';
 await writeFile(resolve(directory,name),content);
 rows.push({slot:slot===4?4:slot+1,scenario:slot===4?'continuous-failure':'stage',name,character:fixture.player.name,pets:fixture.player.pets.length,sha256:createHash('sha256').update(content).digest('hex')});
}
await writeFile(resolve(directory,'manifest.json'),JSON.stringify({purpose:'Disposable QA fixtures, not normal progression saves',rows},null,2)+'\n');
console.log('Exported five device QA saves to '+directory);
