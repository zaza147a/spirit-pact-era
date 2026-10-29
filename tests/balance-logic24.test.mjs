import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {hitChance} from '../dist/combat-balance.js';
const dist=new URL('../dist/',import.meta.url);
async function app(){const nodes=new Map();const c={console,structuredClone,Math:Object.create(Math),Date,confirm:()=>true,document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{style:{},focus:()=>{}});return nodes.get(id);}},localStorage:{setItem:()=>{}},setTimeout:()=>0,clearTimeout:()=>{}};let source=readFileSync(new URL('game.js',dist),'utf8');for(const m of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const mod=await import(new URL(m[2],dist));for(const key of m[1].split(',').map(k=>k.trim()))c[key]=mod[key];}source=source.replace(/^import .*;\n/gm,'').replace(/\ninit\(\);\s*$/,'');source+=`\nglobalThis.api={fresh,normalize,stat,buy,capture,autoUsePotions,releaseSelectedPets,selectForRelease:ids=>selectedReleasePets=new Set(ids),setSaveResult:result=>save=()=>result,award,renderEvolution,renderOverview,renderAutomation,transferJob,evolvePet,beginEvolution,closeEvolution,tickPetEffects,petAutoAbility,addEncounter,ultimate,playerAttack,healPetParty,grantPetShield,enemyAttack,autoCastJobs,dealPetDamage,splashDamage,setup:(p,e)=>{player=p;enemies=[e];enemy=e;auto=true;report=newReport(p.location,e.id,activePet());clearPetEffects();classBuffs={};return report;},state:()=>({player,petEffects,evolutionRunning,enemies}),setEvolutionQuality:q=>evolutionArtRarity=q,setBuff:()=>{classBuffs.angelus={until:Date.now()+10000,power:.2}},setEnemies:foes=>{enemies=foes;enemy=foes[0]}};render=()=>{};renderSide=()=>{};message=()=>{};save=()=>true;toast=()=>{};stopAutoFusion=()=>{};showReviveDialog=()=>{};`;vm.createContext(c);vm.runInContext(source,c);c.Math.random=()=>0;c.rand=()=>100;return c;}
const foe=()=>({id:'world_50',hp:100000,maxHp:100000,atk:100,def:0,flee:0,hit:1000});
test('late-game rating differences do not automatically floor monster accuracy; HIT and FLEE remain monotonic',()=>{
 assert.ok(hitChance(293,881)>.4);assert.ok(hitChance(293,881)<hitChance(293,460));
 assert.ok(hitChance(400,881)>hitChance(293,881));assert.equal(hitChance(100,100),.8);
 for(const h of [0,80,300,1000])for(const f of [0,80,300,1000])assert.ok(hitChance(h,f)>=.05&&hitChance(h,f)<=.95);
});
test('guard protects the actual frontline and only consumed shields contribute; each incoming damage portion is counted once',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('守護','mage')),pet=c.makePet('shell');p.pets=[pet];p.activePetId=pet.id;pet.hp=c.petStats(pet).hp;p.hp=140;const r=a.setup(p,foe());a.grantPetShield(600,true);assert.ok(a.state().petEffects.shield>0);assert.ok(p.shield>0);assert.equal(r.metrics.shieldPrevented,0);c.chooseMonsterTarget=()=> 'pet';a.enemyAttack();assert.ok(r.metrics.shieldPrevented>0);assert.equal(r.metrics.shieldPrevented+r.metrics.petTanked+r.metrics.petProtection,100);assert.equal(r.metrics.petTaken,r.metrics.petTanked);
});
test('party healing prioritizes lower HP ratio, shares one budget, excludes overheal and cannot revive a fallen pet',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('治療','mage')),pet=c.makePet('shell');p.pets=[pet];p.activePetId=pet.id;const r=a.setup(p,foe()),max=c.petStats(pet).hp;p.hp=Math.round(a.stat('hp')/2);const owner=p.hp;pet.hp=1;assert.equal(a.healPetParty(10),10);assert.equal(pet.hp,11);assert.equal(p.hp,owner);assert.equal(r.metrics.effectiveHeal,10);a.healPetParty(100000);assert.equal(p.hp,a.stat('hp'));assert.equal(pet.hp,max);assert.equal(a.healPetParty(100),0);pet.hp=0;assert.equal(a.healPetParty(100),0);assert.equal(pet.hp,0);
});
test('player-provided buff is applied exactly once to pet splash and credited to its owner',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('增益','priest')),r=a.setup(p,foe()),primary=foe(),other=foe();a.setEnemies([primary,other]);a.setBuff();const dealt=a.dealPetDamage(100);assert.equal(dealt,120);a.splashDamage(primary,dealt,.5,'petDamage',true);assert.equal(other.hp,99940);assert.equal(r.metrics.petDamage,150);assert.equal(r.metrics.playerBuffDamage,30);
});
test('automatic skills can run safely without an active pet',async()=>{const c=await app(),a=c.api,p=a.normalize(a.fresh('單人','mage'));a.setup(p,foe());assert.doesNotThrow(()=>a.autoCastJobs());});

