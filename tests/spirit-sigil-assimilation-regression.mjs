// Verify Pact Warrior absorbs pet stats after (not before) Dawn Sigil multiplier.
// Also guard Commander transfer and presentation without touching the ten legacy jobs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {sigilBonus,DAWN_SIGIL_MAX} from '../dist/dawn-sigil.js';
import {commanderInheritedPetStats} from '../dist/commander-owner-growth.js';
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const from=game.indexOf('function pactAssimilationBonus(');
const to=game.indexOf('\nfunction setPetStance(',from);
assert.ok(from>=0&&to>from,'ability transfer source present');
const source=game.slice(from,to);
assert.ok(!game.includes('若雙夥伴均為純攻魔融合，DEF/MDEF 轉移提高至 55%'),
 'obsolete fusion-only extra defense must not be advertised');
const pet1={id:'p1',hp:100},pet2={id:'p2',hp:100};
const base={atk:100,matk:60,hp:1000,def:50,mdef:40};
for(const job of ['pactWarrior','spiritCommander','wizard']){
 for(const sigil of [0,DAWN_SIGIL_MAX]){
  const player={job,dawnSigil:sigil,petStances:{p1:'assimilate',p2:'assimilate'}};
  const ctx={player,sigilBonus,commanderInheritedPetStats,activePetRoster:()=>[pet1,pet2],
   petStats:()=>base,stat:()=>200,rawStat:()=>200,cardBonus:()=>0};
  vm.runInNewContext(source+'\nthis.absorb=pactAssimilationBonus;this.transfer=commanderTransferredPetStats',ctx);
  for(const [type,ratio] of Object.entries({atk:3.20,matk:1.65,hp:.16,def:.28,mdef:.28})){
   const expected=job==='pactWarrior'?2*base[type]*ratio*(1+sigil*.02):0;
   assert.ok(Math.abs(ctx.absorb(type)-expected)<1e-9,job+' '+sigil+' '+type);
  }
  const adjusted=ctx.transfer(pet1,base);
  assert.equal(adjusted.atk,job==='spiritCommander'?base.atk+60:base.atk);
  assert.equal(adjusted.matk,job==='spiritCommander'?base.matk+60:base.matk);
  assert.equal(adjusted.def,job==='spiritCommander'?base.def+70:base.def);
  assert.equal(adjusted.mdef,job==='spiritCommander'?base.mdef+70:base.mdef);
 }
}
console.log(JSON.stringify({complete:true,cases:6,classes:['pactWarrior','spiritCommander','wizard'],
 assertions:'Pact assimilation receives 0/8 sigil on each transferred attribute; commander transfer and old class unaffected; obsolete 55-percent copy removed'}));
