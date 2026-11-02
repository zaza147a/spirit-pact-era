// Cloud-only read-only audit: run from repository root with Node 18+.
// Does not modify main, dist or any save.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const checks=[
  [
    "main_source",
    "dist/game.js",
    "function combatTick(now=gameNow())"
  ],
  [
    "offline_entry",
    "dist/game.js",
    "async function simulateOffline(state,now=Date.now(),progress=()=>{})"
  ],
  [
    "reset_clears_resonance",
    "dist/game.js",
    "function resetSession(){resonanceUsedAt=new Map()"
  ],
  [
    "reset_clears_skill_timers",
    "dist/game.js",
    "jobSkillTimers={};timers={attack:0"
  ],
  [
    "offline_uses_reset",
    "dist/game.js",
    "resetSession();auto=true;spawn()"
  ],
  [
    "offline_uses_tick",
    "dist/game.js",
    "combatTick(offlineClock)"
  ],
  [
    "rng_non_injectable",
    "dist/game.js",
    "Math.random()"
  ],
  [
    "encounter_state",
    "dist/game.js",
    "let encounterSlots=[],petDeathSequence=0,pendingPetCredit=0"
  ],
  [
    "pet_effects",
    "dist/game.js",
    "let petEffects={bleedTicks:0"
  ],
  [
    "cooldowns",
    "dist/game.js",
    "let petSkillTimers={},jobSkillTimers={}"
  ],
  [
    "class_buffs",
    "dist/game.js",
    "let bossCooldowns={},classBuffs={}"
  ],
  [
    "status_effect",
    "dist/game.js",
    "let controlEffect=null"
  ],
  [
    "cast_state",
    "dist/game.js",
    "let casting=null"
  ],
  [
    "enemy_group",
    "dist/game.js",
    "let player=null,enemy=null,enemies=[]"
  ],
  [
    "offline_cap",
    "dist/offline-rules.js",
    "export const OFFLINE_CAP_MS=24*60*60*1000"
  ],
  [
    "offline_step",
    "dist/offline-rules.js",
    "export const OFFLINE_STEP_MS=100"
  ],
  [
    "worker_import",
    "dist/offline-worker.js",
    "import './game.js?v=6.5.1'"
  ]
];
let pass=0;
for(const [id,path,needle] of checks){
 const text=readFileSync(path,'utf8');
 const ok=text.includes(needle);
 console.log((ok?'PASS':'FAIL')+' '+id+' ('+path+')');
 assert.ok(ok, 'Source changed; review checkpoint assumptions for '+id);
 pass++;
}
console.log(pass+'/'+checks.length+' source signatures verified; this is NOT combat equivalence testing.');