test('advanced supply scaling starts at 51, includes pet maximums and keeps all novice flat values',async()=>{
 const {potionRestore}=await import('../dist/restoration.js');const {LOOT_ITEMS}=await import('../dist/loot.js');
 assert.equal(potionRestore(LOOT_ITEMS.red_large,'hp',50,10000),420);
 assert.equal(potionRestore(LOOT_ITEMS.red_large,'hp',50,10000,true),315);
 assert.equal(potionRestore(LOOT_ITEMS.red_large,'hp',51,10000),1920);
 assert.equal(potionRestore(LOOT_ITEMS.red_large,'hp',51,10000,true),1815);
 assert.equal(potionRestore(LOOT_ITEMS.blue_large,'mp',51,3000),520);
 assert.equal(potionRestore(LOOT_ITEMS.red_small,'hp',99,10000),60);
 assert.equal(potionRestore(LOOT_ITEMS.red_large,'mp',99,10000),0);
});

test('all ten second transfers retain first skills/points, return weapon and card, and equip a legal starter',async()=>{
 const {SECOND_JOBS}=await import('../dist/jobs.js');for(const [job,meta] of Object.entries(SECOND_JOBS)){const c=await app(),a=c.api,p=a.normalize(a.fresh('二轉',meta.parent));p.location='town';p.level=50;p.jobLevel=40;p.jobPoints=7;p.sockets.rightHand='fang';const old=p.gear.rightHand.uid,learned=JSON.stringify(p.jobSkills);a.setup(p,foe());a.transferJob(job);assert.equal(p.job,job);assert.equal(p.jobLevel,1);assert.equal(p.firstJobLevel,40);assert.equal(p.firstJobPoints,7);assert.equal(p.jobPoints,0);assert.equal(p.gear.rightHand.id,meta.weapon);assert.ok(c.GEAR_BASE[meta.weapon].jobs.includes(job));assert.ok(p.bag.some(g=>g.uid===old));assert.equal(p.sockets.rightHand,null);assert.ok(p.cards.some(card=>card.id==='fang'));for(const [id,rank] of Object.entries(JSON.parse(learned)))assert.equal(p.jobSkills[id],rank);}
});
test('evolution modal commits one transaction, locks while running, and displays its result after four seconds',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('進化','mage')),pet=c.makePet('shell');pet.level=20;pet.evolution=0;p.pets=[pet];p.activePetId=pet.id;p.location='town';p.bag.push({id:'essence_1',qty:40});a.setup(p,foe());let scheduled;c.setTimeout=(callback,ms)=>{scheduled={callback,ms};return 1;};a.evolvePet(pet.id);const qty=p.bag.find(e=>e.id==='essence_1').qty;a.beginEvolution();const after=p.bag.find(e=>e.id==='essence_1').qty;assert.ok(after<qty);assert.equal(pet.evolution,1);assert.equal(scheduled.ms,4000);assert.equal(a.state().evolutionRunning,true);a.beginEvolution();a.closeEvolution();assert.equal(p.bag.find(e=>e.id==='essence_1').qty,after);assert.equal(a.state().evolutionRunning,true);scheduled.callback();assert.equal(a.state().evolutionRunning,false);assert.match(c.document.getElementById('evolutionTitle').textContent,/恭喜您，進化為/);a.closeEvolution();assert.equal(c.document.getElementById('gameShell').inert,false);
});
test('rarity core stats and own-stat buffs scale through equipped gear while the first three qualities share skill IDs',async()=>{
 const {PET_RARITIES,makePet,petStats}=await import('../dist/catalog.js');const {petSkillsFor}=await import('../dist/pet-abilities.js');const {petSkillEffect}=await import('../dist/pet-effects.js');
 const p=makePet('sprout');p.level=80;p.evolution=4;p.gear.head={id:'petCirclet',affixes:{matk:150,INT:20}};p.gear.body={id:'petArmor',affixes:{hp:500,def:100}};
 let prev;for(const q of PET_RARITIES){p.rarity=q.id;const s=petStats(p),skill=petSkillsFor('support',q.id)[0],buff=petSkillEffect(skill,s,'support').value;if(prev){const expected=q.factor/prev.factor;assert.ok(Math.abs(s.matk/prev.stats.matk-expected)<.005);assert.ok(Math.abs(buff/prev.buff-expected)<.01);}prev={factor:q.factor,stats:s,buff};}
 assert.deepEqual(petSkillsFor('support','common').map(s=>s.id),petSkillsFor('support','rare').map(s=>s.id));assert.deepEqual(petSkillsFor('support','rare').map(s=>s.id),petSkillsFor('support','uncommon').map(s=>s.id));assert.notDeepEqual(petSkillsFor('support','uncommon').map(s=>s.id),petSkillsFor('support','legendary').map(s=>s.id));
});

