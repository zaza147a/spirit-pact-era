import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {GEAR_TIERS,gearTierForLevel,migrateFiveTierShards} from '../dist/progression.js';
import {fuseOne} from '../dist/fusion.js';
import {ITEMS,makePet,petStats} from '../dist/catalog.js';
import {PET_SKILLS} from '../dist/pet-abilities.js';
import {petSkillEffect,supportPulse,resonanceMagnitude} from '../dist/pet-effects.js';
import {RESONANCE_RULES,resonanceTriggered} from '../dist/resonance.js';
import {playerAttackValue,playerMagicAttackValue,jobSkillSpec} from '../dist/player-scaling.js';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {WORLD_MONSTERS} from '../dist/world-data.js';
import {encounterLimit} from '../dist/encounter-rules.js';
const dist=new URL('../dist/',import.meta.url);
async function app(){const context={console,confirm:()=>true,document:{getElementById:()=>({style:{},hidden:false})},localStorage:{setItem:()=>{}},Math:Object.create(Math)};
 let source=readFileSync(new URL('game.js',dist),'utf8');for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const module=await import(new URL(match[2],dist));for(const name of match[1].split(',').map(n=>n.trim()))context[name]=module[name];}
 source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'\nglobalThis.api={fresh,normalize,capture,releasePet,stat,playerAttack,emitEvent,classTactic,enemyAttack,petAutoAbility,renderJobTree,renderPetSkillConfig,state:()=>({player,enemy,timers,petSkillTimers,petEffects}),setup:(p,e)=>{player=p;enemy=e;enemies=[e];timers={attack:0,skill:0,pet:0,resonance:0,tactic:0};jobSkillTimers={};}};render=()=>{};renderSide=()=>{};message=()=>{};save=()=>true;toast=()=>{};award=()=>{};');vm.createContext(context);vm.runInContext(source,context);context.Math.random=()=>.1;context.rand=(min,max)=>Math.round((min+max)/2);return context;
}
const foe=()=>({id:'world_50',hp:100000,maxHp:100000,def:0,flee:0,atk:30,hit:999,appearedAt:1});
test('six equipment tiers and fusion cover every exact boundary including tier VI shards',()=>{
 for(const t of GEAR_TIERS){for(const lv of [t.min,t.max])assert.equal(gearTierForLevel(lv),t.tier);assert.ok(ITEMS[`shard_weapon_${t.tier}`]);assert.ok(ITEMS[`shard_armor_${t.tier}`]);
  for(const [rng,expected] of [[0,t.min],[1,t.max]]){const p={bag:[{id:`shard_weapon_${t.tier}`,qty:8}]};const result=fuseOne(p,{tier:t.tier,base:'blade',stat:'any'},{rng:()=>rng,roller:(id,level)=>({id,level,uid:'test',rarity:'common',affixes:{}})});assert.equal(result.gear.level,expected);assert.equal(p.bag.length,1);}}
});
test('old five-tier migration is simultaneous, quantity-preserving and version-gated; gear identity survives',async()=>{
 const entries=[1,2,3,4,5].map(t=>({id:`shard_weapon_${t}`,qty:t*8}));assert.deepEqual(migrateFiveTierShards(entries).map(x=>x.id),[1,3,4,5,6].map(t=>`shard_weapon_${t}`));
 const c=await app(),a=c.api,p=a.fresh('舊檔','archer');p.version=20;p.bag=entries.concat({id:'blade',uid:'keep',level:36,tier:2,rarity:'rare',affixes:{atk:11,DEX:2}});p.fusionSettings={tier:2,base:'blade'};a.normalize(p);assert.equal(p.version,30);assert.equal(p.fusionSettings.tier,3);assert.equal(p.bag.at(-1).tier,3);assert.equal(p.bag.at(-1).uid,'keep');assert.ok(p.bag.at(-1).affixes.atk>11);assert.equal(p.bag.at(-1).powerVersion,30);const once=JSON.stringify(p);assert.equal(JSON.stringify(a.normalize(p)),once);
});
test('archer ATK primarily follows DEX; magic and healing UI uses MATK and every skill exposes CD and multiplier',()=>{
 const a={STR:1,DEX:1,INT:1},base=playerAttackValue('archer',15,1,a);assert.equal(playerAttackValue('archer',15,1,{...a,DEX:11})-base,20);assert.equal(playerAttackValue('archer',15,1,{...a,STR:11})-base,2);assert.equal(playerMagicAttackValue(1,{...a,INT:11})-playerMagicAttackValue(1,a),20);
 for(const [job,skills] of Object.entries(JOB_SKILLS))for(const skill of skills.filter(s=>!['passive','buff'].includes(s.kind))){const spec=jobSkillSpec(skill,1,job);assert.match(spec.text,/%(?:（[^）]*）)? · CD [\d.]+ 秒/);if(skill.kind==='magic'&&!skill.source||skill.kind==='heal'&&['acolyte','priest'].includes(job))assert.equal(spec.source,'MATK');}
});
test('pet gear affects own-stat blessing, healing, shields, mana, DoTs and core resonance',()=>{
 for(const [species,role] of [['fang','attack'],['wisp','magic'],['shell','defense'],['sprout','support']]){const p=makePet(species);p.level=20;const before=petStats(p);p.gear.head={id:'petCirclet',affixes:{matk:100,atk:100,INT:20}};p.gear.body={id:'petArmor',affixes:{hp:400,def:100,mdef:100}};const after=petStats(p);assert.ok(after.healPower>before.healPower);
  for(const skill of PET_SKILLS[role])assert.ok(petSkillEffect(skill,after,role).value>petSkillEffect(skill,before,role).value,`${role}/${skill.id}`);
  assert.ok(supportPulse(after).sp>supportPulse(before).sp);for(const rule of Object.values(RESONANCE_RULES.archer))assert.ok(resonanceMagnitude(rule,after)>resonanceMagnitude(rule,before));}
});
test('all twenty resonance routes have reachable triggers; archer tank triggers while attacking and tank guarding, never depends on dodge',async()=>{
 let count=0;for(const roles of Object.values(RESONANCE_RULES))for(const rule of Object.values(roles)){count++;assert.ok(rule.events.some(e=>['attack','skill','heal','pet_guard','charge','fist','autospell','steal','crit','dodge','block','shield','buff','combo','falcon','song','castStart','castComplete','snatch'].includes(e)));assert.ok(rule.cooldown>=4000);}assert.equal(count,60);const rule=RESONANCE_RULES.archer.defense;assert.ok(resonanceTriggered(rule,'attack'));assert.ok(resonanceTriggered(rule,'pet_guard'));assert.equal(resonanceTriggered(rule,'dodge'),false);
 const c=await app(),a=c.api,p=a.normalize(a.fresh('弓坦','archer')),pet=makePet('shell');p.pets=[pet];p.activePetId=pet.id;a.setup(p,foe());a.playerAttack();assert.ok(p.shield>0);const shield=p.shield;a.emitEvent('pet_guard');assert.equal(p.shield,shield);assert.ok(a.state().timers.resonance>0);
 // A real tank hit is enough even when owner has not attacked.
 p.shield=0;a.state().timers.resonance=0;c.chooseMonsterTarget=()=> 'pet';a.enemyAttack();assert.ok(p.shield>0);assert.ok(pet.hp<petStats(pet).hp);
});
test('actual healing does not miss, emits heal event, and full-resource resonance does not spend CD',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('服事','acolyte')),pet=makePet('shell');p.pets=[pet];p.activePetId=pet.id;p.jobSkills.heal=1;p.hp=1;p.attributes.INT=50;p.mp=10000;const e=foe();e.flee=99999;c.Math.random=()=>.99;a.setup(p,e);const expected=Math.min(a.stat('hp')-1,Math.round(a.stat('matk')*1.85));a.playerAttack(true,'heal');assert.equal(p.hp,1+expected);assert.ok(p.shield>0);assert.equal(e.hp,100000);
 const support=makePet('sprout');p.pets=[support];p.activePetId=support.id;p.mp=a.stat('mp');a.state().timers.resonance=0;a.emitEvent('heal');assert.equal(a.state().timers.resonance,0);p.mp-=10;a.emitEvent('heal');assert.ok(a.state().timers.resonance>0);
});
test('physical skill damage has no hidden INT multiplier and class tactics do not invent dodges',async()=>{
 async function damage(INT){const c=await app(),a=c.api,p=a.normalize(a.fresh('弓手','archer'));p.attributes.INT=INT;p.gear.rightHand=c.rollGear('shortBow',1,'common',()=>.5);p.mp=9999;const e=foe();a.setup(p,e);a.playerAttack(true);return 100000-e.hp;}
 assert.equal(await damage(1),await damage(100));const c=await app(),a=c.api,p=a.normalize(a.fresh('影步','thief'));a.setup(p,foe());const events=[];c.emitEvent=e=>events.push(e);a.classTactic();assert.deepEqual(events,['tactic']);assert.ok(a.state().timers.shadowUntil>Date.now());
});
test('all 50 novice monsters have lower HP, ATK, DEF and slower attacks; encounter caps ease early zones',()=>{
 for(const m of WORLD_MONSTERS.filter(m=>m.level<=50)){const L=m.level,z=Math.floor((L-1)/10),oldHP=Math.round((32+L*13+L*L*.43)*(1.35+L*.014)*[1,1.4,2.2,1.75,1.65][z]);assert.ok(m.hp<oldHP);assert.ok(m.atk<Math.round((5+L*2.8)*(1.12+L*.004)));assert.ok(m.def<=Math.round(1+L*.85));assert.ok(m.xp>=12);}
 assert.equal(encounterLimit('starter'),2);assert.equal(encounterLimit('forest'),2);assert.equal(encounterLimit('astral'),3);assert.equal(encounterLimit('future'),4);
});

