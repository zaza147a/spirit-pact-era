// This exercises the real game's extreme trial entry and battle logic.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {runtime} from './runtime31-helper.mjs';
import {currentEndgamePlayer} from './fixtures/current-210-endgame-player.mjs';

for(const kind of ['atk','matk','hp','clear']){
 const c=await runtime();
 const p=currentEndgamePlayer('knight',{fusion:'attack-magic'});
 p.location='dawncity';p.extremeProgress={};p.extremeRun=null;
 c.setTime(1_000_000);c.api.setup(p,null);
 vm.runInContext(`startExtreme(${JSON.stringify(kind)},1)`,c);
 assert.equal(p.extremeRun?.kind,kind,`${kind} should enter actual game challenge`);
 assert.equal(p.extremeRun?.floor,1);
 assert.equal(c.api.state().enemies[0]?.extremeKind,kind);
 for(let tick=1;tick<=310;tick++){
  c.setTime(1_000_000+tick*100);
  c.api.combatTick(1_000_000+tick*100);
 }
 assert.ok(p.extremeRun||p.extremeLastResult,`${kind} must have live trial state or a real failure`);
 console.log(JSON.stringify({kind,active:!!p.extremeRun,floor:p.extremeRun?.floor||p.extremeLastResult?.floor,highest:p.extremeProgress?.[kind]?.highest||0,reason:p.extremeLastResult?.reason||null}));
}