test('guard regeneration records only missing HP and does not add artificial attack damage',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('再生守護','mage')),pet=c.makePet('shell');pet.level=20;pet.hp=c.petStats(pet).hp;pet.sp=999;pet.equippedSkills=['wall'];p.pets=[pet];p.activePetId=pet.id;const r=a.setup(p,foe()),now=Date.now();a.petAutoAbility(pet,c.petStats(pet),now);const max=c.petStats(pet).hp;pet.hp=max-1;a.tickPetEffects(now+1000);assert.equal(pet.hp,max);assert.equal(r.metrics.effectiveHeal,1);a.tickPetEffects(now+2000);assert.equal(r.metrics.effectiveHeal,1);assert.equal(r.metrics.petDamage,0);
});
test('independent map boss gets an extra fifth slot without replacing normal enemies',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('首領','mage'));p.location='celestial';a.setup(p,foe());const normals=Array.from({length:4},(_,i)=>({...foe(),instanceId:`normal${i}`}));a.setEnemies(normals);c.canEncounterBoss=()=>true;a.addEncounter(Date.now());const live=a.state().enemies;assert.equal(live.length,5);assert.equal(live.filter(e=>!e.boss).length,4);const boss=live.find(e=>e.boss);assert.equal(boss.id,'boss_celestial');assert.equal(boss.artIndex,9);assert.equal(c.BOSS_CARD_CHANCE,.001);
});

test('joint ultimate attributes the character contribution separately from pet damage',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('雙星','swordsman')),pet=c.makePet('fang');p.pets=[pet];p.activePetId=pet.id;p.resonance=100;const target=foe(),r=a.setup(p,target);a.ultimate();assert.ok(r.metrics.playerDamage>0);assert.ok(r.metrics.resonanceDamage>0);assert.equal(r.metrics.playerDamage+r.metrics.resonanceDamage,100000-target.hp);
});
test('monk retains MATK-based first-job healing while breathing uses ATK',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('武僧治療','monk'));p.jobLevel=50;p.jobSkills.heal=1;p.hp=1;p.mp=10000;a.setup(p,foe());const expected=Math.min(a.stat('hp')-1,Math.round(a.stat('matk')*1.85));a.playerAttack(true,'heal');assert.equal(p.hp,1+expected);const {jobSkillSpec}=await import('../dist/player-scaling.js'),{JOB_SKILLS}=await import('../dist/job-skills.js');assert.equal(jobSkillSpec(JOB_SKILLS.monk.find(s=>s.id==='heal'),1,'monk').source,'MATK');assert.equal(jobSkillSpec(JOB_SKILLS.monk.find(s=>s.id==='breathing'),1,'monk').source,'ATK');
});

