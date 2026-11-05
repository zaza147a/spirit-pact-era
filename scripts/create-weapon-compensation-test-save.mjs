import {writeFileSync,mkdirSync} from 'node:fs';
import {runBuild} from './optimized-dps-simulator.mjs';
import {rollGear} from '../dist/loot.js';

// A legacy save without weaponCompensation intentionally tests eligibility migration.
const result=runBuild('assassin','attack',{level:210,encounterLevel:201,gearLevel:200,petLevelOverride:200,seconds:0,seed:147,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:'attack-magic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:8,fixture:true});
const player=result.fixture;
player.name='武器改版補償測試';
player.gear.rightHand=rollGear('katar',200,'mythic',()=>.5);
player.gear.rightHand.enhancement='SSS';
player.offline={at:Date.now()-5*60*1000,enabled:true};
delete player.weaponCompensation;
delete player.trialRun;
const save={version:2,player};
mkdirSync('dist/test-saves',{recursive:true});
writeFileSync('dist/test-saves/weapon-compensation-assassin-200.json',JSON.stringify(save,null,2)+'\n');
console.log(`Wrote test slot: ${player.job} Lv${player.level}, weapon ${player.gear.rightHand.id} Lv${player.gear.rightHand.level}`);