test('full-HP captures consume one ball and work without damage; failure consumes ball without granting pet',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('捕捉','archer'));const e={...foe(),id:'fang',hp:52,maxHp:52};a.setup(p,e);c.Math.random=()=>.54;a.capture();assert.equal(p.pets.length,1);assert.equal(p.bag.find(x=>x.id==='orb').qty,2);assert.equal(e.hp,52);
 a.setup(p,{...e});c.Math.random=()=>.56;a.capture();assert.equal(p.pets.length,1);assert.equal(p.bag.find(x=>x.id==='orb').qty,1);
 p.location='town';a.capture();assert.equal(p.bag.find(x=>x.id==='orb').qty,1);
});
test('release confirmation protects pets; confirmed release returns exact equipment and clears active state only for selected pet',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('放生','mage')),pet=makePet('sprout'),other=makePet('shell');pet.gear.head={id:'petCirclet',uid:'original-gear',level:1,rarity:'rare',affixes:{matk:8}};p.pets=[pet,other];p.activePetId=pet.id;p.petBook.sprout=1;a.setup(p,foe());c.confirm=()=>false;a.releasePet(pet.id);assert.equal(p.pets.length,2);assert.equal(p.activePetId,pet.id);assert.equal(p.bag.some(x=>x.uid==='original-gear'),false);
 c.confirm=()=>true;a.releasePet(other.id);assert.equal(p.pets.length,1);assert.equal(p.activePetId,pet.id);a.releasePet(pet.id);assert.equal(p.pets.length,0);assert.equal(p.activePetId,null);assert.equal(p.bag.filter(x=>x.uid==='original-gear').length,1);assert.equal(p.petBook.sprout,1);a.releasePet(pet.id);assert.equal(p.bag.filter(x=>x.uid==='original-gear').length,1);
});