test('shop only sells seven useful supplies and rejects hidden equipment or legacy consumable purchases',async()=>{
 const {SHOP_IDS}=await import('../dist/shop-catalog.js');assert.equal(SHOP_IDS.length,7);const c=await app(),a=c.api,p=a.normalize(a.fresh('補給','mage'));p.location='town';p.gold=10000;a.setup(p,foe());const before=JSON.stringify(p.bag);for(const id of ['med','cell','twoStaff','petCirclet','essence_1','shard_weapon_1','scrap'])a.buy(id);assert.equal(p.gold,10000);assert.equal(JSON.stringify(p.bag),before);const held=p.bag.find(e=>e.id==='orb').qty;a.buy('orb');assert.equal(p.bag.find(e=>e.id==='orb').qty,held+1);assert.equal(p.gold,9965);assert.ok(p.bag.some(e=>e.id==='med'));
});

test('capture zone has no boss route or card drops, including a forced zero random roll; field zones keep both card rates',async()=>{
 const {mapRules,cardDropChance}=await import('../dist/map-rules.js'),{ZONES}=await import('../dist/world-data.js');assert.deepEqual(mapRules('petland'),{capture:true,bosses:false,cards:false,summary:'捕捉專區 · 無首領 · 不掉卡片'});assert.equal(cardDropChance('petland',{boss:true}),0);assert.equal(cardDropChance('town',{}),0);
 for(const z of ZONES){assert.equal(mapRules(z.id).capture,false);assert.equal(mapRules(z.id).bosses,true);assert.equal(cardDropChance(z.id,{}),.002);assert.equal(cardDropChance(z.id,{boss:true}),.001);}
 const c=await app(),a=c.api,p=a.normalize(a.fresh('捕捉專區','mage'));p.level=99;p.jobLevel=50;p.location='petland';c.rand=min=>min;a.setup(p,{...foe(),id:'fang',hp:0,xp:20,level:1,drops:['red_small']});a.award();assert.equal(p.cards.length,0);c.canEncounterBoss=()=>true;a.setEnemies([]);a.addEncounter(Date.now());assert.equal(a.state().enemies.length,1);assert.equal(a.state().enemies[0].boss,undefined);
 p.location='starter';a.setup(p,{...foe(),id:'world_1',hp:0,xp:20,level:1,drops:['red_small']});a.award();assert.ok(p.cards.some(card=>card.id==='world_1'));
});
test('evolution guide hides legendary/mythic appearances and clamps stale quality selection; owned forms remain visible',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('圖鑑','mage'));p.location='town';a.setup(p,foe());a.setEvolutionQuality('mythic');let html=a.renderEvolution();assert.equal((html.match(/<option /g)||[]).length,3);assert.ok(!html.includes('value="legendary"'));assert.ok(!html.includes('value="mythic"'));assert.ok(!html.includes('mutation-v18'));assert.ok(html.includes('可變異進化至傳說品質'));assert.ok(html.includes('神話品質'));
 const pet=c.makePet('fang');pet.rarity='legendary';pet.evolution=1;pet.level=40;p.pets=[pet];html=a.renderEvolution();assert.ok(html.includes(c.petArt(pet)));assert.ok(!html.includes(c.petArt(pet,2)));assert.ok(html.includes('未知的進化形態'));
});
test('overview and automation settings are separate and legacy capture-zone cards are retained',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('設定','mage'));a.setup(p,foe());const overview=a.renderOverview(),settings=a.renderAutomation();assert.ok(!overview.includes('data-autopotion'));assert.ok(settings.includes('data-autopotion="playerHp"'));assert.ok(settings.includes('data-autobuy-enabled="hp"'));assert.ok(settings.includes('data-escape-boss'));assert.ok(settings.includes('data-autoultimate'));
 p.cards=[{id:'boss_petland',qty:1}];a.normalize(p);assert.equal(p.cards[0].id,'boss_petland');assert.match(c.CARDS.boss_petland.description,/停止掉落/);
});

test('shop purchases requested quantities atomically and rejects insufficient funds or invalid quantities',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('大量購買','mage'));p.location='town';p.gold=240;a.setup(p,foe());a.buy('red_small',10);assert.equal(p.gold,0);assert.equal(p.bag.find(e=>e.id==='red_small').qty,10);const before=JSON.stringify(p);for(const qty of [0,-1,1.5,1000,NaN])a.buy('orb',qty);a.buy('orb',1);assert.equal(JSON.stringify(p),before);
 const q=a.normalize(a.fresh('儲存失敗','mage'));q.location='town';q.gold=100;a.setup(q,foe());a.setSaveResult(false);a.buy('orb',2);assert.equal(a.state().player.gold,100);assert.equal(a.state().player.bag.find(e=>e.id==='orb').qty,3);
});
test('throwing a ball automatically purchases exactly one missing ball and never charges when gold is insufficient',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('自動捕捉補給','mage'));p.location='petland';p.gold=35;p.bag=[];a.setup(p,{...foe(),id:'fang',hp:50,maxHp:100});c.Math.random=()=>.99;a.capture();assert.equal(p.gold,0);assert.ok(!p.bag.some(e=>e.id==='orb'));const before=JSON.stringify(p);a.capture();assert.equal(JSON.stringify(p),before);
 p.gold=100;p.bag=[{id:'orb',qty:2}];a.capture();assert.equal(p.gold,100);assert.equal(p.bag[0].qty,1);p.location='starter';p.bag=[];a.capture();assert.equal(p.gold,100);
});
test('four potion thresholds operate independently and respect disabled toggles',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('補給門檻','mage')),pet=c.makePet('shell');pet.id='pet-threshold';p.pets=[pet];p.activePetId=pet.id;p.bag=[{id:'red_mid',qty:10},{id:'blue_mid',qty:10}];a.setup(p,foe());p.hp=Math.floor(a.stat('hp')*.6);p.mp=a.stat('mp');pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;p.potionThresholds={playerHp:50,playerSp:20,petHp:80,petSp:90};const hp=p.hp;a.autoUsePotions();assert.equal(p.hp,hp);p.potionThresholds.playerHp=70;a.autoUsePotions();assert.ok(p.hp>hp);
 p.autoPotions.playerHp=false;p.hp=1;a.autoUsePotions();assert.equal(p.hp,1);pet.sp=Math.floor(c.petStats(pet).sp*.7);const sp=pet.sp;a.autoUsePotions();assert.ok(pet.sp>sp);
});
test('batch release protects active pet, returns equipment once, and cancels or rolls back without loss',async()=>{
 const c=await app(),a=c.api,p=a.normalize(a.fresh('批次放生','mage'));const pets=['fang','wisp','shell'].map((id,i)=>({...c.makePet(id),id:'batch'+i}));pets[1].gear.head=c.rollPetGear('petHelm',1);p.pets=pets;p.activePetId='batch0';a.setup(p,foe());a.selectForRelease(['batch0','batch1','batch2']);c.confirm=()=>false;a.releaseSelectedPets();assert.equal(p.pets.length,3);c.confirm=()=>true;a.setSaveResult(false);a.releaseSelectedPets();assert.equal(a.state().player.pets.length,3);assert.ok(!a.state().player.bag.some(e=>e.uid===pets[1].gear.head.uid));a.setSaveResult(true);a.releaseSelectedPets();assert.equal(a.state().player.pets.length,1);assert.equal(a.state().player.pets[0].id,'batch0');assert.equal(a.state().player.bag.filter(e=>e.uid===pets[1].gear.head.uid).length,1);a.releaseSelectedPets();assert.equal(a.state().player.pets.length,1);
});
test('mace names are corrected for new drops and existing equipped or bag gear without altering stats',async()=>{
 const c=await app(),a=c.api,p=a.fresh('權杖名稱','acolyte');assert.match(p.gear.rightHand.name,/單手權杖/);p.gear.rightHand.name=p.gear.rightHand.name.replace('權杖','拳杖');p.bag.push({...c.rollGear('mace',1),name:'稀有 晨曦·單手拳杖'});const affixes=JSON.stringify(p.gear.rightHand.affixes);a.normalize(p);assert.match(p.gear.rightHand.name,/單手權杖/);assert.match(p.bag.find(e=>e.id==='mace').name,/單手權杖/);assert.equal(JSON.stringify(p.gear.rightHand.affixes),affixes);
});
