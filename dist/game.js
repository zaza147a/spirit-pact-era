import {HOMECOMING_SCENE_ART} from './homecoming-art.js';
import {FOURTH_SKILLS,fourthPair,fourthUnlocked,newFourthState,advanceFourthCharge,chargeFourth,consumeFourth,fourthOffense} from './companion-fourth-skill.js';
import {HOMECOMING_ROUTES,HOMECOMING_BY_ID,homecomingMap,homecomingIdentity} from './homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation} from './homecoming-adventures.js';
import {normalizeHomecoming,discoverHomecoming,homecomingBonuses,eligibleHomecoming,homecomingContinents,homecomingTransition,homecomingAdventureAction} from './homecoming-state.js';
import {HOMECOMING_OPPONENTS} from './homecoming-encounters.js';
import {HOMECOMING_MAPS,homecomingEntryError,homecomingBattle,completeHomecomingBattle} from './homecoming-runtime.js';
import {homecomingTracker,renderHomecomingPanel,renderHomecomingTown} from './homecoming-ui.js';
import {SPIRIT_SANCTUARY_MAP,SPIRIT_SANCTUARY_MONSTERS,spiritSanctuaryUnlocked,isCaptureSanctuary,announceSpiritSanctuary,visitSpiritSanctuary,spiritSanctuaryTracker,blessSanctuaryPet} from './spirit-sanctuary.js';
import {homecomingPicture,showHomecomingPicture} from './homecoming-modal.js';
import {ensurePetEffects} from './dual-pet-effects.js';
import {patchTownArea} from './town-scene.js?v=7.1.9';
import {WEAPON_COMPENSATION_VERSION,initializeWeaponCompensation,compensationWeaponOptions,compensationNormalKeys,compensationSpecialKeys,compensationAffixCount,compensationAffixDescription,claimWeaponCompensation,compensationCanCorrect,claimWeaponCompensationCorrection} from './weapon-compensation.js?v=6.5.62';
import {commanderInheritedPetStats,commanderMainSkillMultiplier} from './commander-owner-growth.js';
import {spiritTargetDamageFactor} from './spirit-target-damage.js';
import {spiritPreFusionAttack,spiritPreFusionIsMagic} from './spirit-dual-offense.js?v=6.5.68';
import {petAttackIdentity,ownerAttackIdentity,compactAttackLabel,fusionEquipmentHint} from './attack-type-ui.js?v=7.0.2';
import {bindHeroRename} from './hero-rename.js?v=7.0.3';
import {chooseDefendingPet,pactOwnerOnlyAggro,commanderPetTargetChance} from './dual-pet-targeting.js';
import {dualSpiritResonance,canTriggerDualSpirit} from './dual-fusion-resonance.js';
import {queueCombatVfx} from './skill-effects.js?v=6.5.12';
import {TACTIC_COOLDOWN_MS,manualTactic,tacticSPCost,tacticRemaining,tacticActive,tacticDamageFactor,tacticIncomingFactor} from './manual-tactics.js?v=6.5.30';
import {CARD_COLLECTION_KEY,CARD_COLLECTION_NPC,CARD_COLLECTION_LOCK,readCardCollection,collectMissingCards,collectableFromPlayer,collectionProgress,collectibleCardIds,CARD_COLLECTION_MILESTONES,collectionMilestones,collectionGoldBonus,collectionTitle,normalizedCollection,organizeCards,withdrawCollectedCard} from './card-collection.js?v=6.5.36';
import {CARD_DRAW_COST,CARD_BOSS_RATE,cardRecyclePoints,cardRecycleValue,recycleCards,drawRecycledCards} from './card-recycling.js?v=6.5.28';
import {GOLD_COLLECTIBLES,goldCollectionTier,goldCollectionBonus,earnGold,buyGoldCollectible,goldWealth,reforgePrice,reforgeGear} from './gold-services.js?v=6.5.57';
import {multiTargets} from './adjacent-targets.js?v=6.5.12';
import {rankOutfitArt,rankOutfitName,RANK_OUTFITS} from './rank-outfits.js?v=6.5.0-spirit-20261104';
import {COSMETIC_STORAGE_KEY,COSMETIC_JOBS,COSMETIC_OUTFIT_PRICES,COSMETIC_BACKGROUNDS,cosmeticOutfitId,cosmeticOutfitArt,cosmeticBackgroundArt,readCosmeticCollection,normalizeCosmeticSelection,buyCosmetic,cosmeticWealth} from './cosmetic-gallery.js?v=6.5.35-spirit-gold-1';
import {WAREHOUSE_KEY,WAREHOUSE_ACK_PREFIX,WAREHOUSE_CAPACITY,WAREHOUSE_KEEPER,warehouseEquipment,warehouseItems,warehouseStackAllowed,warehouseStackItems,WAREHOUSE_BATCH_LIMIT,readWarehouse,applyWarehouseCustody,withWarehouseLock,transferWarehouseEquipment,transferWarehouseStack,exportWarehouse,importWarehouse} from './shared-warehouse.js?v=7.1.9';
import {migrateLegacyReselect,reselectionPet,RESELECT_ORDERED_TYPES} from './pet-legacy-reselect.js?v=6.5.0';
import {upgradeDawnSigil,sigilLevel,sigilCost,sigilBonus,dawnBossRewards,dawnArchonPreparationFactor} from './dawn-sigil.js?v=6.5.38';
import {advanceHumanoidEvolution,reconcileHumanoidStages,humanoidStage,nextHumanoidStage,HUMANOID_STAGES} from './pet-humanoid-evolution.js?v=6.5.0';
import {TRIAL_PORTAL,ENHANCER_NAME,ENHANCEMENT_RANKS,ENHANCEMENT_POWER,CONTROL_RESISTANCE,CONTROL_SLOTS,CONTROL_NAMES,enhancedAffixes,enhancedStat,rankOf,fullSetRank,normalizeEnhancements,unlockRankOutfits,controlResistance,enhanceEquipped,enhancePetEquipped,trialEntryError,TRIAL_ROUTES,createTrialBoss,trialDropTable,trialDrops,dawnEntryError} from './sky-trials.js?v=6.5.44';
import {towerFloor,towerEntryError,normalizeTowerProgress,towerObjectiveLabel} from './endless-tower.js';
import {towerFrostUnlocked,normalizeTowerCostume,towerFrostArt,chooseTowerCostume} from './tower-costumes.js';
import {TOWER_FIRST_RELEASE_MAX,buildTowerEnemies,beginTowerRun,markTowerEnemyDefeated,settleTowerRun,towerRemainingSeconds,towerBossSignature,postponeTowerPursuer} from './endless-tower-runtime.js';
import {renderTowerPanel,towerRewardNotice} from './endless-tower-ui.js';
import {EXTREME_TRIALS,extremeStage,normalizeExtremeProgress,beginExtremeRun,recordExtremeDamage,extremeStageResult,settleExtremeStage} from './extreme-trials.js';
import {renderExtremePanel} from './extreme-trials-ui.js';
import {unlockedTowerHonors,towerHonorOptions,normalizeTowerHonorSelection,selectTowerHonor,towerHonorFrameClass} from './tower-honors.js?v=7.1.9';
import {TOWER_SHOP_ITEMS,normalizeTowerCollection,buyTowerShopItem,towerCollectedBackgrounds,selectTowerBackground,towerShowcaseOwned,selectTowerShowcase,awardTowerCoins} from './tower-reward-shop.js?v=7.1.9';
import {DAWN_ZONE,DAWN_MONSTERS,DAWN_BOSS,DAWN_MAPS} from './dawn-world.js?v=6.5.0';
import {trueFormReady,TRUE_FORM_MESSAGE} from './pet-true-form.js?v=6.5.0';
import {companionResonance} from './fusion-resonance.js?v=6.5.0';
import {CONTINENTS,continentFor,PLAYER_REVIVE_MS,PET_REVIVE_MS,deathRemaining,baseExperienceNeed,petExperienceNeed,THIRD_SEAL,THIRD_SEAL_NAME,THIRD_SEAL_COST,thirdJobError,thirdJobRewards} from './frontier.js?v=7.0.1';
import {THIRD_JOBS,scaledSkillBuff} from './third-jobs.js?v=6.5.57';
import {FUSION_PAIRS,FUSION_NAMES,fusedPair,companionRole,fusionSkills,defaultFusionSkills,petSkillLimit,fusionPetError,fusePets} from './pet-fusion.js?v=6.5.5';
import {reconcileSkillPoints,updateSkillPointControls} from './skill-points.js?v=6.5.0';
import {manualSalePrice,sellBagEntry} from './inventory-sale.js?v=6.5.0';
import {bulkSaleQuote,sellBulkCategory} from './bulk-sale.js?v=6.5.46';
import {ATTRIBUTE_KEYS,gearAttributes,cardAttributes,gearAttributeLimit,cardAttributeLimit,attributeBreakdown,POTENTIAL_NAMES,free201AttributeReset,allocationDamageMultiplier,attributeDescriptions} from './growth-v5.js?v=6.5.0';
import {ASCENDED_FORMS,ASCENSION_COST,ascensionCost,LOYALTY_MAX,LOYALTY_PER_POINT,ASCENSION_LOYALTY,normalizePetLevel,petLevelCap,ascensionError,ascendPet,awardLoyalty,normalizeLoyalty} from './pet-ascension.js?v=6.5.0';
import {equipmentReadiness} from './gear-readiness.js?v=6.5.0';
import {capturedQuality,evolutionChances,MYTHIC_MUTATION,QUALITY_ORDER} from './pet-acquisition.js?v=6.5.0';
import {characterLevelCap,jobLevelCap,isTown,homeTown,attributeCap,ignoresGearLevel,experienceFactor,REBIRTH_CORE_ID,rebirthEligibility,normalizeProgression} from './adventure-progression.js?v=homecoming-1';
import {QUEST_REQUIREMENTS,JUNK_ITEMS,PROOF_ITEMS,BREAKTHROUGH_ITEM,acceptZoneQuest,questAcceptError,turnInZoneQuest,sellSelectedJunk} from './adventure-economy.js?v=6.5.48';
import {normalizeAutoSkills,orderedAutoSkills,moveAutoSkill,autoSkillGroup,normalizeCaptureRoles} from './auto-skill-rules.js?v=6.5.0';
import {BASE_ATTRIBUTE_CAP,jobAttributeBonus,capBaseAttributes,JOB_ATTRIBUTE_MAX} from './job-attributes.js?v=6.5.0';
import {normalizePotionThresholds,purchaseQuote,preferredPotion,retrainCost} from './supply-rules.js?v=6.5.0';
import {offlineWindow,inventoryDelta,offlineDuration,OFFLINE_STEP_MS} from './offline-rules.js?v=6.5.0';
import {mapRules,cardDropChance} from './map-rules.js?v=7.0.1';
import {SHOP_GROUPS,isShopItem} from './shop-catalog.js?v=6.5.44';
import {potionRestore} from './restoration.js?v=6.5.44';
import {combatContribution} from './combat-contribution.js?v=6.5.0';
import {SECOND_JOBS,parentJob,secondJobChoices,transferEligibility} from './jobs.js?v=6.5.47';
import {MAP_BOSSES,canEncounterBoss,BOSS_RESPITE_MS,bossRarity,BOSS_CARD_CHANCE} from './map-bosses.js?v=6.5.0';
import {CARD_PROFILES,socketCardBonus,describeCardEffects,cardAllowedInSlot,migrateCardBindings,cardEffectsFor,cardDescription,CARD_EFFECT_LABELS,formatCardNumber} from './card-effects.js?v=7.0.4';
import {bossCardEquipAllowed,bossCardHitBonus,bossCardIncoming,bossCardDodge,bossCardSong} from './boss-card-runtime.js?v=6.5.47';
let bossHitMeta=null;
import {playerRange,companionRange,rangeLabel,monsterTargetWeights,chooseMonsterTarget} from './formation.js?v=6.5.0';
import {CHARACTER_SLOT_COUNT,characterSlotKey,readCharacterSlot,writeCharacterSlot,readCharacterSlots,migrateLegacyCharacter} from './character-slots.js?v=7.1.9';
import {FUSION_STATS,fusionStatsFor,normalizeFusionSettings,fuseOne,fusionTargetInfo} from './fusion.js?v=6.5.57';
import {matchesGearFilters} from './inventory-rules.js?v=6.5.0';
import {TARGET_PRIORITIES,selectEncounterTarget,encounterDelay,replacementDelay,encounterLimit} from './encounter-rules.js?v=7.0.1';
import {patchHtml,panelIsEditing} from './ui-patch.js?v=6.5.0';
import {PET_ROUTES,PET_FAMILIES,PET_PALETTES,petRoute,petIcon,petForm,petArt,evolutionStage,evolveCompanion,synthesizeEssence} from './pet-evolution.js?v=6.5.0';
import {CLASSES,ATTRS,ITEMS,SPECIES,MONSTERS,PETLAND_MONSTERS,MAPS,CARDS,SLOTS,PET_SLOTS,PET_RARITIES,PET_EVOLUTIONS,petRarity,nextPetEvolution,clamp,rand,makePet,petStats as rawPetStats} from './catalog.js?v=7.0.1';
import {FIELDS,NAMES,newReport,record,finish,normalizeHistory,damageSplitPcb} from './contribution.js?v=6.5.0';
import {resonanceRule,resonanceOpener,resonanceTriggered,RESONANCE_RULES,RESONANCE_EVENTS,RESONANCE_MAX,ULTIMATE_COST,ULTIMATE_COOLDOWN} from './resonance.js?v=6.5.0';
import {PET_SKILLS,petSkillById,defaultPetSkills,petSkillsFor,petAbilitySetName,migratePetSkills,fusionSkillLoadoutNotice} from './pet-abilities.js?v=6.5.3';
import {JOB_SKILLS,jobSkillById,initialJobSkills,weaponSkillAllowed,activeJobSkills,jobPassives,skillUnlocked,supersededSkill,REBIRTH_MAIN_REPLACES} from './job-skills.js?v=6.5.68';
import {WORLD_MONSTERS,ZONES,worldMonsterArt} from './world-data.js?v=6.5.0';
import {rollGear,rollPetGear,rebalanceGear,gearStatValue,affixRange,normalizeBag,addStack,consumeStack,STACK_SET,RARITIES,AFFIX_NAMES,TIER_NAMES,gearTier,gearGroup,shardId,gearLabel,affixLabel,GEAR_BASE,PET_GEAR_BASE,SPECIAL_AFFIXES,equipmentDrop} from './loot.js?v=6.5.57';
import {spiritEquipmentSplit,isSpiritJob,spiritThirdJobExtraError,SPIRIT_TRIAL_ID,SPIRIT_TRIAL_KILLS,spiritQuestState,spiritGrowthGuide,startSpiritQuest,recordSpiritQuestVictory,completeSpiritQuest} from './spirit-job-rules.js';
import {activePetRoster,normalizeDualPetState,canSetSecondaryPet,secondPetDamageFactor,equipmentTargetPet} from './dual-pet-formation.js';
import {spiritSinglePetProfile} from './spirit-single-pet-profiles.js';
import {synchronizeCommanderCards} from './commander-card-sync.js';
import {commanderPetSkillForm,commanderSupportSkillPower,commanderSkillOutputScale,commanderFinalDamageFactor} from './commander-pet-skill-forms.js';
import {SPIRIT_PROC_RULES,createSpiritProcState,advanceSpiritProc} from './spirit-single-pet-procs.js?v=6.5.67';
import {outgoingHitDamage,incomingMonsterDamage,monsterAttackPower,monsterDefenseAgainst,aspdAttackIntervalMs,roStyleCritRate,hitChance,monsterHitChance,monsterCombatStats,monsterRuntimeStats,jobZoneOutputFactor,LEVEL_CAPS} from './combat-balance.js?v=6.5.0';
import {shouldAutoSalvage,SALVAGE_STATS} from './salvage-rules.js?v=6.5.45';

import {GEAR_TIERS,legacyFiveTierToNew,migrateFiveTierShards} from './progression.js?v=6.5.0';
import {playerAttackValue,playerMagicAttackValue,GLOBAL_SKILL_COOLDOWN,jobSkillCooldownMs,jobSkillMultiplier,freecastThreshold,jobSkillSpec,skillCastMs,skillActionDelay} from './player-scaling.js?v=6.5.45';
import {petSkillEffect,petSkillPreview,petOffensivePower,petDirectRoleMultiplier,fusionDirectOutputFactor,supportPulse,resonanceMagnitude,petUltimateSupport} from './pet-effects.js?v=6.5.0';

Object.assign(ITEMS,{
 dawn_archon_core:{name:'裁界者核心',quest:true,cost:0,description:'210等首領黎明裁界者保證取得，可強化高階曙界契印。'}
});
Object.assign(MAPS,HOMECOMING_MAPS);for(const m of Object.values(HOMECOMING_OPPONENTS))SPECIES[m.id]={name:m.name,role:m.role,roleName:m.roleName,level:m.level};
Object.assign(MAPS,DAWN_MAPS);for(const m of DAWN_MONSTERS)if(!WORLD_MONSTERS.some(x=>x.id===m.id))WORLD_MONSTERS.push(m);MAP_BOSSES.dawnrift=DAWN_BOSS;for(const m of [...DAWN_MONSTERS,DAWN_BOSS])SPECIES[m.id]={name:m.name,role:m.role,roleName:m.roleName,level:m.level};
for(const route of TRIAL_ROUTES)for(let i=0;i<5;i++){const m=createTrialBoss(route,i,MAP_BOSSES[route.map]);SPECIES[m.id]={name:m.name,role:'attack',roleName:'天穹試煉首領',level:m.level};}
let controlEffect=null;
let inCombatTick=false,attributeSnapshot=null,attributeBreakdownSnapshot=null,cardSnapshot={},passiveSnapshot=null;
let combatSamples=[],combatStarted=0,allocationAmounts={},sellAmounts={};
let offlineSimulation=false,offlineClock=null,offlineMetrics=null,settlingOffline=false,backgroundPaused=false;
const gameNow=()=>offlineClock??Date.now();
// Offline-only max-level pet-stat cache. Pet gear/IV/evolution are immutable
// during an offline encounter, while HP/SP and skill cooldowns remain dynamic.
// Live UI always uses the uncached production calculator.
const offlinePetStatCache=new WeakMap();
let offlineAffixCache=new WeakMap();
let offlinePactFusionCache=new WeakMap();
let offlineAutoSkillCache=null;
let offlineGearStatCache=new WeakMap();
let offlineGearTotals=new Map();
function combatEnhancedAffixes(item){
 if(!offlineSimulation||!item||globalThis.__spiritDisableOfflineAffixCache)return enhancedAffixes(item);
 const existing=offlineAffixCache.get(item);
 if(existing&&existing.affixes===item.affixes&&existing.enhancement===item.enhancement&&existing.level===item.level&&existing.id===item.id)return existing.values;
 const values=enhancedAffixes(item);
 offlineAffixCache.set(item,{affixes:item.affixes,enhancement:item.enhancement,level:item.level,id:item.id,values});
 return values;
}
// Equipment rolls are immutable while offline; level and job bonuses are
// calculated elsewhere. Cache only the item-level gear contribution.
function combatGearStatValue(item,type,job){
 if(!offlineSimulation||!item||globalThis.__spiritDisableOfflineGearStatCache)return gearStatValue(item,type,job);
 let entry=offlineGearStatCache.get(item);
 if(!entry||entry.affixes!==item.affixes||entry.enhancement!==item.enhancement||entry.level!==item.level||entry.id!==item.id||entry.powerVersion!==item.powerVersion){
  entry={affixes:item.affixes,enhancement:item.enhancement,level:item.level,id:item.id,powerVersion:item.powerVersion,values:new Map()};
  offlineGearStatCache.set(item,entry);
 }
 const key=`${job||''}:${type}`;
 if(!entry.values.has(key))entry.values.set(key,gearStatValue(item,type,job));
 return entry.values.get(key);
}
function combatGearTotal(type,equipped){
 if(!offlineSimulation||globalThis.__spiritDisableOfflineGearTotals)return equipped.reduce((n,item)=>n+combatGearStatValue(item,type,player.job),0);
 if(offlineGearTotals.has(type))return offlineGearTotals.get(type);
 const total=equipped.reduce((n,item)=>n+combatGearStatValue(item,type,player.job),0);
 offlineGearTotals.set(type,total);
 return total;
}
function petStats(pet){
 const base=basePetStats(pet);
 if(player?.job!=='spiritCommander'||!pet||pet.id!==player.activePetId||!player.gear||!player.attributes)return base;
 // The Commander shares owner vitality with its only active companion.
 // Return a new view so cached/base companion data remains untouched.
 return {...base,hp:commanderTransferredPetStats(pet,base).hp};
}
function basePetStats(pet){
 if(!offlineSimulation||pet?.level!==200||globalThis.__spiritDisablePetStatsCache)return rawPetStats(pet);
 const previous=offlinePetStatCache.get(pet);
 if(previous&&previous.gear===pet.gear&&previous.iv===pet.iv&&
    previous.fusion===pet.fusion&&previous.rarity===pet.rarity&&
    previous.evolution===pet.evolution&&previous.ascended===pet.ascended&&
    previous.trueForm===pet.trueForm)return previous.stats;
 const stats=rawPetStats(pet);
 offlinePetStatCache.set(pet,{gear:pet.gear,iv:pet.iv,fusion:pet.fusion,
  rarity:pet.rarity,evolution:pet.evolution,ascended:pet.ascended,
  trueForm:pet.trueForm,stats});
 return stats;
}

// Data version 2. Rendering stays separate from the state and rules below.
const KEY='icarus-prototype-v02',OLD='icarus-prototype-v01',$=id=>document.getElementById(id);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let characterSection='attributes',petSection='manage',releaseRarity='rare',petGearTargetId=null;
function selectedGearPet(){return equipmentTargetPet(player,petGearTargetId);}
function dualPetSelector(){return '';}
function setSecondaryPet(id){return toast('所有職業只能攜帶一隻出戰夥伴');}

let selectedReleasePets=new Set(),shopQuantities={};
let gameRunning=false,activeSlot=null,selectedSlot=0,creatingSlot=null,importTargetSlot=null,autoFusionRunning=false,autoFusionPlan=null,autoFusionAttempts=0,autoFusionNext=0,autoFusionStatus='尚未啟動';
let casting=null,manualElementalStrike=false;
let encounterSlots=[],petDeathSequence=0,pendingPetCredit=0;
let bossCooldowns={},classBuffs={},evolutionRunning=false,evolutionPreview=null,evolutionTimer=null;
let evolutionArtRarity='common',nextEncounterAt=0,encounterSerial=0;
let player=null,enemy=null,enemies=[],tab='combat',combatView='player',logView='all',bagCategory='consumables',bagGearPage=0,cardFilterSlot='all',cardCompareSlots={},gearFilterRarity='all',gearFilterTier='all',gearFilterSlot='all',gearFilterStat='all',gearFilterJob='all',craftTier=1,craftBase='blade',selectedClass='swordsman',auto=true,log=[],deadUntil=0,report=null,petShield=0;
let timers={attack:0,skill:0,enemy:0,pet:0,petAbility:0,regen:0,tactic:0,resonance:0,ultimate:0},dirty=false,lastSave=0;
let petSkillTimers={},jobSkillTimers={};
let warehouseBusy=false,warehouseCategory='consumables',gearCompareMode='relevant';
let reforgeTarget=null,reforgeLocks=new Set(),reforgePreview=null;
let cardRecycleQuantities={},cardDrawResults=[];
let bossCardNotices=[],bossCardNoticeOpen=false;
let originalPactHitCount=0;
let resonanceUsedAt=new Map();
let originalPactCounters=new Map();
let secondaryPetEffects={};
let spiritProcState=createSpiritProcState();
let spiritReactiveCharge=null;
let spiritPiercePct=0;
let spiritHitRoll=null;
let spiritGuardianVerdict=null;
function combatPetFactor(pet){const petId=typeof pet==='string'?pet:pet?.id;return secondPetDamageFactor(player,petId,{overload:player?.job==='spiritCommander'&&player.thirdJob&&classBuffs.dualOverload?.until>gameNow()});}
function spiritMainProfile(chosen){if(player?.job!=='pactWarrior'||!['pactSlash','rebirthMain_pactWarrior','thirdMain_pactWarrior'].includes(chosen?.id))return null;return spiritSinglePetProfile(player,activePet());}
function spiritAttackIsMagic(profile,atk,matk,fallback=false){return profile?.kind==='magic'||profile?.kind==='hybrid'&&matk>atk||!profile&&fallback;}
function spiritReactiveEvent(event){ if(!player||player.hp<=0)return null;
 const pet=activePet(),profile=spiritSinglePetProfile(player,pet);
 if(!profile||profile.trigger!==event||!pet?.hp)return null;
 const source=profile.source==='owner'?player:pet;
 if(source.hp<=0)return null;
 const maxHp=profile.source==='owner'?stat('hp'):petStats(pet).hp;
 const now=gameNow(),proc=advanceSpiritProc(spiritProcState,profile,event,{now,
  hpPercent:100*source.hp/Math.max(1,maxHp),targetId:enemy?.instanceId||enemy?.id});
 if(!proc)return null;
 spiritReactiveCharge={source:profile.source,bonusPct:proc.bonusPct,ignoreDef:proc.ignoreDef||0,until:now+8000};
 if(proc.healPct){
  const healing=Math.round(maxHp*proc.healPct/100),effective=Math.min(Math.max(0,maxHp-source.hp),healing);
  source.hp=Math.min(maxHp,source.hp+healing);
 }
 if(proc.shieldPct){
  if(profile.source==='owner')grantPlayerShield(Math.round(maxHp*proc.shieldPct/100),6500);
  else {const fx=effectsForPet(pet);fx.shield=Math.min(Math.round(maxHp*.25),(fx.shield||0)+Math.round(maxHp*proc.shieldPct/100));}
 }
 return proc;
}
function spiritAttackProcBonus(key,secondary=false){
 spiritPiercePct=0;
 if(secondary||!['playerDamage','petDamage'].includes(key)||!activePet()?.hp)return 0;
 const profile=spiritSinglePetProfile(player,activePet());
 if(!profile||key!==(profile.source==='owner'?'playerDamage':'petDamage'))return 0;
 const trigger=profile.trigger;
 const owner=profile.source==='owner';
 const hitTriggers=owner?['ownerHit','ownerSkill','ownerCombo','ownerAlternatingHit','ownerCastCycle']:['petHit','petSkill','petAlternatingHit','petCastCycle'];
 if(!hitTriggers.includes(trigger)){
  if(spiritReactiveCharge?.source===profile.source&&spiritReactiveCharge.until>=gameNow()){
   const bonus=spiritReactiveCharge.bonusPct;spiritPiercePct=spiritReactiveCharge.ignoreDef||0;spiritReactiveCharge=null;return bonus;
  }
  return 0;
 }
 if(trigger.endsWith('Skill')&&!bossHitMeta?.skillId)return 0;
 const source=owner?player:activePet(),maxHp=owner?stat('hp'):petStats(source).hp;
 const proc=advanceSpiritProc(spiritProcState,profile,trigger,{now:gameNow(),
  channel:bossHitMeta?.magical?'magic':'physical',hpPercent:100*source.hp/Math.max(1,maxHp),
  targetId:enemy.instanceId||enemy.id});
 if(proc){spiritPiercePct=proc.ignoreDef||0;spiritHitProcEffects(proc,owner,source,maxHp);}
 return proc?.bonusPct||0;
}
function spiritHitProcEffects(proc,owner,source,maxHp){
 if(!proc)return;
 // Guardian Verdict already heals through its dedicated pet-attack sequence.
 if(proc.healPct&&proc.effect!=='guardianVerdict'){
  const healed=Math.min(Math.max(0,maxHp-source.hp),Math.round(maxHp*proc.healPct/100));
  source.hp+=healed;
  if(healed)record(report,'effectiveHeal',healed);
 }
 if(proc.cooldownReductionMs){
  const timersToReduce=owner?jobSkillTimers:petSkillTimers;
  const prefix=owner?'':`${source.id}:`;
  for(const id of Object.keys(timersToReduce)){
   if(!owner&&!id.startsWith(prefix))continue;
   timersToReduce[id]=Math.max(0,timersToReduce[id]-proc.cooldownReductionMs);
  }
 }
}
const PACT_ASSIMILATION_RATIOS=Object.freeze(Object.fromEntries(Object.entries({
 'attack-magic':{atk:4.0,matk:.90},
 'attack-defense':{atk:4.0,matk:.90},
 'attack-support':{atk:4.0,matk:.90},
 'magic-defense':{atk:1.28,matk:2.10},
 'magic-support':{atk:1.28,matk:2.10},
 'defense-support':{atk:8.80,matk:.90},
 default:{atk:1.80,matk:.90}
}).map(([key,offense])=>[key,{...offense,def:.19,mdef:.19,hp:.15}])));
function pactAssimilationBonus(type){
 if(player?.job!=='pactWarrior')return 0;
 const companion=activePet(),pair=companion?.fusion;
 let fusion;
 if(offlineSimulation&&!globalThis.__spiritDisableOfflinePactFusionCache&&pair?.main&&pair?.sub){
  const cached=offlinePactFusionCache.get(companion);
  if(cached&&cached.main===pair.main&&cached.sub===pair.sub&&cached.thirdJob===player.thirdJob)fusion=cached.fusion;
  else{fusion=spiritSinglePetProfile(player,companion)?.fusion;offlinePactFusionCache.set(companion,{main:pair.main,sub:pair.sub,thirdJob:player.thirdJob,fusion});}
 }else fusion=spiritSinglePetProfile(player,companion)?.fusion;
 // Each fusion keeps its own offensive identity. Survival assimilation remains
 // identical across the six routes and the ten existing jobs are untouched.
 // Only the PET -> owner inheritance is reduced. Do not scale final DEF or
 // incoming monster damage by a special class-specific multiplier.
 const ratios=PACT_ASSIMILATION_RATIOS[fusion]||PACT_ASSIMILATION_RATIOS.default;
 if(!ratios[type])return 0;
 let total=0;
 for(const pet of activePetRoster(player)){
  if(pet.hp<=0)continue;
  const base=petStats(pet)[type]; // already includes pet level, rarity, evolution, IV and flat equipment
  // Pet weapon/armor affix investment additionally trains assimilation. HP% is
  // already included in petStats, so never double-count that multiplier.
  const affixes=Object.values(pet.gear||{}).reduce((n,item)=>{
   if(!item||(item.level||1)>pet.level)return n;
   const e=combatEnhancedAffixes(item);
   if(type==='atk')return n+(e.atkPct||0)+((e.crit||0)*.20)+((e.critDmg||0)*.08)+((e.aspdPct||0)*.20);
   if(type==='matk')return n+(e.matkPct||0)+((e.magicDamage||0)*.30)+((e.ignoreDef||0)*.10);
   return n;
  },0);
  const gearTraining=['atk','matk'].includes(type)?1+Math.min(.20,Math.max(0,affixes)/200):1;
  total+=base*ratios[type]*gearTraining;
 }
 return total*sigilBonus(player)[type];
}
function commanderTransferredPetStats(pet,base){
 if(player?.job!=='spiritCommander'||pet?.hp<=0)return base;
 const cardEffects=Object.fromEntries(['atk','matk','hp','mp','def','mdef','hit','flee',
  'atkPct','matkPct','hpPct','mpPct','defPct','mdefPct','fleePct','aspdPct',
  'crit','critDmg','ignoreDef','magicDamage','damageReduction',
  'STR','AGI','VIT','INT','DEX','LUK'].map(key=>[key,cardBonus(key)]));
 const uncoupled=(type,pct)=>Math.max(0,Math.round(stat(type,true)/(1+(cardEffects[pct]||0)/100)-(cardEffects[type]||0)));
 // Derive from current owner combat stats every time; never mutate pet's cached base.
 const inherited=commanderInheritedPetStats({...base,hp:basePetStats(pet).hp},{
  atk:uncoupled('atk','atkPct'),rawAtk:rawStat('atk')-cardEffects.atk,
  matk:uncoupled('matk','matkPct'),rawMatk:rawStat('matk')-cardEffects.matk,
  def:uncoupled('def','defPct'),mdef:uncoupled('mdef','mdefPct'),
  hp:uncoupled('hp','hpPct'),damageReduction:Math.max(0,stat('damageReduction')-cardEffects.damageReduction),
  // Both equipped affixes (including upgraded tiers) and cards train the pets.
  // Base equipment ATK/MATK/DEF/MDEF is already included in stat() above.
  cardPower:0, // card power is copied directly below, never multiplied twice
  gearPower:Object.values(player.gear).reduce((n,item)=>{
   if(!item)return n;
   const e=combatEnhancedAffixes(item);
   return n+(e.atkPct||0)*.70+(e.matkPct||0)*.70
    +(e.crit||0)*.35+(e.critDmg||0)*.16
    +(e.aspdPct||0)*.45+(e.magicDamage||0)*.40
    +(e.ignoreDef||0)*.18;
  },0)
 });
 const synced=synchronizeCommanderCards(inherited,cardEffects);
 synced.commanderMainSkillMultiplier=commanderMainSkillMultiplier({
  atk:uncoupled('atk','atkPct'),matk:uncoupled('matk','matkPct'),
  def:uncoupled('def','defPct'),mdef:uncoupled('mdef','mdefPct')
 },base,spiritSinglePetProfile(player,pet)?.fusion);
 // Pure-magic fusion converts part of its inherited physical power into
 // spellblade power. Other fusion types retain their original attack channels.
 if(spiritSinglePetProfile(player,pet)?.kind==='magic'){
  const magicAttunement=Math.round(inherited.atk*.55);
  synced.matk+=magicAttunement;
  if(offlineMetrics)offlineMetrics.magicAttunement={atk:inherited.atk,bonusMatk:magicAttunement};
 }
 if(spiritSinglePetProfile(player,pet)?.fusion==='attack-defense'){
  // Bulwark assault: inherited defenses sharpen the pet's active physical main.
  // This is independent of damage taken and never grants counterattacks.
  const bulwarkPower=Math.round(Math.min((inherited.def+inherited.mdef)*.18,170000));
  synced.atk+=bulwarkPower;
  if(offlineMetrics)offlineMetrics.bulwarkAssault={bonusAtk:bulwarkPower};
 }
 // Guardian fusion converts both defenses and healing potency into active
 // offensive power. The attack source remains the pet; no counterattack triggers.
 if(spiritSinglePetProfile(player,pet)?.fusion==='defense-support'){
  // Convert defense aggressively at Lv200, but cap the bonus before SSS
  // Lv210 defense values turn a survival build into the top pure DPS option.
  const guardianHealingPower=Math.max(0,basePetStats(pet).healPower||0);
  const guardPower=Math.round(Math.min((inherited.def+inherited.mdef)*3.5+guardianHealingPower*170,1850000));
  if(offlineMetrics)offlineMetrics.guardianConversion={def:inherited.def,mdef:inherited.mdef,guardPower};
  const guardTempo=18;
  return {...synced,atk:synced.atk+guardPower,matk:synced.matk+guardPower,
   aspd:Math.min(193,(synced.aspd||140)+guardTempo)};
 }
 return synced;
}
function setPetStance(id,stance){return;}
function effectsForPet(pet){return pet?.id&&pet.id!==player?.activePetId?ensurePetEffects(secondaryPetEffects,pet.id):petEffects;}
let petEffects={bleedTicks:0,bleedNext:0,bleedPower:0,burnTicks:0,burnNext:0,burnPower:0,markHits:0,markPower:0,guardUntil:0,blessingUntil:0};
function clearPetEffects(){spiritProcState=createSpiritProcState();spiritReactiveCharge=null;spiritGuardianVerdict=null;timers.wizardStoredCharges=0;timers.wizardStoredUntil=0;timers.wizardWardChargedAt=0;timers.wizardWardChargeUntil=0;timers.wizardWardChargedPetId=null;timers.soundShieldCharge=0;timers.soundShieldUntil=0;timers.knightBrokenShieldUntil=0;originalPactHitCount=0;originalPactCounters.clear();delete classBuffs.pact;delete classBuffs.resonanceHaste;delete classBuffs.resonanceCrit;petEffects={shield:0,bleedTicks:0,bleedNext:0,bleedPower:0,burnTicks:0,burnNext:0,burnPower:0,markHits:0,markPower:0,guardUntil:0,blessingUntil:0,blessingPower:0};secondaryPetEffects={};petSkillTimers={};timers.petAbility=gameNow()-12000;timers.petAbilityById={};timers.petById={};timers.dualSpiritAt=0;}

function fresh(name,job){const c=CLASSES[job];const p={version:51,name,job,location:'petland',level:1,xp:0,jobLevel:1,jobXp:0,jobPoints:0,jobSkills:initialJobSkills(job),equippedJobSkill:Object.keys(initialJobSkills(job))[0],gold:90,cardRecyclePoints:0,tacticReadyAt:0,tacticEffect:null,hp:c.hp,mp:c.mp,kills:0,bag:[{id:'med',qty:2},{id:'cell',qty:1},{id:'orb',qty:3}],gear:Object.fromEntries(Object.keys(SLOTS).map(s=>[s,null])),attributes:{STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1},statPoints:0,cards:[],sockets:Object.fromEntries(Object.keys(SLOTS).map(s=>[s,null])),pets:[],activePetId:null,petBook:{},resonance:0,shield:0,battleHistory:[],autoUltimate:true,autoEscapeBoss:false,autoPotions:{playerHp:true,playerSp:true,petHp:true,petSp:true},manaGuardEnabled:true,autoSalvage:false,salvageMaxRarity:'rare',salvageMaxTier:3,salvageStat:'STR',salvageStatBelow:3,keepRarity:true,keepTier:true,keepStat:false,salvageMatchMode:'any'};const id=SECOND_JOBS[job]?.weapon||({swordsman:'blade',mage:'oneStaff',acolyte:'mace',thief:'rifle',archer:'shortBow',spiritist:'staffSword'})[job];p.gear.rightHand=rollGear(id,1,'common');return p;}
function normalizeCards(cards){const result=[];for(const entry of cards||[]){const id=typeof entry==='string'?entry:entry?.id;if(!CARDS[id])continue;const qty=typeof entry==='string'?1:Math.max(1,Math.floor(entry.qty||1));const found=result.find(x=>x.id===id);if(found)found.qty+=qty;else result.push({id,qty});}return result;}
function addCard(id){const entry=player.cards.find(x=>x.id===id);if(entry)entry.qty++;else player.cards.push({id,qty:1});}
function queueBossCardNotice(id){
 if(!CARDS[id]?.boss)return;
 if(offlineSimulation){if(offlineMetrics)(offlineMetrics.bossCards??=[]).push(id);return;}
 bossCardNotices.push(id);if(bossCardNoticeOpen){const next=document.getElementById('bossCardNoticeNext');if(next)next.textContent='收下卡片 · 下一張';}showNextBossCardNotice();
}
function showNextBossCardNotice(){
 if(typeof document!=='undefined'&&typeof refreshWeaponCompensationReminder==='function')refreshWeaponCompensationReminder();
 if(bossCardNoticeOpen||!bossCardNotices.length||!gameRunning||!$('offlineModal')?.hidden)return;
 const id=bossCardNotices.shift(),card=CARDS[id];if(!card)return showNextBossCardNotice();
 bossCardNoticeOpen=true;
 let modal=document.getElementById('bossCardNotice');
 if(!modal){modal=document.createElement('div');modal.id='bossCardNotice';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','bossCardNoticeTitle');modal.style.cssText='position:fixed;inset:0;z-index:10050;display:grid;place-items:center;background:rgba(4,8,25,.86);padding:16px';document.body.append(modal);}
 const effectText=describeCardEffects(cardEffectsFor(card,player?.level||1));
 const specialText=(card.description||'').split('專屬效果：')[1]?.replace(/。\s*$/,'')||'無額外觸發效果';
 modal.innerHTML=`<section class="boss-notice-card"><p class="boss-notice-eyebrow">♛ BOSS CARD ♛</p><h2 id="bossCardNoticeTitle">恭喜獲得首領卡片！</h2><div class="boss-notice-art">${spriteHtml(id,'large')||'♛'}</div><h3 class="boss-notice-name">${escapeHtml(card.name)}</h3><div class="boss-notice-info"><div class="boss-notice-field"><strong>基本能力</strong><p>${escapeHtml(effectText)}</p></div><div class="boss-notice-field boss-notice-special"><strong>專屬效果</strong><p>${escapeHtml(specialText)}</p></div></div><p class="boss-notice-slot">限定部位 <b>${escapeHtml(card.slots.map(slot=>SLOTS[slot]).join('／'))}</b></p><button id="bossCardNoticeNext">收下卡片${bossCardNotices.length?' · 下一張':''}</button></section>`;
 modal.hidden=false;modal.style.display='grid';
 const noticeNext=modal.querySelector?.('#bossCardNoticeNext');
 if(noticeNext)noticeNext.onclick=()=>{modal.hidden=true;modal.style.display='none';bossCardNoticeOpen=false;showNextBossCardNotice();};
 modal.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();noticeNext?.click();}else if(e.key==='Tab'){e.preventDefault();noticeNext?.focus();}};
 noticeNext?.focus();
}
function takeCard(id){const entry=player.cards.find(x=>x.id===id);if(!entry||entry.qty<1)return false;if(!--entry.qty)player.cards.splice(player.cards.indexOf(entry),1);return true;}
const LEGACY_JOBS={soldier:'swordsman',gunner:'thief',tech:'mage'};
function normalize(p){p.extremeProgress=normalizeExtremeProgress(p.extremeProgress);p.extremeCoins=Math.max(0,Math.floor(Number(p.extremeCoins)||0));if(p.extremeRun){delete p.extremeRun;p.location='dawncity';p.extremeInterrupted=true;if(p.offline)p.offline.enabled=false;}p.towerProgress=normalizeTowerProgress(p.towerProgress);p.towerCoins=Math.max(0,Math.floor(Number(p.towerCoins)||0));if(p.towerRun){delete p.towerRun;p.location='dawncity';p.towerInterrupted=true;if(p.offline)p.offline.enabled=false;}p.tacticReadyAt=Number.isFinite(p.tacticReadyAt)&&p.tacticReadyAt>=0?p.tacticReadyAt:0;p.tacticEffect=p.tacticEffect&&typeof p.tacticEffect.kind==='string'&&Number.isFinite(p.tacticEffect.until)&&p.tacticEffect.until>0?p.tacticEffect:null;p.manaGuardEnabled=p.manaGuardEnabled!==false;p.cardRecyclePoints=cardRecyclePoints(p);p.goldCollectionTier=goldCollectionTier(p);migrateLegacyReselect(p);normalizeProgression(p);p.free201ResetUsed=p.free201ResetUsed===true;normalizeEnhancements(p);unlockRankOutfits(p,GEAR_BASE);p.trialClears=Object.fromEntries(TRIAL_ROUTES.map(r=>[r.map,Math.max(0,Math.floor(Number(p.trialClears?.[r.map])||0))]));if(p.trialRun&&!(p.trialRun.continuous===true&&p.trialClears[p.trialRun.map]>0&&validTrialCheckpoint(p.trialRun))){delete p.trialRun;p.location='skycity';p.trialInterrupted=true;if(p.offline)p.offline.enabled=false;}if(p.trialRun)p.location=p.trialRun.map;if(p.hp<=0&&!Number.isFinite(p.reviveAt))p.reviveAt=gameNow()+PLAYER_REVIVE_MS;if(p.attributes)capBaseAttributes(p);p.autoRevive=p.autoRevive===true;p.manualPaused=p.manualPaused===true;p.potionPriority={playerHp:"high",playerSp:"high",petHp:"high",petSp:"high",...p.potionPriority};p.potionThresholds=normalizePotionThresholds(p.potionThresholds);p.fusionSettings=normalizeFusionSettings(p.fusionSettings);p.fusionNotice=p.fusionNotice&&typeof p.fusionNotice.uid==='string'?{uid:p.fusionNotice.uid,attempts:Math.max(1,Math.floor(Number(p.fusionNotice.attempts)||1))}:null;p.targetPriority=TARGET_PRIORITIES[p.targetPriority]?p.targetPriority:'lowestHp';if(LEGACY_JOBS[p.job])p.job=LEGACY_JOBS[p.job];if(!MAPS[p.location])p.location='petland';if(p.location==='wasteland')p.location='starter';p.petBook=p.petBook||{};p.resonance=clamp(Number(p.resonance)||0,0,100);p.shield=clamp(Number(p.shield)||0,0,50000);p.battleHistory=normalizeHistory(p.battleHistory);p.level=Math.min(characterLevelCap(p),p.level);p.jobLevel=Math.min(jobLevelCap(p),Number.isInteger(p.jobLevel)?p.jobLevel:p.level);if(!p.jobSkills){p.jobSkills=initialJobSkills(p.job);p.jobPoints=Math.max(0,p.jobLevel-1);p.jobXp=0;}p.firstJobLevel=Math.min(50,Math.max(1,Number(p.firstJobLevel)||p.jobLevel));p.firstJobPoints=Math.max(0,Number(p.firstJobPoints)||0);p.jobXp=Math.max(0,Number(p.jobXp)||0);p.jobPoints=Math.max(0,Number(p.jobPoints)||0);p.autoUltimate=p.autoUltimate!==false;p.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true,...p.autoPotions};p.autoEscapeBoss=p.autoEscapeBoss===true;p.autoSalvage=p.autoSalvage===true;p.salvageMaxRarity=RARITIES.some(r=>r.id===p.salvageMaxRarity)?p.salvageMaxRarity:'common';p.cards=normalizeCards(p.cards);for(const [id,rank] of Object.entries(p.jobSkills)){if(!jobSkillById(p.job,id)){p.jobPoints+=Math.max(0,Number(rank)||0);delete p.jobSkills[id];}}for(const s of JOB_SKILLS[p.job]||[])p.jobSkills[s.id]=Math.min(s.maxRank,Math.max(0,p.jobSkills[s.id]||0));p.equippedJobSkill=jobSkillById(p.job,p.equippedJobSkill)?.kind!=='passive'&&jobSkillById(p.job,p.equippedJobSkill)&&p.jobSkills[p.equippedJobSkill]?p.equippedJobSkill:(activeJobSkills(p.job).find(s=>p.jobSkills[s.id]&&(!SECOND_JOBS[p.job]||s.branch==='second'))||activeJobSkills(p.job).find(s=>p.jobSkills[s.id])||activeJobSkills(p.job)[0]).id;p.autoSkills=normalizeAutoSkills(p.autoSkills,JOB_SKILLS[p.job].map(s=>({...s,learned:!!p.jobSkills[s.id]})));p.autoCaptureRoles=normalizeCaptureRoles(p.autoCaptureRoles);p.bag=normalizeBag(p.bag,ITEMS);p.rebornJobPoints=Math.max(0,Math.floor(Number(p.rebornJobPoints)||0));if((p.growthVersion||0)<50){for(const skill of JOB_SKILLS[p.job])if(skill.rebornOnly)delete p.jobSkills[skill.id];p.growthVersion=50;if(!p.jobSkills[p.equippedJobSkill])p.equippedJobSkill=activeJobSkills(p.job).find(s=>p.jobSkills[s.id]&&!s.rebornOnly)?.id||activeJobSkills(p.job)[0].id;}
 normalizeTowerCostume(p);
 if(p.version<12){p.bag=normalizeBag(p.bag.map(e=>{const matched=/^shard_(weapon|armor)_([1-5])$/.exec(e.id);return matched?{...e,id:shardId(matched[1],Math.ceil(Number(matched[2])/2))}:e;}),ITEMS);}
 if((p.version||0)<21){p.bag=migrateFiveTierShards(p.bag);p.fusionSettings.tier=legacyFiveTierToNew(p.fusionSettings.tier);}
 p.salvageMaxTier=clamp(Math.round(Number(p.salvageMaxTier)||11),1,11);
 p.salvageStat=SALVAGE_STATS.includes(p.salvageStat)?p.salvageStat:'none';
 p.salvageStatBelow=clamp(Math.round(Number(p.salvageStatBelow)||0),0,999);
 if(p.version<14){p.autoSalvage=false;p.salvageMaxRarity='rare';p.salvageMaxTier=3;p.salvageStat='STR';p.salvageStatBelow=3;}
 p.keepRarity=p.keepRarity!==false;p.keepTier=p.keepTier!==false;p.keepStat=p.keepStat===true;
 p.salvageMatchMode=['any','two','all'].includes(p.salvageMatchMode)?p.salvageMatchMode:'any';
 p.salvageInventory=p.salvageInventory===true;p.salvageOtherJobs=p.salvageOtherJobs===true;
 const purchaseDefaults={hp:{enabled:false,id:'red_small',min:5,target:25},sp:{enabled:false,id:'blue_small',min:5,target:25}};
 p.autoBuyPotions=p.autoBuyPotions||{};
 for(const type of ['hp','sp']){const raw={...purchaseDefaults[type],...(p.autoBuyPotions[type]||{})},allowed=type==='hp'?['red_small','red_mid','red_large']:['blue_small','blue_mid','blue_large'];p.autoBuyPotions[type]={enabled:raw.enabled===true,id:allowed.includes(raw.id)?raw.id:purchaseDefaults[type].id,min:clamp(Math.round(Number(raw.min)||0),0,200),target:clamp(Math.round(Number(raw.target)||0),1,200)};p.autoBuyPotions[type].target=Math.max(p.autoBuyPotions[type].min,p.autoBuyPotions[type].target);}
 const previousGear=p.gear||{},previousSockets=p.sockets||{};p.gear=Object.fromEntries(Object.keys(SLOTS).map(s=>[s,previousGear[s]??(s==='rightHand'?previousGear.weapon:s==='accessory1'?previousGear.accessory:null)??null]));p.sockets=Object.fromEntries(Object.keys(SLOTS).map(s=>[s,previousSockets[s]??(s==='rightHand'?previousSockets.weapon:s==='accessory1'?previousSockets.accessory:null)??null]));
 migrateCardBindings(p,CARDS,SLOTS);
 for(const slot of Object.keys(SLOTS)){const item=p.gear[slot];if(typeof item==='string')p.gear[slot]=rollGear(item,1);else if(item){const invalidSpecial=!['legendary','mythic'].includes(item.rarity)&&Object.keys(item.affixes||{}).some(k=>SPECIAL_AFFIXES.has(k));if(!item.rarity||invalidSpecial)p.gear[slot]=rollGear(item.id,item.level||1,item.rarity);if(p.gear[slot])p.gear[slot].tier=gearTier(p.gear[slot].level);}}
 for(const pet of p.pets||[]){normalizeLoyalty(pet);pet.ascended=pet.ascended===true;if(pet.fusion&&!fusedPair(pet))delete pet.fusion;if(pet.trueForm!==true||!fusedPair(pet))delete pet.trueForm;if(fusedPair(pet)){pet.rarity='mythic';pet.ascended=true;}if(pet.hp<=0&&!Number.isFinite(pet.reviveAt))pet.reviveAt=gameNow()+PET_REVIVE_MS;normalizePetLevel(pet);const role=SPECIES[pet.species]?.role;if(role){pet.rarity=PET_RARITIES.some(r=>r.id===pet.rarity)?pet.rarity:'common';pet.evolution=clamp(Math.floor(Number(pet.evolution)||0),0,4);pet.iv={hp:0,atk:0,def:0,matk:0,sp:0,aspd:0,...pet.iv};const previous=pet.gear||{};pet.gear=Object.fromEntries(Object.keys(PET_SLOTS).map(slot=>[slot,PET_GEAR_BASE[previous[slot]?.id]?.petSlot===slot?previous[slot]:null]));for(const item of Object.values(pet.gear))if(item)item.tier=gearTier(item.level);pet.equippedSkills=Array.isArray(pet.equippedSkills)?pet.equippedSkills:defaultPetSkills(role,pet.rarity);migratePetSkills(pet,role);pet.hp=clamp(Number.isFinite(pet.hp)?pet.hp:petStats(pet).hp,0,petStats(pet).hp);pet.sp=clamp(Number.isFinite(pet.sp)?pet.sp:petStats(pet).sp,0,petStats(pet).sp);}}if((p.version||0)<23){p.bag=p.bag.map(g=>g.uid?rebalanceGear(g):g);for(const slot of Object.keys(p.gear))p.gear[slot]=rebalanceGear(p.gear[slot]);for(const pet of p.pets)for(const slot of Object.keys(pet.gear))pet.gear[slot]=rebalanceGear(pet.gear[slot]);}for(const g of [...p.bag,...Object.values(p.gear)])if(g?.id==='mace'&&typeof g.name==='string')g.name=g.name.replaceAll('單手拳杖','單手權杖');p.bag=p.bag.map(g=>g.uid?rebalanceGear(g):g);for(const k of Object.keys(p.gear))p.gear[k]=rebalanceGear(p.gear[k]);for(const pet of p.pets){pet.locked=pet.locked===true;for(const k of Object.keys(pet.gear))pet.gear[k]=rebalanceGear(pet.gear[k]);}if(supersededSkill(p,jobSkillById(p.job,p.equippedJobSkill)))p.equippedJobSkill=p.thirdJob&&p.jobSkills['thirdMain_'+p.job]?'thirdMain_'+p.job:'rebirthMain_'+p.job;reconcileSkillPoints(p,JOB_SKILLS[p.job],!!SECOND_JOBS[p.job]);normalizeDualPetState(p);normalizeHomecoming(p);if(p.location===SPIRIT_SANCTUARY_MAP&&!spiritSanctuaryUnlocked(p))p.location='dawncity';if(homecomingMap(p.location)&&homecomingEntryError(p,p.location,p.pets.find(x=>x.id===p.activePetId)))p.location=homecomingMap(p.location).route.townId;if(homecomingMap(p.location)&&homecomingEntryError(p,p.location,p.pets.find(x=>x.id===p.activePetId)))p.location='town';p.version=51;return p;}
function migrate(old){const job=LEGACY_JOBS[old.job]||old.job;const p=fresh(old.name,job);for(const k of ['level','xp','gold','hp','mp','kills'])if(Number.isFinite(old[k]))p[k]=old[k];p.bag=normalizeBag(old.bag,ITEMS);for(const [from,to] of [['weapon','rightHand'],['armor','armor'],['accessory','accessory1']])if(old.gear?.[from]&&ITEMS[old.gear[from]])p.gear[to]=rollGear(old.gear[from],1);p.statPoints=Math.max(0,(p.level-1)*2);return p;}
function valid(p){return !!p&&typeof p.name==='string'&&p.name.length<=16&&CLASSES[p.job]&&Number.isInteger(p.level)&&p.level>=1&&p.level<=characterLevelCap(p)&&['hp','mp','xp','gold','kills','statPoints','jobLevel','jobXp','jobPoints'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<1e9)&&p.jobLevel<=jobLevelCap(p)&&Array.isArray(p.bag)&&p.bag.length<=2000&&p.bag.every(e=>e&&ITEMS[e.id]&&(ITEMS[e.id].slot||ITEMS[e.id].petSlot?!!e.uid:Number.isInteger(e.qty)&&e.qty>0))&&p.gear&&Object.keys(SLOTS).every(s=>p.gear[s]===null||ITEMS[p.gear[s]?.id]?.slot===s)&&p.attributes&&Object.keys(ATTRS).every(k=>Number.isInteger(p.attributes[k])&&p.attributes[k]>=1&&p.attributes[k]<=attributeCap(p))&&Array.isArray(p.cards)&&p.cards.length<=1000&&p.cards.every(c=>CARDS[c.id]&&Number.isInteger(c.qty)&&c.qty>0)&&Number.isSafeInteger(p.cardRecyclePoints)&&p.cardRecyclePoints>=0&&p.cardRecyclePoints<1e9&&p.sockets&&Object.keys(SLOTS).every(s=>p.sockets[s]===null||cardAllowedInSlot(CARDS[p.sockets[s]],s,p.job))&&Array.isArray(p.pets)&&p.pets.length<=100&&p.pets.every(q=>q&&SPECIES[q.species]&&typeof q.id==='string'&&Number.isInteger(q.level)&&q.level>=1&&q.level<=9999&&Number.isFinite(q.xp)&&q.xp>=0&&q.iv&&['hp','atk','def'].every(k=>Number.isInteger(q.iv[k])&&q.iv[k]>=0&&q.iv[k]<=5)&&q.gear&&Object.keys(PET_SLOTS).every(s=>q.gear[s]===null||ITEMS[q.gear[s]?.id]?.petSlot===s))&&(p.activePetId===null||p.pets.some(q=>q.id===p.activePetId))&&(!isSpiritJob(p.job)||p.secondaryPetId===null||p.secondaryPetId!==p.activePetId&&p.pets.some(q=>q.id===p.secondaryPetId));}
function load(){try{const v2=JSON.parse(localStorage.getItem(KEY)||'null');if(v2?.version===2&&v2.player){const p=normalize(v2.player);if(valid(p))return p;}const v1=JSON.parse(localStorage.getItem(OLD)||'null');if(v1?.v===1&&v1.p&&(CLASSES[v1.p.job]||LEGACY_JOBS[v1.p.job]))return migrate(v1.p);}catch(err){console.warn('Save read failed',err)}return null;}
function albumEarnGold(base,p,extra=0){let bonus=Number.isFinite(p?.cardAlbumGoldBonus)?p.cardAlbumGoldBonus:0;if(typeof localStorage!=='undefined'||globalThis.__spiritDisableOfflineStorageGuard===true)try{bonus=collectionGoldBonus(CARDS,readCardCollection(localStorage,CARDS));}catch{}return Math.round(earnGold(base,p,extra)*(1+bonus/100));}
function save(notifyUser=false){
 if(offlineSimulation)return true;if(!player||activeSlot===null)return false;
 const beforeCards=player.cards.map(card=>({...card})),beforePoints=player.cardRecyclePoints;
 let originalAlbum=null,albumChanged=false;
 try{
  // Keep all eight character slots independent of the shared album record.
  // Existing/corrupted album data is never overwritten by fallback defaults.
  try{
   originalAlbum=localStorage.getItem(CARD_COLLECTION_KEY);
   const album=readCardCollection(localStorage,CARDS),result=organizeCards(player,CARDS,album);
   if(result.changed){localStorage.setItem(CARD_COLLECTION_KEY,JSON.stringify(result.collection));albumChanged=true;}
  }catch(albumError){player.cards=beforeCards;player.cardRecyclePoints=beforePoints;console.warn('卡片自動整理暫停：',albumError);}
  sellSurplusPotions(player,ITEMS);exchangeOverflowGold(player);checkpointTrial();
  player.offline={at:Date.now(),enabled:auto&&!homecomingMap(player.location)&&(!player.trialRun||player.trialRun.continuous===true)};
  writeCharacterSlot(localStorage,activeSlot,player);dirty=false;lastSave=gameNow();
  if(notifyUser)toast(`第 ${activeSlot+1} 格角色已儲存`);return true;
 }catch(err){
  if(albumChanged){try{if(originalAlbum===null)localStorage.removeItem(CARD_COLLECTION_KEY);else localStorage.setItem(CARD_COLLECTION_KEY,originalAlbum);}catch{}}
  player.cards=beforeCards;player.cardRecyclePoints=beforePoints;
  toast('存檔失敗：瀏覽器儲存空間不足');return false;
 }
}

function toast(message){if(offlineSimulation)return;$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',2400)}
function renderLog(){const stats=$('battleTelemetry');if(stats&&player)stats.innerHTML=telemetryHtml();const el=$('log');if(!el)return;el.innerHTML=log.filter(x=>logView==='all'||x.category===logView).slice(-60).map(x=>`<div class="logline ${x.kind}"><span class="tiny">${x.time}</span> ${escapeHtml(x.content)}</div>`).join('');el.scrollTop=el.scrollHeight;}
function message(content,kind='',category=''){if(offlineSimulation)return;const pet=activePet(),value=String(content);category=category||(/受到|受傷|倒下|攔截|吸收|命中玩家|命中夥伴|HP -|SP -|閃避了/.test(value)?'damage':pet&&value.includes(pet.nickname)?'pet':/造成|未命中|重擊|暴擊|普通攻擊|攻擊/.test(value)?'player':'system');log.push({content,kind,category,time:new Date().toLocaleTimeString('zh-TW',{hour12:false})});if(log.length>100)log.shift();renderLog();}
function weaponTypes(){return {right:GEAR_BASE[player.gear.rightHand?.id]?.weaponType||null,left:GEAR_BASE[player.gear.leftHand?.id]?.weaponType||null};}
function canCastJobSkill(s){if(s.thirdOnly&&!player.thirdJob||s.rebornOnly&&!player.reborn||supersededSkill(player,s))return false;if(s.kind==='passive')return false;const w=weaponTypes();return weaponSkillAllowed(s,w.right,w.left);}
const activePet=()=>player?.pets.find(p=>p.id===player.activePetId)||null;
function clearStatSnapshots(){attributeSnapshot=null;attributeBreakdownSnapshot=null;cardSnapshot={};passiveSnapshot=null;}
function daggerShieldSpeedBonus(){return player?.job==='assassin'&&player.gear?.rightHand?.id==='rifle'&&player.gear?.leftHand?.id==='shield'?35:0;}
function cachedPassives(){const base=inCombatTick||offlineSimulation?passiveSnapshot??=jobPassives(player):jobPassives(player);const bonus=daggerShieldSpeedBonus();return bonus?{...base,aspdPct:(base.aspdPct||0)+bonus,critDmg:(base.critDmg||0)+45}:base;}
function attributeDetails(){if(inCombatTick||offlineSimulation)return attributeBreakdownSnapshot??=attributeBreakdown(player,CARDS);return attributeBreakdown(player,CARDS);}
function potentialBonus(key){return attributeDetails().potential[key]||0;}
function ownerHitChance(hit,flee,magical=false){return Math.max(.05,monsterHitChance(hit,flee,magical)-potentialBonus('AGI')*(magical?.25:1));}
function effectiveAttributes(){if((inCombatTick||offlineSimulation)&&attributeSnapshot)return attributeSnapshot;const attrs={...player.attributes},jobBonus=jobAttributeBonus(player,SECOND_JOBS),details=attributeDetails();for(const key of Object.keys(attrs))attrs[key]+=(jobBonus[key]||0)+details.gear[key]+details.card[key];if(inCombatTick||offlineSimulation)attributeSnapshot=attrs;return attrs;}

function cardBonus(key){if((inCombatTick||offlineSimulation)&&Object.hasOwn(cardSnapshot,key))return cardSnapshot[key];const n=socketCardBonus(player.sockets,CARDS,key,player.level);if(inCombatTick||offlineSimulation)cardSnapshot[key]=n;return n;}
function rawStat(type){const c=CLASSES[player.job],a=effectiveAttributes(),equipped=Object.values(player.gear);const gear=combatGearTotal(type,equipped)+cardBonus(type);const percent=t=>equipped.reduce((n,item)=>n+enhancedStat(item,t,item?.affixes?.[t]||0),0)/100;switch(type){case 'hp':return Math.round((c.hp+(player.level-1)*38+a.VIT*25+gear)*(1+percent('hpPct')));case 'mp':return c.mp+(player.level-1)*12+a.INT*5+gear;case 'atk':return playerAttackValue(player.job,c.atk,player.level,a,gear);case 'matk':return playerMagicAttackValue(player.level,a,gear);case 'def':return Math.round((c.def+(player.level-1)*2.8+a.VIT*3+gear)*(1+percent('defPct')));case 'mdef':return Math.round(player.level*.9+a.INT*1.5+a.VIT*1.2+gear);case 'hit':return (gameNow()<(timers.eagleUntil||0)?20:0)+(currentTactic()?.kind==='firstFocus'?20:0)+80+player.level*2+a.DEX*2+a.LUK*.3+gear;case 'flee':return (gameNow()<(timers.shadowUntil||0)?20:0)+Math.round((65+player.level*2+a.AGI*2+a.LUK*.15+gear)*(1+percent('fleePct')));case 'aspdPct':return gear;case 'ignoreDef':case 'magicDamage':return Math.min(60,gear);case 'crit':return roStyleCritRate(a.LUK,gear)+(gameNow()<(timers.eagleUntil||0)?5:0);case 'critDmg':return 140+Math.max(0,a.LUK-1)*.5+gear;case 'aspd':return Math.round(clamp(({swordsman:151,acolyte:147,mage:145,thief:156,archer:153,spiritist:150})[parentJob(player.job)]+a.AGI*.32+a.DEX*.025+gear,140,193)*10)/10;case 'speed':return Math.max(80,aspdAttackIntervalMs(stat('aspd'))/(1+(classBuffs.resonanceHaste?.until>gameNow()?classBuffs.resonanceHaste.power:0)+(equipped.reduce((n,g)=>n+enhancedStat(g,'aspdPct',g?.affixes?.aspdPct||0),0)+cardBonus('aspdPct'))/100));case 'damageReduction':return Math.min(40,gear);default:return 0;}}
function activeJobBuffBonus(key){let sum=0;for(const name in classBuffs){const buff=classBuffs[name];if(buff.until>gameNow())sum+=buff.modifiers?.[key]||0;}return sum;}
function passiveBonus(key){return (cachedPassives()[key]||0)+activeJobBuffBonus(key);}
function stat(type,excludeHomecoming=false){const bonuses=cachedPassives(),value=rawStat(type)+(bonuses[type]||0)+activeJobBuffBonus(type),cardType=({atk:'atkPct',matk:'matkPct',def:'defPct',flee:'fleePct',hp:'hpPct',hit:'hitPct',mp:'mpPct',mdef:'mdefPct'})[type];let result=cardType?value*(1+cardBonus(cardType)/100)*(1+((bonuses[cardType]||0)+activeJobBuffBonus(cardType))/100):value;if(['def','mdef'].includes(type))result*=1+effectiveAttributes().VIT*.006;if(type==='flee')result*=1+effectiveAttributes().AGI*.0045;if(type==='hp')result*=1+potentialBonus('VIT');if(type==='critDmg')result+=potentialBonus('LUK')*100;if(type==='crit'&&classBuffs.resonanceCrit?.until>gameNow())result=Math.min(100,result+classBuffs.resonanceCrit.power);if(['atk','matk','hp','def','mdef'].includes(type))result*=sigilBonus(player)[type];result+=pactAssimilationBonus(type);if(!excludeHomecoming&&['hp','def','mdef'].includes(type)){const b=homecomingBonuses(player);result*=1+(type==='hp'?b.hp:b.def);}if(type==='speed')return Math.round(result/(1+passiveBonus('aspdPct')/100+Object.values(player.gear).reduce((n,g)=>n+(GEAR_BASE[g?.id]?.aspdPct||0),0)/100+(currentTactic()?.kind==='frenzy'?.1:0)));if(type==='damageReduction')return Math.min(40,result);if(type==='crit')return Math.min(100,result+(currentTactic()?.kind==='firstFocus'?5:0));if(type==='critDmg')return Math.round(result*10)/10;if(type==='aspd')return Math.round(clamp(result,140,193)*10)/10;return Math.round(result);}
function classBuffPower(target='owner'){return passiveBonus('teamDamagePct')/100+Object.entries(classBuffs).reduce((sum,[key,b])=>sum+(!['autoSpell','pact','quickCast','resonanceHaste','resonanceCrit','teamWard'].includes(key)&&(key!=='devotion'||target==='pet')&&b.until>gameNow()&&(!b.modifiers||b.teamDamage)?b.power:0),0);}
function offensiveSource(skill=null){const shield=skill?.source==='holyShield'||skill?.source==='shield',preFusionMagic=spiritPreFusionIsMagic(player.job,player.thirdJob,stat('atk'),stat('matk')),magical=!shield&&(preFusionMagic??(skill?.kind==='magic'||!skill&&['mage','wizard','acolyte','priest','sage'].includes(player.job))),atk=stat('atk'),matk=stat('matk'),preFusionAttack=spiritPreFusionAttack(player.job,player.thirdJob,atk,matk),defenseForDamage=shield&&player.job==='crusader'?Math.min(stat('def',true),atk*2):stat('def',true),power=skill?.source==='holyShield'?atk*.85+defenseForDamage*(player.job==='crusader'?.06:.15):skill?.source==='shield'?atk*.8+defenseForDamage*(player.job==='crusader'?.08:.2):(preFusionAttack??(magical?matk:atk));return power*allocationDamageMultiplier(player.job,magical,effectiveAttributes(),playerRange(player.job)==='ranged')*(1+potentialBonus(magical?'INT':playerRange(player.job)==='ranged'?'DEX':'STR'));}

function threshold(){return baseExperienceNeed(player);}
function petThreshold(pet){return petExperienceNeed(pet);}
function jobThreshold(){return Math.round(80+15*player.jobLevel**2.1);}
function endReport(outcome){const completed=finish(report,outcome);if(completed){player.battleHistory.push(completed);player.battleHistory=player.battleHistory.slice(-12);dirty=true;}report=null;}
function startReport(){if(offlineSimulation){report=null;return;}report=newReport(player.location,enemy.id,activePet());if(isSpiritJob(player.job)){const roster=activePetRoster(player);report.dualPetDamage={first:0,second:0,dualResonance:0,firstName:roster[0]?.nickname||'第一夥伴',secondName:roster[1]?.nickname||'第二夥伴'};}}
function chooseAttackTarget(){let candidates=enemies;if(player?.towerRun){const objective=towerFloor(player.towerRun.floor).objective;if(objective==='hunt')candidates=enemies.filter(e=>e.hp>0&&!e.towerPursuer);if(objective==='assassinate')candidates=enemies.filter(e=>e.hp>0&&!e.towerEscort);}const target=selectEncounterTarget(candidates.length?candidates:enemies,player?.targetPriority,enemy);if(target)enemy=target;return target;}
const encounterMonsterPools=new Map();
function encounterMonsterPool(map){let pool=encounterMonsterPools.get(map);if(!pool){pool=WORLD_MONSTERS.filter(m=>m.map===map);encounterMonsterPools.set(map,pool);}return pool;}
function addEncounter(now=gameNow(),slotIndex=null){
 if(player.towerRun||player.extremeRun)return;
 if(homecomingMap(player.location))return addHomecomingEncounter(now);
 if(player.trialRun)return;
 if(isTown(player.location))return;
 const isPetland=isCaptureSanctuary(player.location),zone=ZONES.find(z=>z.id===player.location);
 const pool=player.location===SPIRIT_SANCTUARY_MAP?SPIRIT_SANCTUARY_MONSTERS:isPetland?PETLAND_MONSTERS:encounterMonsterPool(player.location);
 const candidates=pool.length?pool:encounterMonsterPool('starter'),isBoss=!isPetland&&canEncounterBoss(player.location,enemies,now,bossCooldowns[player.location]||0),m=isBoss?MAP_BOSSES[player.location]:candidates[rand(0,candidates.length-1)];if(!isBoss&&enemies.filter(e=>!e.boss&&e.hp>0).length>=encounterLimit(player.location))return;if(isBoss){bossCooldowns[player.location]=now+BOSS_RESPITE_MS;if(player.autoEscapeBoss){if(offlineMetrics)offlineMetrics.bossesEscaped++;message(`⚠ 遭遇地圖首領【${m.name}】，依設定自動逃走，未消耗補給。`,'rare','system');nextEncounterAt=now+replacementDelay();return;}}const hp=m.hp+(isPetland&&!isBoss?(player.level-1)*3:0);
 if(!isBoss&&slotIndex===null)slotIndex=Array.from({length:encounterLimit(player.location)},(_,i)=>i).find(i=>!enemies.some(e=>!e.boss&&e.hp>0&&e.slotIndex===i));const foe={slotIndex:isBoss?null:slotIndex,...m,...monsterRuntimeStats(m),hp,maxHp:hp,atk:m.atk+(isPetland&&!isBoss?(player.level-1):0),lastAttack:now,appearedAt:now,instanceId:`${now}-${++encounterSerial}`};
 enemies.push(foe);if(foe.boss&&offlineMetrics)offlineMetrics.bossesEncountered=(offlineMetrics.bossesEncountered||0)+1;chooseAttackTarget();if(!report)startReport();message(`${foe.boss?'⚠ 地圖首領現身！':'遭遇 '}Lv.${foe.level||1} ${SPECIES[foe.id].name}！場上 ${enemies.length} 隻敵人。`,'','system');
}
function tickEncounters(now){if(player.extremeRun)return;if(player.towerRun){if(towerRemainingSeconds(player.towerRun,now)<=0)exitTower('挑戰超時');return;}if(homecomingMap(player.location))return tickHomecomingEncounters(now);if(player.trialRun){if(!enemies.some(e=>e.hp>0)&&now>=player.trialRun.nextAt)spawnTrialBoss();return;}if(isTown(player.location)||!player.hp)return;const capacity=encounterLimit(player.location);let changed=false;
 // The hot 100ms path usually has every encounter slot occupied. Avoid
 // allocating a fresh enemies array and scanning every slot each tick.
 if(enemies.some(e=>e.hp<=0))enemies=enemies.filter(e=>e.hp>0);
 if(capacity>0&&capacity<31&&encounterSlots.length>=capacity){
  let slotsReady=true;for(let slot=0;slot<capacity;slot++)if(!Number.isFinite(encounterSlots[slot])){slotsReady=false;break;}
  let occupied=0;for(const foe of enemies)if(!foe.boss&&foe.hp>0&&Number.isInteger(foe.slotIndex)&&foe.slotIndex>=0&&foe.slotIndex<capacity)occupied|=1<<foe.slotIndex;
  if(slotsReady&&occupied===(1<<capacity)-1)return;
 }
 for(let slot=0;slot<capacity;slot++){if(encounterSlots[slot]===undefined)encounterSlots[slot]=now+rand(100,900);if(!enemies.some(e=>!e.boss&&e.slotIndex===slot)&&now>=encounterSlots[slot]){encounterSlots[slot]=now+rand(250,1400);addEncounter(now,slot);changed=true;}}if(changed)render();}

function restoreTownPartyFully(){
 if(!player||!isTown(player.location))return false;
 // Entering any safe city (including ordinary travel, trial exit and town revival)
 // instantly restores the entire party, even pets still on a revive timer.
 player.hp=Math.max(1,stat('hp'));player.mp=Math.max(0,stat('mp'));
 delete player.reviveAt;delete player.trialDefeated;
 for(const pet of player.pets||[]){
  const maxima=petStats(pet);
  pet.hp=Math.max(1,maxima.hp);pet.sp=Math.max(0,maxima.sp);
  delete pet.reviveAt;
 }
 dirty=true;
 return true;
}
function spawn(){if(restoreTrialCheckpoint())return;casting=null;if(report)endReport('未完成');player.shield=Math.max(0,(player.shield||0)-petShield);petShield=0;clearPetEffects();enemies=[];encounterSlots=Array.from({length:encounterLimit(player.location)},()=>gameNow()+rand(100,900));deadUntil=0;
 if(isTown(player.location)){restoreTownPartyFully();enemy={id:'town',level:1,hp:0,maxHp:1,atk:0,def:0,hit:0,flee:0,aspd:150};report=null;deadUntil=Infinity;nextEncounterAt=Infinity;message('已進入靈契主城，這裡是安全區域。','good','system');render();return;}
 enemy={id:homecomingMap(player.location)?'town':WORLD_MONSTERS.find(m=>m.map===player.location)?.id||'fang',level:1,hp:0,maxHp:1,atk:0,def:0};nextEncounterAt=gameNow()+encounterDelay();render();}

function travel(mapId){if(player?.extremeRun){if(confirm('離開將結束極限試煉，確定離場？'))exitExtreme('主動離場');return;}if(player?.towerRun){if(confirm('離開將結束天穹終境挑戰，確定離場？'))exitTower('主動離場');return;}if(homecomingMap(mapId)){const info=homecomingMap(mapId),q=player.homecoming?.routes?.[info.route.id];if(q?.phase==='traveling'){openPanel('homecoming');return;}const error=homecomingEntryError(player,mapId,activePet());if(error){renderMapChoices();return toast(error);}}if(player.trialRun){if(confirm('離開將結束本次試煉，入場券不退還。確定離場？'))exitTrial('主動離場');return;}if(['dawncity','dawnrift',SPIRIT_SANCTUARY_MAP].includes(mapId)){const error=dawnEntryError(player);if(error){renderMapChoices();return toast(error);}}if(!player.hp){$('mapSelect').value=player.location;return toast('角色倒地時不能移動，請先選擇復活方式');}if(MAPS[mapId]?.min>=151&&!player.thirdJob){renderMapChoices();return toast('151級以上區域需要完成三轉');}if((MAPS[mapId]?.min>=101||mapId==='skycity')&&!player.reborn)return toast('新大陸需要先完成靈契轉生');if(mapId===SPIRIT_SANCTUARY_MAP&&!spiritSanctuaryUnlocked(player))return toast('完成至少一條返鄉契約後才可進入契靈之地');if(!MAPS[mapId]||mapId===player.location)return;endReport('撤退');player.location=mapId;if(mapId===SPIRIT_SANCTUARY_MAP)visitSpiritSanctuary(player);selectedContinent=continentFor(mapId);renderMapChoices();if(isTown(mapId))tab='combat';else player.lastMap=mapId;deadUntil=0;message(`已前往${MAPS[mapId].name}。`,'good');spawn();dirty=true;save();}
function playerHitDamage(power,def,petCrit,petHaste,criticalMultiplier,pactRatio=1,pactOnly=false,critical=false){const roll=rand(90,110)/100,exposed=enemy?.exposedUntil>gameNow()?enemy.exposedPower||0:0,actual=outgoingHitDamage(power,def*(1-exposed),roll,critical?criticalMultiplier:1),without=outgoingHitDamage(power*pactRatio,def,roll,critical&&!petCrit?criticalMultiplier:1);spiritHitRoll={target:enemy,at:gameNow(),power,def:def*(1-exposed),roll,crit:critical?criticalMultiplier:1,base:actual};pendingPetCredit=Math.max(0,Math.min(enemy?.hp||0,actual)-Math.min(enemy?.hp||0,petHaste||pactOnly?0:without));return actual;}
function hitDamage(atk,def,criticalMultiplier=1){if(enemy?.exposedUntil>gameNow())def*=1-(enemy.exposedPower||0);const roll=rand(90,110)/100,actual=outgoingHitDamage(atk,def,roll,criticalMultiplier);spiritHitRoll={target:enemy,at:gameNow(),power:atk,def,roll,crit:criticalMultiplier,base:actual};return actual;}
function spiritApplyPierce(amount,pct){
 const hit=spiritHitRoll;spiritHitRoll=null;
 if(!pct||!hit||hit.target!==enemy||hit.at!==gameNow())return amount;
 // Reuse the original hit's attack, mitigation, roll and crit. This avoids
 // approximating DEF ignore as a flat damage bonus or rolling a second hit.
 const pierced=outgoingHitDamage(hit.power,hit.def*(1-Math.min(90,pct)/100),hit.roll,hit.crit);
 return amount*pierced/Math.max(1,hit.base);
}
function damageText(rolled,effective){return `命中傷害 ${Math.round(rolled)}${Math.round(effective)<Math.round(rolled)?`（有效扣血 ${Math.round(effective)}）`:''}`;}

function originalGuardKey(pet){return 'guardFollow|'+player.job+'|'+pet.id+'|'+pet.fusion?.main+'-'+pet.fusion?.sub;}
function anyProtectionActive(now=gameNow()){
 const ownerSpell=Math.max(0,(player.shield||0)-petShield)>0&&(!(timers.playerShieldExpires||0)||timers.playerShieldExpires>now);
 const ownerPet=petShield>0&&player.shield>0&&(timers.petShieldExpires||0)>now;
 const petWard=petEffects.shield>0&&(!(petEffects.shieldExpires||0)||petEffects.shieldExpires>now);
 return ownerSpell||ownerPet||petWard||(petEffects.guardUntil||0)>now;
}
function originalGuardActive(now=gameNow()){
 return activePet()?.hp>0&&((petEffects.shield>0&&(petEffects.shieldExpires||0)>now)||(petShield>0&&player.shield>0&&(timers.petShieldExpires||0)>now));
}
function originalGuardReady(pet,now){const pending=originalPactCounters.get(originalGuardKey(pet));return pending?.until>now&&originalGuardActive(now);}
function activePetMarkPower(now=gameNow()){
 if(petEffects.markWardOnly&&((petEffects.markUntil||0)<=now||petEffects.markSourcePetId!==activePet()?.id||!originalGuardActive(now))){petEffects.markHits=0;return 0;}
 return petEffects.markHits>0?petEffects.markPower:0;
}
function dealDamage(amount,key,secondary=false){if(!enemy?.hp)return 0;const procBonus=spiritAttackProcBonus(key,secondary);amount=spiritApplyPierce(amount,spiritPiercePct)*(1+procBonus/100);const fused=key==='playerDamage'&&fusedPair(activePet())&&activePet()?.hp>0,spiritSupport=key==='playerDamage'&&isSpiritJob(player.job),preparation=enemy.dawn&&enemy.boss&&enemy.id==='dawn-archon'?dawnArchonPreparationFactor(player):1,roleFactor=spiritTargetDamageFactor(player.job,key,{boss:!!enemy.boss,secondary,level:player.level}),base=Math.max(0,Math.round(amount*jobZoneOutputFactor(player.job,player.level)*preparation*roleFactor));let blessing=fused&&petEffects.blessingUntil>gameNow()?base*petEffects.blessingPower:0,mark=fused?activePetMarkPower():0,markFx=mark?petEffects:null;if(spiritSupport){let bestBlessing=0;mark=0;markFx=null;for(const unit of activePetRoster(player)){if(unit.hp<=0)continue;const fx=effectsForPet(unit),power=fx.markWardOnly&&unit.id===player.activePetId?activePetMarkPower():fx.markHits>0?fx.markPower:0;if(power>mark){mark=power;markFx=fx;}if(fx.blessingUntil>gameNow())bestBlessing=Math.max(bestBlessing,fx.blessingPower||0);}blessing=base*Math.min(.25,bestBlessing);}if(mark&&markFx)markFx.markHits--;const effect=currentTactic(),magical=['mage','wizard','sage','acolyte','priest'].includes(player.job),bonus=key==='playerDamage'?tacticDamageFactor(effect,player.job,enemy,magical)*(effect?.kind==='instantDamage'?1.3:1)*(effect?.kind==='elemental'&&effect.charges>0&&manualElementalStrike?1.4:1):1,inheritance=key==='playerDamage'?Math.max(0,base-Math.min(base,Math.max(0,pendingPetCredit)))*homecomingBonuses(player).damage:0,rolled=(base+blessing+mark+inheritance)*bonus,original=Math.min(enemy.hp,Math.max(0,Math.round(rolled))),cardExtra=bossCardHitBonus(player,CARDS,{now:gameNow(),source:key==='playerDamage'?'owner':key==='petDamage'?'pet':'other',damage:original,critical:!!bossHitMeta?.critical,magical:!!bossHitMeta?.magical,secondary,range:bossHitMeta?.range||'melee',skillId:bossHitMeta?.skillId||'',petId:bossHitMeta?.petId||'',targetHpFraction:enemy.hp/Math.max(1,enemy.maxHp)}),actual=Math.min(enemy.hp,original+cardExtra);enemy.hp-=actual;if(player?.extremeRun&&enemy.extremeKind==='hp')recordExtremeDamage(player.extremeRun,actual);const cardApplied=Math.max(0,actual-original);if(cardApplied&&offlineMetrics)offlineMetrics.damage.bossCard=(offlineMetrics.damage.bossCard||0)+cardApplied;if(cardApplied&&report)report.bossCardDamage=(report.bossCardDamage||0)+cardApplied;const petCredit=key==='playerDamage'?((fused||spiritSupport)?Math.min(actual,Math.round(actual*(Math.min(base,pendingPetCredit)+blessing+mark)/Math.max(1,rolled))):Math.min(actual,pendingPetCredit)):0;pendingPetCredit=0;
 if(offlineMetrics&&actual){
  const d=offlineMetrics.damage;
  d.total+=actual;
  if(key==='playerDamage'){d.player+=actual-petCredit;d.petSupport+=petCredit;}
  else if(key==='resonanceDamage')d.resonance+=actual;
  else d.other+=actual; // pet direct damage is assigned by dealPetDamage below
 }
 record(report,key,actual-petCredit);if(!offlineSimulation&&actual)combatSamples.push({at:gameNow(),owner:key==='playerDamage'?actual-petCredit:0,pet:key==='playerDamage'?petCredit:actual,kills:0});if(petCredit)record(report,'buffDamage',petCredit);return actual;}
function targetEnemy(id){const target=enemies.find(e=>e.instanceId===id&&e.hp>0);if(target){enemy=target;player.targetPriority='manual';dirty=true;save();render();}}
function aoeSkill(id){return !!jobSkillById(player.job,id)?.aoe;}
function grantPetShield(amount,frontline=false,sourcePet=activePet(),fx=effectsForPet(sourcePet)){if(frontline&&sourcePet?.hp>0){const s=petStats(sourcePet),before=fx.shield||0,added=Math.max(0,Math.min(Math.round(amount*.7),Math.round(s.hp*.25)-before));fx.shield=before+added;fx.shieldExpires=gameNow()+6500;return added+grantPetShield(amount-added,false,sourcePet,fx);}const ceiling=Math.round(stat('hp')*.25),before=player.shield;if(before>=ceiling)return 0;timers.petShieldExpires=gameNow()+6500;const after=clamp(before+amount,0,ceiling),added=after-before;player.shield=after;petShield+=Math.max(0,added);return Math.max(0,added);}
function healPetParty(amount,metric='effectiveHeal',receivedBonus=true){const targets=[{unit:player,key:'hp',max:stat('hp')}];for(const pet of activePetRoster(player))if(pet?.hp>0)targets.push({unit:pet,key:'hp',max:petStats(pet).hp});targets.sort((a,b)=>a.unit.hp/a.max-b.unit.hp/b.max);let remaining=Math.max(0,Math.round(amount)),total=0;for(const {unit,max} of targets){const missing=Math.max(0,max-unit.hp),baseGain=Math.min(missing,remaining),gained=Math.min(missing,Math.round(baseGain*(unit===player&&receivedBonus?1+homecomingBonuses(player).recovery:1)));unit.hp+=gained;remaining-=baseGain;total+=gained;}record(report,metric,total);return total;}
function petSkillStatus(pet,skill,now=gameNow()){const fx=effectsForPet(pet);if(!activePetRoster(player).some(unit=>unit.id===pet.id))return '未出戰';if(player.job==='pactWarrior'&&player.petStances?.[pet.id]==='assimilate')return '同化中';if(pet.hp<=0)return '夥伴倒下';if(!player.hp)return '人物倒下';if(pet.level<skill.unlock)return '等級未解鎖';const cost=6+skill.unlock*2;if(pet.sp<cost)return `SP不足（${pet.sp}／${cost}）`;const wait=skill.cooldown-(now-(petSkillTimers[player.job==='spiritist'||player.job==='pactWarrior'||player.job==='spiritCommander'?`${pet.id}:${skill.id}`:skill.id]||0));if(wait>0)return `冷卻 ${(wait/1000).toFixed(1)}秒`;if(skill.kind==='heal'&&player.hp>=stat('hp')&&activePetRoster(player).every(unit=>unit.hp<=0||unit.hp>=petStats(unit).hp))return 'HP已滿';if(skill.kind==='regen'&&fx.regenTicks>0)return '持續恢復中';if(skill.kind==='mana'&&player.mp>=stat('mp')&&(!skill.petRestore||pet.sp>=petStats(pet).sp*.9))return '主人SP已滿';if(skill.kind==='shield'&&player.shield>=Math.round(stat('hp')*.25)&&(fx.shield||0)>=Math.round(petStats(pet).hp*.25))return '主人與夥伴護盾已滿';if(skill.kind==='guard'&&player.shield>=Math.round(stat('hp')*.25)&&(fx.shield||0)>=Math.round(petStats(pet).hp*.25)&&fx.guardUntil>now)return '守護與護盾已生效';if(!enemy?.hp||isTown(player.location))return '等待進入戰鬥';return '可施放';}
function petAutoAbility(pet,s,now){const dual=player.job==='spiritist'||player.job==='pactWarrior'||player.job==='spiritCommander',lastAbility=dual?(timers.petAbilityById?.[pet.id]||0):(timers.petAbility||0),mainInterval=Math.max(80,aspdAttackIntervalMs(s.aspd)/(1+(s.aspdPct||0)/100));if(!auto||!player.hp||pet.hp<=0||!enemy?.hp||now-lastAbility<(player.job==='spiritCommander'?mainInterval:850))return;const role=companionRole(pet),fx=effectsForPet(pet);
 const loadout=pet.equippedSkills||defaultPetSkills(role,pet.rarity);
 // Finisher and area have priority when ready; ASPD main fills the gaps.
 for(const id of player.job==='spiritCommander'?[...loadout].reverse():loadout){
  const skill=petSkillById(role,id),form=commanderPetSkillForm(player,pet,skill),cost=form?.slot===0?0:6+skill?.unlock*2;
  if(!skill)continue;
  if(form?.slot===0){if(pet.level<skill.unlock||now-(petSkillTimers[`${pet.id}:${id}`]||0)<mainInterval)continue;}
  else if(petSkillStatus(pet,skill,now)!=='可施放')continue;

  const effect=petSkillEffect(skill,s,role),spiritForm=commanderPetSkillForm(player,pet,skill);if(spiritForm)effect.value*=commanderSkillOutputScale(pet);pet.sp-=cost;petSkillTimers[dual?`${pet.id}:${id}`:id]=now;if(dual)(timers.petAbilityById??={})[pet.id]=now;else timers.petAbility=now;let outcome='';
  if(skill.kind==='bleed'){fx.bleedTicks=skill.ticks||3;fx.bleedTargetId=enemy?.instanceId;fx.bleedPower=effect.value;fx.bleedInterval=skill.interval||2000;fx.bleedLeech=skill.leech||0;delete fx.bleedSource;fx.bleedNext=now+fx.bleedInterval;outcome=`每${fx.bleedInterval/1000}秒造成 ${effect.value} 傷害，共${fx.bleedTicks}跳`;}
  else if(skill.kind==='mark'){fx.markWardOnly=false;fx.markHits=skill.hits||2;fx.markPower=effect.value;spiritReactiveEvent('ownerMark');outcome=`接下來${fx.markHits}次主人命中各附加 ${effect.value} 傷害`;}
  else if(skill.kind==='guard'){const amount=grantPetShield(effect.value,true,pet,fx);fx.guardUntil=now+effect.duration;fx.guardRegen=Math.round(s.def*.08);fx.guardRegenNext=now+1000;fx.guardCounter=skill.counter||0;spiritReactiveEvent('petGuard');outcome=`護盾 +${amount}，${role==='defense'?'提高攔截優先級':'守護自療'} ${(effect.duration/1000).toFixed(1)}秒`;}
  else if(skill.kind==='shield'){const beforePet=fx.shield||0,beforeOwner=player.shield;grantPetShield(effect.value,true,pet,fx);outcome=`夥伴護盾 +${(fx.shield||0)-beforePet}、主人護盾 +${player.shield-beforeOwner}（持續6.5秒）`;}
  else if(skill.kind==='blessing'){fx.blessingUntil=now+effect.duration;fx.blessingPower=effect.value;outcome=`主人傷害 +${(effect.value*100).toFixed(1)}%，持續 ${effect.duration/1000}秒`;}
  else if(skill.kind==='regen'){fx.regenTicks=skill.ticks||5;fx.regenPower=effect.value;fx.regenInterval=skill.interval||1500;fx.regenNext=now+fx.regenInterval;outcome=`持續恢復 ${fx.regenTicks} 次，每次 ${effect.value} HP`;}
  else if(skill.kind==='heal'||skill.kind==='mana'){const hp=skill.kind==='heal'?healPetParty(effect.value):0,mp=skill.kind==='mana'?Math.min(stat('mp')-player.mp,effect.value):0;player.mp+=mp;if(skill.petRestore)pet.sp=Math.min(s.sp,pet.sp+Math.round(s.sp*skill.petRestore));record(report,'effectiveMana',mp);outcome=`恢復 HP ${hp}、SP ${mp}`;}
  else {const magical=skill.kind==='magic'||['magic','support'].includes(role),mainBoost=spiritForm?.slot===0?(s.commanderMainSkillMultiplier||1):1,rolled=hitDamage(effect.value*(spiritForm?.primary||1)*mainBoost,monsterDefenseAgainst(enemy,magical)*(1-Math.min(90,(s.ignoreDef||0)+(skill.ignoreDef||0))/100)),damage=dealPetDamage(rolled,'petDamage',pet,combatPetFactor(pet.id));if(skill.splash||spiritForm){const primary=enemy,dead=[];for(const foe of multiTargets(enemies,primary,spiritForm?.targets||4,encounterLimit(player.location)).slice(1)){enemy=foe;dealPetDamage(hitDamage(effect.value*(spiritForm?.secondary??skill.splash??1)*mainBoost,monsterDefenseAgainst(foe,magical)*(1-Math.min(90,(s.ignoreDef||0)+(skill.ignoreDef||0))/100)),'petDamage',pet,combatPetFactor(pet.id));if(!foe.hp)dead.push(foe);}finishVictims(dead);enemy=primary;}outcome=damageText(rolled*(1+classBuffPower('pet')),damage);if(skill.kind==='drain'){let healed=Math.min(stat('hp')-player.hp,Math.round(damage*.45),Math.ceil(stat('hp')*.12));player.hp+=healed;if(pet.fusion){const self=Math.min(s.hp-pet.hp,Math.round(damage*.45),Math.ceil(s.hp*.12));pet.hp+=self;healed+=self;}record(report,'effectiveHeal',healed);outcome+=`、恢復 ${healed} HP`;}}
  // Commander converts supportive pet skills into hybrid support + offense.
  // The ordinary heal/shield/mark effects remain; the added strike cannot
  // recursively invoke itself and its hit count respects the encounter cap.
  if(spiritForm&&!['strike','magic','drain'].includes(skill.kind)){
   const chosen=enemy,dead=[],magical=['magic','support'].includes(role),power=commanderSupportSkillPower(s,role,spiritForm)*commanderSkillOutputScale(pet);
   let hits=0;
   for(const [index,foe] of multiTargets(enemies,chosen,spiritForm.targets,encounterLimit(player.location)).entries()){
    if(!foe.hp)continue;
    enemy=foe;
    const amount=power*(index===0?spiritForm.primary:spiritForm.secondary)*(spiritForm.slot===0?(s.commanderMainSkillMultiplier||1):1);
    const rolled=hitDamage(amount,monsterDefenseAgainst(foe,magical)*(1-(s.ignoreDef||0)/100));
    bossHitMeta={magical,petId:pet.id,range:'pet',skillId:skill.id};
    const applied=dealPetDamage(rolled,'petDamage',pet,combatPetFactor(pet.id));bossHitMeta=null;
    if(applied>0)hits++;
    if(foe!==chosen&&!foe.hp)dead.push(foe);
   }
   if(dead.length)finishVictims(dead);
   enemy=chosen;outcome+=`；靈契追擊命中 ${hits} 個目標`;
  }
  if(enemy.hp<=0)award();message(`${pet.nickname} 自動施放【${spiritForm?`萬靈${spiritForm.name} · `:''}${skill.name}】！${outcome}。`,'rare','pet');dirty=true;render();break;
 }
}
function tickDamageOverTime(now,lane,sourcePet=activePet(),fx=effectsForPet(sourcePet)){
 const burning=lane==='burn',prefix=burning?'burn':'bleed',ticks=prefix+'Ticks',next=prefix+'Next',targetId=prefix+'TargetId';
 if(!fx[ticks]||now<fx[next])return;
 const selected=enemy,target=enemies.find(e=>e.instanceId===fx[targetId]&&e.hp>0);
 if(!target){fx[ticks]=0;delete fx[targetId];return;}
 enemy=target;
 const damage=dealPetDamage(fx[prefix+'Power'],burning?'resonanceDamage':'petDamage',sourcePet,combatPetFactor(sourcePet?.id));
 enemy=selected;fx[ticks]--;
 fx[next]=now+(burning?1200:(fx.bleedInterval||2000));
 if(!burning&&fx.bleedLeech)healPetParty(Math.round(damage*fx.bleedLeech),'effectiveHeal',false);
 message((burning?'🔥 灼燒':'🩸 裂傷')+'持續造成 '+damage+' 傷害。','good','pet');
 if(!target.hp){enemy=target;award();enemy=selectEncounterTarget(enemies,player.targetPriority,selected)||selected;}
 render();
}
function tickSongRain(now){
 const wave=petEffects.songRain;if(!wave||wave.remaining<=0)return;
 if(activePet()?.id!==wave.petId||activePet()?.hp<=0||now>=wave.until||now>=wave.hardUntil){wave.remaining=0;return;}
 if(now<wave.next)return;
 wave.remaining--;wave.next=now+2000;
 const selected=enemy,targets=multiTargets(enemies,selected,3,encounterLimit(player.location)),dead=[];
 for(const [index,foe] of targets.entries()){
  enemy=foe;dealPetDamage(hitDamage(wave.power*[1,.65,.45][index],monsterDefenseAgainst(foe,true)),'resonanceDamage');
  if(!foe.hp)dead.push(foe);
 }
 for(const foe of dead){enemy=foe;award();}
 enemy=selectEncounterTarget(enemies,player.targetPriority,selected)||selected;
 render();
}
function tickPetEffects(now){
 if(!player?.hp||!enemies.some(e=>e.hp>0))return;
 const effectGuard=offlineSimulation&&!globalThis.__spiritDisableOfflineEffectGuards;
 if(now<petEffects.guardUntil&&now>=(petEffects.guardRegenNext||0)){
  const pet=activePet();if(pet?.hp>0){const restored=Math.min(Math.max(0,petStats(pet).hp-pet.hp),petEffects.guardRegen||0);pet.hp+=restored;record(report,'effectiveHeal',restored);}
  petEffects.guardRegenNext=now+1000;
 }
 if(petEffects.regenTicks&&now>=petEffects.regenNext){healPetParty(petEffects.regenPower);petEffects.regenTicks--;petEffects.regenNext=now+petEffects.regenInterval;}
 if(!effectGuard||petEffects.markWardOnly||petEffects.markHits>0)activePetMarkPower(now);
 if(!effectGuard||petEffects.bleedTicks)tickDamageOverTime(now,'bleed');
 if(!effectGuard||petEffects.burnTicks)tickDamageOverTime(now,'burn');
 if(!effectGuard||petEffects.songRain?.remaining>0)tickSongRain(now);
 const companionRoster=activePetRoster(player);
 for(let companionIndex=1;companionIndex<companionRoster.length;companionIndex++){
  const pet=companionRoster[companionIndex];
  const fx=effectsForPet(pet);
  if(now<fx.guardUntil&&now>=(fx.guardRegenNext||0)){
   if(pet.hp>0){const restored=Math.min(Math.max(0,petStats(pet).hp-pet.hp),fx.guardRegen||0);pet.hp+=restored;record(report,'effectiveHeal',restored);}
   fx.guardRegenNext=now+1000;
  }
  if(fx.regenTicks&&now>=fx.regenNext){healPetParty(fx.regenPower);fx.regenTicks--;fx.regenNext=now+fx.regenInterval;}
  if(now>(fx.shieldExpires||Infinity))fx.shield=0;
  if(!effectGuard||fx.bleedTicks)tickDamageOverTime(now,'bleed',pet,fx);
  if(!effectGuard||fx.burnTicks)tickDamageOverTime(now,'burn',pet,fx);
 }
}
function addEnergy(amount){if(!activePet()||!player.hp)return;player.resonance=clamp(player.resonance+amount,0,RESONANCE_MAX);dirty=true;}
// All resonance effects are terminal outcomes: they cannot emit more resonance events.
function resonanceModifier(rule,magnitude,primary){
 const now=gameNow(),v=rule.value||0;let useful=false;if(rule.mode==='pact'){classBuffs.pact={until:now+(rule.duration||6000),power:0,skillId:rule.skillId,perSkill:rule.perSkill,...rule.transform};return true;}
 if(rule.mode==='cleave'&&primary){for(const foe of multiTargets(enemies,primary,4,encounterLimit(player.location)).slice(1)){enemy=foe;dealPetDamage(hitDamage(magnitude*v,monsterDefenseAgainst(foe,rule.effect==='magic')),'resonanceDamage');useful=true;}enemy=primary;}
 if(rule.mode==='bleed'){petEffects.burnPower=Math.round(magnitude*v);petEffects.burnTicks=3;petEffects.burnTargetId=primary?.instanceId;petEffects.burnNext=now+1200;useful=true;}
 if(rule.mode==='expose'&&primary){primary.exposedUntil=now+5500;primary.exposedPower=v;useful=true;}
 if(rule.mode==='tempo'){classBuffs.resonanceHaste={until:now+5500,power:v};useful=true;}
 if(rule.mode==='crit'){classBuffs.resonanceCrit={until:now+5500,power:v};useful=true;}
 if(rule.mode==='ward'){classBuffs.teamWard={until:now+3500,power:v};useful=true;}
 if(rule.mode==='chorus'){petEffects.markPower=Math.max(petEffects.markPower||0,Math.round(magnitude*v*3));petEffects.markHits=3;useful=true;}
 if(rule.mode==='intercept'){petEffects.guardUntil=Math.max(petEffects.guardUntil||0,now+v);useful=true;}
 if(rule.mode==='counter'){petEffects.counterUntil=now+5000;petEffects.counterPower=Math.round(magnitude*v);useful=true;}
 if(rule.mode==='drain')useful=healPetParty(Math.round(magnitude*v),'effectiveHeal',false)>0;
 if(rule.mode==='execute'&&primary?.hp>0&&primary.hp<primary.maxHp*.3){dealPetDamage(hitDamage(magnitude*v,primary.def),'resonanceDamage');useful=true;}
 if(rule.mode==='bounty'){const gold=albumEarnGold(Math.max(1,Math.round(player.level*v)),player);player.gold+=gold;if(offlineMetrics)offlineMetrics.goldEarned+=gold;useful=true;}
 if(rule.mode==='reset'){for(const id of Object.keys(jobSkillTimers))jobSkillTimers[id]=Math.max(0,jobSkillTimers[id]-v);useful=true;}
 if(rule.mode==='manaPet'){const pet=activePet();if(pet?.hp>0){const max=petStats(pet).sp;pet.sp=Math.min(max,pet.sp+Math.round(max*v));useful=true;}}
 if(rule.mode==='interrupt'&&primary?.hp>0){primary.lastAttack+=v;record(report,'interrupts',1);useful=true;}
 return useful;
}

function applyOriginalPactPayload(rule,pet,primary,now,event){
 const kind=rule.originalEvent?.payload;
 if(!kind||!primary?.hp)return false;
 if(Array.isArray(kind)){let changed=false;for(const part of kind){const sub={...rule,originalEvent:{...rule.originalEvent,payload:part}};changed=applyOriginalPactPayload(sub,pet,primary,now,event)||changed;if(primary.hp<=0)break;}return changed;}
 const st=petStats(pet);
 if(kind==='guardedFollowup'||kind==='sanctuarySplit'){
  const key=originalGuardKey(pet);
  if(event==='shield'){
   const gained=grantPetShield(Math.max(1,Math.round(st.def*.42)),true);
   if(gained>0)originalPactCounters.set(key,{until:now+6500});
   return gained>0;
  }
  if(kind==='sanctuarySplit'&&event==='skill')return dealPetDamage(hitDamage(st.def*.65+st.atk*.48,monsterDefenseAgainst(primary,true)),'resonanceDamage')>0;
  if(!originalGuardReady(pet,now))return false;
  originalPactCounters.delete(key);
  return dealPetDamage(hitDamage(st.def*.65+st.atk*.48,primary.def*.6),'resonanceDamage')>0;
 }
 if(kind==='storedQi'){
  if(event==='damageTaken'){
   const previous=petEffects.monkQi;
   const charges=previous?.petId===pet.id&&previous.until>now?previous.charges:0;
   petEffects.monkQi={petId:pet.id,charges:Math.min(3,charges+1),until:now+12000};
   const gained=Math.min(Math.max(0,stat('mp')-player.mp),Math.max(1,Math.round(st.sp*.08)));
   player.mp+=gained;record(report,'effectiveMana',gained);return true;
  }
  const qi=petEffects.monkQi;
  if(!qi||qi.petId!==pet.id||qi.until<=now||!qi.charges)return false;
  delete petEffects.monkQi;
  return dealPetDamage(hitDamage((st.atk*.65+st.matk*.4)*(1+(qi.charges-1)*.18),primary.def*.7),'resonanceDamage')>0;
 }
 if(kind==='songRainChain'){
  const previous=petEffects.songRain;
  if(previous?.petId===pet.id&&previous.remaining>0&&previous.until>now&&previous.hardUntil>now){
   const added=Math.min(2,6-previous.issued);
   previous.remaining+=added;previous.issued+=added;
   previous.until=Math.min(previous.hardUntil,now+6500);
   return added>0;
  }
  petEffects.songRain={petId:pet.id,started:now,until:now+6500,hardUntil:now+12000,next:now+2000,remaining:3,issued:3,power:st.matk*.12+st.atk*.07};
  return true;
 }
 if(kind==='vowShieldFollowup'){
  // First holy-shield contact drains health and stores a vow against this foe.
  // Only a later hit on the same living enemy can release the shield strike.
  const key='vow|'+player.job+'|'+pet.id+'|'+pet.fusion?.main+'-'+pet.fusion?.sub+'|'+primary.instanceId;
  const pending=originalPactCounters.get(key);
  if(!pending||pending.until<now){
   const dealt=dealPetDamage(hitDamage(st.atk*.70,primary.def),'resonanceDamage');
   const healed=Math.min(Math.max(0,stat('hp')-player.hp),Math.round(dealt*.22));
   player.hp+=healed;record(report,'effectiveHeal',healed);
   if(dealt>0&&primary.hp>0)originalPactCounters.set(key,{count:1,until:now+8500});
   return dealt>0;
  }
  originalPactCounters.delete(key);
  return dealPetDamage(hitDamage(st.def*.65+st.atk*.48,primary.def*.6),'resonanceDamage')>0;
 }
 if(kind==='armorExecution'){
  // The first successful stab exposes one enemy; only a later stab against
  // that same live instance may execute. The 4s contract cooldown still
  // applies to both steps, and the stored weakness expires after 8.5s.
  const key='execute|'+player.job+'|'+pet.id+'|'+pet.fusion?.main+'-'+pet.fusion?.sub+'|'+primary.instanceId;
  const pending=originalPactCounters.get(key);
  if(!pending||pending.until<now){
   primary.exposedUntil=Math.max(primary.exposedUntil||0,now+8500);
   primary.exposedPower=Math.max(primary.exposedPower||0,.18);
   originalPactCounters.set(key,{count:1,until:now+8500});
   return true;
  }
  originalPactCounters.delete(key);
  const power=(st.atk*.85+st.matk*.2)*(primary.hp<primary.maxHp*.3?1.45:1);
  return dealPetDamage(hitDamage(power,primary.def*.5),'resonanceDamage')>0;
 }
 if(kind==='armorBreak'){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+4500);
  primary.exposedPower=Math.max(primary.exposedPower||0,.18);
  return true;
 }
 if(kind==='elementBurn'){
  // Fire has its own timer and target, and never overwrites companion bleed.
  petEffects.burnPower=Math.round(st.matk*.22);
  petEffects.burnTicks=3;petEffects.burnTargetId=primary?.instanceId;
  petEffects.burnNext=now+1200;
  return true;
 }
 if(kind==='comboLeech'){
  const dealt=dealPetDamage(hitDamage(st.atk*.70,primary.def),'resonanceDamage');
  const recovered=Math.min(stat('hp')-player.hp,Math.round(dealt*.22));
  player.hp+=recovered;record(report,'effectiveHeal',recovered);
  return dealt>0;
 }
 if(kind==='overhealRain'){
  const overflow=Math.max(0,Number(timers.pendingOriginalOverheal)||0);
  timers.pendingOriginalOverheal=0;
  if(!overflow)return false;
  const power=Math.min(overflow*.45,st.matk*3),selected=enemy;
  const targets=multiTargets(enemies,primary,3,encounterLimit(player.location));
  let dealt=0;
  for(const [index,foe] of targets.entries()){
   if(!foe.hp)continue;
   enemy=foe;
   dealt+=dealPetDamage(hitDamage(power*[1,.65,.45][index],monsterDefenseAgainst(foe,true)),'resonanceDamage');
  }
  enemy=selected;
  return dealt>0;
 }
 // Mechanics shared by original sixty contracts; each contract has its own event,
 // timing and source text while drawing from the same verified combat primitives.
 if(kind==='starVolley'){
  let total=0;
  for(let shot=0;shot<2&&primary.hp>0;shot++)total+=dealPetDamage(hitDamage(st.matk*.36+st.atk*.21,monsterDefenseAgainst(primary,true)*.3),'resonanceDamage');
  return total>0;
 }
 if(kind==='falconVolley'){
  let total=0;
  for(let shot=0;shot<2&&primary.hp>0;shot++)total+=dealPetDamage(hitDamage(st.atk*.4+st.matk*.17,primary.def*.4),'resonanceDamage');
  return total>0;
 }
 if(kind==='starRainChain'){
  const targets=multiTargets(enemies,primary,3,encounterLimit(player.location));
  let damage=0;
  const selected=enemy;
  for(const foe of targets){
   if(foe.hp<=0)continue;
   enemy=foe;damage+=dealPetDamage(hitDamage(st.matk*.36+st.atk*.1,monsterDefenseAgainst(foe,true)),'resonanceDamage');
  }
  enemy=selected;
  if(damage>0){const gain=Math.min(stat('mp')-player.mp,Math.max(1,Math.floor(damage*.025)));player.mp+=gain;record(report,'effectiveMana',gain);}
  return damage>0;
 }
 if(kind==='hunterSummon')return dealPetDamage(hitDamage(st.atk*.9+st.matk*.15,primary.def*.55),'resonanceDamage')>0;
 if(kind==='lowHpRiposte'){
  if(player.hp>stat('hp')*.4)return false;
  const shield=grantPlayerShield(Math.max(1,Math.round(st.def*.26)));
  const retaliation=dealPetDamage(hitDamage(st.atk*.65,primary.def*.7),'resonanceDamage');
  return shield>0||retaliation>0;
 }
 if(kind==='guardianAutoChase'){
  if(!anyProtectionActive(now))return false;
  return dealPetDamage(hitDamage(st.matk*.52+st.atk*.25,primary.def*.5),'resonanceDamage')>0;
 }
  if(kind==='storedSpellCharge'){
  timers.wizardStoredCharges=Math.min(3,(timers.wizardStoredCharges||0)+1);
  timers.wizardStoredUntil=now+12000;
  return true;
 }
 if(kind==='soundShield'){
  const gained=grantPlayerShield(Math.max(1,Math.round(st.def*.38)));
  if(gained>0){timers.soundShieldCharge=Math.min(3,(timers.soundShieldCharge||0)+1);timers.soundShieldUntil=now+6500;}
  return gained>0;
 }
 if(kind==='ward'){
  const gained=grantPetShield(Math.max(1,Math.round(st.def*.42)),true);
  return gained>0;
 }
 if(kind==='wardCharge'){
  // A barrier must actually store a spell first; the next eligible cast
  // releases one magic cannon. A same-frame second event cannot double fire.
  if((timers.wizardWardChargeUntil||0)>now&&(timers.wizardWardChargedAt||0)<now&&timers.wizardWardChargedPetId===pet.id){
   timers.wizardWardChargeUntil=0;
   return dealPetDamage(hitDamage(st.matk*.7+st.atk*.2,monsterDefenseAgainst(primary,true)),'resonanceDamage')>0;
  }
  const gained=grantPetShield(Math.max(1,Math.round(st.def*.42)),true);
  if(gained>0){timers.wizardWardChargedAt=now;timers.wizardWardChargeUntil=now+10000;timers.wizardWardChargedPetId=pet.id;}
  return gained>0;
 }
 if(kind==='manaRefund'){
  const gained=Math.min(Math.max(0,stat('mp')-player.mp),Math.max(1,Math.round(st.sp*.08)));
  player.mp+=gained;record(report,'effectiveMana',gained);return gained>0;
 }
 if(kind==='haste'){
  classBuffs.resonanceHaste={until:now+3500,power:.07};return true;
 }
 if(kind==='mark'){
  petEffects.markPower=Math.max(petEffects.markPower||0,Math.round(st.atk*.2+st.matk*.16));
  petEffects.markHits=Math.max(petEffects.markHits||0,2);
  petEffects.markWardOnly=player.job==='wizard'&&pet.fusion?.main==='defense'&&pet.fusion?.sub==='support';
  if(petEffects.markWardOnly){petEffects.markUntil=now+6500;petEffects.markSourcePetId=pet.id;}
  return true;
 }
 if(kind==='stackStrike'){
  // Stack progress belongs to the specific original contract and companion.
  // A different fusion/pet must not inherit another build's charged strike,
  // and an idle stack expires rather than staying fully charged forever.
  const stackKey='stack|'+player.job+'|'+pet.id+'|'+pet.fusion?.main+'-'+pet.fusion?.sub;
  const previous=originalPactCounters.get(stackKey);
  const count=previous&&previous.until>=now?previous.count:0;
  const power=1+Math.min(3,count)*.18;
  originalPactCounters.set(stackKey,{count:Math.min(3,count+1),until:now+8000});
  return dealPetDamage(hitDamage((st.atk*.65+st.matk*.4)*power,primary.def*.7),'resonanceDamage')>0;
 }
 if(kind==='splash'){
  let hits=0;const selected=enemy;
  for(const foe of enemies.filter(e=>e!==primary&&e.hp>0).slice(0,2)){
   enemy=foe;const amount=hitDamage(st.matk*.36+st.atk*.21,foe.def*.3);
   hits+=dealPetDamage(amount,'resonanceDamage');
  }
  enemy=selected;return hits>0;
 }
 if(kind==='counterStrike'||kind==='arcaneStrike'){
  const base=kind==='counterStrike'?st.def*.65+st.atk*.48:st.matk*.7+st.atk*.2;
  return dealPetDamage(hitDamage(base,kind==='arcaneStrike'?monsterDefenseAgainst(primary,true):primary.def*.6),'resonanceDamage')>0;
 }
  const strength=kind==='siegeCounter' ? 0.90 : kind==='dragonCounter' ? 0.66 : kind==='sanctuaryChase' ? 0.54 : 0;
 if(strength<=0)return false;
 const damage=hitDamage(Math.max(1,(st.atk+st.matk*.35)*strength),primary.def);
 return dealPetDamage(damage,'resonanceDamage')>0;
}
function originalPactPrerequisite(rule,now,event){
 if(!rule?.originalEvent)return true;
 const key=player.job+'/'+(activePet()?.fusion?.main||'')+'-'+(activePet()?.fusion?.sub||'');
 if(['crusader/defense-support','hunter/defense-support'].includes(key)&&event!=='shield')return originalGuardReady(activePet(),now);
 if(key==='monk/defense-support'&&event==='thirdHit_monk'){const qi=petEffects.monkQi;return qi?.petId===activePet()?.id&&qi.until>now&&qi.charges>0;}
 if(key==='priest/defense-support'&&event==='damageTaken')return originalGuardReady(activePet(),now);
 if(key==='performer/magic-support'&&event==='song')return (classBuffs.battleSong?.until||0)>now;
 if(key==='assassin/defense-support')return player.hp>0&&player.hp<=stat('hp')*.4;
 if(key==='sage/defense-support')return anyProtectionActive(now);
 if(key==='knight/attack-support')return player.hp>=stat('hp')*.65;
 if(key==='knight/attack-defense')return (timers.knightBrokenShieldUntil||0)>now;
 if(key==='hunter/attack-support')return (petEffects.blessingUntil||0)>now||Object.entries(classBuffs).some(([id,b])=>/song|chant|chorus|hymn/i.test(id)&&b.until>now);
 return true;
}
function triggerDualSpiritResonance(event){
 if(!['thirdHit_pactWarrior','thirdHit_spiritCommander'].includes(event))return;
 if(typeof offlineMetrics!=='undefined'&&offlineMetrics)offlineMetrics.dualSpiritMainEvents++;
 if(!enemy?.hp||!player?.thirdJob){
  if(typeof offlineMetrics!=='undefined'&&offlineMetrics)offlineMetrics.dualSpiritBlockedDeadTarget++;
  return;
 }
 const roster=activePetRoster(player),rule=dualSpiritResonance(player,roster),now=gameNow(),last=timers.dualSpiritAt||0;
 if(!rule){
  if(typeof offlineMetrics!=='undefined'&&offlineMetrics){
   offlineMetrics.dualSpiritBlockedFormation++;
   if(roster.some(p=>p.hp<=0))offlineMetrics.dualSpiritBlockedPetDown++;
   else offlineMetrics.dualSpiritBlockedMissingPair++;
  }
  return;
 }
 if(!canTriggerDualSpirit(rule,event,now,last,enemy.instanceId)){
  if(typeof offlineMetrics!=='undefined'&&offlineMetrics)offlineMetrics.dualSpiritBlockedCooldown++;
  return;
 }
 timers.dualSpiritAt=now;
 if(typeof offlineMetrics!=='undefined'&&offlineMetrics)offlineMetrics.resonanceActivations=(offlineMetrics.resonanceActivations||0)+1;
 const a=petStats(roster[0]),b=petStats(roster[1]),primary=enemy;
 const petPower=Math.max(a.atk,a.matk)+Math.max(b.atk,b.matk);
 const ownerPower=Math.max(stat('atk'),stat('matk'));
 const power=(player.job==='pactWarrior'?ownerPower+petPower*.3:petPower)*rule.coefficient;
 let outcome='';
 if(rule.trait==='guard'){const guardian=roster.find(p=>companionRole(p)==='defense'||p.fusion?.main==='defense'||p.fusion?.sub==='defense')||roster.reduce((lowest,p)=>p.hp/Math.max(1,petStats(p).hp)<lowest.hp/Math.max(1,petStats(lowest).hp)?p:lowest);const restored=grantPetShield(power*2,true,guardian,effectsForPet(guardian));outcome=guardian.nickname+' 雙靈護盾 +'+restored;}
 else if(rule.trait==='heal'){const healed=healPetParty(power*1.8);outcome='共同恢復 '+healed+' HP';}
 else if(rule.trait==='focus'){primary.exposedUntil=Math.max(primary.exposedUntil||0,now+4500);primary.exposedPower=Math.max(primary.exposedPower||0,.06);outcome='對目標施加4.5秒破綻（防禦降低6%）';}
 else {
  const magical=rule.trait==='burst';
  const defense=monsterDefenseAgainst(primary,magical)*(rule.trait==='pierce'?.75:1);
  const dealt=dealDamage(hitDamage(power,defense),'resonanceDamage');if(report?.dualPetDamage)report.dualPetDamage.dualResonance+=dealt;
  outcome='聯動追加 '+dealt+' 傷害';
  if(rule.trait==='cleave'){const targets=multiTargets(enemies,primary,3,encounterLimit(player.location)).slice(1);for(const foe of targets){enemy=foe;const splash=dealDamage(hitDamage(power*.35,monsterDefenseAgainst(foe,false)),'resonanceDamage');if(report?.dualPetDamage)report.dualPetDamage.dualResonance+=splash;}enemy=primary;}
 }
 // Conditional signatures are resolved within this single activation.
 // They cannot recurse through emitEvent or generate an extra action.
 if(rule.signature==='armorEcho'&&primary.hp>0&&primary.def>0){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2500);
  primary.exposedPower=Math.max(primary.exposedPower||0,.025);
 }else if(rule.signature==='rescueGuard'&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.5);
 }else if(rule.signature==='recoveryChain'&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.75)){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.75);
  grantPetShield(power*.35,true,ally,effectsForPet(ally));
 }else if(rule.signature==='bossTrace'&&primary.hp>0&&primary.boss){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+3000);
  primary.exposedPower=Math.max(primary.exposedPower||0,.03);
 }else if(rule.signature==='finisherFocus'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.35){
  primary.exposedPower=Math.max(primary.exposedPower||0,.08);
 }else if(rule.signature==='crowdWard'&&enemies.filter(e=>e.hp>0).length>=2){
  const ally=roster.find(p=>p.hp>0);
  if(ally)grantPetShield(power*.4,true,ally,effectsForPet(ally));
 }else if(rule.signature==='fortressCounter'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.6)){
  healPetParty(power*.3);
 }else if(rule.signature==='sacredRelay'){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.4);
  if(ally)grantPetShield(power*.3,true,ally,effectsForPet(ally));
 }else if(rule.signature==='wardPierce'&&primary.hp>0&&primary.boss&&roster.some(p=>p.hp>0&&(p.fusion?.main==='defense'||p.fusion?.sub==='defense'))){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2200);
  primary.exposedPower=Math.max(primary.exposedPower||0,.02);
 }else if(rule.signature==='shieldCascade'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.75)){
  for(const ally of roster)grantPetShield(power*.22,true,ally,effectsForPet(ally));
 }else if(rule.signature==='lastStand'&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.25)){
  healPetParty(power*.4);
 }else if(rule.signature==='mutualRenewal'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.65)){
  const ally=roster.reduce((a,b)=>a.hp/Math.max(1,petStats(a).hp)<b.hp/Math.max(1,petStats(b).hp)?a:b);
  grantPetShield(power*.28,true,ally,effectsForPet(ally));
 }else if(rule.signature==='crossRelay'&&primary.boss&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.22);
 }else if(rule.signature==='echoBalance'&&primary.hp>0&&roster.every(p=>p.hp>petStats(p).hp*.75)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1800);
  primary.exposedPower=Math.max(primary.exposedPower||0,.018);
 }else if(rule.signature==='rescueBurst'&&enemies.filter(e=>e.hp>0).length>=2){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.5);
  if(ally)grantPetShield(power*.32,true,ally,effectsForPet(ally));
 }else if(rule.signature==='arcaneBulwark'&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.6)){
  const ally=roster.reduce((a,b)=>a.hp/Math.max(1,petStats(a).hp)<b.hp/Math.max(1,petStats(b).hp)?a:b);
  grantPetShield(power*.24,true,ally,effectsForPet(ally));
 }else if(rule.signature==='frostWard'&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.4)){
  healPetParty(power*.24);
 }else if(rule.signature==='guardianPrayer'&&primary.boss){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.45);
  if(ally)grantPetShield(power*.27,true,ally,effectsForPet(ally));
 }else if(rule.signature==='twinFocus'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.5){
  primary.exposedPower=Math.max(primary.exposedPower||0,.09);
 }else if(rule.signature==='sanctuaryPulse'&&enemies.filter(e=>e.hp>0).length>=2){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.65);
  if(ally)grantPetShield(power*.29,true,ally,effectsForPet(ally));
 }else if(rule.signature==='lastBastion'&&roster[1]?.hp>0&&roster[1].hp<petStats(roster[1]).hp*.25){
  healPetParty(power*.33);
 }
 // Route follow-ups share the parent resonance cooldown and never emit events.
 if(rule.routeEffect==='rendingEdge'&&primary.hp>0&&primary.boss){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1800);
  primary.exposedPower=Math.max(primary.exposedPower||0,.03);
 }else if(rule.routeEffect==='guardBreak'&&primary.hp>0&&primary.boss){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2100);
  primary.exposedPower=Math.max(primary.exposedPower||0,.022);
 }else if(rule.routeEffect==='duelRecovery'&&primary.boss&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.19);
 }else if(rule.routeEffect==='spellExecution'&&primary.hp>0&&primary.boss&&primary.maxHp>0&&primary.hp/primary.maxHp<.4){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2300);
  primary.exposedPower=Math.max(primary.exposedPower||0,.045);
 }else if(rule.routeEffect==='focusChase'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.35){
  primary.exposedPower=Math.max(primary.exposedPower||0,.1);
 }else if(rule.routeEffect==='sweepingExpose'&&enemies.filter(e=>e.hp>0).length>=2){
  const other=enemies.find(e=>e!==primary&&e.hp>0);
  if(other){other.exposedUntil=Math.max(other.exposedUntil||0,now+2000);other.exposedPower=Math.max(other.exposedPower||0,.02);}
 }else if(rule.routeEffect==='arcaneGuard'){
  const ally=roster[1];
  if(ally?.hp>0&&ally.hp<petStats(ally).hp*.55)grantPetShield(power*.22,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='sharedBulwark'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.55)){
  for(const ally of roster)grantPetShield(power*.17,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='supportTempo'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.55)){
  healPetParty(power*.21);
 }else if(rule.routeEffect==='mageWard'){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.5);
  if(ally)grantPetShield(power*.23,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='dualReplenish'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.2);
 }else if(rule.routeEffect==='frontlineReinforce'&&enemies.filter(e=>e.hp>0).length>=2){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.6);
  if(ally)grantPetShield(power*.25,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='fortressCrack'&&primary.hp>0&&primary.boss&&primary.def>0){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2200);primary.exposedPower=Math.max(primary.exposedPower||0,.026);
 }else if(rule.routeEffect==='vowReprisal'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.5){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2000);primary.exposedPower=Math.max(primary.exposedPower||0,.07);
 }else if(rule.routeEffect==='piercingContract'&&primary.hp>0&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.55)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1900);primary.exposedPower=Math.max(primary.exposedPower||0,.04);
 }else if(rule.routeEffect==='guardedStrike'&&primary.hp>0&&(player.shield||0)>0){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2000);primary.exposedPower=Math.max(primary.exposedPower||0,.025);
 }else if(rule.routeEffect==='unyieldingFocus'&&primary.hp>0&&primary.boss&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.4)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1900);primary.exposedPower=Math.max(primary.exposedPower||0,.075);
 }else if(rule.routeEffect==='doubleTempo'&&enemies.filter(e=>e.hp>0).length>=2){
  const other=enemies.find(e=>e!==primary&&e.hp>0);
  if(other){other.exposedUntil=Math.max(other.exposedUntil||0,now+2100);other.exposedPower=Math.max(other.exposedPower||0,.025);}
 }else if(rule.routeEffect==='relayCut'&&primary.hp>0&&primary.boss){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2100);primary.exposedPower=Math.max(primary.exposedPower||0,.035);
 }else if(rule.routeEffect==='balancedEdge'&&primary.hp>0&&roster.every(p=>p.hp>petStats(p).hp*.75)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1900);primary.exposedPower=Math.max(primary.exposedPower||0,.04);
 }else if(rule.routeEffect==='rescueGambit'&&enemies.filter(e=>e.hp>0).length>=2){
  const other=enemies.find(e=>e!==primary&&e.hp>0);
  if(other){other.exposedUntil=Math.max(other.exposedUntil||0,now+1700);other.exposedPower=Math.max(other.exposedPower||0,.029);}
 }else if(rule.routeEffect==='arcaneSunder'&&primary.hp>0&&primary.boss){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2400);primary.exposedPower=Math.max(primary.exposedPower||0,.03);
 }else if(rule.routeEffect==='frostRend'&&primary.hp>0&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.4)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1800);primary.exposedPower=Math.max(primary.exposedPower||0,.035);
 }else if(rule.routeEffect==='guardianEdge'&&primary.hp>0&&primary.boss&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.45)){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+1800);primary.exposedPower=Math.max(primary.exposedPower||0,.032);
 }else if(rule.routeEffect==='doubleSentence'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.5){
  primary.exposedPower=Math.max(primary.exposedPower||0,.11);
 }else if(rule.routeEffect==='sanctuaryRupture'&&enemies.filter(e=>e.hp>0).length>=2){
  const other=enemies.find(e=>e!==primary&&e.hp>0);
  if(other){other.exposedUntil=Math.max(other.exposedUntil||0,now+2200);other.exposedPower=Math.max(other.exposedPower||0,.027);}
 }else if(rule.routeEffect==='bastionBreaker'&&primary.hp>0&&primary.boss&&primary.maxHp>0&&primary.hp/primary.maxHp<.5){
  primary.exposedUntil=Math.max(primary.exposedUntil||0,now+2000);primary.exposedPower=Math.max(primary.exposedPower||0,.04);
 }else if(rule.routeEffect==='twinFortification'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.6)){
  for(const ally of roster)grantPetShield(power*.18,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='choralRecovery'&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.24);
 }else if(rule.routeEffect==='wardHandoff'){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.5);
  if(ally)grantPetShield(power*.26,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='sentryPulse'&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.23);
 }else if(rule.routeEffect==='spiritShelter'){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.3);
  if(ally)grantPetShield(power*.3,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='mutualChorus'&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.7)){
  healPetParty(power*.18);
 }else if(rule.routeEffect==='relayShelter'){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.5);
  if(ally)grantPetShield(power*.21,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='balanceChant'&&roster.every(p=>p.hp>petStats(p).hp*.75)){
  const ally=roster[1];
  if(ally?.hp>0)grantPetShield(power*.18,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='massRescue'&&enemies.filter(e=>e.hp>0).length>=2&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.5)){
  healPetParty(power*.25);
 }else if(rule.routeEffect==='arcaneReinforce'&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.6)){
  for(const ally of roster)grantPetShield(power*.16,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='frostRecovery'&&primary.boss&&roster.every(p=>p.hp>0&&p.hp<petStats(p).hp*.4)){
  const ally=roster[1];
  if(ally)grantPetShield(power*.23,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='prayerRelay'&&primary.boss&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.45)){
  healPetParty(power*.22);
 }else if(rule.routeEffect==='choralFocus'&&primary.hp>0&&primary.maxHp>0&&primary.hp/primary.maxHp<.5){
  const ally=roster.find(p=>p.hp>0&&p.hp<petStats(p).hp*.65);
  if(ally)grantPetShield(power*.23,true,ally,effectsForPet(ally));
 }else if(rule.routeEffect==='sanctuaryRelay'&&enemies.filter(e=>e.hp>0).length>=2&&roster.some(p=>p.hp>0&&p.hp<petStats(p).hp*.65)){
  healPetParty(power*.2);
 }else if(rule.routeEffect==='fortressRevival'&&roster[1]?.hp>0&&roster[1].hp<petStats(roster[1]).hp*.25){
  const ally=roster[1];grantPetShield(power*.28,true,ally,effectsForPet(ally));
 }
 message('✧ 雙靈共鳴【'+rule.name+'】'+outcome+'。','rare','pet');
 for(const foe of enemies.filter(e=>e.hp<=0&&!e.rewarded)){enemy=foe;award();}
 enemy=selectEncounterTarget(enemies,player.targetPriority,primary)||primary;
}
let fourthSkillStates=new Map();
function fourthState(pet,now=gameNow()){let state=fourthSkillStates.get(pet.id);if(!state){state=newFourthState(now);fourthSkillStates.set(pet.id,state);}return state;}
function fourthOwnerEvent(event){const pet=activePet();if(!fourthUnlocked(player,pet)||!player.hp||pet.hp<=0)return;chargeFourth(fourthState(pet),fourthPair(pet),event,gameNow(),!isTown(player.location)&&enemies.some(e=>e.hp>0));}
function tickCompanionFourth(now){
 const pet=activePet();if(!fourthUnlocked(player,pet))return;
 const state=fourthState(pet,now),active=auto&&player.hp>0&&pet.hp>0&&!isTown(player.location)&&enemies.some(e=>e.hp>0)&&!isControlled();
 advanceFourthCharge(state,now,active);if(!active||now<(timers.homecomingNextAt||0))return;
 const pair=fourthPair(pet),skill=consumeFourth(state,pair,now,pet.sp,active);if(!skill)return;
 pet.sp-=skill.cost;timers.homecomingNextAt=now+skill.cooldown;chooseAttackTarget();const selected=enemy,s=petStats(pet),victims=[];
 const [main,sub]=pair.split('-'),sourcePet=pet.fusion.main===main?pet:{...pet,fusion:{...pet.fusion,main,sub}};
 const targets=multiTargets(enemies,selected,skill.targets,encounterLimit(player.location));
 for(const [index,foe]of targets.entries()){
  enemy=foe;const amount=fourthOffense(s,pair)*skill.power*(index?skill.splash:1);
  bossHitMeta={critical:false,magical:skill.magical,petId:pet.id,range:'pet',skillId:'homecoming_'+pair};
  const dealt=dealPetDamage(hitDamage(amount,monsterDefenseAgainst(foe,skill.magical)*(1-(s.ignoreDef||0)/100)),'petDamage',sourcePet,combatPetFactor(pet.id));if(report)report.metrics.homecomingDamage=(report.metrics.homecomingDamage||0)+dealt;bossHitMeta=null;
  if(foe.hp<=0)victims.push(foe);
 }
 finishVictims(victims);enemy=selectEncounterTarget(enemies,player.targetPriority,selected)||selected;
 message(`${pet.nickname} 施放第四格【${skill.name}】！`,'rare','pet');dirty=true;
}
function emitEvent(event,creditEnergy=true){fourthOwnerEvent(event);const pet=activePet();if(!pet||pet.hp<=0||!player.hp)return;triggerDualSpiritResonance(event);
 if(event==='shieldBreak'&&player.job==='knight'&&pet.fusion?.main==='attack'&&pet.fusion?.sub==='defense')timers.knightBrokenShieldUntil=gameNow()+6000;
 if(event==='thirdHit_wizard'&&player.job==='wizard'&&pet.fusion?.main==='attack'&&pet.fusion?.sub==='defense'&&(timers.wizardStoredCharges||0)>0){
   const now=gameNow(),charges=timers.wizardStoredCharges;timers.wizardStoredCharges=0;
   if(now<(timers.wizardStoredUntil||0)&&enemy?.hp){
     const st=petStats(pet);
     const dmg=hitDamage((st.matk*.52+st.atk*.15)*charges,monsterDefenseAgainst(enemy,true));
     dealPetDamage(dmg,'resonanceDamage');
     if(!enemy.hp)award();
   }
 }
if(creditEnergy)addEnergy(event==='pet'?7:10);const role=companionRole(pet),rule=companionResonance(player,pet),now=gameNow(),pactKey=player.job+'|'+pet.id+'|'+(pet.fusion?.main||'')+'-'+(pet.fusion?.sub||'');if(!rule||!resonanceTriggered(rule,event)||now-((rule.thirdFusion||rule.fusionContract)?Math.max(resonanceUsedAt.get(pactKey)||0,resonanceUsedAt.get('active|'+player.job)||0):timers.resonance)<rule.cooldown||!originalPactPrerequisite(rule,now,event))return;if(rule.originalEvent?.threshold>1){const previous=originalPactCounters.get(pactKey),count=(previous&&previous.until>=now?previous.count:0)+1;if(count<rule.originalEvent.threshold){originalPactCounters.set(pactKey,{count,until:now+(rule.originalEvent.window||8000)});return;}originalPactCounters.delete(pactKey);}const magnitude=Math.max(1,resonanceMagnitude(rule,petStats(pet))),primary=enemy;let amount=0,dead=false,description=rule.mode==='pact'?rule.description:'';
 if(rule.effect==='strike'||rule.effect==='magic'){if(!enemy?.hp)return;amount=dealPetDamage(hitDamage(magnitude,monsterDefenseAgainst(enemy,rule.effect==='magic')),'resonanceDamage');description=`追加 ${amount} 傷害`;dead=!enemy.hp;}
 else if(rule.effect==='shield'){amount=grantPetShield(magnitude,role==='defense');description=`獲得 ${amount} 護盾`;}
 else if(rule.effect==='heal'){amount=healPetParty(magnitude);description=`恢復 ${amount} HP`;}
 else if(rule.effect==='mana'){amount=Math.min(stat('mp')-player.mp,magnitude);player.mp+=amount;record(report,'effectiveMana',amount);description=`恢復 ${amount} SP`;}
 const payloadApplied=applyOriginalPactPayload(rule,pet,primary,now,event);const modified=resonanceModifier(rule,magnitude,primary);if(amount<=0&&!modified&&!payloadApplied)return;if(player.job==='knight'&&pet.fusion?.main==='attack'&&pet.fusion?.sub==='defense')timers.knightBrokenShieldUntil=0;dead=primary?.hp<=0;timers.resonance=now;resonanceUsedAt.set(pactKey,now);if(rule.thirdFusion||rule.fusionContract)resonanceUsedAt.set('active|'+player.job,now);message(`✦ 共鳴【${rule.name}】${description}。`,'rare');for(const foe of enemies.filter(e=>e.hp<=0&&!e.rewarded)){enemy=foe;award();}enemy=selectEncounterTarget(enemies,player.targetPriority,primary)||primary;dirty=true;
}
function ultimate(){if(isControlled())return;chooseAttackTarget();const pet=activePet();if(!pet||!enemy?.hp||!player.hp)return toast('必須有可戰鬥的出戰夥伴');if(player.resonance<ULTIMATE_COST)return toast('共鳴能量不足');const now=gameNow();if(now-timers.ultimate<ULTIMATE_COOLDOWN)return toast('終極共鳴尚未冷卻');timers.ultimate=now;player.resonance-=ULTIMATE_COST;const role=companionRole(pet),st=petStats(pet);if(role==='attack'||role==='magic'){const petPower=(role==='magic'?st.matk:st.atk)*(role==='attack'?3:2.7),ownerPower=stat('atk')*.8*(1+potentialBonus(role==='magic'?'INT':playerRange(player.job)==='ranged'?'DEX':'STR')),damage=dealDamage(hitDamage(petPower+ownerPower,role==='magic'?0:enemy.def),'resonanceDamage'),ownerPart=Math.round(damage*ownerPower/(petPower+ownerPower));if(report&&ownerPart){report.metrics.resonanceDamage-=ownerPart;record(report,'playerDamage',ownerPart);}creditOwnerTelemetry(ownerPart);message(`★ 終極共鳴【${role==='attack'?'雙星斬擊':'元素爆發'}】造成 ${damage} 傷害！`,'rare');if(!enemy.hp)award();}else if(role==='defense'){const amount=grantPetShield(petUltimateSupport(st).shield,true);message(`★ 終極共鳴【不滅守護】獲得 ${amount} 護盾。`,'rare');}else{const hpBefore=player.hp,mpBefore=player.mp,amount=petUltimateSupport(st).hp;player.hp=Math.min(stat('hp'),player.hp+amount);player.mp=Math.min(stat('mp'),player.mp+petUltimateSupport(st).sp);record(report,'effectiveHeal',player.hp-hpBefore);record(report,'effectiveMana',player.mp-mpBefore);message(`★ 終極共鳴【生命共振】恢復生命與魔力。`,'rare');}dirty=true;save();render();}
function grantPlayerShield(amount,duration=6500){const before=player.shield;if(before>=Math.round(stat('hp')*.25))return 0;timers.playerShieldExpires=gameNow()+duration;player.shield=Math.min(Math.round(stat('hp')*.25),before+amount);return Math.max(0,player.shield-before);}
function currentTactic(){return offlineSimulation?null:tacticActive(player,gameNow());}
function classTactic(){
 if(offlineSimulation||!player||!player.hp)return;
 const rule=manualTactic(player.job);if(!rule)return;
 const now=gameNow(),remaining=tacticRemaining(player,now);
 if(remaining)return toast(`職業戰術尚需 ${remaining} 秒`);
 if(isControlled()&&rule.kind!=='rescue')return toast('受到控制，無法施放戰術');
 const cost=tacticSPCost(stat('mp'),rule);
 if(player.mp<cost)return toast(`戰術需要 ${cost} SP`);
 if(['execute','mark'].includes(rule.kind)){chooseAttackTarget();if(!enemy?.hp||enemy.id==='town')return toast('請先指定有效敵人');}
 player.mp-=cost;player.tacticReadyAt=now+TACTIC_COOLDOWN_MS;
 player.tacticEffect=rule.duration?{kind:rule.kind,until:now+rule.duration,...(rule.charges?{charges:rule.charges}:{}),...(['execute','mark'].includes(rule.kind)?{target:enemy.instanceId}:{})}:null;
 if(rule.kind==='guard'||rule.kind==='firstShield'){const gained=grantPlayerShield(Math.round(stat('hp')*(rule.kind==='guard'?.1:.2)));message(`${rule.name}：獲得 ${gained} 護盾。`,'good');}
 else if(rule.kind==='rescue'){const pet=activePet(),heal=Math.min(stat('hp')-player.hp,Math.round(Math.ceil(stat('hp')*.35)*(1+homecomingBonuses(player).recovery)));player.hp+=heal;record(report,'playerHeal',heal);let petHeal=0;if(pet?.hp>0){petHeal=Math.min(petStats(pet).hp-pet.hp,Math.ceil(petStats(pet).hp*.35));pet.hp+=petHeal;}controlEffect=null;message(`${rule.name}：恢復人物 ${heal}、夥伴 ${petHeal} HP 並解除控制。`,'good');}
 else if(rule.kind==='firstHeal'){const heal=Math.min(stat('hp')-player.hp,Math.round(Math.ceil(stat('hp')*.3)*(1+homecomingBonuses(player).recovery)));player.hp+=heal;record(report,'playerHeal',heal);message(`${rule.name}：恢復 ${heal} HP。`,'good');}
 else if(rule.kind==='firstMana'){const gain=Math.min(stat('mp')-player.mp,Math.ceil(stat('mp')*.3));player.mp+=gain;message(`${rule.name}：恢復 ${gain} SP。`,'good');}
 else message(`${rule.name} 啟動！${rule.description}`,'good');
 dirty=true;save();render();
}
function awardActivePetProgress(defeated,{trial=false,dawn=false}={}){for(const pet of activePetRoster(player)){const gained=awardLoyalty(pet,defeated.level||1,!!defeated.boss,Math.random);if(gained&&!dawn&&!trial)message(`${pet.nickname} 忠誠度+${gained}（${pet.loyalty}／${LOYALTY_MAX}）`,'good');if(trial||!pet.hp||pet.level>=petLevelCap(pet))continue;const petGain=Math.floor(Math.max(8,Math.floor(defeated.xp*.7))*experienceFactor(pet.level,defeated.level||1,dawn?true:pet.ascended));pet.xp+=petGain;if(offlineMetrics)offlineMetrics.petXp+=petGain;while(pet.level<petLevelCap(pet,player.reborn)&&pet.xp>=petThreshold(pet)){pet.xp-=petThreshold(pet);pet.level++;pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;message(`${pet.nickname} 成長至 LV.${pet.level}！解鎖新技能時可前往夥伴頁配置。`,'good');}if(pet.level>=petLevelCap(pet,player.reborn))pet.xp=0;}}
let petGearDropIds=null;
function award(){if(enemy?.extremeKind)return awardExtremeEnemy();if(enemy?.tower)return awardTowerEnemy();if(enemy?.homecomingRoute)return awardHomecomingEncounter();if(enemy?.trial)return awardTrialBoss();if(enemy?.dawn)return awardDawnMonster();if(enemy?.id==='town')return;if(!enemy||enemy.hp>0||enemy.rewarded)return;enemy.rewarded=true;if(!enemy.boss&&Number.isInteger(enemy.slotIndex))encounterSlots[enemy.slotIndex]=gameNow()+rand(250,1400);endReport('擊敗');const defeated=enemy,species=SPECIES[enemy.id];player.kills++;spiritReactiveEvent('ownerKill');if(recordSpiritQuestVictory(player,activePetRoster(player),defeated)&&spiritQuestState(player).kills===SPIRIT_TRIAL_KILLS)message('✧ 雙靈共同戰勝最後一名敵人，回蒼穹樞城完成誓約！','rare','system');if(!offlineSimulation)combatSamples.push({at:gameNow(),owner:0,pet:0,kills:1});const reward=albumEarnGold(enemy.gold??Math.max(1,Math.round((enemy.level||1)*.35)+rand(1,3)),player,passiveBonus('goldPct'));player.gold+=reward;const earnedXp=Math.floor(enemy.xp*experienceFactor(player.level,enemy.level||1,player.reborn));player.xp+=earnedXp;const jobGain=Math.floor(Math.max(10,Math.round(enemy.xp*.85))*experienceFactor(player.level,enemy.level||1,player.reborn));player.jobXp+=jobGain;if(offlineMetrics){offlineMetrics.baseXp+=earnedXp;offlineMetrics.jobXp+=jobGain;offlineMetrics.goldEarned+=reward;}message(`擊敗 Lv.${enemy.level||1} ${species.name}！獲得 ${earnedXp} Base EXP、${jobGain} Job EXP、${reward} 金。`,'rare');
 if(JUNK_ITEMS['junk_'+enemy.id]){const id='junk_'+enemy.id;addStack(player.bag,id,1);message(`掉落：${ITEMS[id].name} ×1`,'good','system');}if(enemy.level>=101){if(enemy.boss||Math.random()<.08)addStack(player.bag,'ascension_core',1);}for(const reward of thirdJobRewards(enemy,Math.random)){addStack(player.bag,reward.id,reward.qty);message(`✦ 獲得 ${ITEMS[reward.id].name} ×${reward.qty}！`,'rare','system');}if(enemy.id==='boss_celestial'&&enemy.boss){addStack(player.bag,REBIRTH_CORE_ID,1);message(`✦ 取得99級星宮首領的${ITEMS[REBIRTH_CORE_ID].name} ×1！回村莊即可轉生。`,'rare','system');}if(auto)autoSellSelected();
 if(Math.random()<.68){const drops=enemy.drops||['red_small','blue_small','scrap'],nonJunkDrops=drops.filter(id=>!ITEMS[id]?.junk),id=nonJunkDrops[rand(0,nonJunkDrops.length-1)]||'red_small';addStack(player.bag,id,1);message(`掉落：${ITEMS[id].name} ×1`,'good');}
 if(!isCaptureSanctuary(player.location)&&enemy.level>=1&&enemy.level<=99&&Math.random()<.22){const stage=Math.min(4,Math.ceil(enemy.level/20)),id=`essence_${stage}`;addStack(player.bag,id,1);message(`進化素材掉落：${ITEMS[id].name} ×1`,'rare');}
 const gearDrop=equipmentDrop(enemy.boss,passiveBonus('lootPct'),Math.random,spiritEquipmentSplit(player.job,player.reborn).character);if(gearDrop==='character'){const level=enemy.level||1,slotChoices=level<10?['blade','rifle','mace','oneStaff','shortBow','staffSword','vest','helm','boots','visor','mask']:level<20?['blade','rifle','mace','oneStaff','shortBow','staffSword','longBow','oneSpear','offDagger','vest','chip','ring','shield','cloak']:['blade','rifle','mace','oneSpear','twoSpear','offDagger','katar','longBow','crossbow','vest','plate','chip','ring','shield','cloak','boots','helm','visor','mask','oneStaff','twoStaff','staffSword','twoSword','spellFist','knuckles','instrument'],id=slotChoices[rand(0,slotChoices.length-1)];awardGear(rollGear(id,level,enemy.boss?bossRarity():null));}
 if(gearDrop==='pet'){const ids=petGearDropIds??=Object.keys(PET_GEAR_BASE);awardGear(rollPetGear(ids[rand(0,ids.length-1)],enemy.level||1,enemy.boss?bossRarity():null));}
 if(Math.random()<cardDropChance(player.location,enemy)){addCard(enemy.id);if(enemy.boss)queueBossCardNotice(enemy.id);message(`✦ ${enemy.boss?'首領專屬':''}卡片掉落：${CARDS[enemy.id].name}！（${enemy.boss?'0.1':'0.2'}%）`,'rare');}
 while(player.level<characterLevelCap(player)&&player.xp>=threshold()){player.xp-=threshold();player.level++;clearStatSnapshots();player.statPoints+=2;player.hp=stat('hp');player.mp=stat('mp');message(`Base LV.${player.level}！獲得 2 點能力點數。`,'good');}if(player.level>=characterLevelCap(player))player.xp=0;while(player.jobLevel<jobLevelCap(player)&&player.jobXp>=jobThreshold()){player.jobXp-=jobThreshold();player.jobLevel++;clearStatSnapshots();reconcileSkillPoints(player,JOB_SKILLS[player.job],!!SECOND_JOBS[player.job]);message(`Job LV.${player.jobLevel}！獲得 1 點職業技能點。`,'good');}if(player.jobLevel>=jobLevelCap(player))player.jobXp=0;syncRebirthSkills();awardActivePetProgress(defeated);enemies=enemies.filter(e=>e!==defeated&&e.hp>0);enemy=selectEncounterTarget(enemies,player.targetPriority)||defeated;if(enemies.length)startReport();nextEncounterAt=Math.min(nextEncounterAt,gameNow()+replacementDelay());dirty=true;save();}
function creditOwnerTelemetry(amount){if(offlineSimulation||!amount)return;const sample=combatSamples.at(-1);if(!sample||sample.at!==gameNow())return;const credit=Math.min(sample.pet,amount);sample.owner+=credit;sample.pet-=credit;}
function dealPetDamage(amount,key='petDamage',sourcePet=activePet(),sourceFactor=1){if(player?.job==='pactWarrior')return 0;const boost=classBuffPower('pet'),manual=currentTactic()?.kind==='duet'?1.2:1,commanderBalance=player?.job==='spiritCommander'?commanderFinalDamageFactor(sourcePet):1,actual=dealDamage(amount*commanderBalance*manual*petDirectRoleMultiplier(companionRole(sourcePet),player.level)*(key==='petDamage'?fusionDirectOutputFactor(sourcePet):1)*sigilBonus(player).petDamage*(1+boost)*sourceFactor,key),owned=Math.round(actual*boost/(1+boost));if(report&&owned){report.metrics[key]-=owned;record(report,'playerBuffDamage',owned);}creditOwnerTelemetry(owned);
 if(offlineMetrics&&actual){
  const d=offlineMetrics.damage;
  d.other-=actual;
  d.player+=owned; // owner class Buff share, not a separate bonus DPS
  const member=sourcePet?.id===player.activePetId?'pet1':sourcePet?.id===player.secondaryPetId?'pet2':'other';
  d[member]+=actual-owned;
 }
 if(report?.dualPetDamage&&sourcePet){const group=sourcePet.id===player.activePetId?'first':sourcePet.id===player.secondaryPetId?'second':null;if(group)report.dualPetDamage[group]+=Math.max(0,actual-owned);}return actual;}
function finishVictims(victims){for(const foe of [...new Set(victims)])if(foe.hp<=0&&!foe.rewarded){enemy=foe;award();}enemy=selectEncounterTarget(enemies,player.targetPriority,enemy)||enemy;}
function splashDamage(primary,amount,fraction,key='playerDamage',petSource=false){const targets=multiTargets(enemies,primary,4,encounterLimit(player.location)).slice(1),victims=[];for(const foe of targets){enemy=foe;if(petSource)dealPetDamage(amount*fraction/(1+classBuffPower('pet')),key);else dealDamage(amount*fraction,key,true);if(!foe.hp)victims.push(foe);}enemy=primary;return victims;}
function stealFromEnemy(){if(player.job!=='rogue'||!enemy?.hp||enemy.stealAttempted)return;enemy.stealAttempted=true;if(Math.random()>.4)return;enemy.stolen=true;const options=(JUNK_ITEMS['junk_'+enemy.id]?['junk_'+enemy.id]:(enemy.drops||['scrap'])).filter(id=>ITEMS[id]&&!ITEMS[id].slot),id=options[rand(0,options.length-1)]||'scrap';addStack(player.bag,id,1);message(`流氓成功偷取 ${ITEMS[id].name} ×1！`,'rare','player');emitEvent('steal');}
function pactFor(skill){const pact=classBuffs.pact;if(pact?.perSkill)return pact.until>gameNow()&&activePet()?.hp>0?(pact.perSkill[skill?.id]||{}):{};if(!(pact?.until>gameNow()&&(pact.skillId==='*'||pact.skillId===skill?.id||(skill?.id==='rebirthMain_'+player.job||skill?.id==='thirdMain_'+player.job))))return {};if(!['rebirthMain_'+player.job,'thirdMain_'+player.job].includes(skill?.id))return pact;return {...pact,...(pact.rebirthRefund!==undefined?{refund:pact.rebirthRefund}:{}),...(pact.rebirthMagic!==undefined?{magic:pact.rebirthMagic}:{}),...(pact.rebirthSpread!==undefined?{spread:pact.rebirthSpread}:{}),...(pact.rebirthBonus!==undefined?{bonus:pact.rebirthBonus}:{}),...(pact.rebirthArmor!==undefined?{armor:pact.rebirthArmor}:{}),...(pact.rebirthPetArmor!==undefined?{petArmor:pact.rebirthPetArmor}:{})};}
function skillContext(skill){const pact=pactFor(skill);return {reborn:player.reborn,level:player.level,speed:stat('speed')*(1-(pact.haste||0)),attributes:effectiveAttributes(),cooldown:pact.cooldown||0,castFactor:(pact.castFactor||1)*(1-Math.min(.6,passiveBonus('castReduction')))};}
function skillCooldown(skill){return jobSkillCooldownMs(skill,skillContext(skill))*(1-(pactFor(skill).cooldown||0));}
function unassistedAction(key,interval,now){timers.unassisted=timers.unassisted||{};const next=timers.unassisted[key]??now,extra=now+0.001<next;if(!extra)timers.unassisted[key]=now-next<interval?next+interval:now+interval;return extra;}
function isHealingMelody(skill){const pet=activePet();return skill?.id==='thirdUtility_performer'&&pet?.hp>0&&pet.fusion?.main==='defense'&&pet.fusion?.sub==='support';}
function playerAttack(skill=false,skillId=null,completed=false){if(isControlled())return;chooseAttackTarget();if(!player||!enemy?.hp||!player.hp)return;const now=gameNow();if(casting&&!completed)return;if(!skill&&(now-timers.attack<stat('speed')||now-timers.skill<(timers.actionDelay||0)))return;const chosen=jobSkillById(player.job,skillId||player.equippedJobSkill)||activeJobSkills(player.job)[0],rank=player.jobSkills[chosen.id]||0;if(skill&&!completed){const context=skillContext(chosen),delay=skillActionDelay(chosen,context);if(chosen.kind==='passive'||!rank||!skillUnlocked(player,chosen)||!canCastJobSkill(chosen)||player.mp<chosen.mp||now-timers.skill<(timers.actionDelay||GLOBAL_SKILL_COOLDOWN)||now-Math.max(jobSkillTimers[chosen.id]||0,chosen.kind==='shield'?jobSkillTimers.personalShield||0:0)<skillCooldown(chosen)||chosen.attackCycle&&now-timers.attack<delay)return;player.mp-=chosen.mp;if(offlineMetrics&&skill){offlineMetrics.skillCasts=offlineMetrics.skillCasts||{};offlineMetrics.skillCasts[chosen.id]=(offlineMetrics.skillCasts[chosen.id]||0)+1;}const actionAt=chosen.attackCycle&&timers.actionDelay===delay&&now-timers.skill<delay*2?timers.skill+delay:now;timers.skill=actionAt;timers.actionDelay=delay;jobSkillTimers[chosen.id]=actionAt;if(chosen.kind==='shield')jobSkillTimers.personalShield=actionAt;if(chosen.attackCycle)timers.attack=actionAt;if(chosen.castMs)emitEvent('castStart');const instant=chosen.kind==='magic'&&currentTactic()?.kind==='instant';if(instant)player.tacticEffect.kind='instantDamage';const cast=instant?0:skillCastMs(chosen,effectiveAttributes(),player)*skillContext(chosen).castFactor;if(cast>0){casting={id:chosen.id,until:now+cast,started:now};message(`開始詠唱【${chosen.name}】（${(cast/1000).toFixed(2)}秒）。`,'good','player');dirty=true;render();return;}}else if(!skill){timers.attack=now;}

 let pact=skill?pactFor(chosen):{};const accelerated=skill?unassistedAction(chosen.id,(chosen.attackCycle?skillActionDelay(chosen,{speed:stat('speed')}):jobSkillCooldownMs(chosen,{speed:stat('speed')})),now):false;
 const utility=skill&&['heal','shield','mana','buff'].includes(chosen.kind),criticalRoll=Math.random()*100,critical=!utility&&criticalRoll<stat('crit'),petCrit=critical&&classBuffs.resonanceCrit?.until>now&&criticalRoll>=stat('crit')-classBuffs.resonanceCrit.power,petHaste=skill&&accelerated&&((pact.haste||0)>0||(pact.cooldown||0)>0)||!skill&&classBuffs.resonanceHaste?.until>now&&now<(timers.unhastedAttackNext||0),primary=enemy,spiritMorph=skill?spiritMainProfile(chosen):null;let damage=0,effectEvent=null,action=spiritMorph?.name||(skill?chosen.name:'普通攻擊');const victims=[primary];if(!skill&&!petHaste)timers.unhastedAttackNext=now+aspdAttackIntervalMs(stat('aspd'))/(1+(Object.values(player.gear).reduce((n,g)=>n+(combatEnhancedAffixes(g).aspdPct||0),0)+cardBonus('aspdPct'))/100);if(!utility&&!(currentTactic()?.kind==='mark'&&currentTactic().target===primary.instanceId)&&Math.random()>hitChance(stat('hit'),primary.flee)&&!critical){if(currentTactic()?.kind==='instantDamage')player.tacticEffect=null;message(`${action} 未命中 ${SPECIES[primary.id].name}。`,'','player');dirty=true;render();return;}
 if(skill&&!utility&&player.reborn&&player.jobSkills['rebirthBuff_'+player.job]&&['hunter','crusader'].includes(player.job))emitEvent('buff');if(skill&&!utility){const companion=activePet(),rule=companion&&companionResonance(player,companion);if(rule?.mode==='pact'){if(rule.perSkill)emitEvent(chosen.id);else emitEvent(chosen.event||'skill');if(chosen.event&&chosen.event!=='skill')emitEvent('skill');if(critical)emitEvent('crit');pact=pactFor(chosen);}}if(skill&&pact.refund){const gain=Math.min(stat('mp')-player.mp,pact.refund);player.mp+=gain;record(report,'effectiveMana',gain);}
 if(skill&&chosen.kind==='heal'){const budget=Math.round(stat(chosen.healSource||(['recover','breathing'].includes(chosen.id)?'atk':'matk'))*jobSkillMultiplier(chosen,rank,skillContext(chosen))*(1+passiveBonus('healingPct')/100)),targets=[{unit:player,max:stat('hp')}];if(chosen.id==='sanctuary'||chosen.partyHeal)for(const pet of activePetRoster(player))if(pet.hp>0)targets.push({unit:pet,max:petStats(pet).hp});targets.sort((a,b)=>a.unit.hp/a.max-b.unit.hp/b.max);let remaining=budget,healed=0;for(const {unit,max} of targets){const missing=Math.max(0,max-unit.hp),baseGain=Math.min(missing,remaining),gain=Math.min(missing,Math.round(baseGain*(unit===player?1+homecomingBonuses(player).recovery:1)));unit.hp+=gain;remaining-=baseGain;healed+=gain;}record(report,'playerHeal',healed);if(healed)effectEvent='heal';if(player.job==='priest'&&remaining>0){timers.pendingOriginalOverheal=remaining;emitEvent('overheal');timers.pendingOriginalOverheal=0;}message(`${action} 恢復 ${healed} HP。`,'good','player');}
 else if(skill&&chosen.kind==='shield'){const shield=grantPlayerShield(Math.round(stat('hp')*.1*jobSkillMultiplier(chosen,rank,skillContext(chosen)),chosen.id==='barrier'?9000:6500));if(shield)effectEvent='shield';message(`${action} 獲得 ${shield} 護盾。`,'good','player');}
 else if(skill&&chosen.kind==='mana'){const gain=Math.min(stat('mp')-player.mp,Math.round(stat('matk')*jobSkillMultiplier(chosen,rank,skillContext(chosen))));player.mp+=gain;if(gain)effectEvent='mana';message(`${action} 恢復 ${gain} SP。`,'good','player');if(isHealingMelody(chosen)){bossCardSong(player,CARDS);
  const healed=healPetParty(Math.round(stat('matk')*jobSkillMultiplier(chosen,rank,skillContext(chosen))),'playerHeal');
  if(healed>0){effectEvent='heal';message(`${action} 的治癒旋律恢復 ${healed} HP。`,'good','player');}
 }}
 else if(skill&&chosen.kind==='buff'){classBuffs[chosen.buff]={until:now+chosen.duration,...scaledSkillBuff(chosen,rank),teamDamage:chosen.teamDamage};bossCardSong(player,CARDS);effectEvent=chosen.event||'buff';message(`${action} 生效，持續 ${chosen.duration/1000} 秒。`,'good','player');}
 else{const preFusionMagic=spiritPreFusionIsMagic(player.job,player.thirdJob,stat('atk'),stat('matk')),magical=preFusionMagic??spiritAttackIsMagic(spiritMorph,stat('atk'),stat('matk'),skill?chosen.kind==='magic':['mage','wizard','acolyte','priest','sage'].includes(player.job)),base=offensiveSource(spiritMorph?{...chosen,kind:magical?'magic':'physical'}:skill?chosen:null),power=(base*(skill?jobSkillMultiplier(chosen,rank,skillContext(chosen))+((pact.bonus||0)+(player.mp>=stat('mp')*.8?pact.manaBurst||0:0))+(enemies.filter(e=>e.hp>0).length===1?pact.single||0:0)+(primary.hp<primary.maxHp*.3?pact.execute||0:0)+(pact.castPower?skillCastMs(chosen,effectiveAttributes(),player)/1000*pact.castPower:0):1)+(pact.magic||0)*(activePet()?.hp>0?petStats(activePet()).matk:0)+(pact.petAttack||0)*(activePet()?.hp>0?petStats(activePet()).atk:0)+(pact.armor||0)*stat('def',true)+(pact.petArmor||0)*(activePet()?.hp>0?petStats(activePet()).def:0))*(magical?1+stat('magicDamage')/100:1)*(1+classBuffPower())*(pact.spread&&enemies.filter(e=>e.hp>0).length>(chosen.targets||1)?pact.spread:1),pactRatio=skill?base*jobSkillMultiplier(chosen,rank,skillContext(chosen))/Math.max(1,base*(jobSkillMultiplier(chosen,rank,skillContext(chosen))+((pact.bonus||0)+(player.mp>=stat('mp')*.8?pact.manaBurst||0:0))+(enemies.filter(e=>e.hp>0).length===1?pact.single||0:0)+(primary.hp<primary.maxHp*.3?pact.execute||0:0)+(pact.castPower?skillCastMs(chosen,effectiveAttributes(),player)/1000*pact.castPower:0))+(pact.magic||0)*(activePet()?.hp>0?petStats(activePet()).matk:0)+(pact.petAttack||0)*(activePet()?.hp>0?petStats(activePet()).atk:0)+(pact.armor||0)*stat('def',true)+(pact.petArmor||0)*(activePet()?.hp>0?petStats(activePet()).def:0)):1,defense=monsterDefenseAgainst(primary,magical)*(1-stat('ignoreDef')/100);const executeActive=primary.hp<primary.maxHp*.3,rolled=playerHitDamage(power*(skill?chosen.primaryTargetPower||1:1),defense,petCrit,petHaste,stat('critDmg')/100,pactRatio,false,critical);manualElementalStrike=player.job==='sage'&&currentTactic()?.kind==='elemental'&&(!skill||['thirdMain_sage','rebirthMain_sage','spellFist'].includes(chosen.id));bossHitMeta={critical,magical,range:playerRange(player.job),skillId:skill?chosen.id:''};damage=dealDamage(rolled,'playerDamage');bossHitMeta=null;manualElementalStrike=false;message(`${action}${critical?'【暴擊】':''}${skill&&Object.keys(pact).length?'【共鳴】':''}${damageText(rolled,damage)}。`,skill?'good':'','player');
  if(skill&&(chosen.aoe||pact.targets)){const secondary=multiTargets(enemies,primary,(chosen.targets||1)+(pact.targets||0),encounterLimit(player.location)).slice(1);for(const [index,foe] of secondary.entries()){enemy=foe;const armor=monsterDefenseAgainst(foe,magical)*(1-stat('ignoreDef')/100);const executeDelta=base*(pact.execute||0)*(Number(foe.hp<foe.maxHp*.3)-Number(executeActive))*(magical?1+stat('magicDamage')/100:1)*(1+classBuffPower())*(pact.spread&&enemies.filter(e=>e.hp>0).length>(chosen.targets||1)?pact.spread:1);dealDamage(playerHitDamage(Math.max(1,(power+executeDelta)*(chosen.secondaryTargetPower||1)),armor,petCrit,petHaste,stat('critDmg')/100,pactRatio,index>=(chosen.targets||1)-1,critical),'playerDamage',true);victims.push(foe);}enemy=primary;}
  if(primary.hp>0&&player.job==='sage'&&(!skill||(chosen.id==='spellFist'||chosen.id==='rebirthMain_sage'||chosen.id==='thirdMain_sage'))&&classBuffs.autoSpell?.until>now&&Math.random()<Math.min(.9,classBuffs.autoSpell.power+passiveBonus('autoSpellChance'))){const autoPact=pactFor({id:player.thirdJob?'thirdMain_sage':player.reborn?'rebirthMain_sage':'spellFist'});for(const [index,foe] of multiTargets(enemies,primary,3+(autoPact.autoTargets||0),encounterLimit(player.location)).entries()){enemy=foe;dealDamage(playerHitDamage(offensiveSource({kind:'magic'})*(.4+(autoPact.autoPower||0)),monsterDefenseAgainst(foe,true),false,petHaste,1,.4/(.4+(autoPact.autoPower||0)),index>=3),'playerDamage');victims.push(foe);}enemy=primary;const mana=Math.min(stat('mp')-player.mp,autoPact.autoMana||0);player.mp+=mana;record(report,'effectiveMana',mana);emitEvent('autospell');}
  if(primary.hp>0&&!skill){if(player.job==='hunter'&&Math.random()<passiveBonus('falcon')){const bonus=dealDamage(hitDamage(offensiveSource()*.35,primary.def*.5),'playerDamage');message(`獵鷹協攻造成 ${bonus} 傷害！`,'good','player');emitEvent('falcon');}if(player.job==='monk'){timers.combo=(timers.combo||0)+1;if(timers.combo%3===0){dealDamage(hitDamage(offensiveSource()*.65,primary.def),'playerDamage');emitEvent('combo');}}}
  if(primary.hp>0&&skill&&chosen.steal)stealFromEnemy();
 }
 enemy=primary;if(damage&&primary.hp>0&&activePet()?.hp>0&&!fusedPair(activePet())){let extra=0;if(now<petEffects.blessingUntil)extra+=Math.max(1,Math.round(damage*petEffects.blessingPower));if(petEffects.markHits>0){extra+=petEffects.markPower;petEffects.markHits--;}if(extra){const applied=dealDamage(extra,'buffDamage');message(`✧ 夥伴增益額外造成 ${applied} 傷害！`,'rare','pet');}}
 if(skill&&damage&&pact.leech){const gain=Math.min(stat('hp')-player.hp,Math.round(damage*pact.leech));player.hp+=gain;record(report,'effectiveHeal',gain);}if(skill&&damage&&pact.bounty){const gain=albumEarnGold(Math.max(1,Math.floor(player.level*pact.bounty)),player);player.gold+=gain;if(offlineMetrics)offlineMetrics.goldEarned+=gain;}if(player.job==='rogue'&&skill&&damage>0&&activePet()?.fusion?.main==='attack'&&activePet()?.fusion?.sub==='support'&&now-(timers.lastSkillRefresh||0)>=1000&&Math.random()<.12){
  const cooldown=skillCooldown(chosen);
  jobSkillTimers[chosen.id]=Math.max(0,(jobSkillTimers[chosen.id]||now)-Math.min(2500,cooldown*.35));
  timers.lastSkillRefresh=now;emitEvent('skillRefresh');
 }
 if(damage>0&&primary.hp<=0)fourthOwnerEvent('kill');
 if(skill&&damage>0){
  if(classBuffs.angelus?.until>now&&chosen.kind==='magic')fourthOwnerEvent('consecratedCast');
  if(chosen.id==='thirdMain_'+player.job)emitEvent('thirdHit_'+player.job);
  if(chosen.id==='thirdWide_'+player.job)emitEvent('thirdWideHit_'+player.job);
  if(player.job==='knight'&&chosen.id==='thirdMain_knight'){timers.knightCombo=(timers.knightCombo||0)+1;if(timers.knightCombo%2===0)emitEvent('combo');}
  if(player.job==='rogue'){timers.rogueCombo=(timers.rogueCombo||0)+1;if(timers.rogueCombo%2===0)emitEvent('combo');}
 }
 if(currentTactic()?.kind==='elemental'&&damage>0&&(!skill||['thirdMain_sage','rebirthMain_sage','spellFist'].includes(chosen.id))){player.tacticEffect.charges--;if(player.tacticEffect.charges<=0)player.tacticEffect=null;}if(currentTactic()?.kind==='instantDamage'&&skill&&chosen.kind==='magic')player.tacticEffect=null;if(skill&&chosen.castMs)emitEvent('castComplete');dirty=true;if(skill&&utility&&chosen.thirdOnly)emitEvent(chosen.id);if(effectEvent)emitEvent(effectEvent);else if(!utility){emitEvent(skill?(chosen.event||'skill'):'attack');if(critical&&damage)emitEvent('crit');}if(skill&&chosen.kind==='buff'&&effectEvent!=='buff')emitEvent('buff',false);if(!offlineSimulation)queueCombatVfx({source:skill?'skill':'normal',skillId:skill?chosen.id:'',kind:skill?chosen.kind:'physical',name:action,critical,range:playerRange(player.job),targetIds:[...new Set(victims)].map(foe=>foe.instanceId).filter(Boolean),finisher:skill&&chosen.id.startsWith('thirdFinish_'),aoe:skill&&victims.length>1});finishVictims(victims);render();}
function offlineOrderedAutoSkills(settings,skills){
 if(!offlineSimulation||globalThis.__spiritDisableOfflineAutoSkillCache)return orderedAutoSkills(settings,skills);
 const signature=(settings?.order||[]).join('\u0001')+'|'+(settings?.disabled||[]).join('\u0001');
 const cache=offlineAutoSkillCache;
 if(cache?.settings===settings&&cache.skills===skills&&cache.signature===signature)return cache.result;
 const result=orderedAutoSkills(settings,skills);
 offlineAutoSkillCache={settings,skills,signature,result};
 return result;
}
function autoCastJobs(){if(casting||!auto||!player.hp||!enemy?.hp||gameNow()-timers.skill<(timers.actionDelay||GLOBAL_SKILL_COOLDOWN))return;const skills=offlineOrderedAutoSkills(player.autoSkills,JOB_SKILLS[player.job]);for(const skill of skills){if(!player.jobSkills[skill.id]||!canCastJobSkill(skill)||player.mp<skill.mp)continue;if(skill.kind==='heal'&&player.hp>stat('hp')*.65&&!((skill.id==='sanctuary'||skill.partyHeal)&&activePetRoster(player).some(pet=>pet.hp>0&&pet.hp<petStats(pet).hp*.65)))continue;if(skill.kind==='shield'&&player.shield>=stat('hp')*(skill.id==='barrier'?.2:.15))continue;if(skill.kind==='mana'&&player.mp>stat('mp')*.55&&!(isHealingMelody(skill)&&(player.hp<=stat('hp')*.65||activePet().hp<=petStats(activePet()).hp*.65)))continue;if(skill.kind==='buff'&&classBuffs[skill.buff]?.until>gameNow())continue;const before=timers.skill;playerAttack(true,skill.id);if(timers.skill!==before){timers.autoJob=gameNow();break;}}}
function petAttack(pet=activePet(),sourceFactor=combatPetFactor(pet?.id)){chooseAttackTarget();if(!pet||!enemy?.hp||!player.hp||pet.hp<=0||sourceFactor<=0)return;const now=gameNow(),s=commanderTransferredPetStats(pet,petStats(pet)),species=SPECIES[pet.species],primary=pet.id===player.activePetId,last=primary?timers.pet:(timers.petById?.[pet.id]||0);const attackInterval=Math.max(80,aspdAttackIntervalMs(s.aspd)/(1+(s.aspdPct||0)/100+(classBuffs.resonanceHaste?.until>now?classBuffs.resonanceHaste.power:0)));if(now-last<attackInterval)return;const attackAt=now-last>attackInterval*2?now:last+attackInterval;if(primary)timers.pet=attackAt;else (timers.petById??={})[pet.id]=attackAt;if(companionRole(pet)==='support'&&pet.sp>=3){pet.sp-=3;const pulse=supportPulse(s),healed=healPetParty(pulse.hp),mp=Math.min(stat('mp')-player.mp,pulse.sp);player.mp+=mp;record(report,'effectiveMana',mp);if(healed||mp)message(`${pet.nickname} 施放 ${species.skill}（SP -3），恢復 HP ${healed}、SP ${mp}。`,'good','pet');}const critical=Math.random()<(s.crit+(classBuffs.resonanceCrit?.until>now?classBuffs.resonanceCrit.power:0))/100;if(!critical&&Math.random()>hitChance(s.hit,enemy.flee)){message(`${pet.nickname} 的攻擊被閃避。`,'','pet');}else{const morph=player.job==='spiritCommander'?spiritSinglePetProfile(player,pet):null,role=companionRole(pet),magic=spiritAttackIsMagic(morph,s.atk,s.matk,['magic','support'].includes(role)),attackSource=morph?(magic?s.matk:role==='defense'?petOffensivePower(s,role):s.atk):petOffensivePower(s,role),rolled=hitDamage(attackSource,monsterDefenseAgainst(enemy,magic)*(1-(s.ignoreDef||0)/100),critical?(s.critDmg||140)/100:1),damage=(bossHitMeta={critical,magical:magic,petId:pet.id,range:'pet'},dealPetDamage(rolled,'petDamage',pet,sourceFactor));bossHitMeta=null;
if(offlineMetrics&&player.job==='spiritCommander'){
 const m=offlineMetrics.spiritPetMain??={hits:0,damage:0,sourcePower:0,magicHits:0};
 m.hits++;m.damage+=damage;m.sourcePower+=attackSource;m.magicHits+=Number(magic);
}
if(player.job==='spiritCommander'){
 const selected=enemy,dead=[];
 // Active blessing: outgoing hits, not incoming hits, drive healing and verdict.
 if(damage>0&&spiritSinglePetProfile(player,pet)?.effect==='guardianVerdict'&&now-(timers.guardianVerdictAt||0)>=6500){
  timers.guardianVerdictAt=now;
  const maxHp=petStats(pet).hp,healing=Math.round(maxHp*.03),effective=Math.min(maxHp-pet.hp,healing);
  pet.hp=Math.min(maxHp,pet.hp+healing);
  spiritGuardianVerdict={petId:pet.id,createdAt:now,healingPower:effective+(healing-effective)*.25};
  if(offlineMetrics){const m=offlineMetrics.guardian??={triggers:0,effectiveHeal:0,overheal:0,echoUses:0,echoPctUsed:0};m.triggers++;m.effectiveHeal+=effective;m.overheal+=healing-effective;}
 }
 const verdict=spiritGuardianVerdict?.petId===pet.id&&now-spiritGuardianVerdict.createdAt<=8000?spiritGuardianVerdict:null;
 if(verdict&&damage>0){
  spiritGuardianVerdict=null;
  const power=Math.round((s.def+s.mdef)*2.5+verdict.healingPower*3);
  for(const foe of multiTargets(enemies,selected,3,encounterLimit(player.location))){
   if(!foe.hp)continue;
   enemy=foe;
   const applied=dealPetDamage(hitDamage(power,monsterDefenseAgainst(foe,magic)*(1-(s.ignoreDef||0)/100)),'petDamage',pet,sourceFactor);
   if(offlineMetrics&&applied){const m=offlineMetrics.guardian??={};m.waveHits=(m.waveHits||0)+1;m.waveDamage=(m.waveDamage||0)+applied;}
   if(foe!==selected&&!foe.hp)dead.push(foe);
  }
  enemy=selected;
 }
 for(const [index,foe] of multiTargets(enemies,selected,3,encounterLimit(player.location)).slice(1).entries()){
  if(!foe.hp)continue;enemy=foe;
  const extra=hitDamage(attackSource*(index===0?.75:.5),monsterDefenseAgainst(foe,magic)*(1-(s.ignoreDef||0)/100),critical?(s.critDmg||140)/100:1);
  dealPetDamage(extra,'petDamage',pet,sourceFactor);
  if(!foe.hp)dead.push(foe);
 }
 enemy=selected;if(dead.length)finishVictims(dead);enemy=selected;
}
message(`${pet.nickname} ${critical?'暴擊':'普通攻擊'}${damageText(rolled*(1+classBuffPower('pet')),damage)}（${magic?'魔法':'物理'}）。`,'good','pet');}if(primary&&enemy.hp)emitEvent('pet');if(!enemy.hp)award();dirty=true;render();}
function absorbDamageWithMana(damage){
 if(player.manaGuardEnabled===false)return {damage,prevented:0,spSpent:0};
 const normalRatio=Math.min(.30,Math.max(0,passiveBonus('manaGuard')/100));
 const emergency=normalRatio>0&&player.hp<=stat('hp')*.40;
 const ratio=emergency?Math.min(.60,normalRatio*2):normalRatio;
 if(!ratio||damage<=0)return {damage,prevented:0,spSpent:0};
 const maximum=stat('mp'),reserve=Math.ceil(maximum*.15);
 const spendable=Math.min(Math.floor(maximum*.10),Math.max(0,player.mp-reserve));
 const prevented=Math.min(Math.floor(damage*ratio),spendable*30);
 const spSpent=Math.ceil(prevented/30);
 if(!spSpent)return {damage,prevented:0,spSpent:0};
 player.mp-=spSpent;
 if(report){report.metrics.manaDamageAbsorbed=(report.metrics.manaDamageAbsorbed||0)+prevented;report.metrics.manaGuardSpSpent=(report.metrics.manaGuardSpSpent||0)+spSpent;if(emergency)report.metrics.manaGuardEmergencyTriggers=(report.metrics.manaGuardEmergencyTriggers||0)+1;}
 return {damage:damage-prevented,prevented,spSpent};
}
function resolveSpiritPairDefeat(){
 if(!player||!['pactWarrior','spiritCommander'].includes(player.job))return false;
 const pet=activePet();
 if(!pet||player.hp>0&&pet.hp>0||player.hp<=0&&pet.hp<=0)return false;
 if(offlineMetrics){const deaths=offlineMetrics.spiritDefeats??={boss:0,mob:0};deaths[enemy?.boss?'boss':'mob']++;}
 if(offlineMetrics)offlineMetrics.spiritFatal={
  at:gameNow(),target:pet.hp<=0?'pet':'owner',trialIndex:player.trialRun?.index??null,
  enemyId:enemy?.id||null,enemyLevel:enemy?.level??null,enemyAttackType:enemy?.attackType||null,
  enemyAtk:enemy?.atk??null,ownerHpBefore:player.hp,ownerMaxHp:stat('hp'),
  petMaxHp:petStats(pet).hp,petStats:commanderTransferredPetStats(pet,petStats(pet)),
  lastPetHit:offlineMetrics.spiritLastPetHit||null};
 player.hp=0;pet.hp=0;
 if(!Number.isFinite(pet.reviveAt))pet.reviveAt=gameNow()+PET_REVIVE_MS;
 if(player.extremeRun){exitExtreme('契約雙方戰敗');return true;}
 if(player.towerRun){exitTower('契約雙方戰敗');return true;}
 if(player.trialRun){exitTrial('契約雙方戰敗，試煉已結束');return true;}
 { // A newly linked defeat always starts a fresh owner revival countdown.
  player.reviveAt=gameNow()+PLAYER_REVIVE_MS;
  stopAutoFusion('契約雙方倒下');
  endReport('戰敗');
  message('契約任一方倒下，人物與夥伴同時戰敗。','bad');
  if(!player.autoRevive)showReviveDialog();
  save();
 }
 return true;
}
function enemyAttack(){
 if(resolveSpiritPairDefeat())return;
 if(!player.hp||!enemy?.hp||gameNow()<(timers.respawnGrace||0))return;
 let petWasHit=false;const attacker=enemy,roster=activePetRoster(player),firstAlive=roster.find(unit=>unit.hp>0),now=gameNow();
 // Legacy jobs retain weighted aggro; the two spirit careers have fixed targets.
 const petAggroWeight=unit=>monsterTargetWeights(player,unit,companionRole(unit),now<effectsForPet(unit).guardUntil).find(entry=>entry.kind==='pet')?.weight||0;
 const aggroPet=roster.filter(unit=>unit.hp>0).reduce((best,unit)=>!best||petAggroWeight(unit)>petAggroWeight(best)?unit:best,null);
 const targetPet=player.job==='spiritCommander'?!!firstAlive:player.job==='pactWarrior'?false:chooseMonsterTarget(player,aggroPet,aggroPet?companionRole(aggroPet):null,aggroPet?now<effectsForPet(aggroPet).guardUntil:false)==='pet';
 const pet=targetPet?chooseDefendingPet(roster,companionRole,{mode:player.dualPetMode||'focus',guardingIds:roster.filter(unit=>gameNow()<effectsForPet(unit).guardUntil).map(unit=>unit.id)}):firstAlive;
 const role=pet?companionRole(pet):null,fx=effectsForPet(pet);
 if(offlineMetrics&&isSpiritJob(player.job)){
  const lane=targetPet?(pet?.id===roster[0]?.id?'pet1':'pet2'):'owner';
  const counts=offlineMetrics.spiritEnemyTargets??={owner:0,pet1:0,pet2:0};
  counts[lane]++;
 }
 const roll=rand(85,115)/100;
 if(targetPet){
  const s=player.job==='spiritCommander'?commanderTransferredPetStats(pet,petStats(pet)):petStats(pet);
  if(Math.random()>monsterHitChance(attacker.hit,s.flee,attacker.attackType==='magic')){if(player.job==='spiritCommander')bossCardDodge(player,CARDS,gameNow(),s.hp,pet);message(`${pet.nickname} 閃避了 ${SPECIES[attacker.id].name} 的攻擊。`,'good');}
  else{petWasHit=true;let d=Math.max(1,Math.round(incomingMonsterDamage(monsterAttackPower(attacker),attacker.attackType==='magic'?s.mdef:s.def,roll)*(1-(s.damageReduction||0)/100)*(1-(classBuffs.teamWard?.until>gameNow()?classBuffs.teamWard.power:0))*tacticIncomingFactor(currentTactic(),true)));if(player.job==='spiritCommander'){const cardGuard=bossCardIncoming(player,CARDS,{now:gameNow(),boss:!!attacker.boss,magic:attacker.attackType==='magic',damage:d,maxHp:s.hp,currentHp:pet.hp});d=cardGuard.damage;if(cardGuard.shield)fx.shield=Math.min(Math.round(s.hp*.25),(fx.shield||0)+cardGuard.shield);if(cardGuard.heal)pet.hp=Math.min(s.hp,pet.hp+cardGuard.heal);}const capacity=pet.hp+(fx.shield||0),absorbed=Math.min(fx.shield||0,d),effective=Math.min(pet.hp,d-absorbed);fx.shield=Math.max(0,(fx.shield||0)-absorbed);pet.hp=Math.max(0,pet.hp-(d-absorbed));if(offlineMetrics)offlineMetrics.spiritLastPetHit={at:gameNow(),damage:d,absorbed,effective,preHp:pet.hp+effective,attacker:attacker.id,attackerAtk:attacker.atk,petDef:s.def,petMdef:s.mdef,petReduction:s.damageReduction};record(report,'shieldPrevented',absorbed);record(report,'petTaken',effective);if(absorbed>0)spiritReactiveEvent('petShieldLost');if(effective>0){spiritReactiveEvent('petDamaged');spiritReactiveEvent('petLowHp');}record(report,'petTanked',effective);record(report,'petProtection',Math.max(0,Math.min(capacity,Math.round(attacker.atk*roll))-Math.min(capacity,d)));if(role==='defense')record(report,'interceptPrevented',Math.min(player.hp,incomingMonsterDamage(attacker.atk,stat('def'),roll)));message(`⚔ ${SPECIES[attacker.id].name} 命中 ${pet.nickname}，HP -${effective}${absorbed?`（護盾吸收 ${absorbed}）`:''}。`,'bad','damage');if(role==='defense')emitEvent('pet_guard');if(pet.id===player.activePetId&&spiritSinglePetProfile(player,pet)?.trigger==='petGuard')spiritReactiveEvent('petGuard');if(!pet.hp){pet.reviveAt=gameNow()+PET_REVIVE_MS;petDeathSequence++;fx.shield=0;if(pet.id!==player.activePetId){delete secondaryPetEffects[pet.id];delete timers.petById?.[pet.id];delete timers.petAbilityById?.[pet.id];}message(`${pet.nickname} 暫時失去戰鬥能力，請使用藥水；人物戰敗復活時也會恢復夥伴。`,'bad','damage');if(player.job==='spiritCommander'&&resolveSpiritPairDefeat())return;}}

 }else if(Math.random()>ownerHitChance(attacker.hit,stat('flee'),attacker.attackType==='magic')){bossCardDodge(player,CARDS,gameNow(),stat('hp'));message('角色閃避了敵人的攻擊。','good');emitEvent('dodge');}
 else{
  const blocked=parentJob(player.job)==='swordsman'&&Math.random()<(player.job==='crusader'?.35:.25);if(blocked){message('劍士成功格擋，本次傷害降低50%。','good');emitEvent('block');}
  let d=Math.max(1,Math.round(incomingMonsterDamage(monsterAttackPower(attacker),stat(attacker.attackType==='magic'?'mdef':'def'),roll)*(blocked?.5:1)*(1-passiveBonus('reflect'))*(1-stat('damageReduction')/100)*(1-(classBuffs.teamWard?.until>gameNow()?classBuffs.teamWard.power:0))*(classBuffs.devotion?.until>gameNow()?.88:1)*tacticIncomingFactor(currentTactic(),false)));const cardGuard=bossCardIncoming(player,CARDS,{now:gameNow(),boss:!!attacker.boss,magic:attacker.attackType==='magic',damage:d,maxHp:stat('hp')});d=cardGuard.damage;if(cardGuard.shield)player.shield=Math.min(Math.round(stat('hp')*.25),player.shield+cardGuard.shield);if(cardGuard.heal)player.hp=Math.min(stat('hp'),player.hp+Math.round(cardGuard.heal*(1+homecomingBonuses(player).recovery)));if(blocked&&passiveBonus('reflect')&&attacker.hp>0){const selected=enemy;enemy=attacker;dealDamage(hitDamage(stat('atk')*passiveBonus('reflect')*10*(1+potentialBonus('STR')),attacker.def),'playerDamage');if(!attacker.hp)award();enemy=selected;}const baseIncoming=Math.round(attacker.atk*roll),capacity=player.hp+(player.shield||0);const ward=classBuffs.teamWard?.until>gameNow()?classBuffs.teamWard.power:0,petWard=ward?Math.max(0,Math.min(capacity,Math.round(d/(1-ward)))-Math.min(capacity,d)):0;record(report,'petProtection',petWard);record(report,'playerProtection',Math.max(0,Math.min(capacity,baseIncoming)-Math.min(capacity,d)-petWard));const absorbed=Math.min(player.shield||0,d),petAbsorbed=Math.min(petShield,absorbed);record(report,'shieldPrevented',petAbsorbed);record(report,'playerShieldPrevented',absorbed-petAbsorbed);petShield=Math.max(0,petShield-petAbsorbed);player.shield=Math.max(0,(player.shield||0)-absorbed);if(absorbed>0&&player.shield===0)emitEvent('shieldBreak');d-=absorbed;const manaGuard=absorbDamageWithMana(d);d=manaGuard.damage;if(d>=player.hp&&currentTactic()?.kind==='decoy'){d=Math.max(0,player.hp-1);player.tacticEffect={kind:'decoyGuard',until:gameNow()+2000};message('幻影替身抵擋了致命攻擊！','good');}const effective=Math.min(player.hp,d);player.hp=Math.max(0,player.hp-d);record(report,'playerTaken',effective);if(absorbed>0)spiritReactiveEvent('ownerShieldLost');if(effective>0){spiritReactiveEvent('ownerDamaged');spiritReactiveEvent('ownerLowHp');}record(report,'playerTanked',effective);
 if(player.job==='performer'&&timers.soundShieldCharge>0&&gameNow()<timers.soundShieldUntil&&attacker.hp>0){
   const selected=enemy;enemy=attacker;
   const st=activePet()?.hp>0?petStats(activePet()):null;
   if(st){dealPetDamage(hitDamage((st.def*.55+st.matk*.35)*timers.soundShieldCharge,attacker.def*.5),'resonanceDamage');if(!attacker.hp)award();}
   timers.soundShieldCharge=0;timers.soundShieldUntil=0;enemy=selected;
 }
 if(effective>0&&player.hp>0)emitEvent('damageTaken');message(`⚔ ${SPECIES[attacker.id].name} 命中玩家，HP -${effective}${absorbed?`（護盾吸收 ${absorbed}）`:''}。`,'bad');if(!player.hp){if(resolveSpiritPairDefeat())return;if(player.extremeRun){exitExtreme('戰敗');return;}if(player.towerRun){exitTower('戰敗');return;}if(player.trialRun){exitTrial('戰敗，試煉已結束');return;}player.reviveAt=gameNow()+PLAYER_REVIVE_MS;stopAutoFusion('角色倒下');endReport('戰敗');message('角色倒下，請決定是否原地復活或回城。','bad');if(!player.autoRevive)showReviveDialog();save();}
 }
 if(petEffects.guardUntil>gameNow()&&petEffects.guardCounter&&activePet()?.hp>0&&attacker.hp>0&&gameNow()>=(petEffects.counterNext||0)){petEffects.counterNext=gameNow()+800;const selected=enemy;enemy=attacker;dealPetDamage(hitDamage(petStats(activePet()).def*petEffects.guardCounter,attacker.def),'petDamage');if(!attacker.hp)award();enemy=selected;}
 if(petWasHit&&pet?.id===activePet()?.id&&classBuffs.pact?.until>gameNow()&&classBuffs.pact.counter&&activePet()?.hp>0&&attacker.hp>0){const selected=enemy;enemy=attacker;dealPetDamage(hitDamage(petStats(activePet()).def*classBuffs.pact.counter,attacker.def),'resonanceDamage');if(!attacker.hp)award();enemy=selected;}
 if(petEffects.counterUntil>gameNow()&&activePet()?.hp>0&&attacker.hp>0){const chosen=enemy;enemy=attacker;dealPetDamage(Math.min(petEffects.counterPower,Math.round(attacker.atk*.3)),'resonanceDamage');if(!attacker.hp)award();enemy=selectEncounterTarget(enemies,player.targetPriority,chosen)||chosen;}dirty=true;render();
}
function fleeMapBosses(){if(player.towerRun)return exitTower('主動離場');if(player.trialRun)return exitTrial('主動離場');const fleeing=enemies.filter(e=>e.boss&&e.hp>0);if(!fleeing.length)return;const current=enemy;if(fleeing.includes(current)){endReport('逃離首領');petEffects.bleedTicks=0;petEffects.burnTicks=0;petEffects.markHits=0;}enemies=enemies.filter(e=>!fleeing.includes(e));enemy=selectEncounterTarget(enemies,player.targetPriority)||{...current,hp:0};if(enemies.length&&!report)startReport();nextEncounterAt=gameNow()+replacementDelay();message(`已逃離 ${fleeing.map(e=>SPECIES[e.id].name).join('、')}，不扣除金幣、不發放獎勵。`,'','system');dirty=true;save();render();}
function capture(){if(!player||!enemy?.hp||!player.hp)return;if(enemy.boss)return toast('地圖首領無法捕捉，可選擇逃走');if(!isCaptureSanctuary(player.location))return toast('只有「夥伴之地」或「契靈之地」可以捕捉夥伴');const ratio=enemy.hp/enemy.maxHp;if(player.pets.length>=30)return toast('夥伴欄已滿（最多 30 隻）');if(!(player.bag.find(e=>e.id==='orb')?.qty>0)){const cost=ITEMS.orb.cost;if(player.gold<cost)return toast(`捕捉球已用完，金幣不足（需要 ${cost} 金）`);player.gold-=cost;addStack(player.bag,'orb',1);if(offlineMetrics){offlineMetrics.spent+=cost;offlineMetrics.purchased.orb=(offlineMetrics.purchased.orb||0)+1;}message(`捕捉球已用完，自動購買 1 顆，花費 ${cost} 金。`,'good','system');}if(!consumeStack(player.bag,'orb'))return;const chance=clamp(.55+Math.max(0,.5-ratio)*.7,.55,.85);if(Math.random()<chance){endReport('捕捉');const pet=makePet(enemy.id);pet.rarity=player.location===SPIRIT_SANCTUARY_MAP?'mythic':capturedQuality(player,companionRole(pet),pet.rarity);if(player.location===SPIRIT_SANCTUARY_MAP)blessSanctuaryPet(pet);pet.nickname=petForm(pet)||SPECIES[pet.species].name;pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;pet.equippedSkills=defaultPetSkills(companionRole(pet),pet.rarity);player.pets.push(pet);player.petBook[enemy.id]=(player.petBook[enemy.id]||0)+1;if(offlineMetrics)(offlineMetrics.captures??=[]).push({name:pet.nickname,rarity:pet.rarity});if(['uncommon','legendary','mythic'].includes(pet.rarity))showCaptureReward(pet);message(`捕捉成功！獲得 ${petForm(pet)||pet.nickname}（${petRarity(pet).name} · ${(fusedPair(pet)?.name||SPECIES[pet.species].roleName)}）。`,'rare');if(!player.activePetId){player.activePetId=pet.id;timers.pet=gameNow();message(`${pet.nickname} 自動設定為出戰夥伴。`,'good');}const caught=enemy;if(Number.isInteger(caught.slotIndex))encounterSlots[caught.slotIndex]=gameNow()+rand(250,1400);enemies=enemies.filter(e=>e!==caught);enemy=selectEncounterTarget(enemies,player.targetPriority)||{...caught,hp:0};if(enemies.length)startReport();nextEncounterAt=gameNow()+replacementDelay();}else message(`捕捉失敗，${SPECIES[enemy.id].name} 掙脫了捕捉球。`,'bad');dirty=true;save();render();}

function combineEssence(tier){const result=synthesizeEssence(player.bag,tier,player.location);if(result.error)return toast(result.error);message(`合成 ${ITEMS[result.id].name} ×1。`,'rare','system');dirty=true;save();renderSide();}
function reviveCost(){const zoneIndex=ZONES.findIndex(z=>z.id===player.location);return Math.max(1,zoneIndex+1)*1000;}
function showReviveDialog(){if(offlineSimulation)return;if(!player||player.hp>0)return;const price=reviveCost();const wait=deathRemaining(player,gameNow());$('reviveYes').textContent=player.trialDefeated?'試煉已結束，請回城復活':wait?`原地復活準備中 · ${wait}秒`:`原地復活 · ${price.toLocaleString('zh-TW')} 金`;$('reviveYes').disabled=player.trialDefeated||player.gold<price||wait>0;$('reviveTown').disabled=false;$('reviveDescription').textContent=`免費回城復活可立即返回安全城鎮，不需要倒數。原地復活需要等待${wait}秒，花費 ${price.toLocaleString('zh-TW')} 金（持有 ${player.gold.toLocaleString('zh-TW')} 金）。夥伴原地復活仍依自身冷卻；回城時人物與所有夥伴立即恢復 100% HP／SP。`; $('reviveModal').style.display='flex';}
function revive(mode='town'){if(player?.trialDefeated)mode='town';if(!player||player.hp>0)return;if(mode==='place'&&deathRemaining(player,gameNow()))return toast(`原地復活準備中，還需${deathRemaining(player,gameNow())}秒`);const cost=mode==='place'?reviveCost():0;if(player.gold<cost)return toast('金幣不足，請選擇回城復活');player.gold-=cost;delete player.trialDefeated;$('reviveModal').style.display='none';const restored=mode==='town'?1:.5;player.hp=Math.max(1,Math.ceil(stat('hp')*restored));player.mp=Math.ceil(stat('mp')*restored);for(const pet of player.pets){if(mode==='place'&&pet.hp<=0&&gameNow()<(pet.reviveAt||0))continue;pet.hp=Math.max(1,Math.ceil(petStats(pet).hp*restored));pet.sp=Math.ceil(petStats(pet).sp*restored);if(mode==='town')delete pet.reviveAt;}if(mode==='place'&&isSpiritJob(player.job)){const pet=activePet();if(pet&&pet.hp<=0){pet.hp=Math.max(1,Math.ceil(petStats(pet).hp*.5));pet.sp=Math.ceil(petStats(pet).sp*.5);delete pet.reviveAt;}}player.shield=0;timers.respawnGrace=gameNow()+10000;auto=!player.manualPaused;if(mode==='town'){player.lastMap=player.location;player.location=homeTown(player.location);}message(`${mode==='town'?'免費回城':'原地'}復活成功，人物與夥伴恢復 ${mode==='town'?'100%':'50%'} HP／SP。${cost?`花費 ${cost} 金。`:''}`,'good','system');dirty=true;spawn();save();}
function applyPoints(attr,amount=1){if(!Object.hasOwn(ATTRS,attr))return 0;const requested=Number(amount),cap=attributeCap(player);if(!Number.isSafeInteger(requested)||requested<1){toast('請輸入大於0的整數配點數量');return 0;}if(player.statPoints<1){toast('目前沒有可配置點數');return 0;}if(player.attributes[attr]>=cap){toast(`${ATTRS[attr]}基本值已達上限${cap}，Job、裝備與卡片加成不占此上限`);return 0;}const before=player.attributes[attr],points=player.statPoints;amount=Math.min(points,cap-before,requested);player.attributes[attr]+=amount;player.statPoints-=amount;dirty=true;if(save()===false){player.attributes[attr]=before;player.statPoints=points;return 0;}allocationAmounts[attr]=Math.max(1,Math.min(requested,player.statPoints,cap-player.attributes[attr]));clearStatSnapshots();render();renderSide(true);toast(`${ATTRS[attr]}成功配置${amount}點，剩餘${player.statPoints}點${amount<requested?'（已依剩餘點數與基本值上限調整）':''}`);return amount;}
function applyPointsFromInput(attr,input){return applyPoints(attr,input?input.value:allocationAmounts[attr]??1);}
function stowEquipped(slot){if(player.gear[slot]){player.gear[slot].swapProtected=true;player.bag.push(player.gear[slot]);player.gear[slot]=null;}}
function useItem(index){if(isControlled())return toast('受控制效果影響，暫時無法行動');const entry=player.bag[index],it=ITEMS[entry?.id];let petEvolutionNotice=null;if(!it)return;if(player.trialRun&&(it.slot||it.petSlot))return toast('試煉中無法換裝，請先離場；補給仍可使用');if(it.capture||it.junk||it.craft||it.evolution||it.quest)return toast('此物品不能直接使用');if(it.petSlot){const pet=selectedGearPet();if(!pet)return toast('請先讓一隻夥伴出戰，再替牠裝備');if(pet.level<(entry.level||1))return toast(`夥伴需要 Lv.${entry.level} 才能穿戴`);const beforeForm=structuredClone(pet);if(pet.gear[it.petSlot]){pet.gear[it.petSlot].swapProtected=true;player.bag.push(pet.gear[it.petSlot]);}player.bag.splice(index,1);pet.gear[it.petSlot]=entry;const evolution=reconcileHumanoidStages(pet);if(evolution.changed)petEvolutionNotice={pet,beforeForm,evolution};pet.hp=Math.min(pet.hp,petStats(pet).hp);pet.sp=Math.min(pet.sp,petStats(pet).sp);message(`${pet.nickname} 穿戴 ${entry.name}。`,'good');}else if(it.heal||it.energy){if(player.hp<=0)return toast('人物倒下後需等待15秒，請選擇復活方式');const hp=clamp(player.hp+potionRestore(it,'hp',player.level,stat('hp')),0,stat('hp')),mp=clamp(player.mp+potionRestore(it,'mp',player.level,stat('mp')),0,stat('mp'));if(hp===player.hp&&mp===player.mp)return toast('目前不需要使用');player.hp=hp;player.mp=mp;consumeStack(player.bag,entry.id);message(`使用 ${it.name}。`,'good');}
 else{if(!ignoresGearLevel(player,entry)&&player.level<(entry.level||1))return toast(`裝備需要 Base Lv.${entry.level}`);if(it.jobs&&!it.jobs.includes(player.job))return toast('這件武器不適合目前職業');if(it.slot==='leftHand'&&ITEMS[player.gear.rightHand?.id]?.hands===2)return toast('雙手武器佔用左手，請先卸下');if(it.id==='offDagger'&&GEAR_BASE[player.gear.rightHand?.id]?.weaponType!=='dagger')return toast('副手匕首需要先裝備主手匕首');const slot=it.slot;if(rankOf(player.gear[slot])&&!confirm('換下的裝備會完整保留原強化；強化不能轉移，新裝備不會繼承原裝備的階級，需要各自強化。確定換裝？'))return;const returnCount=Number(!!player.gear[slot])+Number(slot==='rightHand'&&!!player.gear.leftHand&&(it.hands===2||it.weaponType!=='dagger'&&player.gear.leftHand?.id==='offDagger'));if(player.bag.length-1+returnCount>2000)return toast('背包空間不足以收回換下裝備');player.bag.splice(index,1);if(slot==='rightHand'&&(it.hands===2||it.weaponType!=='dagger'&&player.gear.leftHand?.id==='offDagger'))stowEquipped('leftHand');stowEquipped(slot);player.gear[slot]=entry;player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));message(`裝備 ${entry.name}${it.hands===2?'（雙手武器，佔用左右手）':''}。`,'good');}dirty=true;save();render();}
function usePetItem(index,petId=null){if(isControlled())return toast('受控制效果影響，暫時無法行動');const pet=petId?activePetRoster(player).find(p=>p.id===petId):activePet(),entry=player.bag[index],it=ITEMS[entry?.id];if(!pet)return toast('尚無出戰夥伴');if(!it?.heal&&!it?.energy)return;if(pet.hp<=0&&gameNow()<(pet.reviveAt||(pet.reviveAt=gameNow()+PET_REVIVE_MS)))return toast('夥伴倒下後需等待 10 秒才能復活');const max=petStats(pet),hp=Math.min(max.hp,pet.hp+potionRestore(it,'hp',pet.level,max.hp,true)),sp=Math.min(max.sp,pet.sp+potionRestore(it,'mp',pet.level,max.sp,true));if(hp===pet.hp&&sp===pet.sp)return toast('夥伴目前不需要補給');pet.hp=hp;pet.sp=sp;consumeStack(player.bag,entry.id);message(`替 ${pet.nickname} 使用 ${it.name}。`,'good');dirty=true;save();render();}
function unequip(slot){if(player.towerRun)return toast('天穹終境中無法換裝');if(player.trialRun)return toast('試煉中無法換裝');if(!player.gear[slot])return;if(player.bag.length>=2000)return toast('背包已滿');stowEquipped(slot);player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));save();render();}
function autoSellSelected(){if(!auto||!player)return;const result=sellSelectedJunk(player,ITEMS);if(result.count){if(offlineMetrics){offlineMetrics.goldEarned+=result.gold;offlineMetrics.junkGold=(offlineMetrics.junkGold||0)+result.gold;}message(`自動出售雜物 ${result.count} 個，獲得 ${result.gold} 金。`,'good');dirty=true;}}
function questProgress(map,q){const junk=player.bag.find(e=>e.id===q.junk)?.qty||0,proof=player.bag.find(e=>e.id===q.proof)?.qty||0;return {map,q,junk,proof,ready:junk>=QUEST_REQUIREMENTS.junk&&proof>=QUEST_REQUIREMENTS.proof};}
function checkQuestReady(){if(offlineSimulation)return;for(const [map,q] of Object.entries(player.quests||{})){if(q.done)continue;const progress=questProgress(map,q);if(progress.ready&&!q.readyNotified){q.readyNotified=true;dirty=true;toast(`征途任務材料已備齊！可回村莊找艾琳回報：${MAPS[map]?.name||map}`);}else if(!progress.ready&&q.readyNotified){q.readyNotified=false;dirty=true;}}}
function renderBaseQuestTracker(){const hint=spiritGrowthGuide(player,activePetRoster(player)),spiritCard=hint?`<article class="quest-track-card" data-ui-key="spirit-growth-hint"><b>✧ ${hint.stage}</b><span>${hint.message}</span></article>`:'';const core=player.bag.find(e=>e.id===REBIRTH_CORE_ID)?.qty||0;return spiritCard+(!player.reborn&&SECOND_JOBS[player.job]?`<article class="quest-track-card" data-ui-key="rebirth-core"><b>靈契轉生 · Lv.99星宮首領</b><span>星宮轉生核心 ${Math.min(1,core)}／1</span>${core&&player.level>=99&&player.jobLevel>=50?'<button data-quest-return>回村莊轉生</button>':''}</article>`:'');}
function zoneQuestAction(map,turnIn=false){const previous=structuredClone(player),result=turnIn?turnInZoneQuest(player,map):acceptZoneQuest(player,map);if(result.error)return toast(result.error);dirty=true;if(save()===false){player=previous;return;}render();}
function syncRebirthSkills(){if(!player)return;const main=player.thirdJob&&player.jobSkills['thirdMain_'+player.job]?'thirdMain_'+player.job:'rebirthMain_'+player.job;if(player.reborn&&player.jobSkills[main]&&supersededSkill(player,jobSkillById(player.job,player.equippedJobSkill)))player.equippedJobSkill=main;}
function rebirthCharacter(){const error=rebirthEligibility(player,SECOND_JOBS);if(error)return toast(error);if(!confirm('確認消耗星宮轉生核心×1進行轉生？Base／Job回到1，一轉職業與屬性重新開始，獲得20點自由能力；所有裝備維持穿戴，卡片、夥伴與金幣保留。'))return;const previous=structuredClone(player),core=player.bag.find(e=>e.id===REBIRTH_CORE_ID);core.qty--;player.bag=player.bag.filter(e=>e.id!==REBIRTH_CORE_ID||e.qty>0);player.job=parentJob(player.job);player.reborn=true;player.level=1;player.xp=0;player.jobLevel=1;player.jobXp=0;player.jobPoints=0;player.firstJobLevel=1;player.firstJobPoints=0;player.rebornJobPoints=0;player.attributes=Object.fromEntries(Object.keys(ATTRS).map(k=>[k,1]));player.statPoints=20;player.jobSkills=initialJobSkills(player.job);player.equippedJobSkill=activeJobSkills(player.job)[0].id;player.hp=stat('hp');player.mp=stat('mp');classBuffs={};jobSkillTimers={};dirty=true;if(save()===false){player=previous;return;}message('轉生完成：消耗星宮轉生核心×1，獲得20點自由能力，角色上限150；新大陸101–150已開放。','rare');render();}
function sellJunk(index){const entry=player.bag[index],item=ITEMS[entry?.id];if(!item?.junk)return;const payout=item.cost*entry.qty;player.gold+=payout;message(`販售 ${item.name} ×${entry.qty}，獲得 ${payout} 金。`,'good');player.bag.splice(index,1);dirty=true;save();render();}
function salvageGear(gear){const count=([1,2,3,5,8])[Math.max(0,RARITIES.findIndex(r=>r.id===gear.rarity))];addStack(player.bag,shardId(gearGroup(gear.id),gearTier(gear.level)),count);return count;}
function awardGear(gear){if(auto&&shouldAutoSalvage(gear,player)){const shards=salvageGear(gear);message(`♻ 自動分解 ${gearLabel(gear)} ${gear.name}，獲得 ${shards} 塊碎晶。`,'good');}else{player.bag.push(gear);message(`✦ 裝備掉落：${gearLabel(gear)} ${gear.name}！`,'rare');}}
function salvageBagEquipment(){if(!player?.autoSalvage)return 0;let count=0,shards=0;for(let i=player.bag.length-1;i>=0;i--){const gear=player.bag[i],it=ITEMS[gear?.id];if(!(it?.slot||it?.petSlot)||!shouldAutoSalvage(gear,player))continue;shards+=salvageGear(gear);player.bag.splice(i,1);count++;}if(count){message(`♻ 背包整理：分解 ${count} 件未穿戴裝備，獲得 ${shards} 塊碎晶。`,'good','system');dirty=true;save();render();}return count;}
function dismantle(uid){const index=player.bag.findIndex(g=>g.uid===uid);if(index<0)return toast('這件裝備已不在背包');const gear=player.bag[index];if(rankOf(gear)&&!confirm(`確定分解${rankOf(gear)}階強化裝備？原強化會消失，星鑄結晶不會退還。`))return;if(!(GEAR_BASE[gear?.id]||PET_GEAR_BASE[gear?.id]))return;const count=salvageGear(gear);player.bag.splice(index,1);message(`♻ 分解 ${gear.name}（${gearLabel(gear)}），取得 ${count} 塊 ${TIER_NAMES[gearTier(gear.level)-1]}碎晶。`,'good');dirty=true;save();render();}
function unequipPetGear(slot){if(player.towerRun)return toast('天穹終境中無法換裝');if(player.trialRun)return toast('試煉中無法換裝');if(player.bag.length>=2000)return toast('背包已滿');const pet=selectedGearPet();if(!pet?.gear?.[slot])return;pet.gear[slot].swapProtected=true;player.bag.push(pet.gear[slot]);pet.gear[slot]=null;pet.hp=Math.min(pet.hp,petStats(pet).hp);pet.sp=Math.min(pet.sp,petStats(pet).sp);dirty=true;save();render();}
function craftGear(){if(autoFusionRunning)return toast('請先暫停自動融合');const result=fuseOne(player,{tier:craftTier,base:craftBase,stat:'any',rarity:'any'});if(result.error)return toast(result.error);message(`⚒ 融合成功：${gearLabel(result.gear)} ${result.gear.name}！`,'rare');dirty=true;save();render();}
function startAutoFusion(){if(!gameRunning||!player?.hp)return toast('請先進入遊戲並讓角色保持存活');if(player.fusionNotice)return showFusionResult();if(!save())return;autoFusionPlan=normalizeFusionSettings(player.fusionSettings);autoFusionRunning=true;autoFusionAttempts=0;autoFusionNext=0;autoFusionStatus='正在融合';save();updateFusionStop();renderSide();}
function stopAutoFusion(reason='已手動暫停'){autoFusionRunning=false;autoFusionStatus=reason;updateFusionStop();}
function updateFusionStop(){if(offlineSimulation)return;const button=$('fusionQuickStop');if(!button)return;button.hidden=!autoFusionRunning;button.textContent=`停止融合 · ${autoFusionAttempts} 次`;}
function autoFusionTick(now=gameNow()){
 if(!gameRunning||!player||!autoFusionRunning)return;
 if(!player.hp){stopAutoFusion('角色倒下，已停止融合');return;}
 if(now<autoFusionNext)return;
 autoFusionNext=now+100;
 const batchSize=200;
 let processed=0,returned=0,matched=false;
 while(autoFusionRunning&&processed<batchSize&&autoFusionAttempts<autoFusionPlan.limit){
  const result=fuseOne(player,autoFusionPlan);
  if(result.error){stopAutoFusion(result.error+'，已停止融合');break;}
  autoFusionAttempts++;processed++;
  if(result.matched){
   result.gear.fusionMatch=true;
   player.fusionNotice={uid:result.gear.uid,attempts:autoFusionAttempts};
   message(`⚒ 批次融合第 ${autoFusionAttempts} 次達成：${gearLabel(result.gear)} ${result.gear.name}`,'rare','system');
   stopAutoFusion('已融合到目標裝備');matched=true;break;
  }
  returned+=salvageGear(result.gear);
  const index=player.bag.findIndex(g=>g.uid===result.gear.uid);
  if(index>=0)player.bag.splice(index,1);
 }
 if(!processed&&!matched&&!autoFusionRunning){toast(autoFusionStatus);renderSide();return;}
 if(!matched&&autoFusionRunning&&autoFusionAttempts>=autoFusionPlan.limit)stopAutoFusion('已達本次融合次數上限');
 if(processed){if(!matched)message(`♻ 批次融合 ${processed} 次，未達標全部分解，返還碎晶 ${returned} 個（累計 ${autoFusionAttempts} 次）。`,'good','system');dirty=true;save();}
 updateFusionStop();renderSide();
 if(matched)showFusionResult();
 else if(!autoFusionRunning)toast(autoFusionStatus);
}
function showFusionResult(){const notice=player?.fusionNotice,gear=notice&&player.bag.find(g=>g.uid===notice.uid);if(!gear)return;const c=player.fusionSettings;$('fusionResultContent').innerHTML=`<p>第 ${notice.attempts} 次融合達成條件，自動融合已暫停。</p>${equipmentLine(gear)}<p>${TIER_NAMES[gearTier(gear.level)-1]} · 詞條 ${c.stat==='any'?'任意':`${AFFIX_NAMES[c.stat]||c.stat} ≥ ${c.minimum}`} · 已放入本角色背包</p><p class="tiny">此裝備不會被自動分解，仍可由你手動分解。</p>`;$('fusionResultModal').style.display='grid';$('gameShell').inert=true;$('fusionResultBag').focus();}
function closeFusionResult(goBag=false){if(!player)return;const gear=player.bag.find(g=>g.uid===player.fusionNotice?.uid);player.fusionNotice=null;$('fusionResultModal').style.display='none';$('gameShell').inert=false;save();if(goBag){tab='bag';bagCategory=ITEMS[gear?.id]?.petSlot?'petEquipment':'equipment';gearFilterRarity=gearFilterTier=gearFilterSlot=gearFilterStat=gearFilterJob='all';}render();}
function renderFormation(){const pet=activePet(),role=pet?companionRole(pet):null,weights=monsterTargetWeights(player,pet,role,gameNow()<petEffects.guardUntil),total=weights.reduce((n,x)=>n+x.weight,0);return `<div class="item formation-panel"><b>戰鬥站位 · 近戰優先承受攻擊</b><p>防禦近戰夥伴較容易被鎖定，其次為其他近戰；遠程優先級較低，但仍會受到攻擊。若只有遠程單位，也會正常承受攻擊。</p><div class="formation-units">${weights.map(t=>`<div class="formation-unit ${t.range}"><span>${rangeLabel(t.range)}</span><b>${escapeHtml(t.kind==='player'?player.name:petForm(pet)||pet.nickname)}</b><small>目前被選為目標機率 ${Math.round(t.weight/total*100)}%</small></div>`).join('')}</div></div>`;}
function renderAutoFusion(){const c=player.fusionSettings,all=[...Object.entries(GEAR_BASE),...Object.entries(PET_GEAR_BASE)],material=shardId(GEAR_BASE[c.base]?.weaponType?'weapon':'armor',c.tier),held=player.bag.find(e=>e.id===material)?.qty||0,range=fusionTargetInfo(c),disabled=autoFusionRunning?'disabled':'';if(c.stat!=='any'&&range.max>0)c.minimum=clamp(c.minimum,range.min,range.max);const targetInfo=fusionTargetInfo(c);return `<div class="item auto-fusion-panel"><div class="eyebrow">AUTO FUSION</div><h3>⚒ 自動融合目標</h3><p>每次消耗指定階級碎晶 ×8。未達標成品立即自動分解、返還對應碎晶；符合品質與詞條目標時保留裝備、自動停止並顯示結果。</p><div class="gear-filters"><label>指定階級<select data-fusion-setting="tier" ${disabled}>${TIER_NAMES.map((t,i)=>`<option value="${i+1}" ${c.tier===i+1?'selected':''}>${t}階 Lv.${GEAR_TIERS[i].min}–${GEAR_TIERS[i].max}</option>`).join('')}</select></label><label>指定裝備<select data-fusion-setting="base" ${disabled}>${all.map(([id,g])=>`<option value="${id}" ${c.base===id?'selected':''}>${g.petSlot?'夥伴':''}${g.name}</option>`).join('')}</select></label><label>目標屬性<select data-fusion-setting="stat" ${disabled}>${fusionStatsFor(c.base).map(id=>`<option value="${id}" ${c.stat===id?'selected':''}>${id==='any'?'任意詞條':AFFIX_NAMES[id]||id.toUpperCase()}</option>`).join('')}</select></label><label>詞條至少<input type="number" min="${targetInfo.min}" max="${targetInfo.max}" step="1" data-fusion-setting="minimum" value="${c.minimum}" ${disabled||c.stat==='any'?'disabled':''}></label><label>品質至少<select data-fusion-setting="rarity" ${disabled}><option value="any">不限品質</option>${RARITIES.map(r=>`<option value="${r.id}" ${c.rarity===r.id?'selected':''}>${r.name}</option>`).join('')}</select></label><label>本次最多融合<input type="number" min="1" max="100000" data-fusion-setting="limit" value="${c.limit}" ${disabled}></label></div><p class="fusion-odds"><b>目標單次機率 ${(targetInfo.chance*100).toFixed(4)}%</b> · ${Number.isFinite(targetInfo.expected)?`平均約 ${Math.ceil(targetInfo.expected)} 次`:'目前目標不可能產出'}<br>此屬性可產出 ${targetInfo.min}～${targetInfo.max}；含所選品質以上。${targetInfo.rows.map(r=>`${r.name} ${(r.drop*100).toFixed(1)}%`).join(' · ')}</p><p class="tiny">可選屬性依裝備類型調整，依實際詞條判斷，不含裝備基礎數值。未達標成品立即分解，回收碎晶供後續融合；達標成品保留且受到自動分解保護。重新進入遊戲後需手動啟動融合。</p><p>${ITEMS[material].name}：${held} 個 · 可融合 ${Math.floor(held/8)} 次</p><p class="fusion-status" role="status">${autoFusionRunning?'●':'○'} ${autoFusionStatus} · 已融合 ${autoFusionAttempts} 次</p><button data-fusion-toggle class="${autoFusionRunning?'danger':'goldbtn'}" ${!autoFusionRunning&&(held<8||!player.hp)?'disabled':''}>${autoFusionRunning?'暫停自動融合':'開始自動融合'}</button></div>`;}

function socket(cardId,slot){if(!Object.hasOwn(SLOTS,slot)||!bossCardEquipAllowed(CARDS[cardId],slot,player.job))return toast('這張卡片不能鑲入此部位');if(!takeCard(cardId))return;if(player.sockets[slot])addCard(player.sockets[slot]);player.sockets[slot]=cardId;message(`${CARDS[cardId].name} 插入${SLOTS[slot]}插槽。`,'good');player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));dirty=true;save();render();}
function unsocket(slot){const id=player.sockets[slot];if(!id)return;addCard(id);player.sockets[slot]=null;player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));message(`卸下 ${CARDS[id].name}。`);dirty=true;save();render();}
function autoUsePotions(){if(isControlled())return;if(!auto||!player.hp)return;const settings=player.autoPotions;const tests=[['playerHp','hp',player,stat('hp')],['playerSp','mp',player,stat('mp')],...activePetRoster(player).flatMap(pet=>[['petHp','hp',pet,petStats(pet).hp],['petSp','sp',pet,petStats(pet).sp]])];for(const [setting,field,target,max] of tests){if(!settings[setting]||!target||max<=0||target[field]>=max*((player.potionThresholds?.[setting]??45)/100))continue;if(target!==player&&target.hp<=0){if(field!=='hp')continue;if(!target.reviveAt)target.reviveAt=gameNow()+PET_REVIVE_MS;if(gameNow()<target.reviveAt)continue;}const choice=preferredPotion(player.bag,ITEMS,field,player.potionPriority?.[setting]||'high',max);if(!choice)continue;const it=ITEMS[choice.id],amount=potionRestore(it,field==='hp'?'hp':'mp',target.level,max,target!==player);if(amount<=0)continue;target[field]=Math.min(max,target[field]+amount);consumeStack(player.bag,choice.id);if(offlineMetrics)offlineMetrics.potions[choice.id]=(offlineMetrics.potions[choice.id]||0)+1;message(`🧪 自動補給 ${target===player?'玩家':target.nickname}：${it.name}，${field.toUpperCase()} +${amount}。`,'good');dirty=true;}}
function autoBuyPotions(){if(!auto||!player?.autoBuyPotions)return;for(const type of ['hp','sp']){const config=player.autoBuyPotions[type];if(!config?.enabled)continue;const held=player.bag.find(e=>e.id===config.id)?.qty||0;if(held>=config.min)continue;const price=ITEMS[config.id]?.cost||0;if(!price)continue;const count=Math.min(config.target-held,Math.floor(player.gold/price));if(count<=0)continue;player.gold-=count*price;if(offlineMetrics){offlineMetrics.spent+=count*price;offlineMetrics.purchased[config.id]=(offlineMetrics.purchased[config.id]||0)+count;}addStack(player.bag,config.id,count);message(`🛒 掛機自動購入 ${ITEMS[config.id].name} ×${count}，花費 ${count*price} 金（剩餘 ${player.gold} 金）。`,'good','system');dirty=true;}}
function buy(id,quantity=1){if(!isTown(player.location))return toast('請回村莊商店購買');const it=ITEMS[id];if(!isShopItem(id)||!it)return;const quote=purchaseQuote(it,quantity,player.gold);if(quote.error)return toast(quote.error);const previous=structuredClone(player);player.gold-=quote.total;addStack(player.bag,id,quote.qty);dirty=true;if(save()===false){player=previous;return;}message(`購買 ${it.name} ×${quote.qty}，花費 ${quote.total} 金。`);render();}
function releaseSelectedPets(){
 const pets=player.pets.filter(p=>selectedReleasePets.has(p.id)&&!p.locked&&p.id!==player.activePetId&&p.id!==player.secondaryPetId);if(!pets.length)return toast('請先勾選要放生的夥伴（出戰夥伴受保護）');
 const gear=pets.flatMap(p=>Object.values(p.gear||{}).filter(Boolean));if(player.bag.length+gear.length>2000)return toast('背包空間不足，請先整理背包以收回夥伴裝備');
 if(!confirm(`確定一次放生以下 ${pets.length} 隻夥伴？\n${pets.map(p=>`・${p.nickname}／${petForm(p)}／${petRarity(p).name}／Lv.${p.level}`).join('\n')}\n放生後無法復原。穿戴的 ${gear.length} 件裝備會退回背包。`))return;
 const previous=structuredClone(player),ids=new Set(pets.map(p=>p.id));for(const g of gear)g.swapProtected=true;player.bag.push(...gear);player.pets=player.pets.filter(p=>!ids.has(p.id));dirty=true;if(save()===false){player=previous;return;}selectedReleasePets.clear();message(`已批次放生 ${pets.length} 隻夥伴，退回 ${gear.length} 件裝備。`,'','system');renderSide();
}
function setPet(id){if(player.towerRun)return toast('天穹終境中無法更換夥伴');if(player.trialRun)return toast('試煉中無法更換夥伴');const pet=player.pets.find(p=>p.id===id);if(!pet)return;timers.resonance=0;if(enemy?.hp){endReport('更換夥伴');player.shield=Math.max(0,(player.shield||0)-petShield);petShield=0;}clearPetEffects();if(player.activePetId===id){petGearTargetId=null;player.activePetId=null;player.secondaryPetId=null;}else{player.activePetId=id;petGearTargetId=id;if(player.secondaryPetId===id)player.secondaryPetId=null;petSection='active';tab='pets';timers.pet=gameNow();}normalizeDualPetState(player);if(enemy?.hp)startReport();message(player.activePetId?`${pet.nickname} 已出戰。`:'夥伴已收回。','good');dirty=true;save();render();}
function releasePet(id){const pet=player?.pets.find(p=>p.id===id);if(!pet)return;if(id===player.secondaryPetId)return toast('第二出戰夥伴請先卸下再放生');if(pet.locked)return toast('請先解除夥伴鎖定');const gear=Object.values(pet.gear||{}).filter(Boolean);if(!confirm(`確定放生「${pet.nickname}」（${petRarity(pet).name}／${petForm(pet)}／Lv.${pet.level}）？\n放生後無法復原。${gear.length?`穿戴的 ${gear.length} 件裝備會退回背包。`:'目前沒有穿戴裝備。'}`))return;
 if(player.activePetId===id){if(report)endReport('放生出戰夥伴');player.shield=Math.max(0,(player.shield||0)-petShield);petShield=0;player.activePetId=null;clearPetEffects();timers.resonance=0;}
 for(const g of gear)g.swapProtected=true;player.bag.push(...gear);player.pets=player.pets.filter(p=>p.id!==id);message(`已放生 ${pet.nickname}。${gear.length?`裝備 ${gear.length} 件已退回背包。`:''}`,'','system');dirty=true;save();if(enemy?.hp&&!report)startReport();render();}
function movePetSkill(id,skill,delta){const pet=player.pets.find(p=>p.id===id),list=pet?.equippedSkills;if(!list)return;const from=list.indexOf(skill),to=from+delta;if(from<0||to<0||to>=list.length)return;[list[from],list[to]]=[list[to],list[from]];dirty=true;save();render();}
function togglePetSkill(id,skillId){const pet=player.pets.find(p=>p.id===id);if(!pet)return;const role=companionRole(pet),skill=petSkillById(role,skillId);if(!skill||!(fusionSkills(pet)||petSkillsFor(role,pet.rarity)).some(s=>s.id===skillId)||pet.level<skill.unlock)return;pet.equippedSkills=pet.equippedSkills||defaultPetSkills(role,pet.rarity);if(pet.equippedSkills.includes(skillId))pet.equippedSkills=pet.equippedSkills.filter(x=>x!==skillId);else{if(pet.equippedSkills.length>=petSkillLimit(pet))return toast(`此夥伴最多裝備 ${petSkillLimit(pet)} 招，請先卸下一招`);pet.equippedSkills.push(skillId);}if(id===player.activePetId)clearPetEffects();dirty=true;save();render();}
function upgradeJobSkill(id){const skill=jobSkillById(player.job,id);if(!skill)return;const rank=player.jobSkills[id]||0,pool=skill.thirdOnly?'thirdJobPoints':skill.rebornOnly?'rebornJobPoints':SECOND_JOBS[player.job]&&skill.branch==='first'?'firstJobPoints':'jobPoints';if(!skillUnlocked(player,skill)||rank>=skill.maxRank||!player[pool])return;player.jobSkills[id]=rank+1;player[pool]--;if((skill.rebornOnly||skill.thirdOnly)&&skill.kind!=='passive'&&rank===0){const old=skill.thirdOnly?'rebirthMain_'+player.job:REBIRTH_MAIN_REPLACES[player.job],order=player.autoSkills.order.filter(x=>x!==id),index=order.indexOf(old);if(index>=0)order.splice(index,1,id);player.autoSkills.order=order;}syncRebirthSkills();dirty=true;save();render();renderSide(true);}
function equipJobSkill(id){const skill=jobSkillById(player.job,id);if(!skill||skill.kind==='passive'||!player.jobSkills[id]||supersededSkill(player,skill))return;player.equippedJobSkill=id;dirty=true;save();render();}

function meter(value,maxValue,color=''){return `<div class="bar ${color}"><i style="width:${clamp(value/Math.max(1,maxValue)*100,0,100)}%"></i></div>`;}
function petSprite(pet,size='pet',stage=evolutionStage(pet),rarity=pet.rarity){const src=petArt(pet,stage,rarity);return src?`<img class="art-sprite art-${size} companion-art grade-${rarity}" src="${src}" alt="${escapeHtml(petForm(pet,stage,rarity))} · ${PET_RARITIES.find(r=>r.id===rarity)?.name||'普通'}" loading="lazy">`:spriteHtml(pet.species,size);}
function spriteHtml(id,size='medium',reborn=player?.reborn,third=false,outfit=null,cosmetic=null){const homeArt=Object.values(HOMECOMING_OPPONENTS).find(m=>m.id===id);if(homeArt)return `<img class="art-sprite art-${size} trial-art" src="${homeArt.artPath}" alt="${escapeHtml(homeArt.name)}">`;if(third&&cosmetic?.startsWith(id+'-')&&readCosmeticCollection(localStorage).outfits.includes(cosmetic)){const variant=Number(cosmetic.split('-')[1]),name=COSMETIC_JOBS[id]?.[variant];if(name)return `<img class="art-sprite art-${size} cosmetic-equipped" src="${cosmeticOutfitArt(id,variant)}" alt="${escapeHtml(name)} 金幣外觀">`;}if(outfit&&['S','SS','SSS'].includes(outfit)&&SECOND_JOBS[id]&&rankOutfitArt(id,outfit))return `<img class="art-sprite art-${size} rank-outfit" src="${rankOutfitArt(id,outfit)}" alt="${THIRD_JOBS[id]?.name||SECOND_JOBS[id].name} ${outfit}階外觀">`;const spiritPortrait=id==='spiritist'?(reborn?'spiritist-reborn-first':'spiritist-first'):(id==='pactWarrior'||id==='spiritCommander')?(third?`${id}-third`:reborn?`${id}-reborn-second`:`${id}-second`):null;if(spiritPortrait)return `<img class="art-sprite art-${size} spirit-job-portrait" src="assets/spirit-jobs/${spiritPortrait}.webp" alt="${escapeHtml(CLASSES[id]?.name||THIRD_JOBS[id]?.name||SECOND_JOBS[id]?.name||'御靈使')} 職業立繪">`;if(outfit&&['S','SS','SSS'].includes(outfit)&&SECOND_JOBS[id])return `<img class="art-sprite art-${size} rank-outfit" src="${rankOutfitArt(id,outfit)}" alt="${THIRD_JOBS[id].name} ${outfit}階外觀">`;const towerParts=/^tower-(\d+)-(\d+)$/.exec(id);const towerVariant=/^tower-(?:(\d+)-wave-\d+|chaser-(\d+)|escort-(\d+)-\d+)$/.exec(id);const towerSummon=/^tower-summon-(\d+)-(\d+)-(\d+)$/.exec(id);const towerFloorArt=Number(towerParts?.[1]||towerVariant?.[1]||towerVariant?.[2]||towerVariant?.[3]||0);const towerArt=towerFloorArt?(towerParts&&towerFloorArt%10===0&&towerFloorArt<=30?`assets/tower/boss-${towerFloorArt}.webp`:`assets/tower/monster-${towerFloorArt<=10?'dawn':towerFloorArt<=20?'flame':'frost'}.webp`):towerSummon?`assets/tower/monster-${Number(towerSummon[1])<=10?'dawn':Number(towerSummon[1])<=20?'flame':'frost'}.webp`:null;const trialArt=towerArt||(/^boss-(151|161|171|181|191)-[1-5]$/.test(id)?`assets/sky-trials/${id}.webp`:[...DAWN_MONSTERS,DAWN_BOSS].find(m=>m.id===id)?.artPath);if(trialArt)return `<img class="art-sprite art-${size} trial-art" src="${trialArt}" alt="${SPECIES[id]?.name||id}">`;if(third&&THIRD_JOBS[id]){const index=Object.keys(SECOND_JOBS).indexOf(id);return `<span class="art-sprite art-${size}" role="img" aria-label="${THIRD_JOBS[id].name} 三轉美術" style="background-image:url('assets/third-jobs-v6.webp');background-size:500% 200%;background-position:${index%5/4*100}% ${Math.floor(index/5)*100}%"></span>`;}if(reborn&&(CLASSES[id]||SECOND_JOBS[id])){const first=['swordsman','acolyte','mage','thief','archer'],index=SECOND_JOBS[id]?5+Object.keys(SECOND_JOBS).indexOf(id):first.indexOf(id);if(index>=0)return `<span class="art-sprite art-${size} reborn-art" role="img" aria-label="轉生${CLASSES[id]?.name||SECOND_JOBS[id].name} 美術" style="background-image:url('assets/reborn-classes-v40.webp');background-size:500% 300%;background-position:${index%5/4*100}% ${Math.floor(index/5)/2*100}%"></span>`;}if(SECOND_JOBS[id]){const i=Object.keys(SECOND_JOBS).indexOf(id);return `<span class="art-sprite art-${size}" role="img" aria-label="${SECOND_JOBS[id].name} 美術" style="background-image:url('assets/second-jobs-v24.png');background-size:500% 200%;background-position:${i%5/4*100}% ${Math.floor(i/5)*100}%"></span>`;}if(id.startsWith('boss_')){const boss=Object.values(MAP_BOSSES).find(b=>b.id===id);if(boss?.artFile)return `<span class="art-sprite art-${size}" role="img" aria-label="${boss.name} 獨立首領美術" style="background-image:url('assets/${boss.artFile}.webp');background-size:500% 100%;background-position:${(boss.artIndex-(boss.artFile==='bosses-frontier'?15:10))/4*100}% 0"></span>`;return boss?`<span class="art-sprite art-${size}" role="img" aria-label="${boss.name} 獨立首領美術" style="background-image:url('assets/independent-bosses-v24.png');background-size:300% 400%;background-position:${boss.artIndex%3/2*100}% ${Math.floor(boss.artIndex/3)/3*100}%"></span>`:'';}if(PET_FAMILIES[id])return petSprite({species:id,evolution:0,rarity:'common'},size);if(id==='archer')return `<span class="art-sprite art-${size}" role="img" aria-label="弓箭手美術" style="background-image:url('assets/archer.png');background-size:contain;background-repeat:no-repeat;background-position:center"></span>`;let file=null,col=0,row=0,cols=4,format='png';
 const classes=['swordsman','acolyte','mage','thief'],pets=['fang','wisp','shell','sprout'];
 if(classes.includes(id)){file='characters-pets';col=classes.indexOf(id);}
 else if(pets.includes(id)){file='characters-pets';col=pets.indexOf(id);row=1;}
 else if(/^world_\d+$/.test(id)){const level=Number(id.slice(6));const art=worldMonsterArt(level);if(!art)return '';file=art.file;format=art.format;cols=art.cols;col=art.index%cols;row=Math.floor(art.index/cols);}
 if(!file)return '';
 const x=col/(cols-1)*100,y=row*100;
 return `<span class="art-sprite art-${size}" role="img" aria-label="${escapeHtml(id)} 美術" style="background-image:url('assets/${file}.${format}');background-size:${cols*100}% 200%;background-position:${x}% ${y}%"></span>`;
}
function mainSkillState(skill){if(isControlled())return `受控：${CONTROL_NAMES[controlEffect.type]}`;if(!player.jobSkills[skill.id])return '尚未學習';if(!player.hp)return '人物倒下';if(supersededSkill(player,skill))return '已由高階主攻取代';if(!canCastJobSkill(skill))return '武器不符';if(player.mp<skill.mp)return 'SP不足';if(casting)return '詠唱中';if(!enemy?.hp)return '等待遭遇敵人';const now=gameNow(),cooldown=skillCooldown(skill)-(now-Math.max(jobSkillTimers[skill.id]||0,skill.kind==='shield'?jobSkillTimers.personalShield||0:0)),action=Math.max((timers.actionDelay||0)-(now-timers.skill),skill.attackCycle?skillActionDelay(skill,skillContext(skill))-(now-timers.attack):0);if(cooldown>0)return `冷卻 ${(cooldown/1000).toFixed(1)}秒`;if(action>0)return `動作間隔 ${(action/1000).toFixed(2)}秒`;return '可施放';}
function refreshCollectionHonorTitles(character){if(!character)return;const available=new Set(Array.isArray(character.extraHonorTitles)?character.extraHonorTitles:[]);if(goldCollectionTier(character)>=1)available.add('黃金冒險者');try{const title=collectionTitle(CARDS,readCardCollection(localStorage,CARDS));if(title)available.add(title);}catch{}character.extraHonorTitles=[...available].filter(name=>typeof name==='string'&&name.length<=32);}
function render(){if(offlineSimulation)return;refreshCollectionHonorTitles(player);discoverHomecomingLetters();if(player&&announceSpiritSanctuary(player)){dirty=true;save();toast('✦ 新任務：契靈之地已開放！前往曙界新陸捕捉天生忠誠100的Lv.100神話夥伴。');message('返鄉契約的羈絆喚醒了契靈之地。這裡的夥伴非常信任你，天生忠誠100。','rare','system');}const telemetry=$('battleTelemetry');if(telemetry&&player)patchHtml(telemetry,telemetryHtml());const full=$('petFullNotice');if(full&&player){full.hidden=!(isCaptureSanctuary(player.location)&&player.pets.length>=30&&player.autoCaptureRoles?.length);full.querySelector('button').onclick=()=>{petSection='manage';openPanel('pets');};}const redo=$('returnLastMap');if(redo&&player){redo.disabled=!player.lastMap||player.lastMap===player.location;redo.textContent=player.lastMap?`再出發：${MAPS[player.lastMap]?.name||player.lastMap}`:'再出發';}if(!player||!enemy)return;checkRankUnlocks();checkQuestReady();const tracker=$('questTracker');if(tracker){const html=renderQuestTracker();tracker.hidden=!html;patchHtml(tracker,html?'<h3>任務追蹤</h3><div class="quest-tracker-list">'+html+'</div>':'');for(const b of tracker.querySelectorAll('[data-quest-return]'))b.onclick=()=>{if(player.location==='town')openPanel('quests');else travel('town');};}const questTop=$('questTrackerTop'),questSlot=$('partyQuestSlot');if(tracker&&questTop&&questSlot){const target=questTop;if(tracker.parentElement!==target)target.appendChild(tracker);const hud=$('characterPanel')?.querySelector('.party-hud'),owner=$('characterPanel')?.querySelector('.party-character-column');if(isSpiritJob(player.job)&&hud&&questSlot.parentElement!==hud)hud.appendChild(questSlot);else if(!isSpiritJob(player.job)&&owner&&questSlot.parentElement!==owner)owner.appendChild(questSlot);}player.shield=Math.min(player.shield||0,Math.round(stat('hp')*.25));petShield=Math.min(petShield,player.shield);chooseAttackTarget();const c=CLASSES[player.job],a=effectiveAttributes(),pet=activePet(),ownerStyle=ownerAttackIdentity(player.job,player.thirdJob,stat('atk'),stat('matk'),pet?spiritSinglePetProfile(player,pet)?.kind:null);document.body.classList.toggle('spirit-dual-ui',isSpiritJob(player.job));const progressPanel=$('spiritProgress');if(progressPanel){const showSpiritProgress=isSpiritJob(player.job)&&!player.thirdJob;progressPanel.hidden=!showSpiritProgress;progressPanel.style.display=showSpiritProgress?'':'none';const dualProgressHtml=showSpiritProgress?renderDualGrowthCard():'';if(progressPanel._dualProgressMarkup!==dualProgressHtml){const expanded=!!progressPanel.querySelector('.dual-growth-next')?.open;progressPanel.innerHTML=dualProgressHtml;progressPanel._dualProgressMarkup=dualProgressHtml;if(expanded){const details=progressPanel.querySelector('.dual-growth-next');if(details)details.open=true;}}}$('character').innerHTML=`<div class="hero"><div class="eyebrow">REGISTERED OPERATIVE</div><button class="character-name" id="renameCharacterBtn" title="點擊更改角色名稱">${escapeHtml(player.name)} <small>✎</small></button><span class="pill attack-identity attack-${ownerStyle.type}">${player.thirdJob?THIRD_JOBS[player.job].name:c.name} · ${compactAttackLabel(ownerStyle,playerRange(player.job))}</span></div><div class="meterline"><span>HP</span><span>${player.hp} / ${stat('hp')}</span></div>${meter(player.hp,stat('hp'),'red')}<div class="meterline shield-meterline"><span>◇ 護盾</span><span>${Math.max(0,player.shield||0).toLocaleString()}</span></div>${meter(player.shield||0,Math.round(stat('hp')*.25),'shield')}${isControlled()?`<div class="control-alert">${CONTROL_NAMES[controlEffect.type]} · 無法行動 ${(Math.max(0,controlEffect.until-gameNow())/1000).toFixed(1)}秒</div>`:''}${casting?`<div class="shield-status">✦ 詠唱中 ${(Math.max(0,casting.until-gameNow())/1000).toFixed(1)} 秒</div>`:''}<div class="meterline"><span>SP</span><span>${player.mp} / ${stat('mp')}</span></div>${meter(player.mp,stat('mp'),'blue')}<div class="level-card base-level"><div class="level-line"><div><span>Base Level</span><strong>${player.level}</strong></div><small>EXP<br>${player.level===characterLevelCap(player)?'MAX':`${player.xp} / ${threshold()}`}</small></div>${meter(player.level===characterLevelCap(player)?1:player.xp,player.level===characterLevelCap(player)?1:threshold(),'gold')}</div><div class="level-card job-level"><div class="level-line"><div><span>Job Level</span><strong>${player.jobLevel}</strong></div><small>EXP<br>${player.jobLevel===jobLevelCap(player)?'MAX':`${player.jobXp} / ${jobThreshold()}`}</small></div>${meter(player.jobLevel===jobLevelCap(player)?1:player.jobXp,player.jobLevel===jobLevelCap(player)?1:jobThreshold(),'blue')}</div><div class="tiny">${player.thirdJob?`已三轉 · 角色上限${characterLevelCap(player)}`:player.reborn?'已轉生 · 角色上限150':SECOND_JOBS[player.job]?'已完成二轉 · Base99可回村莊轉生':'二轉 Base50／Job40'}</div>`;$('companion').innerHTML=isSpiritJob(player.job)?renderDualPetHud():pet?`<div class="divider"></div><div class="hero"><div class="eyebrow">ACTIVE COMPANION</div><strong>${petIcon(pet)} ${escapeHtml(pet.nickname)}</strong><button type="button" class="pet-nickname rename-pet" id="renamePetBtn" title="點擊更改夥伴暱稱">✎ 更改暱稱</button><span class="pet-role-row"><span class="pill">Lv.${pet.level} · ${(fusedPair(pet)?.name||SPECIES[pet.species].roleName)}</span>${petAttackBadge(pet,petStats(pet))}</span><span class="pet-form">${escapeHtml(petForm(pet)||SPECIES[pet.species].name)} · ${petRarity(pet).name}</span></div><div class="meterline"><span>夥伴 HP</span><span>${pet.hp} / ${petStats(pet).hp}</span></div>${meter(pet.hp,petStats(pet).hp,'red')}<div class="meterline shield-meterline"><span>◇ 夥伴護盾</span><span>${Math.max(0,petEffects.shield||0).toLocaleString()}</span></div>${meter(petEffects.shield||0,Math.round(petStats(pet).hp*.25),'shield')}<div class="shield-status">${pet.hp<=0?` · 復活等待 ${Math.max(0,Math.ceil(((pet.reviveAt||gameNow()+PET_REVIVE_MS)-gameNow())/1000))} 秒`:''}</div><div class="meterline"><span>夥伴 SP</span><span>${pet.sp} / ${petStats(pet).sp}</span></div>${meter(pet.sp,petStats(pet).sp,'blue')}${nextPetEvolution(pet)&&pet.level>=nextPetEvolution(pet).level?'<div class="evolution-ready">✦ 夥伴已達進化等級，可回村莊進行進化。</div>':''}`:'<p class="tiny">尚未有出戰夥伴，可在夥伴之地捕捉。</p>';
const chosenHonor=normalizeTowerHonorSelection(player),chosenFrame=towerHonorFrameClass(player),nameButton=$('renameCharacterBtn');if(nameButton&&chosenFrame)nameButton.classList.add('tower-honor-name',chosenFrame);if(chosenHonor.title)$('character').querySelector('.hero')?.insertAdjacentHTML('beforeend',`<span class="tower-honor-title">✦ ${escapeHtml(chosenHonor.title)}</span>`);if(normalizeTowerCollection(player.towerCollection).selectedShowcase)$('character').querySelector('.hero')?.insertAdjacentHTML('beforeend',`<div class="tower-showcase-display" aria-label="三域首領收藏展示框"><span>✧ 三域首領典藏</span><div><img src="assets/tower/boss-10.webp" alt="破曉首領"><img src="assets/tower/boss-20.webp" alt="熾焰首領"><img src="assets/tower/boss-30.webp" alt="永凍首領"></div></div>`);$('character').dataset.goldTier=goldCollectionTier(player);$('companion').dataset.goldTier=goldCollectionTier(player);$('area').className=`area ${player.location}`;const map=player.trialRun?{...MAPS[player.location],name:TRIAL_ROUTES.find(r=>r.map===player.trialRun.map).name+'試煉',eyebrow:'SKY TRIAL / FIVE GUARDIANS'}:MAPS[player.location];const homeArea=homecomingMap(player.location);$('area').style.backgroundImage=homeArea?`linear-gradient(100deg,#0b1620ed,#0b162088),url("${HOMECOMING_SCENE_ART[homeArea.route.id].src}")`:'';patchTownArea($('area'),`<div class="eyebrow">${map.eyebrow}</div><h2>${map.name}</h2><div class="chips"><span>${player.trialRun?'五連戰 · 僅掉落階段強化結晶':homecomingMap(player.location)?(isTown(player.location)?'返鄉城鎮 · 安全整備':'返鄉事件 · 不掉落卡片 · 無法捕捉'):mapRules(player.location).summary}</span></div>${player.location==='skycity'?'<div class="town-npc trial-gatekeeper"><div class="trial-gatekeeper-profile"><img src="assets/towns/npc-trial-officiant.webp" alt="星穹試煉官・艾莉亞立繪" loading="lazy"><div><b>⚔ 星穹試煉官・艾莉亞</b><p>主持五位首領連續挑戰，協助確認入場券、通關紀錄與連戰資格。此處與曙光聖港的天穹終境分開。</p></div></div><button data-open="trials" class="goldbtn">與艾莉亞對話 · 挑戰五連戰</button></div><button data-open="enhancement" class="town-evolution">⚒ 星鑄師・赫瑟</button><button id="townThirdBtn" class="goldbtn town-evolution">✦ 覺醒導師 · 三轉</button><button id="townEvolutionBtn" class="goldbtn town-evolution">✦ 界限進化與融合進化</button><button data-open="shop" class="town-evolution">🛒 蒼穹補給商店</button>':player.location==='dawncity'?'<div class="town-npc tower-gatekeeper"><b>✧ 終境守望者・賽菈</b><p>守護天穹終境之門。三轉 Base 210 且解鎖曙界新陸後，可逐層挑戰；通關會返回聖港整備。</p><button data-open="tower" class="goldbtn">與賽菈對話 · 挑戰天穹終境</button></div><div class="town-npc tower-gatekeeper"><b>⚔ 極限試煉官・亞爾德</b><p>四大無限階段首領 · 物理防禦、魔法防禦、輸出極限。每階首次突破獲得極限徽記。</p><button data-open="extreme" class="goldbtn">與亞爾德對話 · 四域極限試煉</button></div><button data-open="sigilcraft" class="town-evolution">✧ 契印師・曦紋</button><button data-open="enhancement" class="town-evolution">⚒ 星鑄師・赫瑟</button><button data-open="shop" class="town-evolution">🛒 曙光補給商店</button><button id="townEvolutionBtn" class="town-evolution">✦ 夥伴進化</button>':homecomingMap(player.location)?.kind==='town'?renderHomecomingTown(player):isTown(player.location)?'<button data-open="enhancement" class="town-evolution">⚒ 星鑄師・赫瑟</button><button id="townTransferBtn" class="goldbtn town-evolution">✦ 公會轉職官 · 二轉</button><div class="town-npc"><b>🧭 征途引導官・艾琳</b><p>Lv.51起的征途任務與轉生準備，接取及回報都在村莊辦理。</p><button data-open="quests" class="goldbtn">與艾琳對話 · 接取／回報任務</button></div><button id="townEvolutionBtn" class="goldbtn town-evolution">✦ 村莊夥伴進化</button><button data-open="shop" class="town-evolution">🛒 村莊商店</button>':''}${isTown(player.location)?`<button data-open="warehouse" class="town-evolution">▣ ${WAREHOUSE_KEEPER} · 四格共用倉庫</button>`:''}${player.dawnUnlocked&&isTown(player.location)?'<div class="dawn-ready">🌅 曙界新陸已開放 · 請於大陸選單選擇「曙界新陸」，前往曙光聖港。</div>':''}${map.capture?'<div class="role-list compact-roles"><div>🐺 <b>攻擊型</b><small>高物理輸出</small></div><div>✨ <b>魔法型</b><small>魔法穿透</small></div><div>🐢 <b>防禦型</b><small>吸收傷害</small></div><div>🌱 <b>輔助型</b><small>回復 HP/MP</small></div></div>':''}`);if(isTown(player.location)&&!$('area').querySelector('[data-open="reforge"]'))$('area').insertAdjacentHTML('beforeend','<button data-open="reforge" class="town-evolution">⚒ 靈紋重鑄師</button><button data-open="collection" class="town-evolution">♛ 黃金收藏館・鑄金典藏師</button><button data-open="cardrecycle" class="town-evolution">✧ 命運卡片鍊成師</button><button data-open="cardcollection" class="town-evolution">📖 星頁典藏師・露娜</button>');if([...$('mapSelect').options].some(o=>o.value===player.location))$('mapSelect').value=player.location;const thirdButton=$('townThirdBtn');if(thirdButton)thirdButton.onclick=()=>{tab='guild';render();};const transferButton=$('townTransferBtn');if(transferButton)transferButton.onclick=()=>{tab='guild';render();};for(const b of $('area').querySelectorAll('[data-open]'))b.onclick=()=>openPanel(b.dataset.open);const altarButton=$('townEvolutionBtn');if(altarButton)altarButton.onclick=()=>{tab='evolution';render();};
const species=SPECIES[enemy.id];patchHtml($('encounter'),`${player.trialRun?renderTrialProgress():''}<div class="encounter-heading"><span class="tiny">${player.trialRun?'首領試煉 · 單體五連戰':isTown(player.location)?'安全區':`持續隨機遭遇 · 一般 ${enemies.filter(e=>!e.boss).length}/${encounterLimit(player.location)}${isCaptureSanctuary(player.location)?'':` · 首領 ${enemies.filter(e=>e.boss).length}/1`}`}</span>${!isTown(player.location)&&!player.trialRun?`<label>鎖定目標<select id="targetPriority" aria-label="鎖定目標">${Object.entries(TARGET_PRIORITIES).map(([id,name])=>`<option value="${id}" ${player.targetPriority===id?'selected':''}>${name}</option>`).join('')}</select></label>`:''}</div><div class="enemy-lineup">${renderEncounterSlots()}</div><div class="tiny">${player.trialRun?'逐隻挑戰五位首領 · 控制期間人物無法行動 · 死亡立即離場':isTown(player.location)?(player.location==='dawncity'?'曙光聖港提供契印製作、星鑄強化、夥伴進化與補給商店。':player.location==='skycity'?'蒼穹樞城提供首領試煉、星鑄強化、三轉與融合進化。':'可在村莊進化夥伴、接取任務、整理裝備與購買補給。'):map.capture?'滿血也能直接丟球 · 基礎成功率55%，HP低於50%可提高至最高85%':'各格獨立隨機遭遇，擊殺後各自重新探索，沒有固定進場順序。'}</div>`);for(const b of $('encounter').querySelectorAll('[data-target]'))b.onclick=()=>targetEnemy(b.dataset.target);const priority=$('targetPriority');if(priority)priority.onchange=()=>{player.targetPriority=priority.value;chooseAttackTarget();save();render();};

$('petStatus').innerHTML='';$('petStatus').style.display='none';
$('resonancePanel').innerHTML=['pactWarrior','spiritCommander'].includes(player.job)?renderSpiritResonanceStatus(pet):`<div class="rule">${pet?`<strong>✦ 核心共鳴：${companionResonance(player,pet)?.name||'共鳴'}</strong> · ${companionResonance(player,pet)?.description||'與主人協同作戰'} · 冷卻 ${((companionResonance(player,pet)?.cooldown||0)/1000).toFixed(1)} 秒`:'尚未有出戰夥伴，核心共鳴不會觸發'}</div><div class="tiny">人物護盾 ${player.shield||0} · 夥伴護盾 ${petEffects.shield||0} · 核心共鳴自動觸發，獨立冷卻</div>`;
$('skillBar').innerHTML=orderedAutoSkills(player.autoSkills,autoQueueSkills()).map(s=>`<button data-cast="${s.id}" ${mainSkillState(s)!=='可施放'?'disabled':''}>✦ ${s.name} Lv.${player.jobSkills[s.id]} · SP ${s.mp}<small class="skill-spec">${jobSkillSpec(s,player.jobSkills[s.id],player.job,skillContext(s)).text}</small>${!canCastJobSkill(s)?' · 武器不符':''}</button>`).join('');
for(const b of $('skillBar').querySelectorAll('[data-cast]'))b.onclick=()=>playerAttack(true,b.dataset.cast);
const equippedSkill=jobSkillById(player.job,player.equippedJobSkill)||JOB_SKILLS[player.job][0];bindTrialControls();$('attackBtn').disabled=!player.hp||!enemy.hp||isControlled();$('skillBtn').disabled=mainSkillState(equippedSkill)!=='可施放';$('skillBtn').textContent=`✦ ${equippedSkill.name} (-${equippedSkill.mp} SP)`;$('skillBtn').title=jobSkillSpec(equippedSkill,player.jobSkills[equippedSkill.id],player.job,skillContext(equippedSkill)).text;if($('selectedSkillInfo'))$('selectedSkillInfo').innerHTML=`<b>目前人物技能：${equippedSkill.name} Lv.${player.jobSkills[equippedSkill.id]||0} · SP ${equippedSkill.mp}</b><span>${jobSkillSpec(equippedSkill,player.jobSkills[equippedSkill.id],player.job,skillContext(equippedSkill)).text}</span><span>${mainSkillState(equippedSkill)}</span>`;$('captureBtn').hidden=!map.capture;$('fleeBossBtn').hidden=!player.trialRun&&!mapRules(player.location).bosses;$('fleeBossBtn').textContent=player.trialRun?'離開試煉':'逃離首領';$('captureBtn').disabled=!player.hp||!enemy.hp||!map.capture||enemy.boss;$('captureBtn').textContent=enemy.boss?'♛ 首領不可捕捉':map.capture?'◈ 丟球捕捉':'◈ 此地禁止捕捉';$('fleeBossBtn').disabled=!enemies.some(e=>e.boss&&e.hp>0);$('autoBtn').textContent=auto?'⏸ 暫停自動戰鬥':'▶ 開始自動戰鬥';$('autoBtn').setAttribute('aria-pressed',String(auto));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));renderSide();
$('character').querySelector('.hero')?.insertAdjacentHTML('afterend',`<div class="wallet-line">🪙 持有金幣 <b>${Number(player.gold).toLocaleString('zh-TW')}</b></div>`);
$('renameCharacterBtn').onclick=openCharacterRename;if(pet&&$('renamePetBtn'))$('renamePetBtn').onclick=()=>openPetRename(pet.id);for(const button of $('companion').querySelectorAll('[data-rename-active-pet]'))button.onclick=()=>openPetRename(button.dataset.renameActivePet);const heroes=document.querySelectorAll('#character .hero, #companion .hero');heroes[0]?.insertAdjacentHTML('afterbegin',spriteHtml(player.job,'hero',player.reborn,player.thirdJob,player.selectedOutfit,player.cosmeticOutfit));if(pet&&!isSpiritJob(player.job))heroes[1]?.insertAdjacentHTML('afterbegin',petSprite(pet,'hero'));
applyCosmeticHero();
if(!player.hp){$('character').insertAdjacentHTML('beforeend','<button class="wide primary" id="showRevive">✚ 選擇復活方式</button>');$('showRevive').onclick=showReviveDialog;}
const tactic=manualTactic(player.job),remaining=tacticRemaining(player,gameNow()),cost=tactic?tacticSPCost(stat('mp'),tactic):0;
$('tacticBtn').textContent=tactic?`◇ ${tactic.name}${remaining?`（${remaining}秒）`:''}`:'◇ 職業戰術';
$('tacticBtn').title=tactic?`${tactic.description} · 冷卻60秒 · SP ${cost}`:'尚未取得戰術';
$('tacticBtn').disabled=!player.hp||!tactic||remaining>0||player.mp<cost||(isControlled()&&tactic.kind!=='rescue');$('ultimateBtn').style.display='none';
}
function reportMetrics(r){const contribution=combatContribution(r.metrics);const {total,ratios}=damageSplitPcb(r);const dual=r.dualPetDamage;const dualLine=dual?`<div class="report-notice">雙靈傷害：${escapeHtml(dual.firstName)} ${Math.round(dual.first||0).toLocaleString('zh-TW')}／${escapeHtml(dual.secondName)} ${Math.round(dual.second||0).toLocaleString('zh-TW')}／雙融合共鳴 ${Math.round(dual.dualResonance||0).toLocaleString('zh-TW')}（其餘原有共鳴仍計於共鳴欄）。</div>`:'';return `${dualLine}${r.scoringVersion===61?'':'<div class="report-notice">舊版戰報：採用舊版防禦或增益歸屬方式，保留原始紀錄，不納入新版總貢獻比較。</div>'}<div class="report-notice">${r.scoringVersion===61&&contribution.total?`戰鬥貢獻參考值：人物 ${(contribution.ownerShare*100).toFixed(1)}%／夥伴 ${((1-contribution.ownerShare)*100).toFixed(1)}%<br>`:''}${total?`傷害歸屬 P／C／B：人物直接 ${(ratios.P*100).toFixed(1)}%／夥伴直接 ${(ratios.C*100).toFixed(1)}%／共鳴增益 ${(ratios.B*100).toFixed(1)}%（設計目標50／40／10）`:'尚無傷害資料'}；參考評分以傷害、有效治療、實際吸收護盾、實際承傷與防禦減傷的 HP 等值計算。重複的受傷紀錄與攔截估算不再加分，防禦減傷以受擊前HP＋護盾為有效上限，SP 及打斷次數另列；比例會隨敵人與隊伍需求變動，不代表固定戰力。</div>`+`<div class="report-grid">${FIELDS.map(key=>`<div class="report-metric"><small>${NAMES[key]}</small><strong>${Math.round(r.metrics[key]||0).toLocaleString('zh-TW')}</strong></div>`).join('')}</div>`;}
function reportName(r){return `${SPECIES[r.monster]?.name||'未知敵人'} · ${r.petName||'未出戰'}`;}
function renderReports(){const history=player.battleHistory||[];let html='<div class="item"><b>有效戰鬥貢獻</b><p>總評分包含實際傷害、未溢補治療、實際吸收護盾、實際承傷與防禦減傷。攻擊、魔法夥伴偏重輸出；防禦、輔助夥伴偏重保護與續航。每項均以 HP 等值計分並依來源歸屬；SP另列，不重複計算估算項目。</p></div>';if(report){html+=`<div class="report-card"><div class="report-title"><b>● 本場進行中</b><span class="pill">${escapeHtml(reportName(report))}</span></div>${reportMetrics(report)}</div>`;}else html+='<p class="muted">目前沒有進行中的戰鬥。</p>';html+='<div class="report-notice">BUFF 額外傷害包含夥伴自主祝福與元素印記提供的實際額外傷害；控制、打斷仍待未來技能實裝。防禦夥伴攔截值依敵方攻擊與玩家防禦估算，非實際承傷；護盾僅記錄已吸收部分。戰報保留最近 12 場並隨角色存檔。</div><h2 style="margin-top:16px">最近戰報</h2>';html+=history.length?`<div class="report-history">${history.slice().reverse().map(r=>`<details><summary><b>${escapeHtml(r.outcome)}</b> · ${escapeHtml(reportName(r))} · ${Math.max(0,Math.round(((r.endedAt||r.startedAt)-r.startedAt)/1000))} 秒</summary>${reportMetrics(r)}</details>`).join('')}</div>`:'<div class="empty">還沒有已結束的戰鬥。打倒一隻怪物後即可查看報告。</div>';return html;}
function renderLegacyFusionReselect(){
 const pet=activePet(),count=pet?.fusionReselectRemaining||0;
 if(!pet?.fusion||count<=0)return '';
 return `<section class="item"><h3>舊版200等融合夥伴補償重選</h3><p>剩餘 ${count}／10 次；保留等級、忠誠度及裝備，每次更改會改用新融合型態的預設技能。</p><div class="panel-shortcuts">${RESELECT_ORDERED_TYPES.map(key=>`<button data-reselect-fusion="${key}" ${!isTown(player.location)||key===pet.fusion.main+'-'+pet.fusion.sub?'disabled':''}>${key.replace('attack','攻擊').replace('magic','魔法').replace('defense','防禦').replace('support','輔助')}</button>`).join('')}</div></section>`;
}
function doLegacyFusionReselect(key){
 const pet=activePet();if(!pet)return;
 const snapshot=structuredClone(player),result=reselectionPet(player,pet,key,defaultFusionSkills);
 if(result.error)return toast(result.error);
 clearStatSnapshots();if(!save()){player=snapshot;clearStatSnapshots();return;}
 toast(`已重選融合類型：${key}，剩餘${result.remaining}次`);render();renderSide(true);
}
function renderDawnSigil(crafting=false){
 const current=sigilLevel(player),next=current+1,cost=sigilCost(next),bonus=current*2;
 const status=`<section class="item"><h3>✧ 曙界契印 · ${current}／8階</h3><p>${current?'已啟用，隨角色永久生效':'尚未製作契印'}</p><p>目前加成：ATK、MATK、HP、DEF、MDEF、夥伴傷害各 +${bonus}%。</p><p>每階各提升2%，最高各+16%。獨立於人物及夥伴裝備。</p></section>`;
 if(!crafting)return status+`<section class="item"><h3>製作與升階</h3><p>請至曙光聖港找「契印師・曦紋」。使用曙界雜物逐階製作與強化，5階起需要210等首領黎明裁界者的核心。</p>${player.location==='dawncity'?'<button data-open="sigilcraft">拜訪契印師・曦紋</button>':'<p>契印師位於曙界新陸 → 曙光聖港。</p>'}</section>`;
 if(player.location!=='dawncity')return '<section class="item"><h3>✧ 契印師・曦紋</h3><p>請回曙光聖港製作或強化曙界契印。</p></section>';
 return `<section class="item npc-dialog"><h3>✧ 契印師・曦紋</h3><p>「帶來曙界的素材，讓我為你刻下遠行的力量。」</p><p>專門製作及逐階強化曙界契印。</p></section>`+status+`<section class="item">${cost?`<p>${current?'下一階':'製作1階'}材料：${Object.entries(cost).map(([id,qty])=>`${ITEMS[id]?.name||id} ${player.bag.find(x=>x.id===id)?.qty||0}/${qty}`).join('、')}</p><p>5階起需要210等首領黎明裁界者的核心。</p><button data-upgrade-sigil ${player.hp>0&&Object.entries(cost).every(([id,qty])=>(player.bag.find(x=>x.id===id)?.qty||0)>=qty)?'':'disabled'}>${current?`強化至${next}階`:'製作1階契印'}</button>`:'<b>已達最高階</b>'}<button data-open="sigil">查看角色契印</button></section>`;
}
function doUpgradeSigil(){
 const snapshot=structuredClone(player),result=upgradeDawnSigil(player);
 if(result.error)return toast(result.error);
 clearStatSnapshots();if(!save()){player=snapshot;clearStatSnapshots();return;}
 toast(`曙界契印已提升至${result.level}階！`);render();renderSide(true);
}
function petEquipmentLine(g){const rank=rankOf(g),grade=escapeHtml(g.rarity||'common');return `<div class="pet-gear-details"><div class="pet-gear-heading"><span class="gear-title grade-${grade}">${escapeHtml(g.name)}</span><span class="gear-grade grade-${grade}">${gearLabel(g)}</span></div><div class="pet-gear-rank">${rank?`<span class="rank-badge rank-${rank}">${rank}階 · 裝備能力×${ENHANCEMENT_POWER[rank]}</span>`:'<span class="pet-rank-empty">未強化</span>'}</div><div class="gear-affixes">${Object.entries(enhancedAffixes(g)).map(([key,value])=>`<span>${affixLabel(key,value)}</span>`).join('')||'<span>無額外屬性</span>'}</div></div>`;}
function renderBasePetSkillConfig(){const pet=selectedGearPet();if(!pet)return '<div class="item">先選擇一隻出戰夥伴，再配置牠的技能與裝備。</div>';const role=companionRole(pet);return renderLegacyFusionReselect()+`${player.job==='pactWarrior'?`<div class="item"><b>靈契戰使 · 固定同化</b><p>自二轉起固定同化唯一出戰夥伴。此夥伴不會進行普攻、施放技能或造成任何傷害；能力與裝備依同化公式轉移給人物，所有主攻由人物發動。</p></div>`:''}${player.job==='spiritCommander'?`<div class="item"><b>萬靈統率 · 夥伴技能改造</b><p>唯一出戰融合夥伴承受全部敵方攻擊、負責主要輸出；人物裝備卡片直接同步夥伴。夥伴已裝備的第1／2／3格攻擊技能分別改造為主攻（3目標、全額傷害）、範圍（4目標、全額傷害）、終結（2目標、副目標傷害衰減）；目標數依當前存活敵人決定，；主攻依夥伴ASPD施放、不消耗SP，範圍與終結保留原本冷卻與SP消耗。可利用下方技能裝備與順序按鈕改變技能定位；治療與輔助技能維持原作用，並附帶該欄位專屬的追擊。</p></div>`:''}<div class="item"><b>${escapeHtml(pet.nickname)} · 三部位裝備</b><p>夥伴裝備可強化 ATK、MATK、HP、DEF、HIT、FLEE 與 ASPD，魔法型以 MATK 計算傷害。融合攻擊／魔法型會把裝備另一種攻擊能力的80%轉為主攻能力，原裝備仍可發揮作用。</p>${Object.entries(PET_SLOTS).map(([slot,name])=>{const g=pet.gear?.[slot];return `<div class="skill-option pet-gear-slot"><b>${name}</b>${g?`${petEquipmentLine(g)}<button data-petoff="${slot}">卸下</button>`:'<small>未裝備</small>'}</div>`}).join('')}</div><div class="item"><b>${escapeHtml(pet.nickname)} · 自動技能配置 · 已配置 ${(pet.equippedSkills||[]).length}／${petSkillLimit(pet)}</b>${fusionSkillLoadoutNotice(pet)?`<p class="report-notice">⚠ ${fusionSkillLoadoutNotice(pet)}</p>`:''}${pet.fusion&&(pet.equippedSkills||[]).length<3?'<p class="report-notice">融合夥伴現在可配置3招；已保留原本配置，可自行追加技能並調整順序。</p>':''}<p>${fusedPair(pet)?.name||petAbilitySetName(pet.rarity)} · ${pet.fusion?'融合專屬6招（可選3招）':'每組6招'}，隨夥伴等級解鎖，可裝備${petSkillLimit(pet)}招。普通→稀有→罕見各強化6%；傳說與神話各再強化12.5%。技能獨立於普攻自動施放，不需等普攻命中或留下存活敵人；一般職業技能依裝備順序嘗試，共用0.85秒施放間隔並消耗SP；萬靈優先施放就緒的終結／範圍，主攻則依ASPD補足攻擊節奏且不消耗SP。下方預估依目前夥伴能力（含裝備）計算；實際回復依缺額、主人與夥伴護盾各以自身最大HP的25%為上限，護盾優先以70%額度保護夥伴、餘額給主人，各以自身最大HP25%為上限；護盾會被攻擊消耗，6.5秒後消退，並非整段冷卻都存在。增益以施放當下能力決定。</p>${(fusionSkills(pet)||petSkillsFor(role,pet.rarity)).map(s=>{const equipped=(pet.equippedSkills||[]).includes(s.id),unlocked=pet.level>=s.unlock;return `<div class="skill-option"><b>${equipped?`${pet.equippedSkills.indexOf(s.id)+1}. `:''}${s.name}</b><small>${s.description}<br>${petSkillPreview(s,petStats(pet),role,pet)} · ${commanderPetSkillForm(player,pet,s)?.slot===0?'主攻：0 SP／依ASPD施放':`SP ${6+s.unlock*2} · ${Number((s.cooldown/1000).toFixed(1))}秒冷卻`} · Lv.${s.unlock}${equipped?`<br>自動施放狀態：${petSkillStatus(pet,s)}${['shield','guard'].includes(s.kind)?`<br>目前夥伴護盾 ${Math.max(0,effectsForPet(pet).shield||0)} · 主人護盾 ${Math.max(0,player.shield||0)}（0表示已消耗或到期）`:''}`:''}</small><button data-petskill="${pet.id}:${s.id}" ${unlocked?'':'disabled'}>${equipped?'卸下':unlocked?'裝備':'未解鎖'}</button>${equipped?`<button data-petskillmove="${pet.id}:${s.id}:-1" ${pet.equippedSkills.indexOf(s.id)===0?'disabled':''}>提前</button><button data-petskillmove="${pet.id}:${s.id}:1" ${pet.equippedSkills.indexOf(s.id)===pet.equippedSkills.length-1?'disabled':''}>延後</button>`:''}</div>`}).join('')}</div>`;}
function renderTransfer(){if(player.location==='skycity')return renderThirdTransfer();if(SECOND_JOBS[player.job])return `<div class="item"><b>${CLASSES[player.job].name} · 二轉已完成</b><p>${SECOND_JOBS[player.job].style} · ${rangeLabel(playerRange(player.job))}<br>一轉Job ${player.firstJobLevel} · 一轉剩餘點數 ${player.firstJobPoints||0} · 二轉剩餘點數 ${player.jobPoints}</p></div>`;return `<div class="item"><b>城鎮二轉公會</b><p>需求 Base Lv.50、Job Lv.40。保留一轉技能，補齊一轉共50點的技能總額；二轉Job重設為1。所有裝備與部位卡片維持原樣；贈送星輝罕見職業武器至背包，可自行換裝。</p>${secondJobChoices(player.job).map(([id,meta])=>`<div class="transfer-option">${spriteHtml(id,'choice')}<b>${meta.name} · ${rangeLabel(meta.range)}</b><button data-transfer="${id}" ${transferEligibility(player,id)?'disabled':''}>${transferEligibility(player,id)||'轉職為'+meta.name}</button></div>`).join('')}</div>`;}
function transferJob(target){const error=transferEligibility(player,target);if(error)return toast(error);if(player.bag.length>=2000)return toast('請先清出1格背包空間，領取轉職武器');const meta=SECOND_JOBS[target];if(!confirm(`確定二轉為「${meta.name}」？\n保留一轉技能；Job重設為1，所有裝備及卡片維持原樣；罕見職業武器放入背包。`))return;player.firstJobLevel=player.jobLevel;player.firstJobPoints=player.jobPoints;player.job=target;player.jobLevel=1;player.jobXp=0;player.jobPoints=0;const starter=rollGear(meta.weapon,Math.min(50,player.level),'uncommon');player.bag.push(starter);if(['pactWarrior','spiritCommander'].includes(target)&&player.gear.rightHand?.id!==meta.weapon){player.bag.pop();if(player.gear.rightHand)player.bag.push(player.gear.rightHand);player.gear.rightHand=starter;if(player.sockets.rightHand)addCard(player.sockets.rightHand);player.sockets.rightHand=null;}const learned=activeJobSkills(target).find(s=>s.branch==='second');player.jobSkills[learned.id]=1;reconcileSkillPoints(player,JOB_SKILLS[player.job],true);player.equippedJobSkill=learned.id;player.hp=stat('hp');player.mp=stat('mp');classBuffs={};jobSkillTimers={};timers.resonance=0;dirty=true;save();message(`二轉成功！現在是【${meta.name}】。`,'rare');render();}
function readinessNote(){const r=equipmentReadiness(player,player.location,rollGear,gearStatValue,SECOND_JOBS[player.job]?.weapon||({mage:'oneStaff',acolyte:'mace',archer:'shortBow',swordsman:'blade',thief:'rifle'})[player.job]);return r?`<p class="gear-readiness">裝備準備：對照前階段Lv.${r.level}完整罕見核心約${Math.round(r.ratio*100)}%。建議累積60～70%再穩定推進；不計神話特殊詞，不限制提早挑戰。夥伴、配點與操作仍會影響生存。</p>`:'';}
function renderCharacterTabs(){return `<div class="section-tabs" aria-label="角色分頁">${[['attributes','人物能力'],['gear','角色裝備'],['skills','技能配置'],['sigil','契印'],['outfits','角色外觀'],['honortitle','稱號'],['honorframe','名稱框'],['background','背景']].map(([id,label])=>`<button data-character-section="${id}" class="${characterSection===id?'active':''}">${label}</button>`).join('')}</div>`;}
function renderTowerHonors(type){
 const options=towerHonorOptions(player,type),selected=normalizeTowerHonorSelection(player),label=type==='title'?'稱號':'名稱框';
 const collection=normalizeTowerCollection(player.towerCollection),owned=towerShowcaseOwned(player),showcase=type==='frame'?`<section class="item tower-showcase-settings"><h3>三域首領收藏展示框</h3><p>${owned?'已永久收藏，可決定是否展示於遊戲內角色資料。':'通關第 30 層後可在天穹商店以 1,200 塔幣永久收藏。'}純外觀，不增加戰鬥能力。</p><div class="tower-showcase-preview"><img src="assets/tower/boss-10.webp" alt="破曉首領"><img src="assets/tower/boss-20.webp" alt="熾焰首領"><img src="assets/tower/boss-30.webp" alt="永凍首領"></div><div class="tower-honor-choices"><button data-tower-showcase="on" ${owned?'':'disabled'} class="${collection.selectedShowcase?'active':''}">展示三域首領</button><button data-tower-showcase="off" class="${!collection.selectedShowcase?'active':''}">不展示</button></div></section>`:'';
 return `<section class="item tower-honor-wardrobe"><h3>天穹榮譽 · ${label}</h3><p>已解鎖的${label}可自由切換，同時僅啟用一款，也可以不顯示。登入選角頁同步呈現，沒有能力加成。</p><div class="tower-honor-choices"><button data-tower-honor-pick="${type}" data-tower-honor-value="" class="${!selected[type]?'active':''}">不顯示</button>${options.map(name=>`<button data-tower-honor-pick="${type}" data-tower-honor-value="${escapeHtml(name)}" class="${selected[type]===name?'active':''}">${escapeHtml(name)}${selected[type]===name?' · 使用中':''}</button>`).join('')}</div><p>目前已解鎖 ${options.length} 款；通關第 10、20、30 層還可解鎖獎勵，商店另售典藏名稱框。</p></section>${showcase}`;
}
function renderCharacterAttributes(){const attrs=effectiveAttributes(),bonus=jobAttributeBonus(player,SECOND_JOBS),d=attributeDetails(),fmt=n=>Number(n.toFixed(2)),free=free201AttributeReset(player),values={'攻擊距離':rangeLabel(playerRange(player.job)),HP:`${player.hp} / ${stat('hp')}`,SP:`${player.mp} / ${stat('mp')}`,'護盾':player.shield||0,ATK:stat('atk'),MATK:stat('matk'),DEF:stat('def'),MDEF:stat('mdef'),ASPD:stat('aspd').toFixed(1),'攻擊間隔':`${(stat('speed')/1000).toFixed(3)}秒`,'實際每秒攻擊次數':`${(1000/stat('speed')).toFixed(2)}次／秒`,'攻速加成':`${stat('aspdPct')}%`,HIT:stat('hit'),FLEE:stat('flee'),'暴擊率':`${stat('crit')}%`,'暴擊傷害':`${stat('critDmg')}%`,'無視防禦':`${stat('ignoreDef')}%`,'魔法傷害加成':`${stat('magicDamage')}%`,'最終減傷':`${stat('damageReduction')}%`,'最終減傷':`${stat('damageReduction')}%`,'近距離物理傷害':`×${((1+attrs.STR*.008)*(1+d.potential.STR)).toFixed(3)}`,'遠距離物理傷害':`×${((1+attrs.DEX*.008)*(1+d.potential.DEX)).toFixed(3)}`,'魔法傷害':`×${((1+attrs.INT*.008)*(1+d.potential.INT)).toFixed(3)}`,'無詠唱進度':`${fmt(attrs.INT+2*attrs.DEX)} / ${freecastThreshold(player)}`};return `<div class="item"><h3>${escapeHtml(player.name)} · ${player.thirdJob?THIRD_JOBS[player.job].name:CLASSES[player.job].name}${player.reborn?' · 轉生':''}</h3><p>Base ${player.level}／${characterLevelCap(player)} · Job ${player.jobLevel}／${jobLevelCap(player)}</p><div class="allocation-summary"><b>可配置點數 <strong>${player.statPoints}</strong></b><span>單項上限 ${attributeCap(player)}</span></div><p>+值顯示Job、裝備與卡片的完整加成；超出各項上限的部分轉為遞減成長的溢出潛能。</p><button data-retrain="attributes" ${!isTown(player.location)||!player.hp?'disabled':''}>${free?'使用201級免費素質重置（本角色1次）':`重置素質 · ${retrainCost(player.level)}金`}</button>${player.level<201?'<small>Base201起單項上限提升至150，並贈送一次免費素質重置。</small>':''}${Object.entries(ATTRS).map(([id,label])=>`<div class="allocation-row" data-ui-key="allocation-${id}"><div><b>${id} ${label}</b><small>${attributeDescriptions[id]}</small><small data-allocation-limit="${id}">本次最多 ${Math.max(0,Math.min(player.statPoints,attributeCap(player)-player.attributes[id]))} 點${player.attributes[id]>=attributeCap(player)?'（已滿）':''}</small></div><span class="full-attribute-value" title="Job +${bonus[id]}／裝備完整 +${fmt(d.rawGear[id])}（正常生效${fmt(d.gear[id])}）／卡片完整 +${fmt(d.rawCards[id])}（正常生效${fmt(d.card[id])}）；溢出${fmt(d.overflow[id])} → ${POTENTIAL_NAMES[id]} +${(d.potential[id]*100).toFixed(2)}${id==='AGI'||id==='LUK'?'個百分點':'%'}">${player.attributes[id]}<b class="attribute-bonus">+${fmt(bonus[id]+d.rawGear[id]+d.rawCards[id])}</b></span><input type="number" min="1" max="${Math.max(1,Math.min(player.statPoints,attributeCap(player)-player.attributes[id]))}" value="${escapeHtml(allocationAmounts[id]??1)}" data-allocation-amount="${id}" aria-label="${label}配置數量"><button data-add="${id}" ${player.statPoints&&player.attributes[id]<attributeCap(player)?'':'disabled'}>配置</button></div>`).join('')}<p>裝備每項正常加成上限 ${d.gearLimit}（基本上限30%）；卡片每項 ${d.cardLimit}（20%），六項分別計算，Job另計。</p><details class="overflow-details" data-ui-key="overflow-details"><summary>溢出潛能明細</summary>${ATTRIBUTE_KEYS.map(k=>`<p>${k}：裝備 +${fmt(d.rawGear[k])}／卡片 +${fmt(d.rawCards[k])} · 溢出 ${fmt(d.overflow[k])} → ${POTENTIAL_NAMES[k]} +${(d.potential[k]*100).toFixed(2)}${k==='AGI'||k==='LUK'?'個百分點':'%'}</p>`).join('')}<p>溢出50／100／200點分別提供4%／6%／8%效果，之後持續成長、增幅遞減。溢出不重複加入ATK、MATK、ASPD或詠唱公式。</p></details></div><div class="item"><h3>人物完整能力</h3><p class="attack-gear-hint">目前主攻判定：${ownerAttackIdentity(player.job,player.thirdJob,stat("atk"),stat("matk"),activePet()?spiritSinglePetProfile(player,activePet())?.kind:null).label}。御靈使三轉前取 ATK／MATK 較高者判定傷害類型。</p><div class="numbers combat-numbers">${Object.entries(values).map(([label,value])=>`<div><span class="tiny">${label}</span><b>${value}</b></div>`).join('')}</div></div>`;}

function petAttackBadge(pet,stats=petStats(pet)){
 const info=petAttackIdentity(companionRole(pet));
 return `<span class="attack-identity attack-${info.type}">${compactAttackLabel(info,companionRange(companionRole(pet)))}</span>`;
}
function renderDualGrowthCard(){if(player?.thirdJob)return '';const guide=spiritGrowthGuide(player,activePetRoster(player));if(!guide)return '';const q=spiritQuestState(player),progress=Math.max(0,Math.min(100,Math.round((q?.kills||0)/SPIRIT_TRIAL_KILLS*100)));return `<div class="dual-growth-heading"><b>✧ 單靈誓約</b><span>${escapeHtml(guide.stage)}</span></div><div class="dual-growth-progress"><span>出戰融合夥伴</span><strong>${guide.fused}／1</strong></div>${meter(guide.fused,1,'gold')}${q?.started&&!q.done?`<div class="dual-growth-progress"><span>契約勝利</span><strong>${q.kills||0}／${SPIRIT_TRIAL_KILLS}</strong></div>${meter(progress,100,'blue')}`:''}<details class="dual-growth-next"><summary>查看下一步與三轉條件</summary><p>${escapeHtml(guide.message)}</p><ul><li>一隻融合夥伴出戰</li><li>轉生後 Base Lv.140 於蒼穹樞城接取單靈誓約</li><li>一隻融合夥伴存活並擊敗 24 隻 Lv.101–150 敵人</li><li>回蒼穹樞城完成誓約，再滿足原三轉等級、Job 與聖印條件</li></ul></details>`;}
function renderDualPetHud(){
 const pet=activePet(),stats=pet&&petStats(pet),fx=pet&&effectsForPet(pet);
 if(!pet)return '<p class="tiny">尚未有出戰夥伴，可在夥伴之地捕捉。</p>';
 return `<div class="divider"></div><div class="hero"><div class="eyebrow">ACTIVE COMPANION</div>${petSprite(pet,'hero')}<strong>${petIcon(pet)} ${escapeHtml(pet.nickname)}</strong><button type="button" class="pet-nickname rename-pet" data-rename-active-pet="${pet.id}" title="更改夥伴暱稱">✎ 更改暱稱</button><span class="pet-role-row"><span class="pill">Lv.${pet.level} · ${fusedPair(pet)?.name||SPECIES[pet.species].roleName}</span>${petAttackBadge(pet,stats)}</span><span class="pet-form">${escapeHtml(petForm(pet)||SPECIES[pet.species].name)} · ${petRarity(pet).name}</span></div><div class="meterline"><span>夥伴 HP</span><span>${pet.hp} / ${stats.hp}</span></div>${meter(pet.hp,stats.hp,'red')}<div class="meterline shield-meterline"><span>◇ 夥伴護盾</span><span>${fx.shield||0}</span></div>${meter(fx.shield||0,Math.round(stats.hp*.25),'shield')}<div class="shield-status">${pet.hp<=0?` · 復活等待 ${Math.max(0,Math.ceil(((pet.reviveAt||gameNow()+PET_REVIVE_MS)-gameNow())/1000))} 秒`:''}</div><div class="meterline"><span>夥伴 SP</span><span>${pet.sp} / ${stats.sp}</span></div>${meter(pet.sp,stats.sp,'blue')}${nextPetEvolution(pet)&&pet.level>=nextPetEvolution(pet).level?'<div class="evolution-ready">✦ 夥伴已達進化等級，可回村莊進行進化。</div>':''}`;
}
function renderPetTabs(){return `<div class="section-tabs" aria-label="夥伴分頁"><button data-pet-section="manage" class="${petSection==='manage'?'active':''}">夥伴管理</button><button data-pet-section="active" class="${petSection==='active'?'active':''}">當前出戰夥伴</button></div>`;}
function renderPetManagement(){const spiritHint=spiritGrowthGuide(player,activePetRoster(player));return `${spiritHint?`<div class="item report-notice"><b>✧ ${spiritHint.stage}</b><p>${spiritHint.message}</p></div>`:''}<div class="item"><h3>夥伴管理 ${player.pets.length}／30</h3><p>管理捕捉、鎖定、出戰與放生。鎖定及出戰中的夥伴不會被批次放生。能力與技能請到「當前出戰夥伴」。</p><div class="panel-shortcuts"><button data-release-select="all">全選可放生</button><button data-release-select="none">取消全選</button><button data-release-batch>放生已選（${selectedReleasePets.size}）</button></div><label>依品質放生<select data-release-rarity>${PET_RARITIES.map(r=>`<option value="${r.id}" ${releaseRarity===r.id?'selected':''}>${r.name}及以下</option>`).join('')}</select></label><button data-release-below class="danger">確認放生所選品質及以下</button><p>捕捉品質：普通70%／稀有25%／罕見4%／傳說1%，不直接捕捉神話。</p></div>${player.pets.map(p=>{const active=p.id===player.activePetId,secondary=false,step=nextPetEvolution(p),ready=step&&p.level>=step.level;return `<div class="item" data-ui-key="pet-${p.id}"><label><input type="checkbox" data-release-check="${p.id}" ${selectedReleasePets.has(p.id)?'checked':''} ${active||secondary||p.locked?'disabled':''}>選擇放生</label><div class="itemhead"><b>${petIcon(p)} ${escapeHtml(petForm(p)||p.nickname)}</b><span class="grade-${p.rarity}">${petRarity(p).name}</span></div><p>Lv.${p.level} · ${fusedPair(p)?.name||SPECIES[p.species].roleName} · ${active?'夥伴出戰中':p.locked?'已鎖定':'未出戰'}${ready?' · 可回村莊進化':''}</p><button data-pet="${p.id}">${active?'收回':'設為出戰夥伴'}</button><button data-rename-pet="${p.id}">✎ 改名</button><button data-pet-lock="${p.id}">${p.locked?'解除鎖定':'鎖定'}</button><button data-release="${p.id}" ${p.locked?'disabled':''}>放生</button>${ready?`<button ${isTown(player.location)?`data-evolve="${p.id}"`:'data-town'}>${isTown(player.location)?'村莊進化':'回村莊進化'}</button>`:''}</div>`;}).join('')||'<div class="item">尚無夥伴。</div>'}${isTown(player.location)?'<details class="item"><summary>村莊進化規則與靈核合成</summary>'+renderEvolution(false)+'</details>':'<p>進化只能回村莊進行。</p>'}`;}
function renderActiveCompanion(){const p=selectedGearPet();if(!p)return '<div class="item">尚無出戰夥伴，請先到夥伴管理選擇夥伴。</div>';const stats=petStats(p);return `<div class="item loyalty-panel"><b>忠誠度 ${p.loyalty||0}／${LOYALTY_MAX}</b><p>出戰且存活、怪物與夥伴等差±40以內，每累積${LOYALTY_PER_POINT}隻+1；擊敗首領另有50%機率直接+1；目前進度 ${p.loyaltyKills||0}／${LOYALTY_PER_POINT}。界限進化消耗${ASCENSION_LOYALTY}忠誠度。${p.fusion?'已完成融合進化 · 上限200':p.ascended?'已完成界限進化／異化 · 上限150 · 額外核心能力+15%':'上限99；需完成99級界限進化／異化後才開放150'}</p></div><div class="item"><h3>${escapeHtml(petForm(p)||p.nickname)}</h3>${p.sealedProgress?`<p>已封存Lv.${p.sealedProgress.level}的舊進度，完成界限進化／異化後恢復；超過目前等級的夥伴裝備暫不生效。</p>`:''}${petSprite(p,'pet')}<p>${petRarity(p).name} · ${fusedPair(p)?.name||SPECIES[p.species].roleName} · Lv.${p.level}</p>${petAttackBadge(p,stats)}${fusionEquipmentHint(companionRole(p),!!fusedPair(p))?`<p class="attack-gear-hint">${fusionEquipmentHint(companionRole(p),true)}</p>`:""}<div class="pet-live-shield"><b>◇ 夥伴目前護盾 ${Math.max(0,effectsForPet(p).shield||0)}</b>${meter(effectsForPet(p).shield||0,Math.round(stats.hp*.25),'shield')}</div><div class="numbers">${['hp','sp','atk','matk','def','mdef','aspd','hit','flee','crit','critDmg','ignoreDef','damageReduction','aspdPct'].map(key=>`<div><small>${({hp:"生命值",sp:"魔力值",atk:"物理攻擊",matk:"魔法攻擊",def:"物理防禦",mdef:"魔法防禦",aspd:"攻擊速度",hit:"命中",flee:"迴避",crit:"暴擊率",critDmg:"暴擊傷害",ignoreDef:"無視防禦",damageReduction:"最終減傷",aspdPct:"攻速加成"})[key]}</small><b>${stats[key]}${["crit","critDmg","ignoreDef","damageReduction","aspdPct"].includes(key)?"%":""}</b></div>`).join('')}</div>${nextPetEvolution(p)&&p.level>=nextPetEvolution(p).level?'<p class="evolution-ready">已達進化等級，請回村莊進化。</p>':''}</div>`+renderPetSkillConfig();}
function setJunkSelection(enabled,map=null){const ids=Object.entries(ITEMS).filter(([,it])=>it.junk&&!it.dawnJunk&&!it.goldBar&&(map===null||(map==='legacy'?!it.map:it.map===map))).map(([id])=>id),selected=new Set(map===null?[]:player.autoSellJunk);for(const id of ids){if(enabled)selected.add(id);else selected.delete(id);}player.autoSellJunk=[...selected];if(enabled)autoSellSelected();dirty=true;save();renderSide(true);}
function renderJunkSettings(){return `<div class="item"><h3>自動出售雜物</h3><p>只出售勾選的雜物。舊版五區征途已取消，相關雜物可依勾選出售；星宮轉生核心屬任務道具，不會自動出售。線上與離線皆適用。</p><div class="panel-shortcuts"><button data-junk-bulk="all:on">全部勾選</button><button data-junk-bulk="all:off">全部取消</button></div>${[{id:'petland',name:'夥伴之地'},...ZONES].map(z=>`<details><summary>${z.name}</summary><button data-junk-bulk="${z.id}:on">本區全選</button><button data-junk-bulk="${z.id}:off">本區取消</button>${Object.entries(ITEMS).filter(([,it])=>it.junk&&!it.dawnJunk&&!it.goldBar&&it.map===z.id).map(([id,it])=>`<label class="setting-toggle"><input type="checkbox" data-junk-sell="${id}" ${player.autoSellJunk.includes(id)?'checked':''}>${it.name} · ${it.cost}金</label>`).join('')}</details>`).join('')}<details><summary>舊版雜物</summary><button data-junk-bulk="legacy:on">本區全選</button><button data-junk-bulk="legacy:off">本區取消</button>${Object.entries(ITEMS).filter(([,it])=>it.junk&&!it.dawnJunk&&!it.goldBar&&!it.map).map(([id,it])=>`<label><input type="checkbox" data-junk-sell="${id}" ${player.autoSellJunk.includes(id)?'checked':''}>${it.name}</label>`).join('')}</details></div>`;}
function renderVillageQuests(){if(player.location!=='town')return '<div class="item">請回靈契主城完成轉生。</div>';const spiritHint=spiritGrowthGuide(player,activePetRoster(player)),core=player.bag.find(e=>e.id===REBIRTH_CORE_ID)?.qty||0;return `${spiritHint?`<div class="item report-notice"><b>✧ 御靈使成長目標：${spiritHint.stage}</b><p>${spiritHint.message}</p></div>`:''}<div class="item npc-dialog"><h3>🧭 轉生引導官・艾琳</h3><p>「只要擊敗Lv.99星宮首領『終界吞天巨鯨』，帶回星宮轉生核心×1，就能完成轉生。舊版五區征途任務已取消。」</p><p>星宮轉生核心：${Math.min(1,core)}／1。二轉Base99／Job50後，回村莊消耗核心1個即可轉生。轉生後回到一轉Base1／Job1，基本能力重置並獲得20點自由能力；裝備、卡片、夥伴、金幣保留。角色上限150，Base100起基本能力上限120；101級起可前往蒼穹機界新大陸。</p><button data-rebirth ${rebirthEligibility(player,SECOND_JOBS)?'disabled':''}>${rebirthEligibility(player,SECOND_JOBS)||'消耗核心×1進行靈契轉生'}</button></div>`;}
function renderJobCodex(){return Object.entries(SECOND_JOBS).map(([id,job])=>`<details class="item" ${id===player.job?'open':''}><summary>${job.name} · ${rangeLabel(job.range)}</summary><div class="job-art-pair">${spriteHtml(id,'choice',false)}${spriteHtml(id,'choice',true)}</div><p>二轉外觀／轉生二轉外觀</p><p>${job.style}</p><p>一轉 ${CLASSES[job.parent].name} → ${job.name}；Base50／Job40可回村莊辦理。主要能力：${job.attribute}。</p>${JOB_SKILLS[id].filter(s=>s.branch==='second').map(skill=>`<p><b>${skill.name}</b>${skill.rebornOnly?' · 轉生二轉限定':''}<br>${skill.desc} · ${jobSkillSpec(skill,1,id).text}</p>`).join('')}<h3>三轉：${THIRD_JOBS[id].name}</h3>${spriteHtml(id,'choice',true,true)}<p>${THIRD_JOBS[id].style}</p>${JOB_SKILLS[id].filter(s=>s.thirdOnly).map(skill=>`<p><b>${skill.name}</b> · Lv.${skill.maxRank}<br>${skill.desc} · ${jobSkillSpec(skill,1,id).text}</p>`).join('')}<p>四種夥伴搭配的具體觸發、技能名稱及作用請見「共鳴玩法」。</p></details>`).join('');}
let autoSkillSelection={};
function selectAutoSkill(id){autoSkillSelection[player.job]=id;}
const skillStageLabel=skill=>skill.thirdOnly||skill.branch==='third'?'三轉':skill.rebornOnly?'轉生二轉':skill.branch==='second'?'二轉':'一轉';
function autoQueueSkills(){return JOB_SKILLS[player.job].map(s=>({...s,learned:!!player.jobSkills[s.id]&&!supersededSkill(player,s)}));}
function renderAutoSkillSettings(){const settings=normalizeAutoSkills(player.autoSkills,autoQueueSkills()),skills=settings.order.map(id=>jobSkillById(player.job,id)),groups=new Set(skills.map(autoSkillGroup).filter(Boolean)),available=autoQueueSkills().filter(s=>s.learned&&s.kind!=='passive'&&!settings.order.includes(s.id)),defaultAdd=available.find(s=>s.id===autoSkillSelection?.[player.job]&&(!autoSkillGroup(s)||!groups.has(autoSkillGroup(s))))||available.find(s=>!autoSkillGroup(s)||!groups.has(autoSkillGroup(s))),canAdd=!!defaultAdd;return `<div class="item auto-skill-settings"><h3>自動技能優先順序</h3><p>由上往下嘗試。只施放清單內的技能；學習新技能不會自動加入。移除只取消自動施放，不會遺忘技能。</p><div class="auto-skill-add"><label for="autoSkillAddSelect">選擇技能</label><select id="autoSkillAddSelect" aria-label="選擇要新增的自動技能" ${canAdd?'':'disabled'}>${available.length?available.map(skill=>{const conflict=autoSkillGroup(skill)&&groups.has(autoSkillGroup(skill));return `<option value="${skill.id}" ${defaultAdd?.id===skill.id?'selected':''} ${conflict?'disabled':''}>${skill.name} · ${skillStageLabel(skill)}${conflict?'（同類護盾已配置）':''}</option>`;}).join(''):'<option value="">沒有可新增的已學技能</option>'}</select><button data-auto-skill-add ${canAdd?'':'disabled'}>新增技能</button></div><p class="tiny">同類護盾限配置一個；若要更換，先移除目前的護盾。二轉護盾CD3.6秒，一轉4.8秒，共用冷卻，無法交替連放。</p>${skills.length?skills.map((skill,index)=>`<div class="auto-skill-row"><div class="auto-skill-name"><b>${index+1}. ${skill.name}</b><small>${skillStageLabel(skill)} · Lv.${player.jobSkills[skill.id]} · CD ${(skillCooldown(skill)/1000).toFixed(2)}秒</small></div><div class="auto-skill-actions"><button data-skill-move="${skill.id}" data-direction="-1" aria-label="將${skill.name}上移" ${index===0?'disabled':''}>↑</button><button data-skill-move="${skill.id}" data-direction="1" aria-label="將${skill.name}下移" ${index===skills.length-1?'disabled':''}>↓</button><button data-auto-skill-remove="${skill.id}" aria-label="移除${skill.name}" class="danger">移除</button></div></div>`).join(''):'<p class="empty">尚未配置自動技能；可從上方選擇並新增。普通攻擊仍會正常進行。</p>'}<p class="tiny">護盾低於HP15%才補盾；治療低於65%、回魔低於55%才施放。零CD攻擊排在最前可能占用其他招式的施放機會。</p></div>`;}
function changeAutoSkill(id,enabled){const previous=structuredClone(player.autoSkills),skills=autoQueueSkills(),skill=skills.find(s=>s.id===id),settings=normalizeAutoSkills(player.autoSkills,skills);if(enabled){if(!skill?.learned||skill.kind==='passive')return;const group=autoSkillGroup(skill);if(group&&settings.order.some(other=>other!==id&&autoSkillGroup(skills.find(s=>s.id===other))===group))return toast('同類護盾只能配置一個，請先移除目前的護盾');if(!settings.order.includes(id))settings.order.push(id);}else settings.order=settings.order.filter(other=>other!==id);player.autoSkills=settings;dirty=true;if(save()===false)player.autoSkills=previous;renderSide(true);}
function reorderAutoSkill(id,direction){const previous=structuredClone(player.autoSkills);player.autoSkills=moveAutoSkill(player.autoSkills,JOB_SKILLS[player.job].map(s=>({...s,learned:player.jobSkills[s.id]>0})),id,direction);dirty=true;if(save()===false)player.autoSkills=previous;renderSide(true);}
function renderCaptureSettings(){const selected=normalizeCaptureRoles(player.autoCaptureRoles);return `<div class="item"><h3>夥伴之地自動捕捉</h3><p>勾選要捕捉的類型；全部關閉即停用。僅夥伴之地自動戰鬥時丟球（含離線掛機），不需壓低血量，其餘類型照常戰鬥。</p>${[['attack','攻擊型'],['magic','魔法型'],['defense','防禦型'],['support','輔助型']].map(([role,label])=>`<label class="setting-toggle"><input type="checkbox" data-capture-role="${role}" ${selected.includes(role)?'checked':''}> 自動捕捉${label}</label>`).join('')}<p>缺球時逐顆以金幣補球；金幣不足或夥伴滿30隻時停止丟球，不會自動放生。</p></div>`;}
function autoCapturePet(now){if(!auto||!player.hp||!isCaptureSanctuary(player.location)||!enemy?.hp||enemy.boss||now-(timers.capture||0)<1000)return;const role=SPECIES[enemy.id]?.role;if(!normalizeCaptureRoles(player.autoCaptureRoles).includes(role)||player.pets.length>=30)return;timers.capture=now;const balls=player.bag.some(e=>e.id==='orb'&&e.qty>0);if(!balls&&player.gold<ITEMS.orb.cost)return;capture();}
function renderPactStatus(){const pet=activePet(),rule=pet&&companionResonance(player,pet),a=effectiveAttributes();return `<div class="pact-status"><b>目前共鳴：${rule?.name||'未攜帶夥伴'}</b><p>${rule?.description||'選擇夥伴後可查看專屬玩法。'}${player.thirdJob?`<br>${rule?.originalEvent?'依上方事件與前置條件觸發專屬共鳴':'三轉主攻命中後觸發專屬共鳴'}；範圍與終結技亦有獨立變化。`:player.reborn&&player.jobSkills['rebirthMain_'+player.job]?`<br>目前由轉生主攻【${jobSkillById(player.job,'rebirthMain_'+player.job).name}】承接此共鳴；標示「轉生主攻」的數值優先適用。`:''}${!player.thirdJob&&pet&&!fusedPair(pet)&&resonanceOpener(player.job,companionRole(pet))?`<br>建議將【${jobSkillById(player.job,resonanceOpener(player.job,companionRole(pet))).name}】排在主攻之前，滿足共鳴觸發條件；仍由你自行設定順序。`:''}${rule?.mode==='pact'?`<br>觸發：${rule.events.map(e=>RESONANCE_EVENTS[e]||jobSkillById(player.job,e)?.name||e).join('／')} · 持續${(rule.duration||6000)/1000}秒 · 冷卻${rule.cooldown/1000}秒<br>${classBuffs.pact?.until>gameNow()?'● 共鳴效果生效中':'等待職業動作觸發'}`:''}${player.job==='wizard'?`<br>無詠唱進度 INT＋2DEX：${a.INT+2*a.DEX}／${freecastThreshold(player)}（含Job、裝備與卡片）`:''}</p></div>`;}
function renderJobTree(){const branches=[...(player.thirdJob?['third']:[]),...(player.reborn&&SECOND_JOBS[player.job]?['rebirth']:[]),...(SECOND_JOBS[player.job]?['second']:[]),'first'];return renderAutoSkillSettings()+(['mage','wizard','sage'].includes(player.job)?`<div class="item"><b>魔力護體 · 常駐開關</b><p>啟用後以 SP 分攤傷害，不需施放，也不占用技能循環。滿級平時承傷30%，HP低於40%時提高至60%。每1SP承擔30傷害，每次最多消耗10%最大SP，保留15%SP。</p><label class="setting-toggle"><input type="checkbox" data-mana-guard-toggle ${player.manaGuardEnabled?'checked':''} ${!player.jobSkills.manaStudy?'disabled':''}> ${player.manaGuardEnabled?'魔力承傷已開啟':'魔力承傷已關閉'}</label></div>`:'')+`<div class="item"><b>技能重新訓練</b><p>每次 ${retrainCost(player.level)} 金，全部職階技能點退回各自點數池。素質重置請到「人物能力」。</p><button data-retrain="skills">重置技能</button></div><div class="item"><h3>${player.thirdJob?THIRD_JOBS[player.job].name:CLASSES[player.job].name} · 主動與被動技能</h3>${renderPactStatus()}<p>每提升1級Job立即給1點。轉生二轉Job51–70給轉生技能點；三轉另開獨立Job1–70與70點技能總額（初始主攻1級）。舊技能及點數保留。</p><p>三轉包含五主動×10級、四被動×5級。主攻零CD、由ASPD限制每次動作；範圍技能每體獨立計傷。巫師INT＋2DEX達${freecastThreshold(player)}可無詠唱，大型主攻仍保留0.9秒最低動作後延遲。同類護盾共用冷卻，不能同時配置。</p>${branches.map(branch=>{const pool=branch==='third'?'thirdJobPoints':branch==='rebirth'?'rebornJobPoints':branch==='first'&&SECOND_JOBS[player.job]?'firstJobPoints':'jobPoints',skills=JOB_SKILLS[player.job].filter(s=>branch==='third'?s.thirdOnly:branch==='rebirth'?s.rebornOnly:!s.rebornOnly&&!s.thirdOnly&&s.branch===branch);return `<section class="job-skill-section ${branch}"><h3>${({third:'三轉專屬',rebirth:'轉生二轉 · 主攻與常駐強化',second:'二轉專屬技能',first:'一轉基礎技能'})[branch]} · 可用 <span data-skill-points="${pool}">${player[pool]||0}</span> 點</h3>${skills.map(s=>{const rank=player.jobSkills[s.id]||0,passive=s.kind==='passive';return `<div class="skill-option"><b>${passive?'◆ 被動':'✦ 主動'} ${s.name} <span class="pill">Lv.${rank}/${s.maxRank}</span></b><small>${supersededSkill(player,s)?'已由高階主攻取代 · ':''}${s.desc}<br>${jobSkillSpec(s,Math.max(1,rank),player.job,skillContext(s)).text}${s.aoe?` · 同時攻擊最多${s.targets||3}個目標，每個目標獨立承受上述倍率`:''} · Job ${s.unlock}${passive?'':` · SP ${s.mp}`}<br>${!passive&&!canCastJobSkill(s)?'目前武器不符':'依職業裝備配置'}</small><div class="skill-actions"><button data-jobup="${s.id}" ${skillUnlocked(player,s)&&(player[pool]||0)>0&&rank<s.maxRank?'':'disabled'}>升級技能</button>${passive?'':`<button data-jobequip="${s.id}" ${rank&&!supersededSkill(player,s)&&player.equippedJobSkill!==s.id?'':'disabled'}>${player.equippedJobSkill===s.id?'預設技能':'設為預設'}</button>`}</div></div>`;}).join('')}</section>`;}).join('')}</div>`;}
function evolvePet(id){const pet=player.pets.find(p=>p.id===id),step=pet&&nextPetEvolution(pet);if(!pet||!step)return toast('夥伴已達進化上限');if(!isTown(player.location))return toast('只能在城鎮進化');if(pet.level<step.level)return toast(`需夥伴 Lv.${step.level}`);if((player.bag.find(e=>e.id===step.id)?.qty||0)<step.count)return toast('進化素材不足');evolutionPreview={id,before:JSON.parse(JSON.stringify(pet))};$('evolutionModal').style.display='grid';$('gameShell').inert=true;$('evolutionScene').className='evolution-scene preview';$('evolutionBefore').src=petArt(pet);$('evolutionAfter').src=petArt(pet,evolutionStage(pet)+1);$('evolutionTitle').textContent='夥伴即將迎來新的形態';$('evolutionStatus').textContent=`${petForm(pet)} → 下一階形態 · 消耗 ${ITEMS[step.id].name} ×${step.count}`;$('evolutionStart').hidden=false;$('evolutionStart').disabled=false;$('evolutionClose').disabled=false;$('evolutionClose').textContent='取消';$('evolutionStart').focus();}
function beginEvolution(){if(evolutionRunning||!evolutionPreview)return;if(evolutionPreview.trueForm)return beginTrueFormReveal();const pet=player.pets.find(p=>p.id===evolutionPreview.id);if(!pet)return closeEvolution();const before=JSON.parse(JSON.stringify(pet)),bagBefore=JSON.parse(JSON.stringify(player.bag)),playerBefore=structuredClone(player),result=evolutionPreview.fusion?fusePets(player,pet.id,evolutionPreview.donorId):evolutionPreview.ascension?ascendPet(pet,player.bag,player.location,evolutionPreview.mode):evolveCompanion(pet,player.bag,player.location,PET_EVOLUTIONS,PET_RARITIES);if(result.error)return toast(result.error);result.form=petForm(pet);if(evolutionPreview.ascension&&!pet.customNickname)pet.nickname=petForm(pet);migratePetSkills(pet,companionRole(pet));pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;if(activePet()?.id===pet.id)clearPetEffects();dirty=true;if(save()===false){player=playerBefore;return toast('存檔失敗，本次進化未扣除素材');}stopAutoFusion('夥伴進化中');evolutionRunning=true;$('evolutionAfter').src=petArt(pet);$('evolutionScene').className='evolution-scene evolving';$('evolutionTitle').textContent='進化之光正在凝聚…';$('evolutionStatus').textContent='夥伴的輪廓正在變化，請稍候…';$('evolutionStart').hidden=true;$('evolutionClose').disabled=true;evolutionTimer=setTimeout(()=>{evolutionRunning=false;const mutation=!result.guaranteedLegend&&result.before!==result.after&&['legendary','mythic'].includes(result.after),failedMutation=evolutionPreview?.ascension&&evolutionPreview.mode==='mutate'&&!result.mutation;$('evolutionScene').className='evolution-scene complete';$('evolutionTitle').textContent=failedMutation?`異化未成功，夥伴維持【${result.form}】。`:result.fusion?`融合成功，誕生【${result.form}】！`:mutation?`太驚人了，居然是【${result.form}】！`:`恭喜您，進化為【${result.form}】！`;$('evolutionStatus').textContent=`${petRarity(pet).name} · ${petAbilitySetName(pet.rarity)}${result.before!==result.after?' · 品質提升成功':''}`;$('evolutionClose').disabled=false;$('evolutionClose').textContent='繼續冒險';$('evolutionClose').focus();message($('evolutionTitle').textContent,'rare');render();},4000);}

let trueFormToken=0;
function trueFormBlocked(){if(typeof document==='undefined'||offlineSimulation||settlingOffline||backgroundPaused||document.hidden||!gameRunning||!player||player.hp<=0||player.trialRun)return true;for(const id of ['offlineProgress','offlineModal','captureRewardModal'])if($(id)&&!$(id).hidden)return true;for(const id of ['createModal','reviveModal','renameModal','fusionResultModal']){const display=$(id)?.style.display;if(display&&display!=='none')return true;}return false;}
function maybeRevealTrueForm(){if(trueFormBlocked()||evolutionRunning||evolutionPreview)return false;const pet=player.pets.find(trueFormReady);if(!pet)return false;evolutionPreview={id:pet.id,trueForm:true,before:structuredClone(pet)};$('evolutionModal').style.display='grid';$('gameShell').inert=true;$('evolutionBefore').src=petArt(pet);$('evolutionAfter').src=petArt({...pet,trueForm:true});beginTrueFormReveal();return true;}
function deferTrueFormReveal(){if(!evolutionPreview?.trueForm)return;trueFormToken++;clearTimeout(evolutionTimer);evolutionRunning=false;evolutionPreview=null;if(typeof document!=='undefined'){$('evolutionModal').style.display='none';$('gameShell').inert=false;}}
function beginTrueFormReveal(){const pet=player?.pets.find(p=>p.id===evolutionPreview?.id);if(trueFormBlocked()||!pet||!trueFormReady(pet)){deferTrueFormReveal();return;}stopAutoFusion('夥伴真形顯現中');const owner=player,token=++trueFormToken;evolutionRunning=true;$('evolutionScene').className='evolution-scene evolving';$('evolutionTitle').textContent='熟悉的氣息，陌生的輪廓…';$('evolutionStatus').textContent=TRUE_FORM_MESSAGE;$('evolutionStart').hidden=true;$('evolutionClose').disabled=true;$('evolutionClose').textContent='見證羈絆…';evolutionTimer=setTimeout(()=>{if(token!==trueFormToken)return;if(owner!==player||trueFormBlocked()||!trueFormReady(pet)){deferTrueFormReveal();return;}const stageBeforeReveal=pet.humanoidStage;pet.trueForm=true;reconcileHumanoidStages(pet);dirty=true;if(save()===false){delete pet.trueForm;if(stageBeforeReveal===undefined)delete pet.humanoidStage;else pet.humanoidStage=stageBeforeReveal;evolutionRunning=false;$('evolutionScene').className='evolution-scene preview';$('evolutionAfter').src=petArt(pet);$('evolutionTitle').textContent='真形尚未保存';$('evolutionStatus').textContent='存檔失敗，原有夥伴與進度已保留，稍後可再次相見。';}else{evolutionRunning=false;$('evolutionScene').className='evolution-scene complete';$('evolutionTitle').textContent=`原來，你是【${petForm(pet)}】！`;$('evolutionStatus').textContent=TRUE_FORM_MESSAGE;message(`與${pet.nickname}的羈絆，迎來了全新的模樣。`,'rare');render();}$('evolutionClose').disabled=false;$('evolutionClose').textContent='繼續同行';$('evolutionClose').focus();},4000);}

function closeEvolution(){if(evolutionRunning)return;$('evolutionModal').style.display='none';$('gameShell').inert=false;evolutionPreview=null;render();}
function showPermanentFormEvolution(pet,before,title,detail){
 if(typeof document==='undefined'||!pet)return;
 evolutionPreview={id:pet.id,completedForm:true,before};
 $('evolutionBefore').src=petArt(before);
 $('evolutionAfter').src=petArt(pet);
 $('evolutionTitle').textContent=title;
 $('evolutionStatus').textContent=detail;
 $('evolutionScene').className='evolution-scene complete';
 $('evolutionStart').hidden=true;
 $('evolutionClose').disabled=false;
 $('evolutionClose').textContent='見證新的羈絆';
 $('evolutionModal').style.display='grid';
 $('gameShell').inert=true;
 $('evolutionClose').focus();
}
function renderResonanceGuide(){return renderThirdResonanceGuide()+`<div class="item"><b>一轉／二轉 × 四種夥伴 · 60組核心共鳴</b><p>攻擊事件需命中，治療／回魔需實際回復；防禦型夥伴攔截需實際受擊。每個配對有一組共用冷卻，夥伴共鳴不會再觸發共鳴。一轉效果依夥伴裝備能力計算；二轉共鳴命中觸發時即可改造當次及後續6秒的指定技能，夥伴本身攻擊／坦傷／治療仍依能力成長。</p>${Object.entries(RESONANCE_RULES).map(([job,roles])=>`<details ${job===player.job?'open':''}><summary>${CLASSES[job].name}${job===player.job?' · 目前職業':''}</summary>${Object.entries(roles).map(([role,rule])=>`<div class="skill-option"><b>${({attack:'攻擊',magic:'魔法',defense:'防禦',support:'輔助'})[role]}夥伴 · ${rule.name}</b><small>${rule.description}${JOB_SKILLS[job]?.some(s=>s.rebornOnly)?`<br>轉生主攻「${JOB_SKILLS[job].find(s=>s.id==='rebirthMain_'+job)?.name}」完整承接此效果並取代原主攻；常駐BUFF下，獵鷹／聖盾命中可維持原BUFF觸發的共鳴；觸發仍須滿足下方條件。`:''}<br>觸發：${rule.events.map(e=>RESONANCE_EVENTS[e]).join('／')} · CD ${(rule.cooldown/1000).toFixed(1)}秒</small></div>`).join('')}</details>`).join('')}</div>`;}

function renderSpiritResonanceStatus(pet){
 const profile=spiritSinglePetProfile(player,pet);
 if(!profile)return '<div class="rule">尚未具備專屬共鳴條件；三轉需配置一隻融合夥伴。</div>';
 const rule=SPIRIT_PROC_RULES[profile.effect];
 if(!rule)return '<div class="rule">尚未具備專屬共鳴條件。</div>';
 const triggers={ownerHit:'人物命中',ownerSkill:'人物技能命中',ownerCombo:'人物連續命中',ownerAlternatingHit:'人物物理／魔法交替命中',ownerDamaged:'人物受到傷害',ownerKill:'擊敗敵人',ownerShieldLost:'人物護盾受損',ownerCastCycle:'人物施法命中',ownerLowHp:'人物受傷後 HP 不高於 40%（必須存活）',petHit:'夥伴命中',petSkill:'夥伴技能命中',petAlternatingHit:'夥伴物理／魔法交替命中',petDamaged:'夥伴受到傷害',petGuard:'夥伴施放守護或承受攻擊',ownerMark:'夥伴施放標記',petShieldLost:'夥伴護盾受損',petCastCycle:'夥伴施法命中'};
 const owner=profile.source==='owner',who=owner?'人物':'夥伴',details=[who+'觸發攻擊傷害提高 '+rule.bonusPct+'%'];
 if(rule.ignoreDef)details.push('觸發攻擊額外無視防禦 '+rule.ignoreDef+'%');
 if(rule.healPct&&profile.effect!=='guardianVerdict')details.push('恢復'+who+'最大 HP 的 '+rule.healPct+'%');
 if(rule.shieldPct)details.push('獲得'+who+'最大 HP 的 '+rule.shieldPct+'% 護盾');
 if(rule.cooldownReductionMs)details.push(who+'技能冷卻縮短 '+(rule.cooldownReductionMs/1000).toFixed(1)+' 秒');
 if(profile.effect==='guardianVerdict')details.push('另於夥伴命中時每 6.5 秒恢復最大 HP 的 3%，以雙防與治療量追加最多三目標傷害；溢出治療以 25% 計入');
 const matching=spiritProcState.key?.endsWith(':'+profile.effect),charges=matching?spiritProcState.charges:0;
 const remaining=matching?Math.max(0,rule.cooldownMs-(gameNow()-spiritProcState.lastAt)):0;
 const ready=player.hp>0&&pet?.hp>0;
 return '<div class="rule"><strong>✦ 專屬共鳴：'+escapeHtml(profile.name)+'</strong><br>'+details.join('；')+'<br>觸發：'+triggers[profile.trigger]+'，累積 '+rule.charges+' 次 · 冷卻 '+(rule.cooldownMs/1000).toFixed(1)+' 秒</div><div class="tiny">'+(ready?'自動觸發':'人物或夥伴倒地，暫停觸發')+' · 累積 '+charges+'／'+rule.charges+' · '+(remaining>0?'冷卻剩餘 '+(remaining/1000).toFixed(1)+' 秒':'冷卻就緒')+'</div>';
}

function renderCombatPanel(){
 const pet=activePet(),s=pet?petStats(pet):null;
 const values=combatView==='player'?{'職業':CLASSES[player.job].name,'攻擊距離':rangeLabel(playerRange(player.job)),'HP':`${player.hp}/${stat('hp')}`,'SP':`${player.mp}/${stat('mp')}`,ATK:stat('atk'),MATK:stat('matk'),DEF:stat('def'),MDEF:stat('mdef'),ASPD:stat('aspd').toFixed(1),HIT:Math.round(stat('hit')),FLEE:stat('flee'),CRIT:`${stat('crit').toFixed(1)}%`,'暴擊傷害':`${stat('critDmg')}%`,'無視防禦':`${stat('ignoreDef')}%`,'魔法傷害加成':`${stat('magicDamage')}%`,'最終減傷':`${stat('damageReduction')}%`}
 :s?{'目前形態':petForm(pet)||SPECIES[pet.species].name,'類型':(fusedPair(pet)?.name||SPECIES[pet.species].roleName),'攻擊距離':rangeLabel(companionRange(companionRole(pet))),'稀有度':petRarity(pet).name,'進化階段':`${pet.evolution||0}/4`,'等級':pet.level,'HP':`${pet.hp}/${s.hp}`,'SP':`${pet.sp}/${s.sp}`,ATK:s.atk,MATK:s.matk,DEF:s.def,MDEF:s.mdef,ASPD:s.aspd.toFixed(1),HIT:Math.round(s.hit),FLEE:Math.round(s.flee),CRIT:`${s.crit.toFixed(1)}%`,"暴擊傷害":`${s.critDmg}%`,"無視防禦":`${s.ignoreDef}%`,"最終減傷":`${s.damageReduction}%`,"攻速加成":`${s.aspdPct}%`}:{};
 return `<div class="item"><b>角色／夥伴完整狀態面板</b><p>這裡只顯示當前實際屬性；攻擊與受傷事件請至作戰紀錄切換。</p><div class="bag-filters"><button data-combatview="player" class="${combatView==='player'?'active':''}">人物狀態</button><button data-combatview="pet" class="${combatView==='pet'?'active':''}">夥伴狀態</button></div>${Object.keys(values).length?`<div class="numbers combat-numbers">${Object.entries(values).map(([k,v])=>`<div><span class="tiny">${k}</span><b>${v}</b></div>`).join('')}</div>`:'<div class="empty">尚未有出戰夥伴。</div>'}</div>`;}
function renderPotionSettings(){const thresholds=normalizePotionThresholds(player.potionThresholds);return `<div class="item"><b>自動補給門檻</b><p>HP／SP 低於設定百分比時使用背包現有藥水，四項可獨立設定 1～100%。離線掛機沿用相同設定。藥水恢復量仍依藥水種類與角色／夥伴能力計算。</p><div class="auto-options">${[['playerHp','玩家補血 HP'],['playerSp','玩家補魔 SP'],['petHp','夥伴補血 HP'],['petSp','夥伴補魔 SP']].map(([key,label])=>`<div class="potion-setting"><label><input type="checkbox" data-autopotion="${key}" ${player.autoPotions[key]?'checked':''}> ${label}</label><label>低於 <input type="number" min="1" max="100" step="1" data-potion-threshold="${key}" aria-label="${label}門檻百分比" value="${thresholds[key]}"> % 自動使用</label><label>藥水優先順序<select data-potion-priority="${key}">${[['high','由高效到低效'],['low','由低效到高效'],...(key.endsWith('Hp')?['red_small','red_mid','red_large']:['blue_small','blue_mid','blue_large']).map(id=>[id,ITEMS[id].name+'優先'])].map(([id,name])=>`<option value="${id}" ${(player.potionPriority?.[key]||'high')===id?'selected':''}>${name}</option>`).join('')}</select></label></div>`).join('')}</div></div>`;}

function equipmentLine(g){return `${rankOf(g)?`<span class="rank-badge rank-${rankOf(g)}">${rankOf(g)}階 · 裝備能力×${ENHANCEMENT_POWER[rankOf(g)]}</span><small class="rank-resistance">抵抗${CONTROL_NAMES[CONTROL_SLOTS[GEAR_BASE[g.id]?.slot]]||'異常'} ${Math.round(CONTROL_RESISTANCE[rankOf(g)]*100)}%${GEAR_BASE[g.id]?.hands===2?'（同時抵抗束縛）':''}</small>`:''}${g.swapProtected?`<span class="fusion-protected">換裝保留 · 自動分解保護</span><button data-swap-unprotect="${g.uid}">解除換裝保護</button>`:''}${g.fusionMatch?'<span class="fusion-protected">✦ 融合目標 · 自動分解保護</span>':''}<span class="gear-title grade-${g.rarity||'common'}">${escapeHtml(g.name)}</span> <span class="gear-grade grade-${g.rarity||'common'}">${gearLabel(g)}</span>${GEAR_BASE[g.id]?.weaponTrait?`<div class="gear-affixes"><span>武器特性：${escapeHtml(GEAR_BASE[g.id].weaponTrait)}</span></div>`:''}<div class="gear-affixes">${Object.entries(enhancedAffixes(g)).map(([k,v])=>`<span>${affixLabel(k,v)}</span>`).join('')||'無額外屬性'}</div>`;}
function equippedCardDisplay(slot){
 const card=CARDS[player.sockets[slot]];
 if(!card)return '<div class="equipped-card-empty">◇ 卡片插槽 · 尚未鑲嵌</div>';
 return `<div class="equipped-card ${card.boss?'equipped-card-boss':''}"><div class="equipped-card-header"><span class="equipped-card-symbol" aria-hidden="true">${card.boss?'♛':'✦'}</span><div><small>已鑲嵌${card.boss?' · 首領卡片':' · 怪物卡片'}</small><strong>${escapeHtml(card.name)}</strong></div></div><div class="equipped-card-effect">${cardDescription(card,player.level)}</div><div class="equipped-card-footer"><span>綁定${SLOTS[slot]} · 換裝保留</span><button data-unsocket="${slot}">卸下卡片</button></div></div>`;
}
function gearComparisonProfile(job,weaponType){
 const magic=['mage','acolyte','wizard','priest','spiritCommander'].includes(job),hybrid=job==='sage';
 const ranged=['archer','hunter','performer'].includes(job)||(job==='rogue'&&weaponType==='rifle');
 const physical=!magic||hybrid,melee=physical&&(!ranged||job==='rogue');
 return {name:hybrid?'魔拳／魔法混合':magic?'魔法輸出':ranged?'遠距物理':'近戰物理',
  relevant:key=>!(['atk','matk','magicDamage','crit','critDmg','ignoreDef','近距離物理傷害%','遠距離物理傷害%','魔法傷害%'].includes(key))
   ||(key==='atk'&&physical)||(key==='matk'&&(magic||hybrid))||(key==='magicDamage'&&(magic||hybrid))
   ||(['crit','critDmg','ignoreDef'].includes(key)&&physical)
   ||(key==='近距離物理傷害%'&&melee)||(key==='遠距離物理傷害%'&&ranged)
   ||(key==='魔法傷害%'&&(magic||hybrid))};
}
function gearComparison(g){const base=ITEMS[g.id],pet=selectedGearPet(),isPet=!!base.petSlot;
 if(isPet&&!pet)return '<div class="gear-compare">出戰夥伴後可比較數值。</div>';
 if(!isPet&&base.jobs&&!base.jobs.includes(player.job))return '<div class="gear-compare">此武器不適用目前職業。</div>';
 if(!isPet&&base.slot==='leftHand'&&GEAR_BASE[player.gear.rightHand?.id]?.hands===2)return '<div class="gear-compare">需先卸下雙手武器。</div>';
 if(!isPet&&g.id==='offDagger'&&GEAR_BASE[player.gear.rightHand?.id]?.weaponType!=='dagger')return '<div class="gear-compare">需先裝備主手匕首。</div>';
 const keys=isPet?['hp','sp','atk','matk','def','mdef','hit','flee','aspd','aspdPct','crit','critDmg','ignoreDef','damageReduction']:['hp','mp','atk','matk','def','mdef','hit','flee','aspd','aspdPct','crit','critDmg','ignoreDef','magicDamage','damageReduction'];
 const labels={hp:'生命值',sp:'夥伴魔力',mp:'魔力值',atk:'物理攻擊',matk:'魔法攻擊',def:'物理防禦',mdef:'魔法防禦',hit:'命中',flee:'迴避',aspd:'攻擊速度',aspdPct:'攻速加成',crit:'暴擊率',critDmg:'暴擊傷害',ignoreDef:'無視防禦',magicDamage:'魔法傷害加成',damageReduction:'最終減傷'};
 const percentKeys=new Set(['aspdPct','crit','critDmg','ignoreDef','magicDamage','damageReduction']);
 const snapshot=()=>{clearStatSnapshots();return {...Object.fromEntries(keys.map(k=>[k,isPet?petStats(pet)[k]||0:stat(k)])),...(!isPet?ownerAttributeEffects():{})};};
 const before=snapshot(),slot=base.petSlot||base.slot,gears=isPet?pet.gear:player.gear,previous=gears[slot],left=isPet?null:player.gear.leftHand,socket=isPet?null:player.sockets[slot],leftSocket=isPet?null:player.sockets.leftHand;
 try{
  gears[slot]=g;
  if(!isPet&&slot==='rightHand'&&(base.hands===2||base.weaponType!=='dagger'&&left?.id==='offDagger'))player.gear.leftHand=null;
  const after=snapshot(),format=(n,percent)=>Number(n.toFixed(percent?2:1));
  const changes=Object.keys(before).filter(k=>Math.abs(after[k]-before[k])>.001).map(k=>{
   const delta=after[k]-before[k],percent=percentKeys.has(k)||k.endsWith('%'),unit=percent?'%':'',label=labels[k]||k;
   const text=`${format(before[k],percent)}${unit} → ${format(after[k],percent)}${unit}`;
   const deltaText=`${delta===0?'±':delta>0?'+':''}${format(delta,percent)}${percent?' 個百分點':''}`;
   return {k,label,delta,text,deltaText,sign:Math.abs(delta)<.001?'zero':delta>0?'up':'down'};
  });
  const profile=isPet?null:gearComparisonProfile(player.job,base.weaponType||GEAR_BASE[player.gear.rightHand?.id]?.weaponType);
  const relevant=profile?changes.filter(c=>profile.relevant(c.k)):changes;
  const oldName=previous?.name||'尚未穿戴',newName=g.name||base.name;
  const comparisonView=(list,mode)=>{
   const up=list.filter(c=>c.sign==='up'),down=list.filter(c=>c.sign==='down');
   const headline=up.length&&down.length?'能力取捨':up.length?'能力提升':down.length?'能力下降':'能力相同';
   const badge=up.length&&down.length?'mixed':up.length?'positive':down.length?'negative':'neutral';
   const cards=list.map(c=>`<div class="compare-quick-item ${c.sign}"><small>${escapeHtml(c.label)}</small><strong class="delta-${c.sign}">${c.deltaText}</strong></div>`).join('');
   return `<div class="compare-mode-content" data-compare-content="${mode}" ${mode!==(profile?gearCompareMode:'relevant')?'hidden':''}><div class="compare-verdict ${badge}"><b>${headline}</b><span class="delta-up">▲ ${up.length} 項增加</span><span class="delta-down">▼ ${down.length} 項減少</span></div><div class="compare-quick" aria-label="${mode==='all'?'全部':'本職業相關'}屬性增減">${cards||'<span>此範圍沒有屬性變化</span>'}</div></div>`;
  };
  return `<section class="gear-compare comparison-v2"><div class="compare-direction"><div class="compare-source"><small>目前穿戴</small><strong>${escapeHtml(oldName)}</strong></div><span class="compare-arrow" aria-label="更換為">→</span><div class="compare-target"><small>準備穿戴</small><strong>${escapeHtml(newName)}</strong></div></div>${profile?`<div class="compare-mode-switch" role="group" aria-label="比較範圍"><span>${escapeHtml(profile.name)}</span><button type="button" data-compare-mode="relevant" aria-pressed="${gearCompareMode==='relevant'}">本職業重點</button><button type="button" data-compare-mode="all" aria-pressed="${gearCompareMode==='all'}">全部屬性</button></div>`:''}${comparisonView(relevant,'relevant')}${profile?comparisonView(changes,'all'):''}${!isPet&&base.hands===2&&left?'<small class="compare-caution">已包含卸除左手裝備的影響</small>':''}<small class="compare-caution">這是穿戴後總屬性的增減；隱藏的比較欄位仍會正常套用到裝備與戰鬥。</small></section>`;
 }finally{gears[slot]=previous;if(!isPet){player.gear.leftHand=left;player.sockets[slot]=socket;player.sockets.leftHand=leftSocket;}clearStatSnapshots();}
}
function equipmentFilters(petOnly=false){return `<div class="gear-filters"><label>稀有度<select data-gearfilter="rarity"><option value="all">全部稀有度</option>${RARITIES.map(r=>`<option value="${r.id}" ${gearFilterRarity===r.id?'selected':''}>${r.name} · ${r.count}詞</option>`).join('')}</select></label><label>階級<select data-gearfilter="tier"><option value="all">全部階級</option>${TIER_NAMES.map((t,i)=>`<option value="${i+1}" ${gearFilterTier===String(i+1)?'selected':''}>${t}階 Lv.${GEAR_TIERS[i].min}–${GEAR_TIERS[i].max}</option>`).join('')}</select></label><label>部位<select data-gearfilter="slot"><option value="all">全部部位</option>${Object.entries(petOnly?PET_SLOTS:SLOTS).map(([id,label])=>`<option value="${petOnly?'pet-':''}${id}" ${gearFilterSlot===(petOnly?'pet-':'')+id?'selected':''}>${label}</option>`).join('')}</select></label><label>攻擊屬性<select data-gearfilter="stat">${[['all','全部屬性'],['atk','含 ATK 物理攻擊'],['matk','含 MATK 魔法攻擊']].map(([id,label])=>`<option value="${id}" ${gearFilterStat===id?'selected':''}>${label}</option>`).join('')}</select></label>${petOnly?'':`<label>職業適用<select data-gearfilter="job">${[['all','全部職業'],['usable','本職業可用（含通用）'],['unusable','其他職業專用']].map(([id,label])=>`<option value="${id}" ${gearFilterJob===id?'selected':''}>${label}</option>`).join('')}</select></label>`}</div><p class="tiny">ATK／MATK 依裝備基礎值與詞綴篩選。${petOnly?'夥伴裝備不限角色職業。':'本職業可用包含通用裝備；穿戴等級仍需另外達標。'}</p>`;}
function matchesGear(g){return matchesGearFilters(g,ITEMS[g.id],{rarity:gearFilterRarity,tier:gearFilterTier,slot:gearFilterSlot,stat:gearFilterStat,job:gearFilterJob},player.job,gearTier(g.level));}

function renderTierGuide(){return `<details class="item" open><summary>裝備傳承 · 八大階段</summary><p>比較同部位、同物理／魔法用途：下一階普通裝備的核心最低值，高於上一階神話的核心最高值。詞條功能仍依配裝取捨。下列為武器ATK詞條範圍，不含角色屬性。</p>${GEAR_TIERS.map(t=>`<p><b>${t.name}</b> · Lv.${t.min}–${t.max} · 核心基準×${t.power}<br>普通ATK ${affixRange('atk',t.tier,'common').join('–')}／神話ATK ${affixRange('atk',t.tier,'mythic').join('–')}<br>${ITEMS[shardId('weapon',t.tier)].name}／${ITEMS[shardId('armor',t.tier)].name}</p>`).join('')}<p>普通2詞／稀有3詞／罕見4詞／傳說5詞／神話6詞；同階數值係數×1／1.12／1.28／1.48／1.72。舊裝備已同步換算，保留身分、等級、品質、穿戴位置及既有可用詞條方向。</p></details>`;}
function renderCrafting(){
 const all=[...Object.entries(GEAR_BASE),...Object.entries(PET_GEAR_BASE)];
 const selected=ITEMS[craftBase]?.slot||ITEMS[craftBase]?.petSlot?craftBase:'blade',group=gearGroup(selected),id=shardId(group,craftTier),owned=player.bag.find(e=>e.id===id)?.qty||0;
 const salvage=`<div class="item"><b>♻ 掛機自動分解／保留規則</b><p>新掉落裝備與勾選的背包掃描共用這套規則。<strong>符合保留條件的留下，其他分解。</strong> 勾選要參與判斷的條件。</p><div class="auto-options"><label><input type="checkbox" data-autosalvage ${player.autoSalvage?'checked':''}> 啟用掛機自動分解</label><label><input type="checkbox" data-salvageotherjobs ${player.salvageOtherJobs?'checked':''}> 自動分解本職業無法使用的裝備</label><p class="tiny">只判斷職業限制，不因等級不足而分解。此選項優先於其他保留條件；通用裝備與夥伴裝備仍依原規則處理，融合目標與換裝保護裝備不分解。</p></div><div class="gear-filters"><label>保留方式<select data-salvagemode><option value="any" ${player.salvageMatchMode==='any'?'selected':''}>符合任一條即保留</option><option value="two" ${player.salvageMatchMode==='two'?'selected':''}>至少符合兩條才保留</option><option value="all" ${player.salvageMatchMode==='all'?'selected':''}>全部符合才保留</option></select></label><label><input type="checkbox" data-keeprarity ${player.keepRarity?'checked':''}> 依稀有度保留<select data-salvagelimit>${RARITIES.map(r=>`<option value="${r.id}" ${player.salvageMaxRarity===r.id?'selected':''}>${r.name}及以上</option>`).join('')}</select></label><label><input type="checkbox" data-keeptier ${player.keepTier?'checked':''}> 依階級保留<select data-salvagetier>${TIER_NAMES.map((name,i)=>`<option value="${i+1}" ${player.salvageMaxTier===i+1?'selected':''}>${name}階及以上</option>`).join('')}</select></label><label><input type="checkbox" data-keepstat ${player.keepStat?'checked':''}> 依詞條保留<select data-salvagestat>${SALVAGE_STATS.map(s=>`<option value="${s}" ${player.salvageStat===s?'selected':''}>${s}</option>`).join('')}</select></label><label>詞條數值達到<input data-salvagevalue type="number" min="0" max="999" value="${player.salvageStatBelow}" ${!player.keepStat?'disabled':''}></label></div><p class="tiny">例：勾選「罕見及以上」「星輝階及以上」「STR ≥ 3」，可選符合 1、2、3 條才保留。缺少 STR 視為 0。</p><p class="tiny">未勾選的條件不參與判斷；若保留條件全部取消，僅執行已勾選的職業不符分解；職業選項也關閉時不自動分解任何裝備。普通 1、稀有 2、罕見 3、傳說 5、神話 8 塊碎晶。</p></div>`;
 const craft=`<div class="item"><b>⚒ 同階指定裝備融合</b><p>同階武器或防具碎晶 ×8；夥伴裝備使用防具碎晶。</p><div class="gear-filters"><label>階級<select data-crafttier>${TIER_NAMES.map((name,i)=>`<option value="${i+1}" ${craftTier===i+1?'selected':''}>${name}階 Lv.${GEAR_TIERS[i].min}–${GEAR_TIERS[i].max}</option>`).join('')}</select></label><label>指定裝備<select data-craftbase>${all.map(([key,g])=>`<option value="${key}" ${selected===key?'selected':''}>${g.petSlot?'夥伴'+PET_SLOTS[g.petSlot]:SLOTS[g.slot]}｜${g.name}</option>`).join('')}</select></label></div><p class="tiny">材料：${ITEMS[id].name} · 持有 ${owned}/8</p><button data-craft ${owned<8?'disabled':''}>融合指定裝備（消耗 8 塊）</button></div>`;
 const active=[player.keepRarity&&`${RARITIES.find(r=>r.id===player.salvageMaxRarity)?.name}以上`,player.keepTier&&`${TIER_NAMES[player.salvageMaxTier-1]}階以上`,player.keepStat&&`${player.salvageStat} ≥ ${player.salvageStatBelow}`].filter(Boolean),rule=player.salvageMatchMode==='all'?'全部':player.salvageMatchMode==='two'?'至少兩條':'至少一條';
 const eligible=player.bag.filter(g=>(ITEMS[g.id]?.slot||ITEMS[g.id]?.petSlot)&&shouldAutoSalvage(g,player)).length;
 const status=`<div class="salvage-status ${player.autoSalvage?'enabled':'disabled'}"><b>${player.autoSalvage?'● 自動分解已啟用':'○ 自動分解未啟用'}</b><p>${!player.autoSalvage?'目前所有裝備掉落都會進背包。':active.length?`保留：${active.join('、')}；符合${rule}才留下，其餘自動拆解。`:(player.salvageOtherJobs?'職業不符的裝備自動分解，其餘保留。':'尚未勾選保留條件，所有裝備保留。')}</p><div class="salvage-existing"><label><input type="checkbox" data-salvageinventory ${player.salvageInventory?'checked':''}> 同時自動整理背包原有的未穿戴裝備</label><p>僅處理背包，絕不拆解角色與夥伴正在穿戴的裝備。${player.autoSalvage?`${player.salvageOtherJobs?'職業不符優先分解。':''}目前符合分解條件：${eligible} 件。`:''}</p><button data-salvagebatch ${!player.autoSalvage||!eligible?'disabled':''}>立即整理背包（${eligible} 件）</button></div></div>`;
 return renderAutoFusion()+status+salvage+craft+'<div class="item"><b>稀有度機率</b><p>普通 70% · 稀有 25% · 罕見 4% · 傳說 0.9% · 神話 0.1%。只有神話會出現特殊詞綴；傳說保有更高核心數值與5條一般詞綴；品質同時提高核心數值與詞條數量。首領裝備另採罕見70%／傳說25%／神話5%。</p></div>';
}
function ownerAttributeEffects(){const a=effectiveAttributes(),d=attributeDetails();return {'近距離物理傷害%':((1+a.STR*.008)*(1+d.potential.STR)-1)*100,'遠距離物理傷害%':((1+a.DEX*.008)*(1+d.potential.DEX)-1)*100,'魔法傷害%':((1+a.INT*.008)*(1+d.potential.INT)-1)*100,'溢出閃避率%':d.potential.AGI*100};}
function cardComparison(cardId,slot=cardCompareSlots[cardId]||CARDS[cardId]?.slots?.[0]){
 const card=CARDS[cardId];if(!card||!cardAllowedInSlot(card,slot))return '';
 const previous=CARDS[player.sockets[slot]];
 const oldEffects=previous?cardEffectsFor(previous,player.level):{},newEffects=cardEffectsFor(card,player.level);
 const keys=[...new Set([...Object.keys(oldEffects),...Object.keys(newEffects)])];
 const percent=new Set(['atkPct','matkPct','hpPct','defPct','mdefPct','magicDamage','aspdPct','critDmg','damageReduction','ignoreDef','crit']);
 const changes=keys.map(k=>({key:k,old:Number(oldEffects[k]||0),next:Number(newEffects[k]||0)})).map(c=>({...c,delta:Number((c.next-c.old).toFixed(2))}));
 const up=changes.filter(c=>c.delta>0),down=changes.filter(c=>c.delta<0);
 const kind=up.length&&down.length?'mixed':down.length?'negative':up.length?'positive':'neutral';
 const verdict=up.length&&down.length?'能力各有優勢':down.length?'能力偏向舊卡':up.length?'能力偏向新卡':'基本能力相同';
 const trait=c=>c?.description?.split('專屬效果：')[1]?.replace(/。\s*$/,'')||'無額外專屬觸發';
 const statRows=changes.map(({key,old,next,delta})=>{const unit=percent.has(key)||key.endsWith('Pct')?'%':'',sign=delta>0?'up':delta<0?'down':'zero';return `<div class="card-compare-stat"><span>${escapeHtml(CARD_EFFECT_LABELS[key]||key)}</span><span>${formatCardNumber(old)}${unit} → ${formatCardNumber(next)}${unit}</span><b class="delta-${sign}">${delta>0?'+':''}${formatCardNumber(delta)}${unit?' 個百分點':''}</b></div>`;}).join('');
 return `<section class="gear-compare comparison-v2 card-comparison-v2"><div class="compare-slot-label">${escapeHtml(SLOTS[slot])}部位 · 卡片替換預覽</div><div class="compare-direction"><div class="compare-source"><small>目前鑲嵌 · 將卸下</small><strong>${escapeHtml(previous?.name||'空插槽')}</strong></div><span class="compare-arrow" aria-label="替換為">→</span><div class="compare-target"><small>背包候選 · 將鑲入</small><strong>${escapeHtml(card.name)}</strong></div></div><div class="compare-verdict ${kind}"><b>${verdict}</b><span class="delta-up">▲ ${up.length} 項增加</span><span class="delta-down">▼ ${down.length} 項減少</span></div><div class="card-compare-effect-title">基本能力差異</div><div class="card-compare-stat-list">${statRows||'<p>沒有可比較的基本能力詞條</p>'}</div><details class="compare-details"><summary>檢視兩張卡片的完整功能與特殊觸發</summary><div class="card-effect-compare"><div class="compare-source"><small>目前卡片</small><strong>${escapeHtml(previous?.name||'無')}</strong><p>${previous?escapeHtml(cardDescription(previous,player.level)):'目前沒有卡片效果'}</p><b>特殊觸發</b><p>${escapeHtml(trait(previous))}</p></div><div class="compare-target"><small>候選卡片</small><strong>${escapeHtml(card.name)}</strong><p>${escapeHtml(cardDescription(card,player.level))}</p><b>特殊觸發</b><p>${escapeHtml(trait(card))}</p></div></div></details><small class="compare-caution">上方僅比較基本能力數值；首領卡的特殊觸發可能改變實戰結果，無法單靠增減項數判斷。</small></section>`;
}
function renderCardCollection(){
 let album;
 try{album=readCardCollection(localStorage,CARDS);}catch(error){return `<section class="item"><h3>📖 ${CARD_COLLECTION_NPC}</h3><p class="bad">${escapeHtml(error.message)}</p><p>已保留原收藏資料，請備份後再修復。</p></section>`;}
 const progress=collectionProgress(CARDS,album),toCollect=collectableFromPlayer(player,CARDS,album),saved=new Set(album.ids),unlocks=new Set(collectionMilestones(CARDS,album)),opt=album.options;
 const grouped={icarus:new Map(),sky:new Map(),dawn:new Map()};
 for(const id of collectibleCardIds(CARDS)){const card=CARDS[id],continent=continentFor(card.map);if(!grouped[continent])grouped[continent]=new Map();if(!grouped[continent].has(card.map))grouped[continent].set(card.map,[]);grouped[continent].get(card.map).push(id);}
 const bossAll=collectibleCardIds(CARDS).filter(id=>CARDS[id].boss),bossOwned=bossAll.filter(id=>saved.has(id));
 let html=`<section class="item"><h3>📖 ${CARD_COLLECTION_NPC}</h3><p>八角色共用收藏冊。首次收錄消耗未鑲嵌的1張；可取回背包。自動收藏及重複回收均不處理首領卡片。</p><h3>總進度 ${progress.owned}/${progress.total}（${progress.total?Math.floor(progress.owned/progress.total*100):0}%）</h3><p>首領 ${bossOwned.length}/${bossAll.length} · 本角色待收錄 ${toCollect.length} 種</p><button data-card-collect-all ${toCollect.length?'':'disabled'}>一鍵收錄未收藏卡片（${toCollect.length} 張）</button></section>`;
 html+=`<section class="item"><h3>自動收藏與重複卡管理</h3><p class="muted">以下設定八角色共用；預設關閉。自動整理只處理一般怪物卡片，不處理首領卡片；取回的卡片不會立即自動收回。已鑲嵌卡片不會被處理。</p><label class="setting-toggle"><input type="checkbox" data-album-setting="autoCollect" ${opt.autoCollect?'checked':''}>自動收入尚未收藏的卡片（每種1張）</label><label class="setting-toggle"><input type="checkbox" data-album-setting="autoRecycle" ${opt.autoRecycle?'checked':''}>多餘的重複卡片自動轉為回收點數</label><label>每種卡片保留張數<select data-album-keep>${[1,3,5].map(n=>`<option value="${n}" ${opt.keepCopies===n?'selected':''}>${n} 張（不含已鑲嵌）</option>`).join('')}</select></label><button data-album-organize>立即整理本角色重複卡片</button></section>`;
 html+=`<section class="item"><h3>八角色共用收藏里程碑</h3><p>目前金幣收入額外 ×${(1+collectionGoldBonus(CARDS,album)/100).toFixed(2)}，與黃金收藏分開計算；獎勵只採最高階，不疊加。已解鎖不會因新增卡片而取消。</p>${CARD_COLLECTION_MILESTONES.map(m=>`<p>${unlocks.has(m.pct)?'✓':'○'} ${m.pct}% · ${m.title}${m.bonus?' · 金幣收入 +'+m.bonus+'%':''} ${unlocks.has(m.pct)?'（已解鎖）':''}</p>`).join('')}</section>`;
 html+=`<details class="item" data-ui-key="album-withdraw"><summary>從收藏冊取回卡片（已收藏 ${album.ids.length} 張）</summary><p>取回一張到目前角色背包，該卡片暫停自動收入；可再手動收錄。</p><div class="card-collection-grid">${album.ids.filter(id=>CARDS[id]).map(id=>`<div><span>${escapeHtml(CARDS[id].name)}${CARDS[id].boss?' ♛ 首領':''}</span> <button data-album-withdraw="${escapeHtml(id)}">取回一張</button></div>`).join('')||'目前沒有已收藏卡片'}</div></details>`;
 html+=`<details class="item" data-ui-key="album-boss"><summary>♛ 全部首領卡片 · ${bossOwned.length}/${bossAll.length}</summary><div class="card-collection-grid">${bossAll.map(id=>`<span class="${saved.has(id)?'collected':'missing'}">${saved.has(id)?'✓':'○'} ${escapeHtml(CARDS[id].name)} · ${escapeHtml(MAPS[CARDS[id].map]?.name||CARDS[id].map)}</span>`).join('')}</div></details>`;
 for(const continent of ['icarus','sky','dawn']){
  const groups=grouped[continent],all=[...groups.values()].flat(),count=all.filter(id=>saved.has(id)).length;
  html+=`<details class="item" data-ui-key="album-continent-${continent}"><summary>${CONTINENTS[continent]?.name||continent} · ${count}/${all.length} 種</summary>`;
  if(!all.length)html+='<p>此大陸目前尚無可收藏卡片。</p>';
  for(const [map,ids] of groups){
   const ownCount=ids.filter(id=>saved.has(id)).length,boss=ids.filter(id=>CARDS[id].boss),bossCount=boss.filter(id=>saved.has(id)).length;
   html+=`<details class="item" data-ui-key="album-map-${map}"><summary>${escapeHtml(MAPS[map]?.name||map)} · ${ownCount}/${ids.length}（首領 ${bossCount}/${boss.length}）</summary><div class="card-collection-grid">${ids.sort((a,b)=>Number(CARDS[a].boss)-Number(CARDS[b].boss)).map(id=>`<span class="${saved.has(id)?'collected':'missing'}">${saved.has(id)?'✓':'○'} ${escapeHtml(CARDS[id].name)}${CARDS[id].boss?' ♛ 首領':''}<small> · ${(CARDS[id].slots||[]).map(s=>SLOTS[s]||s).join('／')}</small></span>`).join('')}</div></details>`;
  }
  html+='</details>';
 }
 return html;
}
async function updateAlbumSettings(key,value){
 if(!isTown(player.location))return toast('請回村莊找星頁典藏師・露娜');
 const action=()=>{const album=readCardCollection(localStorage,CARDS),next=normalizedCollection({...album,options:{...album.options,[key]:value}},CARDS);localStorage.setItem(CARD_COLLECTION_KEY,JSON.stringify(next));save();renderSide(true);toast('八角色共用收藏設定已更新');};
 try{if(navigator.locks?.request)await navigator.locks.request(CARD_COLLECTION_LOCK,{mode:'exclusive'},action);else action();}catch(error){toast('設定更新失敗：'+error.message);}
}
async function manuallyRecycleDuplicates(){
 if(!isTown(player.location))return toast('請回村莊找星頁典藏師・露娜');
 const action=()=>{
  const album=readCardCollection(localStorage,CARDS),before=structuredClone(player),prepared=normalizedCollection({...album,options:{...album.options,autoCollect:false,autoRecycle:true}},CARDS);
  const result=organizeCards(player,CARDS,prepared);
  if(!result.recycled)return toast('沒有超出保留數量的重複卡片');
  if(!confirm(`確定回收 ${result.recycled} 張多餘卡片，取得 ${result.points} 點？`)){player=before;return;}
  if(!save()){player=before;return toast('儲存失敗，整理已取消');}
  render();renderSide(true);toast(`已回收 ${result.recycled} 張卡片，取得 ${result.points} 點`);
 };
 try{if(navigator.locks?.request)await navigator.locks.request(CARD_COLLECTION_LOCK,{mode:'exclusive'},action);else action();}catch(error){toast('整理失敗：'+error.message);}
}

async function collectCardAlbum(){
 if(!isTown(player.location))return toast('請回村莊找星頁典藏師・露娜');
 const action=()=>{
  const collection=readCardCollection(localStorage,CARDS);
  const ids=collectableFromPlayer(player,CARDS,collection);
  if(!ids.length)return toast('目前沒有可新增的卡片收藏');
  if(!confirm(`確定將 ${ids.length} 張未收藏卡片放入八角色共用收藏冊？每種消耗 1 張，可隨時從收藏冊取回。`))return;
  const beforePlayer=structuredClone(player),raw=localStorage.getItem(CARD_COLLECTION_KEY),result=collectMissingCards(player,CARDS,collection);
  if(result.error)return toast(result.error);
  try{
   localStorage.setItem(CARD_COLLECTION_KEY,JSON.stringify(result.collection));
   if(!save())throw Error('角色儲存失敗');
  }catch(error){
   player=beforePlayer;
   try{if(raw===null)localStorage.removeItem(CARD_COLLECTION_KEY);else localStorage.setItem(CARD_COLLECTION_KEY,raw);}catch{}
   return toast(`收藏失敗：${error.message}`);
  }
  render();renderSide(true);toast(`成功收錄 ${result.ids.length} 種卡片！八個角色可共用進度`);
 };
 try{
  if(navigator.locks?.request)await navigator.locks.request(CARD_COLLECTION_LOCK,{mode:'exclusive'},action);
  else action();
 }catch(error){toast(`收藏操作失敗：${error.message}`);}
}

async function withdrawAlbumCard(id){
 if(!isTown(player.location))return toast('請回村莊找星頁典藏師・露娜');
 const action=()=>{
  const album=readCardCollection(localStorage,CARDS);
  if(!album.ids.includes(id))return toast('收藏冊內已沒有這張卡片');
  if(!confirm('確定從共用收藏取回 '+CARDS[id].name+'？將放入目前角色背包。'))return;
  const previous=structuredClone(player),raw=localStorage.getItem(CARD_COLLECTION_KEY);
  const result=withdrawCollectedCard(player,CARDS,album,id);
  if(result.error)return toast(result.error);
  try{
   localStorage.setItem(CARD_COLLECTION_KEY,JSON.stringify(result.collection));
   if(!save())throw Error('角色儲存失敗');
  }catch(error){
   player=previous;
   try{if(raw===null)localStorage.removeItem(CARD_COLLECTION_KEY);else localStorage.setItem(CARD_COLLECTION_KEY,raw);}catch{}
   return toast('取回失敗：'+error.message);
  }
  render();renderSide(true);toast('已取回 '+CARDS[id].name+' 至背包');
 };
 try{if(navigator.locks?.request)await navigator.locks.request(CARD_COLLECTION_LOCK,{mode:'exclusive'},action);else action();}catch(error){toast('取回失敗：'+error.message);}
}

function renderCardRecycler(){
 const points=cardRecyclePoints(player),total=player.cards.reduce((n,c)=>n+c.qty,0);
 const options=player.cards.filter(x=>CARDS[x.id]&&x.qty>0).sort((a,b)=>Number(CARDS[a.id].boss)-Number(CARDS[b.id].boss)||CARDS[a.id].name.localeCompare(CARDS[b.id].name,'zh-Hant'));
 let html=`<section class="item"><h3>✧ 命運卡片鍊成師</h3><p>所有大陸共用抽卡池：一般卡 99%，首領卡 1%。每抽消耗 ${CARD_DRAW_COST} 點，不收金幣；不保底、不限制次數。</p><h3>目前回收點數：${points.toLocaleString()} 點</h3><p>一般卡回收 10 點／張；首領卡回收 100 點／張。僅能回收未鑲嵌卡片。</p></section>`;
 html+=`<section class="item"><h3>隨機抽取</h3><div class="panel-shortcuts">${[1,10,100].map(count=>`<button data-card-draw="${count}" ${points<count*CARD_DRAW_COST?'disabled':''}>抽 ${count} 次 · ${(count*CARD_DRAW_COST).toLocaleString()} 點</button>`).join('')}</div>${cardDrawResults.length?`<details open><summary>上次抽卡結果 · ${cardDrawResults.length} 張（首領 ${cardDrawResults.filter(id=>CARDS[id]?.boss).length} 張）</summary><p>${Object.entries(cardDrawResults.reduce((o,id)=>(o[id]=(o[id]||0)+1,o),{})).map(([id,qty])=>`<span class="${CARDS[id]?.boss?'rarity':''}">${escapeHtml(CARDS[id]?.name||id)} ×${qty}</span>`).join('、')}</p></details>`:''}</section>`;
 html+=`<section class="item"><h3>卡片回收 · 目前持有 ${total} 張</h3><button data-card-recycle-duplicates ${options.some(x=>x.qty>1)?'':'disabled'}>批次回收重複卡（每種保留 1 張）</button><p class="muted">已鑲嵌的卡片不在清單內。批次回收前會再次確認。</p></section>`;
 if(!options.length)html+='<div class="empty">目前沒有可回收卡片。</div>';
 html+=options.map(({id,qty})=>{const card=CARDS[id],value=cardRecycleValue(card),selected=Math.min(qty,Math.max(1,Math.floor(Number(cardRecycleQuantities[id])||1)));return `<div class="item"><b>${escapeHtml(card.name)} ×${qty}</b><p>${card.boss?'首領卡片':'一般卡片'} · 每張 ${value} 點</p><label>回收張數<input type="number" min="1" max="${qty}" value="${selected}" data-card-recycle-qty="${id}"></label><button data-card-recycle="${id}">回收 ${selected} 張（${(selected*value).toLocaleString()} 點）</button></div>`;}).join('');
 return html;
}
function recycleOwnedCards(choices){
 if(!isTown(player.location))return toast('請回村莊找命運卡片鍊成師');
 const gain=choices.reduce((n,x)=>n+x.qty*cardRecycleValue(CARDS[x.id]),0);
 if(!gain||!confirm(`確定回收 ${choices.reduce((n,x)=>n+x.qty,0)} 張卡片，換取 ${gain.toLocaleString()} 點？回收後無法復原。`))return;
 const previous=structuredClone(player),result=recycleCards(player,CARDS,choices);
 if(result.error)return toast(result.error);
 if(!save()){player=previous;return toast('儲存失敗，回收已取消');}
 cardRecycleQuantities={};cardDrawResults=[];render();renderSide(true);toast(`已回收卡片，取得 ${result.gain.toLocaleString()} 點`);
}
function drawCardRecycling(count){
 if(!isTown(player.location))return toast('請回村莊找命運卡片鍊成師');
 const previous=structuredClone(player),result=drawRecycledCards(player,CARDS,count);
 if(result.error)return toast(result.error);
 if(!save()){player=previous;return toast('儲存失敗，抽卡已取消');}
 cardDrawResults=result.drawn;render();renderSide(true);for(const id of result.drawn)if(CARDS[id]?.boss)queueBossCardNotice(id);
 toast(`抽取 ${count} 張完成！首領卡片 ${result.bossCount} 張`);
}

function renderCards(){
 let html=`<div class="item"><b>怪物卡片庫 · ${player.cards.reduce((n,c)=>n+c.qty,0)} 張未鑲嵌</b><p>每張卡片限指定部位，每部位1張。已鑲卡片及能力請至「角色 → 角色裝備」查看。卡片綁定角色部位並持續生效，換裝、卸裝、雙手武器與轉職皆保留；只有手動卸卡或換卡才會退回卡片庫。負面效果同樣生效。</p><label>篩選卡片部位<select data-card-filter-slot><option value="all">全部部位</option>${Object.entries(SLOTS).map(([slot,label])=>`<option value="${slot}" ${cardFilterSlot===slot?'selected':''}>${label}</option>`).join('')}</select></label></div>`;
 const returned=player.cardBindingMigration?.returned||[];if(returned.length)html+=`<div class="item quest-ready"><b>舊存檔卡片已安全整理</b><p>上次整理有 ${returned.length} 張不符合新部位限制，已卸回下方卡片庫；合法卡片原位保留。</p>${returned.map(x=>`<p>${CARDS[x.id]?.name||x.id}：原 ${SLOTS[x.slot]} → 卡片庫</p>`).join('')}</div>`;
 const held=player.cards.filter(({id})=>cardFilterSlot==='all'||cardAllowedInSlot(CARDS[id],cardFilterSlot)).sort((a,b)=>Number(!!CARDS[b.id]?.boss)-Number(!!CARDS[a.id]?.boss));if(!held.length)html+='<div class="empty">此篩選下尚無可用卡片。</div>';
 html+=held.map(({id,qty})=>{const card=CARDS[id],slots=card.slots,slot=cardFilterSlot!=='all'?cardFilterSlot:slots.includes(cardCompareSlots[id])?cardCompareSlots[id]:slots[0];return `<div class="item ${card.boss?'boss-card-item':''}" style="${card.boss?'border:2px solid #d9ae52;background:linear-gradient(120deg,rgba(118,79,24,.22),rgba(45,32,69,.26));box-shadow:inset 0 0 20px rgba(240,195,81,.08)':''}"><div class="itemhead"><b>${card.boss?'♛ 首領卡片 · ':'✦ '}${escapeHtml(card.name)} <span class="stack-count">×${qty}</span></b><span class="rarity" style="${card.boss?'color:#ffe2a0;background:#67451f;padding:4px 9px;border-radius:12px':''}">${card.boss?'♛ 首領卡片':'特色卡片'}</span></div><p>${cardDescription(card,player.level)}</p><b>限定部位：${slots.map(s=>SLOTS[s]).join('／')}</b>${slots.length>1&&cardFilterSlot==='all'?`<label>選擇比較部位<select data-card-compare-slot="${id}">${slots.map(s=>`<option value="${s}" ${slot===s?'selected':''}>${SLOTS[s]} · ${CARDS[player.sockets[s]]?.name||'空插槽'}</option>`).join('')}</select></label>`:''}${cardComparison(id,slot)}<button data-socket="${id}:${slot}">鑲入${SLOTS[slot]}${player.sockets[slot]?'（替換現有卡片）':''}</button></div>`;}).join('');
 return html;}

const BAG_GROUPS={consumables:'消耗品',equipment:'角色裝備',petEquipment:'夥伴裝備',cards:'卡片',junk:'雜物',tickets:'入場券',enhancements:'階段強化',dawnJunk:'曙界雜物',quests:'任務道具',shards:'裝備碎片',materials:'進化材料'};
function bagGroup(entry){const it=ITEMS[entry.id];return it.enhancement?'enhancements':it.dawnJunk?'dawnJunk':it.slot?'equipment':it.petSlot?'petEquipment':it.ticket?'tickets':it.quest?'quests':it.craft?'shards':it.junk?'junk':it.evolution?'materials':'consumables';}
function renderBag(){const indexed=player.bag.map((entry,index)=>({entry,index})),count=type=>indexed.filter(x=>bagGroup(x.entry)===type).length;
 const bulk=bulkSaleQuote(player,ITEMS,bagGroup,bagCategory,manualSalePrice,rankOf);
 let html=`<p class="muted">背包共 ${player.bag.length} 格 · 藥水／碎晶／雜物堆疊，裝備獨立</p><div class="bag-filters">${Object.entries(BAG_GROUPS).map(([id,name])=>`<button data-bagcategory="${id}" class="${bagCategory===id?'active':''}">${name} ${id==='cards'?player.cards.reduce((n,c)=>n+c.qty,0):count(id)}</button>`).join('')}</div>${['equipment','petEquipment'].includes(bagCategory)?equipmentFilters(bagCategory==='petEquipment'):''}`;
 if(bagCategory==='petEquipment'&&isSpiritJob(player.job))html+=dualPetSelector();if(bagCategory==='cards')return html+renderCards();
 const entries=indexed.filter(x=>bagGroup(x.entry)===bagCategory&&(!['equipment','petEquipment'].includes(bagCategory)||matchesGear(x.entry)));const paged=['equipment','petEquipment'].includes(bagCategory),pageSize=30,totalPages=Math.max(1,Math.ceil(entries.length/pageSize));bagGearPage=Math.min(bagGearPage,totalPages-1);if(paged)html+=`<div class="item"><small>符合條件 ${entries.length} 件 · 第 ${bagGearPage+1}/${totalPages} 頁（每頁最多 30 件）</small><div class="gear-actions"><button data-bag-page="-1" ${bagGearPage===0?'disabled':''}>上一頁</button><button data-bag-page="1" ${bagGearPage>=totalPages-1?'disabled':''}>下一頁</button></div></div>`;html+=(paged?entries.slice(bagGearPage*pageSize,(bagGearPage+1)*pageSize):entries).map(({entry,index:i})=>{const it=ITEMS[entry.id],gear=!!(it.slot||it.petSlot),petGear=!!it.petSlot,sale=bulk.entries.find(x=>x.index===i);return `<div class="item" data-ui-key="bag-${escapeHtml(entry.uid||entry.id)}"><div class="itemhead"><div>${gear?equipmentLine(entry):`<b>${escapeHtml(it.name)}</b><span class="stack-count">×${entry.qty}</span>`}<p>${gear?`需求 ${petGear?'夥伴':'Base'} Lv.${entry.level} · ${petGear?'夥伴'+PET_SLOTS[it.petSlot]:SLOTS[it.slot]}${it.hands===2?' · 雙手武器':''}`:it.enhancement||it.dawnJunk?it.description:it.ticket?it.description:it.thirdSeal?it.description:it.quest?(it.breakthrough?'預備聖證 · 不自動出售（不是天極覺醒聖印）':'轉生任務材料 · 不自動出售'):it.craft?'可用於相同階級裝備融合':it.junk?'雜物，可出售':it.evolution?it.description:it.capture?'捕捉道具':it.heal?`恢復 HP ${potionRestore(it,'hp',player.level,stat('hp'))}${it.healPct?'（Lv.51起含最大HP15%）':''}`:`恢復 SP ${potionRestore(it,'mp',player.level,stat('mp'))}${it.energyPct?'（Lv.51起含最大SP10%）':''}`}</p></div><div class="gear-actions">${it.junk||it.craft||it.evolution||it.quest?'':`<button data-use="${i}" ${it.capture||gear&&(petGear?(selectedGearPet()?.level||0):ignoresGearLevel(player,entry)?999:player.level)<entry.level||gear&&!petGear&&it.jobs&&!it.jobs.includes(player.job)?'disabled':''}>${gear?'穿戴':'使用'}</button>`}${gear?`<button data-dismantle="${escapeHtml(entry.uid)}" class="manual-dismantle">手動分解</button>`:''}</div></div>${gear?'':`<div class="manual-sale-row"><label>出售數量<input type="number" min="1" max="${entry.uid?1:entry.qty}" data-sale-quantity="${escapeHtml(entry.uid||entry.id)}" value="${sellAmounts[entry.uid||entry.id]||1}" aria-label="${escapeHtml(it.name)}出售數量"></label><button data-manual-sale="${escapeHtml(entry.uid||entry.id)}">出售 · 每個${manualSalePrice(entry,it)}金</button></div>`}${sale?`<button class="wide" data-sell-stack="${escapeHtml(entry.uid||entry.id)}">一鍵販售此物品全部 ×${sale.qty} · ${sale.gold.toLocaleString()} 金</button>`:''}${gear?gearComparison(entry):''}${(it.heal||it.energy)&&activePet()?(isSpiritJob(player.job)?activePetRoster(player).map((pet,n)=>`<button data-petuse="${i}" data-pet-target="${escapeHtml(pet.id)}">給${n===0?'第一':'第二'}夥伴使用</button>`).join(''):`<button data-petuse="${i}">給夥伴使用</button>`):''}</div>`}).join('')||'<div class="empty">這個分類還沒有物品。</div>';return html;}
function renderAutoBuy(){return `<div class="item autobuy-panel"><b>🛒 掛機自動購買藥水</b><p>藥水由玩家和夥伴共用背包。庫存少於設定瓶數時，自動用金幣補到目標數量；不足額時只購買負擔得起的數量。</p>${[['hp','HP 紅水',['red_small','red_mid','red_large']],['sp','SP 藍水',['blue_small','blue_mid','blue_large']]].map(([type,name,ids])=>{const c=player.autoBuyPotions[type];return `<div class="autobuy-row"><label class="autobuy-check"><input type="checkbox" data-autobuy-enabled="${type}" ${c.enabled?'checked':''}> ${name}自動補貨</label><label>選擇藥水<select data-autobuy-id="${type}">${ids.map(id=>`<option value="${id}" ${c.id===id?'selected':''}>${ITEMS[id].name} · ${ITEMS[id].cost} 金</option>`).join('')}</select></label><label>少於幾瓶時<input type="number" min="0" max="200" data-autobuy-min="${type}" value="${c.min}"></label><label>補到幾瓶<input type="number" min="1" max="200" data-autobuy-target="${type}" value="${c.target}"></label><small>目前持有 ${player.bag.find(e=>e.id===c.id)?.qty||0} 瓶</small></div>`}).join('')}</div>`;}
function renderAscensionDetails(p){if(fusedPair(p))return `<p>融合形態：${fusedPair(p).name} · 等級上限200 · ${fusedPair(p).style}</p>`;const cost=ascensionCost(p),reason=ascensionError(p,player.bag,player.location);return `<p>界限進化素材：超越靈核 ${cost.essence_4}＋蒼穹界限靈髓 ${cost.ascension_core}；消耗忠誠度 ${ASCENSION_LOYALTY}（目前 ${p.loyalty||0}／${LOYALTY_MAX}）。${p.rarity==='mythic'?'原有神話維持神話。':'保證提升／維持傳說；不抽神話。'}</p><button data-pet-ascend="${p.id}" ${reason?'disabled':''}>${reason||'進行界限進化'}</button>${p.ascended&&p.rarity==='legendary'?`<p>獨立神話異化：超越靈核50＋界限靈髓20，成功率15%；失敗維持傳說。</p><button data-pet-mutate="${p.id}" ${ascensionError(p,player.bag,player.location,'mutate')?'disabled':''}>嘗試神話異化（15%）</button>`:''}`;}
function renderEvolution(showAtlas=false){if(!['common','rare','uncommon'].includes(evolutionArtRarity))evolutionArtRarity='uncommon';return `<section class="item evolution-altar"><div class="eyebrow">COMPANION EVOLUTION</div><h3>✦ 村莊夥伴進化</h3><p>達 Lv.20／40／60／80 後，回城消耗靈核進化。一般品質沿原物種成長；晉升傳說或神話時，會變異成另一種族，整條進化路線、名稱與立繪同步改變。升級不會自動進化。</p><p>普通／稀有／罕見為同型態的不同色彩；傳說與神話則是兩種獨立的種族變異，各有專屬名稱與造型。20～80級的一般進化仍有機會提升品質或變異神話。99級界限進化保證到傳說，不抽神話；原有神話維持神話。</p><details><summary>查看一般品質進化圖鑑</summary><div class="evolution-preview-controls"><label>外觀品質<select id="evolutionArtSelect">${PET_RARITIES.slice(0,3).map(r=>`<option value="${r.id}" ${r.id===evolutionArtRarity?'selected':''}>${r.name}</option>`).join('')}</select></label></div>${Object.entries(PET_FAMILIES).map(([species,role])=>`<h4>${SPECIES[species].roleName}</h4>${PET_PALETTES[evolutionArtRarity]?.[role]?`<p class="pet-palette-note">${PET_PALETTES[evolutionArtRarity][role]} · 專屬配色</p>`:''}<div class="evolution-route">${petRoute({species,rarity:evolutionArtRarity}).map((name,i)=>`<div class="evolution-form">${petSprite({species,evolution:i,rarity:evolutionArtRarity},'evolution')}<small>Lv.${i?i*20:1}</small><b>${name}</b></div>`).join('')}</div>`).join('')}<div class="mutation-mystery"><b>✦ 傳說變異</b><p>可變異進化至傳說品質，成功時揭曉專屬形態。</p><b>✧ 神話覺醒</b><p>任何品質夥伴均有機會直接變異為神話品質，外觀將在成功後揭曉。</p></div></details><details><summary>進化素材與持有數量</summary>${PET_EVOLUTIONS.map((s,i)=>`<p>第 ${i+1} 階 Lv.${s.level}：${ITEMS[s.id].name} ×${s.count} · 持有 ${player.bag.find(e=>e.id===s.id)?.qty||0}<br><small>怪物 ${s.range} 掉落率 22%${i===3?'；Lv.81–99同樣掉落超越靈核':''}</small></p>`).join('')}</details><details><summary>靈核合成 · 低階 3 → 高階 1</summary><p>只能在城鎮合成，讓目前地圖也能取得最終進化素材。</p>${[1,2,3].map(i=>`<p>${ITEMS['essence_'+i].name} ×3 → ${ITEMS['essence_'+(i+1)].name} ×1 <button data-essence="${i}" ${!isTown(player.location)||(player.bag.find(e=>e.id==='essence_'+i)?.qty||0)<3?'disabled':''}>合成</button></p>`).join('')}</details></section>${renderPetFusion()}${player.pets.map(p=>{const step=nextPetEvolution(p),held=step?(player.bag.find(e=>e.id===step.id)?.qty||0):0,rarity=petRarity(p),chance=step?(step.mutation[rarity.id]||0):0,can=step&&p.level>=step.level&&held>=step.count&&isTown(player.location);return `<div class="item evolution-pet"><div class="evolution-pair"><div>${petSprite(p,'evolution')}<b class="grade-${rarity.id}">${escapeHtml(petForm(p)||SPECIES[p.species].name)}</b><small>${rarity.name} · 第 ${evolutionStage(p)} 階</small></div>${step?`<span class="evolution-arrow">→</span><div>${['legendary','mythic'].includes(p.rarity)?'<div class="unknown-form" aria-label="進化後形態尚未揭曉">?</div><b>未知的進化形態</b>':`${petSprite(p,'evolution',evolutionStage(p)+1)}<b>${escapeHtml(petForm(p,evolutionStage(p)+1)||SPECIES[p.species].name)}</b>`}<small>下一形態 · Lv.${step.level}</small></div>`:''}</div><p>夥伴：${escapeHtml(p.nickname)} · Lv.${p.level}</p>${step?`<p>${ITEMS[step.id].name} ${held}/${step.count} · 直達神話機率 ${(chance*100).toFixed(1)}%</p><small>預覽為目前品質的下一階；若升為傳說或神話，將轉入對應變異種族，名稱與立繪一起改變。</small><button data-evolve="${p.id}" ${can?'':'disabled'}>${!isTown(player.location)?'回城後可進化':p.level<step.level?`需要 Lv.${step.level}`:held<step.count?'素材不足':'執行進化'}</button>`:`<p>✦ ${p.ascended?'已完成界限進化':'已達一般最終形態'}</p>${renderAscensionDetails(p)}`}</div>`}).join('')}`;}

function openPanel(id){if(id==='sigilcraft'&&player.location!=='dawncity')return toast('請回曙光聖港拜訪契印師・曦紋');if(['reforge','collection','cardrecycle','cardcollection'].includes(id)&&!isTown(player.location))return toast('請回村莊拜訪 NPC');if(id==='shop'&&!isTown(player.location))return toast('商店只在村莊開放');if(id==='warehouse')return openWarehouseModal();if(['quests','guild'].includes(id)&&player.location!=='town')return toast('請回村莊辦理公會事務');if(['skills','gear','attributes','sigil'].includes(id)){characterSection=id;id='character';}if(id==='cards'){bagCategory='cards';id='bag';}if(id==='evolution'){petSection='manage';id='pets';}if(id==='reports')id='codex';tab=id;render();if(window.innerWidth<1100)$('collectionPanel')?.scrollIntoView({behavior:'smooth',block:'start'});}
function reforgeItems(){return [...Object.values(player.gear||{}),...player.bag,...player.pets.flatMap(p=>Object.values(p.gear||{}))].filter(g=>g?.uid&&g.affixes);}
function selectedReforgeItem(){return reforgeItems().find(g=>g.uid===reforgeTarget);}
function renderGoldCollection(){const tier=goldCollectionTier(player),bonus=goldCollectionBonus(player);return `<section class="item"><h3>♛ 黃金收藏館・鑄金典藏師</h3><p>永久收藏，依序解鎖。戰鬥金幣收入 +${bonus}%，只採用最高已解鎖階級，不疊加。</p><p>持有 ${player.gold.toLocaleString()} 金 · 金條折合總資產 ${goldWealth(player).toLocaleString()} 金</p></section>`+GOLD_COLLECTIBLES.map((r,i)=>`<div class="item"><b>${r.title}</b><p>${r.reward} · 戰鬥金幣 +${r.bonus}%</p><small>${r.cost.toLocaleString()} 金 · ${tier>i?'已解鎖':tier===i?'可購買':'需先解鎖上一階'}</small>${tier===i?`<button data-buy-gold-collection ${goldWealth(player)<r.cost?'disabled':''}>投入 ${r.cost.toLocaleString()} 金解鎖</button>`:''}</div>`).join('');}
function renderReforge(){const item=selectedReforgeItem(),locks=[...reforgeLocks],rank=item?rankOf(item):'',price=reforgePrice(locks.length,rank);return `<section class="item"><h3>⚒ 靈紋重鑄師</h3><p>最多鎖定三條詞條；S～SSS 裝備收費加倍。重洗後可選擇原本或新詞條，費用不退還。</p><p>持有 ${player.gold.toLocaleString()} 金</p></section><label class="item">選擇裝備<select data-reforge-select><option value="">請選擇人物或夥伴裝備</option>${reforgeItems().map(g=>`<option value="${escapeHtml(g.uid)}" ${item?.uid===g.uid?'selected':''}>${escapeHtml(g.name)} · ${escapeHtml(g.uid.slice(-5))}</option>`).join('')}</select></label>${!item?'':`<section class="item"><h3>${escapeHtml(item.name)} · ${rank||'未強化'}</h3>${Object.entries(item.affixes).map(([key,val])=>`<label class="setting-toggle"><input type="checkbox" data-reforge-lock="${key}" ${reforgeLocks.has(key)?'checked':''} ${reforgePreview||(!reforgeLocks.has(key)&&reforgeLocks.size>=3)?'disabled':''}> ${escapeHtml(affixLabel(key,val))}</label>`).join('')}<p>鎖定 ${locks.length} 條 · 本次 ${price.toLocaleString()} 金</p>${!reforgePreview?`<button data-reforge-roll ${player.gold<price?'disabled':''}>支付金幣重新鑄造</button>`:`<p>請選擇重鑄結果：</p><div class="item"><b>原本詞條</b><p>${Object.entries(item.affixes).map(([k,v])=>escapeHtml(affixLabel(k,v))).join('、')}</p><button data-reforge-keep="old">保留原本結果</button></div><div class="item"><b>重鑄後詞條</b><p>${Object.entries(reforgePreview.affixes).map(([k,v])=>escapeHtml(affixLabel(k,v))).join('、')}</p><button data-reforge-keep="new">採用新結果</button></div>`}</section>`}`;}
function chooseReforge(accept){const g=selectedReforgeItem();if(!g||!reforgePreview)return toast('裝備已不存在');const original=structuredClone(g.affixes);if(accept)g.affixes=reforgePreview.affixes;if(!save()){g.affixes=original;return;}reforgePreview=null;reforgeLocks.clear();dirty=true;render();toast(accept?'已採用新詞條':'已保留原詞條');}
function rollReforge(){if(!isTown(player.location)||!player.hp||reforgePreview)return;const g=selectedReforgeItem();if(!g)return toast('請選擇裝備');const price=reforgePrice(reforgeLocks.size,rankOf(g));if(price===null||player.gold<price)return toast('金幣不足');const preview=reforgeGear(g,[...reforgeLocks]);if(preview.error)return toast(preview.error);player.gold-=price;if(!save()){player.gold+=price;return;}reforgePreview=preview;dirty=true;render();}
function buyCollection(){if(!isTown(player.location)||!player.hp)return toast('請回村莊使用收藏館');const oldGold=player.gold,oldTier=player.goldCollectionTier,oldBag=structuredClone(player.bag),result=buyGoldCollectible(player);if(result.error)return toast(result.error);if(!save()){player.gold=oldGold;player.goldCollectionTier=oldTier;player.bag=oldBag;return;}dirty=true;render();toast(`已解鎖 ${result.reward.title}，戰鬥金幣收入 +${result.reward.bonus}%`);}
function renderAutomation(){return `<div class="item"><b>離線掛機 · 最多 24 小時</b><p>離開時開啟自動戰鬥，回來後依此角色的地圖、夥伴、技能與補給設定補算。死亡或背包接近容量上限時停止；城鎮及暫停戰鬥沒有收益。夥伴之地會依自動捕捉設定離線抓取；不會進化或融合。舊存檔首次進入後才開始記錄離線時間。</p></div><div class="item"><b>掛機設定</b><p>設定會自動儲存。補給使用背包中的藥水，只有開啟自動購買時才會花費金幣。</p><div class="panel-shortcuts"><button data-preset="safe">套用穩健掛機</button><button data-preset="manual">改用手動補給</button></div><small>穩健掛機：四種自動補給與終極共鳴開啟、遇首領逃走；不會自動開啟購買。</small></div><div class="item"><b>自動復活、首領避戰與共鳴</b><label class="setting-toggle"><input type="checkbox" data-auto-revive ${player.autoRevive?'checked':''}> 金幣自動復活（線上／離線）</label><p>只支付金幣原地復活；金幣不足會免費回城並停止掛機，不使用其他資源。</p><p>僅一般練功區有地圖首領，夥伴之地沒有首領。首領卡片掉率0.1%，一般怪物卡片0.2%。</p><label class="setting-toggle"><input type="checkbox" data-escape-boss ${player.autoEscapeBoss?'checked':''}> 遇到首領立即逃走</label><label class="setting-toggle"><input type="checkbox" data-autoultimate ${player.autoUltimate?'checked':''}> 能量足夠時自動施放終極共鳴</label></div>`+renderCaptureSettings()+renderJunkSettings()+renderPotionSettings()+renderAutoBuy()+`<button class="wide" data-open="salvage">前往工坊設定自動分解與融合</button>`;}
function renderOverview(){return (player.location==='dawncity'?'<div class="item"><button data-open="tower">✧ 天穹終境</button><button data-open="extreme">⚔ 四域極限試煉</button></div>':'')+`<div class="item overview-intro"><span class="eyebrow">ADVENTURE GUIDE</span><h3>${isCaptureSanctuary(player.location)?'尋找你的靈契夥伴':isTown(player.location)?'整備好，再出發':'正在冒險'}</h3><p>${mapRules(player.location).summary}</p>${!activePet()?'<p>可手動直接丟球，或在掛機設定選擇自動捕捉類型，不需壓低血量。</p>':''}<div class="panel-shortcuts"><button data-open="pets">管理夥伴</button><button data-open="bag">整理背包</button><button data-open="settings">掛機設定</button></div></div>`+renderFormation()+`<details class="item" data-ui-key="full-stats"><summary>查看人物與夥伴完整數值</summary>${renderCombatPanel()}</details>`;}
function renderSide(force=false){if(offlineSimulation)return;if(!force&&panelIsEditing($('side'))){updateSkillPointControls($('side'),player,JOB_SKILLS[player.job],!!SECOND_JOBS[player.job],skillUnlocked);return;}const requestedTab=tab,characterView=tab==='character';if(characterView)tab=characterSection;let html='';if(tab==='attributes')html=renderCharacterAttributes();else if(tab==='homecoming')html=renderHomecomingPanel(player);else if(tab==='quests')html=renderVillageQuests();else if(tab==='guild')html=isTown(player.location)?renderTransfer():'<div class="item">請回村莊找公會轉職官。</div>';else if(tab==='combat'){html=renderOverview();}else if(tab==='settings'){html=renderAutomation();}else if(tab==='reports'){html=renderReports();}else if(tab==='evolution'){html=renderEvolution(false);}
else if(tab==='pets'){html=renderPetTabs()+dualPetSelector()+(petSection==='active'?renderActiveCompanion():renderPetManagement());}
else if(tab==='honortitle'){html=renderTowerHonors('title');}
else if(tab==='honorframe'){html=renderTowerHonors('frame');}
else if(tab==='background'){html=renderBackgroundGallery();}
else if(tab==='skills'){html=renderJobTree();}
else if(tab==='cards'){html=renderCards();}
else if(tab==='gear'){html='<p class="muted">10 個裝備部位。雙手武器同時佔用右手與左手。下方可分解／融合裝備。</p>'+equipmentFilters()+Object.entries(SLOTS).filter(([slot])=>gearFilterSlot==='all'||gearFilterSlot===slot).map(([slot,label])=>{const g=player.gear[slot],blocked=slot==='leftHand'&&ITEMS[player.gear.rightHand?.id]?.hands===2;if(g&&!matchesGear(g))return '';return `<div class="item"><div class="itemhead"><div><span class="tiny">${label}</span><div>${g?equipmentLine(g):blocked?'被雙手武器佔用':'未裝備'}</div>${equippedCardDisplay(slot)}</div>${g?`<button data-off="${slot}">卸下</button>`:''}</div></div>`}).join('')+'<button data-open="salvage" class="wide">前往裝備工坊：分解／融合</button>';}
else if(tab==='cardcollection'){html=isTown(player.location)?renderCardCollection():'<div class="item">請回村莊拜訪星頁典藏師・露娜。</div>';}else if(tab==='cardrecycle'){html=isTown(player.location)?renderCardRecycler():'<div class="item">請回村莊拜訪命運卡片鍊成師。</div>';}else if(tab==='reforge'){html=isTown(player.location)?renderReforge():'<div class="item">請回村莊拜訪靈紋重鑄師。</div>';}else if(tab==='collection'){html=isTown(player.location)?renderGoldCollection():'<div class="item">請回村莊拜訪黃金收藏館。</div>';}else if(tab==='tower'){html=renderTowerPanel(player,{now:gameNow()});}else if(tab==='extreme'){html=renderExtremePanel(player,{now:gameNow()});}else if(tab==='trials'){html=renderTrials();}else if(tab==='enhancement'){html=renderEnhancement();}else if(tab==='sigil'){html=renderDawnSigil();}else if(tab==='sigilcraft'){html=renderDawnSigil(true);}else if(tab==='outfits'){html=renderOutfits();}else if(tab==='warehouse'){html='<div class="item">請在村莊點選倉庫 NPC 開啟視窗。</div>';}else if(tab==='salvage'){html=renderCrafting();}
else if(tab==='bag'){html=renderBag();}
else if(tab==='shop'){if(!isTown(player.location))html='<div class="item">請回村莊購買補給。</div>';else html=`<div class="item"><b>旅途補給所</b><p>持有 ${player.gold} 金 · 補充生命、魔力與捕捉球。角色與夥伴裝備可由戰鬥掉落及碎晶融合取得。</p></div>`+SHOP_GROUPS.map(group=>`<section class="shop-group"><h3>${group.name}</h3>${group.ids.map(id=>{const it=ITEMS[id];return `<div class="item itemhead" data-ui-key="shop-${id}"><div><b>${it.name}</b><p>${it.cost} 金${it.heal?` · HP +${it.heal}${it.healPct?'，Lv.51起另回復最大HP15%':''}`:''}${it.energy?` · SP +${it.energy}${it.energyPct?'，Lv.51起另回復最大SP10%':''}`:''}${it.capture?' · 在夥伴之地直接丟球捕捉':''}</p><small>背包持有 ${player.bag.find(e=>e.id===id&&!e.uid)?.qty||0} 個${id==='orb'?' · 丟球時缺球會自動購買 1 顆（需足夠金幣）':''}</small></div><div class="shop-purchase"><label>數量<input type="number" min="1" max="999" step="1" data-shop-quantity="${id}" aria-label="${it.name}購買數量" value="${escapeHtml(shopQuantities[id]??1)}"></label><button data-buy="${id}" aria-label="購買${it.name}" ${player.gold<it.cost?'disabled':''}>購買 · ${it.cost*Number(shopQuantities[id]||1)} 金</button></div></div>`;}).join('')}</section>`).join('');}
tab=requestedTab;if(characterView)html=renderCharacterTabs()+html;if(tab==='evolution')html=html.replace(/<details[^>]*>[\s\S]*?查看一般品質進化圖鑑[\s\S]*?<\/details>/,'');const openDetails=[...$('side').querySelectorAll('.evolution-altar details')].map(d=>d.open);patchHtml($('side'),html);[...$('side').querySelectorAll('.evolution-altar details')].forEach((d,i)=>d.open=!!openDetails[i]);bindTrialControls();const artSelect=$('evolutionArtSelect');if(artSelect)artSelect.onchange=()=>{evolutionArtRarity=artSelect.value;renderSide(true)};for(const b of $('side').querySelectorAll('[data-pet-fuse]'))b.onclick=()=>openPetFusion(b.dataset.petFuse);for(const b of $('side').querySelectorAll('[data-third-transfer]'))b.onclick=thirdTransfer;for(const b of $('side').querySelectorAll('[data-spirit-quest]'))b.onclick=()=>spiritQuestAction(b.dataset.spiritQuest);for(const b of $('side').querySelectorAll('[data-essence]'))b.onclick=()=>combineEssence(Number(b.dataset.essence));
for(const b of $('side').querySelectorAll('[data-character-section]'))b.onclick=()=>{characterSection=b.dataset.characterSection;renderSide(true);};
for(const b of $('side').querySelectorAll('[data-pet-section]'))b.onclick=()=>{petSection=b.dataset.petSection;renderSide(true);};for(const b of $('side').querySelectorAll('[data-dual-config]'))b.onclick=()=>{petGearTargetId=b.dataset.dualConfig;renderSide(true);};for(const b of $('side').querySelectorAll('[data-pet-stance]'))b.onclick=()=>{const [id,stance]=b.dataset.petStance.split(':');setPetStance(id,stance);};for(const b of $('side').querySelectorAll('[data-secondary-pet]'))b.onclick=()=>setSecondaryPet(b.dataset.secondaryPet);
for(const b of $('side').querySelectorAll('[data-rename-pet]'))b.onclick=()=>openPetRename(b.dataset.renamePet);
for(const b of $('side').querySelectorAll('[data-quest-accept]'))b.onclick=()=>zoneQuestAction(b.dataset.questAccept);
for(const b of $('side').querySelectorAll('[data-quest-turnin]'))b.onclick=()=>zoneQuestAction(b.dataset.questTurnin,true);
for(const b of $('side').querySelectorAll('[data-rebirth]'))b.onclick=rebirthCharacter;
for(const b of $('side').querySelectorAll('[data-buy-gold-collection]'))b.onclick=buyCollection;
for(const s of $('side').querySelectorAll('[data-reforge-select]'))s.onchange=()=>{if(reforgePreview)return toast('請先選擇新舊重鑄結果');reforgeTarget=s.value;reforgeLocks.clear();renderSide(true);};
for(const b of $('side').querySelectorAll('[data-reforge-lock]'))b.onchange=()=>{if(reforgePreview)return;const key=b.dataset.reforgeLock;if(b.checked){if(reforgeLocks.size>=3)return;}if(b.checked)reforgeLocks.add(key);else reforgeLocks.delete(key);renderSide(true);};
for(const b of $('side').querySelectorAll('[data-reforge-roll]'))b.onclick=rollReforge;
for(const b of $('side').querySelectorAll('[data-reforge-keep]'))b.onclick=()=>chooseReforge(b.dataset.reforgeKeep==='new');
for(const b of $('side').querySelectorAll('[data-town]'))b.onclick=()=>travel('town');
for(const b of $('side').querySelectorAll('[data-release-rarity]'))b.onchange=()=>{releaseRarity=b.value;};
for(const b of $('side').querySelectorAll('[data-release-below]'))b.onclick=()=>{selectedReleasePets.clear();for(const pet of player.pets)if(!pet.locked&&pet.id!==player.activePetId&&QUALITY_ORDER.indexOf(pet.rarity)<=QUALITY_ORDER.indexOf(releaseRarity))selectedReleasePets.add(pet.id);releaseSelectedPets();};
for(const b of $('side').querySelectorAll('[data-junk-bulk]'))b.onclick=()=>{const [map,mode]=b.dataset.junkBulk.split(':');setJunkSelection(mode==='on',map==='all'?null:map);};
for(const b of $('side').querySelectorAll('[data-junk-sell]'))b.onchange=()=>{const selected=new Set(player.autoSellJunk);if(b.checked)selected.add(b.dataset.junkSell);else selected.delete(b.dataset.junkSell);player.autoSellJunk=[...selected];if(b.checked)autoSellSelected();save();render();};
for(const b of $('side').querySelectorAll('[data-retrain]'))b.onclick=()=>retrain(b.dataset.retrain);for(const b of $('side').querySelectorAll('[data-auto-revive]'))b.onchange=()=>{player.autoRevive=b.checked;save();};for(const b of $('side').querySelectorAll('[data-potion-priority]'))b.onchange=()=>{player.potionPriority[b.dataset.potionPriority]=b.value;save();};for(const b of $('side').querySelectorAll('[data-pet-lock]'))b.onclick=()=>{const pet=player.pets.find(p=>p.id===b.dataset.petLock);if(pet){pet.locked=!pet.locked;selectedReleasePets.delete(pet.id);save();renderSide(true);}};for(const b of $('side').querySelectorAll('[data-swap-unprotect]'))b.onclick=()=>{const g=player.bag.find(g=>g.uid===b.dataset.swapUnprotect);if(g){delete g.swapProtected;save();renderSide(true);}};
for(const b of $('side').querySelectorAll('[data-open]'))b.onclick=()=>openPanel(b.dataset.open);for(const b of $('side').querySelectorAll('[data-preset]'))b.onclick=()=>{const enabled=b.dataset.preset==='safe';player.autoPotions={playerHp:enabled,playerSp:enabled,petHp:enabled,petSp:enabled};if(enabled){player.autoEscapeBoss=true;player.autoUltimate=true;fleeMapBosses();}save();renderSide(true);toast(enabled?'已套用穩健掛機；自動購買設定不變':'已改為手動補給');};
for(const b of $('side').querySelectorAll('[data-tower-honor-pick]'))b.onclick=()=>{
  if(!selectTowerHonor(player,b.dataset.towerHonorPick,b.dataset.towerHonorValue)){toast('尚未解鎖此榮譽');renderSide(true);return;}
  save();render();renderSide(true);toast('已更新天穹稱號／名稱框，角色畫面立即生效');
};
for(const b of $('side').querySelectorAll('[data-tower-showcase]'))b.onclick=()=>{
 const before=structuredClone(player.towerCollection||{});
 if(!selectTowerShowcase(player,b.dataset.towerShowcase==='on'))return toast('請先於天穹商店收藏展示框');
 if(save()===false){player.towerCollection=before;return toast('存檔失敗，展示設定已復原');}
 render();renderSide(true);toast(b.dataset.towerShowcase==='on'?'已展示三域首領收藏':'已關閉三域首領展示');
};
for(const b of $('side').querySelectorAll('[data-tower-buy]'))b.onclick=()=>{
 const item=TOWER_SHOP_ITEMS.find(i=>i.id===b.dataset.towerBuy);
 if(!item)return;
 if(!confirm(`花費 ${item.cost} 天穹塔幣永久收藏「${item.name}」？`))return;
 const oldCoins=player.towerCoins,oldCollection=structuredClone(player.towerCollection||{});
 const bought=buyTowerShopItem(player,item.id);
 if(bought.error)return toast(bought.error);
 if(save()===false){player.towerCoins=oldCoins;player.towerCollection=oldCollection;return toast('存檔失敗，已退還塔幣');}
 renderSide(true);toast(`✦ 已收藏 ${item.name}！`);
};
for(const b of $('side').querySelectorAll('[data-tower-background-pick]'))b.onclick=()=>{
 if(!selectTowerBackground(player,b.dataset.towerBackgroundPick))return toast('尚未收藏此背景');
 player.cosmeticBackground=null;
 save();render();renderSide(true);
};
if(tab==='pets')for(const b of $('side').querySelectorAll('[data-pet]')){const p=player.pets.find(x=>x.id===b.dataset.pet);const head=b.closest('.item')?.querySelector('.itemhead');if(head){head.querySelector('.art-pet')?.remove();head.insertAdjacentHTML('afterbegin',petSprite(p,'pet'));}}
for(const b of document.querySelectorAll('[data-add]'))b.onclick=()=>applyPointsFromInput(b.dataset.add,$('side').querySelector(`[data-allocation-amount="${b.dataset.add}"]`));
for(const b of document.querySelectorAll('[data-use]'))b.onclick=()=>useItem(+b.dataset.use);
for(const b of document.querySelectorAll('[data-petuse]'))b.onclick=()=>usePetItem(+b.dataset.petuse,b.dataset.petTarget||null);
for(const b of document.querySelectorAll('[data-sell]'))b.onclick=()=>sellJunk(+b.dataset.sell);
for(const b of document.querySelectorAll('[data-bagcategory]'))b.onclick=()=>{bagCategory=b.dataset.bagcategory;bagGearPage=0;gearFilterSlot='all';renderSide(true)};
for(const b of document.querySelectorAll('[data-bag-page]'))b.onclick=()=>{bagGearPage=Math.max(0,bagGearPage+Number(b.dataset.bagPage));renderSide(true)};
for(const b of document.querySelectorAll('[data-sell-stack]'))b.onclick=()=>sellOneBagStack(b.dataset.sellStack);
for(const b of document.querySelectorAll('[data-petoff]'))b.onclick=()=>unequipPetGear(b.dataset.petoff);for(const b of document.querySelectorAll('[data-dual-config]'))b.onclick=()=>{petGearTargetId=b.dataset.dualConfig;renderSide(true);};
for(const b of document.querySelectorAll('[data-gearfilter]'))b.onchange=()=>{if(b.dataset.gearfilter==='rarity')gearFilterRarity=b.value;else if(b.dataset.gearfilter==='tier')gearFilterTier=b.value;else if(b.dataset.gearfilter==='stat')gearFilterStat=b.value;else if(b.dataset.gearfilter==='job')gearFilterJob=b.value;else gearFilterSlot=b.value;bagGearPage=0;renderSide(true)};
for(const b of $('side').querySelectorAll('[data-compare-mode]'))b.onclick=()=>{const section=b.closest('.gear-compare'),mode=b.dataset.compareMode;gearCompareMode=mode;for(const panel of section.querySelectorAll('[data-compare-content]'))panel.hidden=panel.dataset.compareContent!==mode;for(const button of section.querySelectorAll('[data-compare-mode]'))button.setAttribute('aria-pressed',String(button.dataset.compareMode===mode));};
for(const b of document.querySelectorAll('[data-dismantle]'))b.onclick=()=>dismantle(b.dataset.dismantle);
for(const b of document.querySelectorAll('[data-autosalvage]'))b.onchange=()=>{player.autoSalvage=b.checked;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvageinventory]'))b.onchange=()=>{player.salvageInventory=b.checked;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvagebatch]'))b.onclick=()=>{const count=player.bag.filter(g=>(ITEMS[g.id]?.slot||ITEMS[g.id]?.petSlot)&&shouldAutoSalvage(g,player)).length;if(count&&confirm(`將永久分解背包內 ${count} 件符合條件的裝備，並換取碎晶。已穿戴裝備不受影響。確定嗎？`))salvageBagEquipment();};
for(const b of document.querySelectorAll('[data-salvagemode]'))b.onchange=()=>{player.salvageMatchMode=b.value;save();renderSide(true)};
for(const [selector,key] of [['[data-keeprarity]','keepRarity'],['[data-keeptier]','keepTier'],['[data-keepstat]','keepStat'],['[data-salvageotherjobs]','salvageOtherJobs']])for(const b of document.querySelectorAll(selector))b.onchange=()=>{player[key]=b.checked;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvagelimit]'))b.onchange=()=>{player.salvageMaxRarity=b.value;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvagetier]'))b.onchange=()=>{player.salvageMaxTier=Number(b.value);save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvagestat]'))b.onchange=()=>{player.salvageStat=b.value;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-salvagevalue]'))b.onchange=()=>{player.salvageStatBelow=clamp(Math.round(Number(b.value)||0),0,999);save();renderSide(true)};
for(const b of document.querySelectorAll('[data-crafttier]'))b.onchange=()=>{craftTier=Number(b.value);renderSide(true)};
for(const b of document.querySelectorAll('[data-craftbase]'))b.onchange=()=>{craftBase=b.value;renderSide(true)};
for(const b of document.querySelectorAll('[data-craft]'))b.onclick=craftGear;
for(const b of $('side').querySelectorAll('[data-fusion-setting]'))b.onchange=()=>{if(autoFusionRunning)return;player.fusionSettings=normalizeFusionSettings({...player.fusionSettings,[b.dataset.fusionSetting]:b.value});const range=fusionTargetInfo(player.fusionSettings);if(player.fusionSettings.stat!=='any')player.fusionSettings.minimum=clamp(player.fusionSettings.minimum,range.min,range.max);save();renderSide(true)};for(const b of $('side').querySelectorAll('[data-fusion-toggle]'))b.onclick=()=>{if(autoFusionRunning){stopAutoFusion();renderSide(true);}else startAutoFusion();};
for(const b of document.querySelectorAll('[data-off]'))b.onclick=()=>unequip(b.dataset.off);
for(const b of $('side').querySelectorAll('[data-shop-quantity]')){b.oninput=()=>{const id=b.dataset.shopQuantity;shopQuantities[id]=b.value;const button=$('side').querySelector(`[data-buy="${id}"]`),quote=purchaseQuote(ITEMS[id],b.value,player.gold);button.textContent=Number.isInteger(Number(b.value))&&Number(b.value)>0?`購買 · ${ITEMS[id].cost*Number(b.value)} 金`:'請輸入數量';button.disabled=!!quote.error;};b.onchange=b.oninput;}for(const b of document.querySelectorAll('[data-buy]'))b.onclick=()=>{const input=$('side').querySelector(`[data-shop-quantity="${b.dataset.buy}"]`);buy(b.dataset.buy,input?.value??1);};
for(const b of document.querySelectorAll('[data-pet]'))b.onclick=()=>setPet(b.dataset.pet);
for(const b of $('side').querySelectorAll('[data-release-check]'))b.onchange=()=>{if(b.checked)selectedReleasePets.add(b.dataset.releaseCheck);else selectedReleasePets.delete(b.dataset.releaseCheck);renderSide(true);};for(const b of $('side').querySelectorAll('[data-release-select]'))b.onclick=()=>{selectedReleasePets.clear();if(b.dataset.releaseSelect==='all')for(const p of player.pets)if(!p.locked&&p.id!==player.activePetId)selectedReleasePets.add(p.id);renderSide(true);};for(const b of $('side').querySelectorAll('[data-release-batch]'))b.onclick=releaseSelectedPets;
for(const b of document.querySelectorAll('[data-release]'))b.onclick=()=>releasePet(b.dataset.release);
for(const b of document.querySelectorAll('[data-evolve]'))b.onclick=()=>evolvePet(b.dataset.evolve);
for(const b of document.querySelectorAll('[data-petskillmove]'))b.onclick=()=>{const [id,skill,d]=b.dataset.petskillmove.split(':');movePetSkill(id,skill,Number(d));};
for(const b of document.querySelectorAll('[data-petskill]'))b.onclick=()=>{const [id,skill]=b.dataset.petskill.split(':');togglePetSkill(id,skill)};
for(const b of $('side').querySelectorAll('[data-transfer]'))b.onclick=()=>transferJob(b.dataset.transfer);
if($('autoSkillAddSelect'))$('autoSkillAddSelect').onchange=()=>{selectAutoSkill($('autoSkillAddSelect').value);};
for(const b of $('side').querySelectorAll('[data-auto-skill-add]'))b.onclick=()=>changeAutoSkill($('autoSkillAddSelect').value,true);
for(const b of $('side').querySelectorAll('[data-auto-skill-remove]'))b.onclick=()=>changeAutoSkill(b.dataset.autoSkillRemove,false);
for(const b of document.querySelectorAll('[data-skill-move]'))b.onclick=()=>reorderAutoSkill(b.dataset.skillMove,Number(b.dataset.direction));
for(const b of document.querySelectorAll('[data-capture-role]'))b.onchange=()=>{const before=normalizeCaptureRoles(player.autoCaptureRoles);player.autoCaptureRoles=b.checked?[...new Set([...before,b.dataset.captureRole])]:before.filter(x=>x!==b.dataset.captureRole);dirty=true;if(save()===false)player.autoCaptureRoles=before;renderSide(true);};
for(const b of document.querySelectorAll('[data-jobup]'))b.onclick=()=>upgradeJobSkill(b.dataset.jobup);
for(const b of document.querySelectorAll('[data-jobequip]'))b.onclick=()=>equipJobSkill(b.dataset.jobequip);
for(const b of document.querySelectorAll('[data-mana-guard-toggle]'))b.onchange=()=>{player.manaGuardEnabled=b.checked;dirty=true;save();renderSide(true);};
for(const b of $('side').querySelectorAll('[data-card-compare-slot]'))b.onchange=()=>{cardCompareSlots[b.dataset.cardCompareSlot]=b.value;renderSide(true);};
for(const b of $('side').querySelectorAll('[data-card-filter-slot]'))b.onchange=()=>{cardFilterSlot=b.value;renderSide(true);};
for(const b of $('side').querySelectorAll('[data-allocation-amount]')){b.oninput=()=>{allocationAmounts[b.dataset.allocationAmount]=b.value;};b.onchange=b.oninput;b.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();applyPointsFromInput(b.dataset.allocationAmount,b);}};}
for(const b of $('side').querySelectorAll('[data-sale-quantity]'))b.oninput=()=>{sellAmounts[b.dataset.saleQuantity]=Math.max(1,Math.floor(Number(b.value)||1));};
for(const b of $('side').querySelectorAll('[data-manual-sale]'))b.onclick=()=>sellManual(b.dataset.manualSale);

 for(const input of $('side').querySelectorAll('[data-card-recycle-qty]'))input.onchange=()=>{const qty=Math.floor(Number(input.value));const held=player.cards.find(x=>x.id===input.dataset.cardRecycleQty);cardRecycleQuantities[input.dataset.cardRecycleQty]=Math.max(1,Math.min(held?.qty||1,qty||1));renderSide(true);};
 for(const b of $('side').querySelectorAll('[data-card-recycle]'))b.onclick=()=>{const id=b.dataset.cardRecycle,held=player.cards.find(x=>x.id===id);if(held)recycleOwnedCards([{id,qty:Math.max(1,Math.min(held.qty,cardRecycleQuantities[id]||1))}]);};
 for(const b of $('side').querySelectorAll('[data-card-recycle-duplicates]'))b.onclick=()=>recycleOwnedCards(player.cards.filter(x=>x.qty>1&&CARDS[x.id]).map(x=>({id:x.id,qty:x.qty-1})));
 for(const b of $('side').querySelectorAll('[data-card-draw]'))b.onclick=()=>drawCardRecycling(Number(b.dataset.cardDraw));
 for(const b of $('side').querySelectorAll('[data-card-collect-all]'))b.onclick=collectCardAlbum;
 for(const b of $('side').querySelectorAll('[data-album-withdraw]'))b.onclick=()=>withdrawAlbumCard(b.dataset.albumWithdraw);
 for(const input of $('side').querySelectorAll('[data-album-setting]'))input.onchange=()=>updateAlbumSettings(input.dataset.albumSetting,input.checked);
 for(const input of $('side').querySelectorAll('[data-album-keep]'))input.onchange=()=>updateAlbumSettings('keepCopies',Number(input.value));
 for(const b of $('side').querySelectorAll('[data-album-organize]'))b.onclick=manuallyRecycleDuplicates;
for(const b of $('side').querySelectorAll('[data-pet-ascend]'))b.onclick=()=>openAscension(b.dataset.petAscend);
for(const b of $('side').querySelectorAll('[data-pet-mutate]'))b.onclick=()=>openAscension(b.dataset.petMutate,'mutate');
for(const b of document.querySelectorAll('[data-socket]'))b.onclick=()=>{const [id,slot]=b.dataset.socket.split(':');socket(id,slot)};
for(const b of document.querySelectorAll('[data-combatview]'))b.onclick=()=>{combatView=b.dataset.combatview;renderSide(true)};
for(const b of document.querySelectorAll('[data-autoultimate]'))b.onchange=()=>{player.autoUltimate=b.checked;save();renderSide(true)};
for(const b of $('side').querySelectorAll('[data-escape-boss]'))b.onchange=()=>{player.autoEscapeBoss=b.checked;if(b.checked)fleeMapBosses();save();renderSide(true);};
for(const b of $('side').querySelectorAll('[data-potion-threshold]')){b.oninput=()=>{const value=Number(b.value);if(b.value!==''&&Number.isFinite(value)&&value>=1&&value<=100){player.potionThresholds=normalizePotionThresholds({...player.potionThresholds,[b.dataset.potionThreshold]:value});save();}};b.onchange=()=>{player.potionThresholds=normalizePotionThresholds({...player.potionThresholds,[b.dataset.potionThreshold]:b.value});save();renderSide(true);};}
for(const b of document.querySelectorAll('[data-autopotion]'))b.onchange=()=>{player.autoPotions[b.dataset.autopotion]=b.checked;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-autobuy-enabled]'))b.onchange=()=>{player.autoBuyPotions[b.dataset.autobuyEnabled].enabled=b.checked;save();renderSide(true)};
for(const b of document.querySelectorAll('[data-autobuy-id]'))b.onchange=()=>{player.autoBuyPotions[b.dataset.autobuyId].id=b.value;save();renderSide(true)};
for(const name of ['min','target'])for(const b of document.querySelectorAll(`[data-autobuy-${name}]`))b.onchange=()=>{const type=b.dataset[`autobuy${name[0].toUpperCase()+name.slice(1)}`],c=player.autoBuyPotions[type];c[name]=clamp(Math.round(Number(b.value)||0),name==='min'?0:1,200);c.target=Math.max(c.min,c.target);save();renderSide(true)};
for(const b of document.querySelectorAll('[data-unsocket]'))b.onclick=()=>unsocket(b.dataset.unsocket);
}
function lobbySlots(){return readCharacterSlots(localStorage,normalize,valid);}
function decorateTowerHonorEntry(slots){
  for(const {index,player:character} of slots){
    if(!character)continue;
    const slot=$('slotGrid').querySelector(`[data-slot-select="${index}"]`),name=slot?.querySelector('h2');
    if(!name)continue;
    if(normalizeTowerCostume(character)==='frost'){
      const stage=slot.querySelector('.slot-art-stage'),oldArt=stage?.querySelector('.art-sprite');
      if(oldArt){const art=document.createElement('img');art.className='art-sprite art-entry cosmetic-equipped tower-frost-equipped';art.src=towerFrostArt(character.job);art.alt='第30層永凍限定外觀';oldArt.replaceWith(art);}
    }
    const honor=normalizeTowerHonorSelection(character),frameClass=towerHonorFrameClass(character);
    if(frameClass)name.classList.add('tower-honor-name',frameClass);
    if(honor.title){const label=document.createElement('span');label.className='tower-honor-title';label.textContent=honor.title;name.insertAdjacentElement('afterend',label);}
  }
}
function renderEntry(){const slots=lobbySlots();$('slotGrid').innerHTML=slots.map(({index,player:p,error})=>`<article class="slot-card ${selectedSlot===index?'selected':''} ${p?'occupied':'empty'}"><button class="slot-select" data-slot-select="${index}" aria-label="選擇第 ${index+1} 格${p?' '+escapeHtml(p.name):' 空白角色'}"><span class="slot-number">CHARACTER 0${index+1}</span><span class="slot-art-stage">${p?spriteHtml(p.job,'entry',p.reborn,p.thirdJob,p.selectedOutfit,p.cosmeticOutfit):'<span class="slot-empty-art">＋</span>'}</span><h2>${p?escapeHtml(p.name):error?'存檔待還原':'尚未建立角色'}</h2><p>${p?`${p.thirdJob?'三轉 · ':p.reborn?'轉生 · ':''}${p.thirdJob?THIRD_JOBS[p.job].name:CLASSES[p.job].name} · ${rangeLabel(playerRange(p.job))}`:error||'建立一位新的冒險者'}</p>${p?`<div class="slot-levels"><span>BLV <b>${p.level}</b></span><span>JLV <b>${p.jobLevel}</b></span><span>夥伴 <b>${p.pets.length}</b></span></div><small>${MAPS[p.location]?.name||'夥伴之地'} · 金幣 ${Number(p.gold).toLocaleString('zh-TW')}</small>`:'<small>獨立角色、背包、夥伴與進度</small>'}</button><div class="slot-actions"><button data-slot-new="${index}" aria-label="第 ${index+1} 格新建或覆蓋">${p||error?'新建覆蓋':'建立角色'}</button><button data-slot-import="${index}" aria-label="第 ${index+1} 格導入存檔">導入</button><button data-slot-export="${index}" aria-label="第 ${index+1} 格匯出存檔" ${p?'':'disabled'}>匯出</button></div></article>`).join('');decorateTowerHonorEntry(slots);const selected=slots[selectedSlot];$('enterGameBtn').disabled=!selected?.player;$('enterGameBtn').textContent=selected?.player?`進入遊戲 · ${selected.player.name}`:'請先建立或導入角色';$('entrySelection').textContent=`目前選擇第 ${selectedSlot+1} 格 · ${selected?.player?.name||'空白存檔'}`;for(const button of $('slotGrid').querySelectorAll('[data-slot-select]'))button.onclick=()=>{selectedSlot=Number(button.dataset.slotSelect);renderEntry()};for(const button of $('slotGrid').querySelectorAll('[data-slot-new]'))button.onclick=()=>openCharacterCreation(Number(button.dataset.slotNew));for(const button of $('slotGrid').querySelectorAll('[data-slot-import]'))button.onclick=()=>{importTargetSlot=Number(button.dataset.slotImport);$('saveFile').click()};for(const button of $('slotGrid').querySelectorAll('[data-slot-export]'))button.onclick=()=>exportCharacterSlot(Number(button.dataset.slotExport));}
function refreshSpiritCreationLock(){const button=$('classChoices').querySelector('[data-class="spiritist"]');if(!button)return;button.disabled=false;button.classList.remove('spirit-locked');button.removeAttribute('aria-label');const hint=button.querySelector('.spirit-unlock-hint');if(hint)hint.textContent='從 1 等開始正常養成';}
function openCharacterCreation(index){const slot=readCharacterSlot(localStorage,index,normalize,valid);if((slot.player||slot.error)&&!confirm(`新建角色將覆蓋第 ${index+1} 格「${slot.player?.name||'現有存檔'}」，其他七格不受影響。確定繼續？`))return;creatingSlot=index;selectedClass='swordsman';$('classChoices').querySelectorAll('[data-class]').forEach(b=>b.classList.toggle('active',b.dataset.class===selectedClass));refreshSpiritCreationLock();$('createSlotLabel').textContent=`第 ${index+1} 格 · 建立獨立角色`;$('nameInput').value='';$('createModal').style.display='grid';$('entryScreen').inert=true;$('nameInput').focus();}
function closeCharacterCreation(){$('createModal').style.display='none';$('entryScreen').inert=false;creatingSlot=null;}
function start(name,job){if(creatingSlot===null)return;if(!CLASSES[job]||SECOND_JOBS[job])return toast('請選擇一轉職業建立角色');try{const index=creatingSlot,candidate=normalize(fresh(name.trim().slice(0,16)||'無名冒險者',job));if(!valid(candidate))throw Error('存檔資料驗證未通過');writeCharacterSlot(localStorage,index,candidate);selectedSlot=index;closeCharacterCreation();renderEntry();toast('角色已建立，請選擇後按「進入遊戲」');}catch(error){toast('建立失敗：'+error.message);}}
function resetSession(){fourthSkillStates=new Map();resonanceUsedAt=new Map();originalPactCounters=new Map();controlEffect=null;deferTrueFormReveal();clearStatSnapshots();combatSamples=[];combatStarted=gameNow();allocationAmounts={};sellAmounts={};casting=null;selectedReleasePets.clear();shopQuantities={};backgroundPaused=false;bossCooldowns={};classBuffs={};enemy=null;enemies=[];report=null;petShield=0;log=[];clearPetEffects();jobSkillTimers={};timers={attack:0,skill:0,enemy:0,pet:0,petAbility:0,regen:gameNow(),tactic:0,resonance:0,ultimate:0};nextEncounterAt=0;deadUntil=0;dirty=false;tab='character';characterSection='attributes';petSection='manage';petGearTargetId=null;combatView='player';bagCategory='consumables';cardFilterSlot='all',cardCompareSlots={};gearFilterRarity=gearFilterTier=gearFilterSlot=gearFilterStat=gearFilterJob='all';autoFusionAttempts=0;autoFusionStatus='尚未啟動';autoFusionRunning=false;autoFusionPlan=null;}
async function enterCharacterSlot(index){if(settlingOffline)return;const slot=readCharacterSlot(localStorage,index,normalize,valid);if(!slot.player)return toast(slot.error||'請先建立或導入角色');resetSession();activeSlot=index;selectedSlot=index;player=slot.player;gameRunning=false;auto=!player.manualPaused;delete player.autoStoppedReason;let offlineSummary;try{offlineSummary=await settleOffline();}catch(error){player=null;activeSlot=null;renderEntry();toast(error.message);return;}resetSession();gameRunning=true;selectedContinent=continentFor(player.location);renderMapChoices();player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));$('entryScreen').hidden=true;$('gameShell').hidden=false;$('gameShell').inert=false;$('createModal').style.display='none';$('activeSlotLabel').textContent=`第 ${index+1} 格`;message(`歡迎，${player.name}！已進入第 ${index+1} 格的獨立冒險。`,'good');spawn();save();const returningJourney=HOMECOMING_ROUTES.find(r=>player.homecoming?.routes?.[r.id]?.phase==='traveling');if(returningJourney){tab='homecoming';selectedContinent=returningJourney.continentId;renderMapChoices();renderSide(true);}if(!player.hp&&(!player.autoRevive||player.trialDefeated))showReviveDialog();if(player.fusionNotice)showFusionResult();if(offlineSummary){bossCardNotices.push(...(offlineSummary.bossCards||[]));showOfflineReport(offlineSummary);}else showNextBossCardNotice();if(document.hidden)backgroundPaused=true;}
function returnToEntry(saveCurrent=true){if(player?.extremeRun)exitExtreme('返回選角');if(player?.towerRun)exitTower('返回選角');bossCardNotices=[];bossCardNoticeOpen=false;const notice=document.getElementById('bossCardNotice');if(notice){notice.hidden=true;notice.style.display='none';}if(player?.trialRun&&!player.trialRun.continuous)exitTrial('返回選角，試煉已結束');if(settlingOffline)return false;if(saveCurrent&&player){endReport('返回選角');if(!save())return false;}stopAutoFusion('已返回選角');gameRunning=false;player=null;activeSlot=null;resetSession();for(const id of ['createModal','reviveModal','renameModal','fusionResultModal'])$(id).style.display='none';$('entryScreen').inert=false;$('gameShell').hidden=true;$('gameShell').inert=false;$('entryScreen').hidden=false;renderEntry();window.scrollTo(0,0);return true;}
function exportCharacterSlot(index){try{if(gameRunning&&activeSlot===index&&!save())return;const slot=readCharacterSlot(localStorage,index,normalize,valid);if(!slot.player)return toast(slot.error||'這一格沒有角色');const blob=new Blob([JSON.stringify({version:2,player:slot.player},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`icarus-slot-${index+1}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}catch(error){toast('匯出失敗：'+error.message);}}
function exportSave(){if(activeSlot!==null)exportCharacterSlot(activeSlot);}
async function importSave(file){try{if(file.size>4*1024*1024)throw Error('檔案超過 4 MB');const index=importTargetSlot??activeSlot??selectedSlot;characterSlotKey(index);const data=JSON.parse(await file.text()),candidate=data.version===2?normalize(data.player):data.v===1?normalize(migrate(data.p)):null;if(!valid(candidate))throw Error('檔案格式或資料不正確');const existing=readCharacterSlot(localStorage,index,normalize,valid);if((existing.player||existing.error)&&!confirm(`導入將覆蓋第 ${index+1} 格「${existing.player?.name||'現有存檔'}」，其他存檔不受影響。確定繼續？`))return;writeCharacterSlot(localStorage,index,candidate);selectedSlot=index;if(gameRunning)returnToEntry(false);else renderEntry();toast('存檔已導入，請選擇角色後進入遊戲。');}catch(error){toast('導入失敗：'+error.message);}finally{importTargetSlot=null;}}

function retrain(kind){
 if(!isTown(player.location))return toast('請回城鎮重新訓練');if(player.hp<=0)return toast('請先復活再重新訓練');const free=kind==='attributes'&&free201AttributeReset(player),cost=free?0:retrainCost(player.level);if(player.gold<cost)return toast(`需要 ${cost} 金`);
 if(!confirm(`${free?'使用本角色201級免費素質重置機會（1次）':`花費 ${cost} 金重置${kind==='attributes'?'屬性':'一轉與二轉技能'}`}？已使用點數會完整退回。`))return;
 const previous=structuredClone(player);player.gold-=cost;if(free)player.free201ResetUsed=true;
 if(kind==='attributes'){for(const key of Object.keys(ATTRS)){player.statPoints+=Math.max(0,player.attributes[key]-1);player.attributes[key]=1;}}
 else{for(const skill of JOB_SKILLS[player.job].filter(s=>s.thirdOnly)){player.thirdJobPoints=(player.thirdJobPoints||0)+(player.jobSkills[skill.id]||0);player.jobSkills[skill.id]=0;}for(const skill of JOB_SKILLS[player.job].filter(s=>s.rebornOnly)){player.rebornJobPoints+=player.jobSkills[skill.id]||0;player.jobSkills[skill.id]=0;}for(const branch of ['first','second']){const skills=JOB_SKILLS[player.job].filter(s=>s.branch===branch&&!s.rebornOnly);if(!skills.length)continue;const pool=branch==='first'&&SECOND_JOBS[player.job]?'firstJobPoints':'jobPoints';for(const skill of skills){player[pool]+=player.jobSkills[skill.id]||0;player.jobSkills[skill.id]=0;}const starter=skills.find(s=>s.kind!=='passive'&&s.unlock===1);if(starter&&player[pool]>0){player[pool]--;player.jobSkills[starter.id]=1;}}player.equippedJobSkill=activeJobSkills(player.job).find(s=>player.jobSkills[s.id]&&s.branch===(SECOND_JOBS[player.job]?'second':'first'))?.id||activeJobSkills(player.job)[0].id;jobSkillTimers={};classBuffs={};}
 clearStatSnapshots();reconcileSkillPoints(player,JOB_SKILLS[player.job],!!SECOND_JOBS[player.job]);syncRebirthSkills();player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));dirty=true;if(save()===false){player=previous;return;}message('已完成重新訓練，點數已退回。','good');render();
}
function autoRevivePlayer(){if(player?.extremeRun||player?.towerRun)return false;if(player?.trialRun||player?.trialDefeated)return false;
 if(player.hp>0||!player.autoRevive||!auto)return false;if(!Number.isFinite(player.reviveAt))player.reviveAt=gameNow()+PLAYER_REVIVE_MS;if(gameNow()<player.reviveAt)return false;
 const cost=reviveCost(),oldMap=player.location;
 if(player.gold>=cost){player.gold-=cost;if(offlineMetrics){offlineMetrics.spent+=cost;offlineMetrics.revives=(offlineMetrics.revives||0)+1;}player.hp=Math.ceil(stat('hp')*.5);player.mp=Math.ceil(stat('mp')*.5);for(const pet of player.pets)if(pet.hp<=0&&gameNow()>=(pet.reviveAt||0)){pet.hp=Math.ceil(petStats(pet).hp*.5);pet.sp=Math.ceil(petStats(pet).sp*.5);}timers.respawnGrace=gameNow()+3000;player.shield=0;spawn();message(`金幣自動復活，花費 ${cost} 金。`,'good');}
 else{player.lastMap=oldMap;player.location=homeTown(player.location);player.hp=stat('hp');player.mp=stat('mp');for(const pet of player.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;delete pet.reviveAt;}spawn();message('復活金幣不足，已回城休整；人物與夥伴 HP／SP 已恢復。','bad');}
 if(isSpiritJob(player.job)){const pet=activePet();if(pet&&pet.hp<=0){pet.hp=Math.max(1,Math.ceil(petStats(pet).hp*.5));pet.sp=Math.ceil(petStats(pet).sp*.5);delete pet.reviveAt;}}
 if(!offlineSimulation)$('reviveModal').style.display='none';dirty=true;save();return true;
}
function showCaptureReward(pet){if(offlineSimulation)return;$('captureRewardContent').innerHTML=`${petSprite(pet,'capture')}<h3 class="grade-${pet.rarity}">恭喜抓到 ${escapeHtml(petForm(pet)||pet.nickname)}！</h3><p>${petRarity(pet).name} · ${(fusedPair(pet)?.name||SPECIES[pet.species].roleName)}</p>`;$('captureRewardModal').hidden=false;}
function renderEncounterSlots(){if(player.extremeRun)return renderExtremeEncounter();if(player.towerRun)return renderTowerEncounter();if(player.trialRun)return renderTrialEncounter();const capacity=encounterLimit(player.location);if(!capacity)return '<div class="enemy-idle">安全區域，沒有敵人。</div>';const card=foe=>`<button class="enemy-target ${enemy===foe?'active':''} ${foe.boss?'map-boss':''}" data-target="${foe.instanceId}">${spriteHtml(foe.id,'monster')}<span class="enemy-label">${foe.boss?'♛ 首領 ':''}Lv.${foe.level||1} ${SPECIES[foe.id].name}</span><span class="enemy-hp">${foe.hp}/${foe.maxHp} HP</span>${meter(foe.hp,foe.maxHp,'red')}<small>${enemy===foe?'◎ 目前鎖定':'點擊指定'}</small></button>`;return Array.from({length:capacity},(_,slot)=>{const foe=enemies.find(e=>!e.boss&&e.hp>0&&e.slotIndex===slot);return foe?card(foe):`<div class="enemy-target empty-slot" data-ui-key="empty-${slot}"><span>探索中</span><small>此格獨立隨機遇怪</small></div>`;}).join('')+enemies.filter(e=>e.boss&&e.hp>0).map(card).join('');}

function combatTick(now=gameNow()){if(player?.extremeRun&&player.hp<=0){exitExtreme('戰敗');return;}if(player?.towerRun&&player.hp<=0){exitTower('挑戰失敗');return;}if(resolveSpiritPairDefeat())return;if(player?.trialRun&&player.hp<=0){exitTrial('戰敗，試煉已結束');return;}inCombatTick=true;if(!offlineSimulation)clearStatSnapshots();try{if(!player.hp){casting=null;if(auto&&player.autoRevive)autoRevivePlayer();if(!offlineSimulation&&$('reviveModal').style.display==='flex')showReviveDialog();return;}if(now>(timers.petShieldExpires||Infinity)){player.shield=Math.max(0,player.shield-petShield);petShield=0;}if(now>(timers.playerShieldExpires||Infinity))player.shield=Math.min(player.shield,petShield);if(now>(petEffects.shieldExpires||Infinity))petEffects.shield=0;
 const wasExtremeRun=!!player.extremeRun,wasTowerRun=!!player.towerRun;tickExtreme(now);if(!player?.extremeRun&&wasExtremeRun)return;tickTrialControl(now);tickTowerBossMechanics(now);if(wasTowerRun&&!player.towerRun)return;tickEncounters(now);chooseAttackTarget();autoCapturePet(now);if(casting&&now>=casting.until){const id=casting.id;casting=null;playerAttack(true,id,true);}if(casting&&!player.hp)casting=null;
 if(now-timers.regen>=4000){timers.regen=now;for(const pet of activePetRoster(player))if(pet.hp>0)pet.sp=Math.min(petStats(pet).sp,pet.sp+Math.max(1,Math.ceil(pet.level/8)));const intRegen=['mage','wizard','sage'].includes(player.job)?Math.ceil(stat('mp')*Math.min(150,effectiveAttributes().INT)*.0004):0;player.mp=Math.min(stat('mp'),player.mp+2+passiveBonus('spRegen')+cardBonus('spRegen')+intRegen);dirty=true;}
 if(enemy.hp&&player.hp){const trialAtTick=player.trialRun;if(auto&&now-(timers.potions||0)>800){timers.potions=now;autoUsePotions();}tickPetEffects(now);const selected=enemy;for(const foe of [...enemies]){if(!player.hp)break;if(foe.extremeKind==='hp'||foe.extremeKind==='clear')continue;if(foe.towerPursuer&&player.towerRun&&towerFloor(player.towerRun.floor).objective==='hunt')continue;if(foe.hp&&now-foe.lastAttack>=aspdAttackIntervalMs(foe.aspd)){foe.lastAttack=now;enemy=foe;enemyAttack();if(trialAtTick&&!player.trialRun)return;}}enemy=selectEncounterTarget(enemies,player.targetPriority,selected)||selected;if(player.hp<=0){casting=null;return;}if(enemy.hp&&auto){for(const companion of activePetRoster(player)){if(!enemy.hp)break;if(companion?.hp>0&&combatPetFactor(companion.id)>0){const dualPetAbility=player.job==='spiritist'||player.job==='pactWarrior'||player.job==='spiritCommander';const lastPetAbility=dualPetAbility?(timers.petAbilityById?.[companion.id]||0):(timers.petAbility||0);if(now-lastPetAbility>=850)petAutoAbility(companion,commanderTransferredPetStats(companion,petStats(companion)),now);if(enemy.hp)petAttack(companion,combatPetFactor(companion.id));}}if(enemy.hp)autoCastJobs();if(enemy.hp)playerAttack();if(enemy.hp&&player.autoUltimate&&player.resonance>=ULTIMATE_COST&&now-timers.ultimate>=ULTIMATE_COOLDOWN)ultimate();}}
tickCompanionFourth(now);
}finally{inCombatTick=false;if(!offlineSimulation)clearStatSnapshots();}}
// Skip only completely idle 100ms slices; retain the original time grid and
// never jump over encounter, regeneration or supply deadlines.
function offlineIdleSkipSteps(now,remaining){
 if(globalThis.__spiritDisableOfflineIdleSkip===true)return 0;
 // The selected live target is sufficient to disqualify idle skipping.
 // This constant-time guard avoids scanning the encounter roster on most combat ticks.
 if(enemy?.hp>0)return 0;
 if(player?.trialRun||casting||controlEffect||enemies.some(foe=>foe.hp>0)||!encounterSlots.length||encounterSlots.some(at=>!Number.isFinite(at)))return 0;
 const regenAt=Number.isFinite(timers.regen)?timers.regen+4000:now;
 const suppliesAt=Number.isFinite(timers.offlineSupplies)?timers.offlineSupplies+4000:now;
 const deadline=Math.min(...encounterSlots,regenAt,suppliesAt,now+remaining);
 return Math.max(0,Math.min(Math.floor((remaining-OFFLINE_STEP_MS)/OFFLINE_STEP_MS),Math.floor((deadline-now-1)/OFFLINE_STEP_MS)));
}
async function simulateOffline(state,now=Date.now(),progress=()=>{}){
 if(homecomingMap(state?.location))return {player:state,summary:null};
 const window=offlineWindow(state,now),before=structuredClone(state);
 if(!window.eligible)return {player:state,summary:null};
 clearStatSnapshots();offlineAffixCache=new WeakMap();offlineGearStatCache=new WeakMap();offlineGearTotals=new Map();offlineSimulation=true;offlineClock=state.offline.at;offlineMetrics={bossCards:[],captures:[],baseXp:0,jobXp:0,petXp:0,goldEarned:0,potions:{},purchased:{},spent:0,bossesEscaped:0,skillCasts:{},dualSpiritMainEvents:0,dualSpiritBlockedDeadTarget:0,dualSpiritBlockedFormation:0,dualSpiritBlockedPetDown:0,dualSpiritBlockedMissingPair:0,dualSpiritBlockedCooldown:0,damage:{player:0,pet1:0,pet2:0,resonance:0,petSupport:0,other:0,total:0}};
 try{
  player=normalize(structuredClone(state));player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));resetSession();auto=true;spawn();const trialMode=!!player.trialRun?.continuous;let simulated=0,reason='已完成離線時間',yieldSteps=0,lastYieldAt=performance.now();
  for(;simulated<window.duration;){
   if(!player.hp){if(player.autoRevive&&auto)autoRevivePlayer();if(!player.hp&&auto&&player.autoRevive&&gameNow()<player.reviveAt){const wait=Math.min(window.duration-simulated,player.reviveAt-gameNow());offlineClock+=wait;simulated+=wait;continue;}if(!player.hp||!auto||isTown(player.location)){reason=isTown(player.location)?'金幣不足，已回城停止掛機':'角色倒下，掛機停止';break;}}
   if(player.bag.length>=1900){reason='背包接近容量上限，掛機停止';if(trialMode)exitTrial(reason);break;}
   const skipSteps=offlineIdleSkipSteps(offlineClock,window.duration-simulated);if(skipSteps){const skipMs=skipSteps*OFFLINE_STEP_MS;offlineClock+=skipMs;simulated+=skipMs;}
   const delta=Math.min(OFFLINE_STEP_MS,window.duration-simulated);offlineClock+=delta;simulated+=delta;combatTick(offlineClock);
   if(trialMode&&!player.trialRun){reason=player.trialStopReason||'連續試煉已停止';break;}
   if(offlineClock-(timers.offlineSupplies||0)>=4000){timers.offlineSupplies=offlineClock;if(player.hp>0)autoBuyPotions();if(player.autoSalvage&&player.salvageInventory)salvageBagEquipment();}
   if(++yieldSteps>=256){yieldSteps=0;const wallNow=performance.now();if(wallNow-lastYieldAt>=100){progress(simulated/window.duration);if(typeof document!=='undefined')await new Promise(resolve=>setTimeout(resolve,0));lastYieldAt=performance.now();}}
  }
  if(!player.hp)reason=player.trialStopReason||'角色倒下，掛機停止';
  progress(simulated/window.duration);
  if(trialMode)checkpointTrial();
  const summary={...window,simulated,reason,map:state.location,trialRounds:trialMode?Math.max(0,(player.trialClears?.[state.trialRun.map]||0)-(before.trialClears?.[state.trialRun.map]||0)):0,kills:player.kills-before.kills,gold:player.gold-before.gold,baseBefore:before.level,baseAfter:player.level,jobBefore:before.jobLevel,jobAfter:player.jobLevel,...offlineMetrics,...inventoryDelta(before,player)};
  return {player,summary};
 }finally{clearStatSnapshots();offlineAffixCache=new WeakMap();offlineGearStatCache=new WeakMap();offlineGearTotals=new Map();offlineClock=null;offlineSimulation=false;offlineMetrics=null;}
}
let compensationChoice=null;
function refreshWeaponCompensationReminder(){
 let badge=$('weaponCompensationReminder');
 if(!badge){badge=document.createElement('button');badge.id='weaponCompensationReminder';badge.type='button';badge.className='weapon-compensation-reminder';badge.innerHTML='<span>✦ 武器改版感謝禮</span><small>尚未領取 · 點擊自選武器</small>';badge.onclick=showWeaponCompensation;document.body.append(badge);}
 const correction=compensationCanCorrect(player);
 badge.hidden=!player||(player.weaponCompensation?.state!=='pending'&&!correction)||!gameRunning||$('gameShell')?.hidden;
 const reminderText=badge.querySelector?.('small');
 if(reminderText)reminderText.textContent=correction?'可補發第二把 · 僅限一次':'尚未領取 · 點擊自選武器';
}
function compensationDraft(id){
 const proof=player.weaponCompensation.proof;
 const make=weaponId=>({regular:compensationNormalKeys(weaponId).slice(0,compensationAffixCount(proof.rarity)),special:compensationSpecialKeys(proof.rarity)[0]||null});
 return {id,main:make(id==='dualDagger'?'rifle':id),...(id==='dualDagger'?{offhand:make('offDagger')}:{})};
}
function weaponCompensationDialog(){
 let modal=$('weaponCompensationModal');if(modal)return modal;
 modal=document.createElement('div');modal.id='weaponCompensationModal';modal.className='overlay weapon-compensation-modal';modal.hidden=true;
 modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','weaponCompensationTitle');
 modal.innerHTML='<section class="modal"><div class="eyebrow">WEAPON REFORGE GRATITUDE</div><h2 id="weaponCompensationTitle">✦ 武器改版感謝禮</h2><div id="weaponCompensationContent"></div><div class="revive-actions"><button id="weaponCompensationLater" type="button">－ 先縮小，稍後再選</button><button id="weaponCompensationClaim" class="goldbtn" type="button">確認領取（僅一次）</button></div></section>';
 document.body.append(modal);
 $('weaponCompensationLater').onclick=()=>{modal.hidden=true;refreshWeaponCompensationReminder();showNextBossCardNotice();};
 $('weaponCompensationClaim').onclick=()=>{try{
  const correction=compensationCanCorrect(player),proof=player.weaponCompensation.proof,option=compensationWeaponOptions(player.job).find(w=>w.id===compensationChoice?.id);
  const ids=option?.id==='dualDagger'?['rifle','offDagger']:[option?.id];
  const details=ids.map((id,i)=>`${GEAR_BASE[id]?.name||id}：${compensationAffixDescription(id,proof,i===1?compensationChoice.offhand:compensationChoice.main).join('、')}`).join('\n');
  if(!window.confirm(`${correction?'補發第二把（原武器保留）':'確認領取'}，請核對最終詞條：\n\n${details}\n\n確認後${correction?'不可再次補發':'將消耗本次領取資格'}。`))return;
  const beforeBag=player.bag.slice(),beforeState=player.weaponCompensation;
  const rewarded=correction?claimWeaponCompensationCorrection(player,compensationChoice):claimWeaponCompensation(player,compensationChoice);
  const exact=rewarded.every((gear,i)=>{const expected=compensationAffixDescription(gear.id,proof,i===1?compensationChoice.offhand:compensationChoice.main);return expected.length===Object.keys(gear.affixes).length&&expected.every(x=>Object.entries(gear.affixes).some(([k,v])=>affixLabel(k,v)===x));});
  if(!exact||!save()){player.bag=beforeBag;player.weaponCompensation=beforeState;throw Error('詞條校驗或存檔失敗，領取資格保持不變');}
  modal.hidden=true;refreshWeaponCompensationReminder();render();toast(`${correction?'已補發':'已領取'}改版武器：${rewarded.map(g=>g.name).join('、')}`);showNextBossCardNotice();
 }catch(error){toast(error.message);}};
 return modal;
}
function renderWeaponCompensation(){
 const proof=player.weaponCompensation.proof,modal=weaponCompensationDialog(),correction=compensationCanCorrect(player);
 const choices=compensationWeaponOptions(player.job);
 if(!choices.some(w=>w.id===compensationChoice?.id))compensationChoice=compensationDraft(choices[0]?.id);
 const chosen=choices.find(w=>w.id===compensationChoice.id);
 const controls=(id,field)=>{
  const choice=compensationChoice[field],regular=compensationNormalKeys(id),locked=regular.slice(0,2),count=compensationAffixCount(proof.rarity);
  const selector=(n)=>`<label>第 ${n+1} 詞條<select data-comp-field="${field}" data-comp-index="${n}">${regular.filter(key=>!locked.includes(key)).map(key=>`<option value="${key}" ${choice.regular[n]===key?'selected':''}>${escapeHtml(AFFIX_NAMES[key])}</option>`).join('')}</select></label>`;
  const special=compensationSpecialKeys(proof.rarity);
  return `<div class="comp-affix-panel"><h4>${escapeHtml(GEAR_BASE[id].name)}</h4><p>固定詞條：${locked.map(k=>escapeHtml(AFFIX_NAMES[k])).join('、')}</p><div class="comp-selectors">${Array.from({length:count-2},(_,i)=>selector(i+2)).join('')}${special.length?`<label>神話特殊詞條<select data-comp-field="${field}" data-comp-special="1">${special.map(k=>`<option value="${k}" ${choice.special===k?'selected':''}>${escapeHtml(AFFIX_NAMES[k])}</option>`).join('')}</select></label>`:''}</div><p class="tiny">預覽：${compensationAffixDescription(id,proof,choice).map(escapeHtml).join('、')}</p></div>`;
 };
 const rank=RARITIES.find(r=>r.id===proof.rarity)?.name||proof.rarity;
 $('weaponCompensationContent').innerHTML=`<p>${correction?'✦ 一次性補發：原先領取的武器不回收，這次會額外發放第二把（雙短劍選項則為第二組）。補發成功後不能再次補發。':'感謝支持！更新前已持有 Lv.190～200 武器的角色，可免費自選一次本職武器。'} 武器直接放入背包，保留補償資格的 <b>Lv.${proof.level}／${rank}${proof.enhancement?'／'+proof.enhancement+'階':''}</b>。<br><b>現在不決定也沒關係，點「先縮小」後可隨時由右側感謝禮提示重新開啟。</b></p><div class="comp-weapon-grid">${choices.map(w=>`<button class="comp-weapon-option ${w.id===chosen.id?'selected':''}" type="button" data-comp-weapon="${w.id}"><b>${escapeHtml(w.name)}</b><span>${escapeHtml(w.trait)}</span></button>`).join('')}</div><div class="comp-selected-trait"><b>選定武器特性</b><p>${escapeHtml(chosen.trait)}</p><small>固有武器特性不會因 SSS 強化而放大；下方自選詞條依裝備等級及品質計算。</small></div>${controls(chosen.id==='dualDagger'?'rifle':chosen.id,'main')}${chosen.id==='dualDagger'?controls('offDagger','offhand'):''}`;
 $('weaponCompensationClaim').textContent=correction?'確認補發第二把（僅一次）':'確認領取（僅一次）';
 for(const b of modal.querySelectorAll('[data-comp-weapon]'))b.onclick=()=>{compensationChoice=compensationDraft(b.dataset.compWeapon);renderWeaponCompensation();};
 for(const s of modal.querySelectorAll('[data-comp-field]'))s.onchange=()=>{
  const part=compensationChoice[s.dataset.compField];
  if(s.dataset.compSpecial)part.special=s.value;
  else {const n=Number(s.dataset.compIndex);const other=part.regular.findIndex((v,i)=>i>=2&&i!==n&&v===s.value);if(other>=0)part.regular[other]=part.regular[n];part.regular[n]=s.value;}
  renderWeaponCompensation();
 };
}
function showWeaponCompensation(){
 if(player?.weaponCompensation?.state!=='pending'&&!compensationCanCorrect(player))return false;
 const options=compensationWeaponOptions(player.job);if(!options.length)return false;
 if(!compensationChoice||!options.some(o=>o.id===compensationChoice.id))compensationChoice=compensationDraft(options[0].id);
 renderWeaponCompensation();weaponCompensationDialog().hidden=false;refreshWeaponCompensationReminder();$('weaponCompensationClaim').focus();return true;
}
function showOfflineReport(summary){
 if(!summary)return;const modal=$('offlineModal');$('offlineTitle').textContent='歡迎回來，離線掛機已結算';
 $('offlineContent').innerHTML=`<p>${escapeHtml(MAPS[summary.map]?.name||summary.map)} · 離開 ${offlineDuration(summary.elapsed)}<br>實際掛機 ${offlineDuration(summary.simulated)}${summary.capped?' · 已套用 24 小時上限':''}</p><p>${escapeHtml(summary.reason)}${summary.trialRounds?` · 完整通關 ${summary.trialRounds} 輪`:''}</p><div class="offline-totals"><div>擊殺<b>${summary.kills.toLocaleString()} 隻</b></div><div>金幣淨收益<b>${summary.gold>=0?'+':''}${summary.gold.toLocaleString()}</b></div><div>Base EXP<b>+${summary.baseXp.toLocaleString()}</b></div><div>Job EXP<b>+${summary.jobXp.toLocaleString()}</b></div><div>夥伴 EXP<b>+${summary.petXp.toLocaleString()}</b></div><div>掉落裝備保留<b>${summary.equipment.length} 件</b></div></div><p>Base Level ${summary.baseBefore} → ${summary.baseAfter} · Job Level ${summary.jobBefore} → ${summary.jobAfter}<br>金幣獲得 ${summary.goldEarned.toLocaleString()} · 補給／復活支出 ${summary.spent.toLocaleString()} · 自動復活 ${summary.revives||0} 次 · 避開首領 ${summary.bossesEscaped} 隻</p><details><summary>補給與掉落明細</summary><p>消耗藥水：${Object.entries(summary.potions).map(([id,qty])=>`${escapeHtml(ITEMS[id]?.name||id)} ×${qty}`).join('、')||'無'}</p><p>購入藥水：${Object.entries(summary.purchased).map(([id,qty])=>`${escapeHtml(ITEMS[id]?.name||id)} ×${qty}`).join('、')||'無'}</p><p>背包堆疊物品淨變動：${summary.stacks.map(e=>`${escapeHtml(ITEMS[e.id]?.name||e.id)} ${e.qty>0?'+':''}${e.qty}`).join('、')||'無'}</p><p>離線捕捉：${(summary.captures||[]).length} 隻${summary.captures?.length?' · '+summary.captures.map(e=>`${escapeHtml(e.name)}（${PET_RARITIES.find(r=>r.id===e.rarity)?.name||e.rarity}）`).join('、'):''}</p><p>卡片：${summary.cards.map(e=>`${escapeHtml(CARDS[e.id]?.name||e.id)} ×${e.qty}`).join('、')||'無'}</p><p>保留裝備：${summary.equipment.map(e=>`${escapeHtml(RARITIES.find(r=>r.id===e.rarity)?.name||'')} ${escapeHtml(e.name)}`).join('、')||'無'}</p></details><p class="tiny">收益已自動存入此角色；不需額外領取。依目前配置與原掉落規則補算，收益可能與即時戰鬥略有差異；滿級後的 EXP 不會繼續累積。</p>`;modal.hidden=false;$('offlineClose').focus();
}
async function settleOffline(){
 const now=Date.now(),window=offlineWindow(player,now);if(!window.eligible)return null;
 const slotIndex=activeSlot,raw=localStorage.getItem(characterSlotKey(slotIndex)),warehouseRaw=localStorage.getItem(WAREHOUSE_KEY),albumRaw=localStorage.getItem(CARD_COLLECTION_KEY);settlingOffline=true;$('entryScreen').inert=true;$('gameShell').inert=true;
 $('offlineProgress').hidden=false;$('offlineProgressText').textContent='正在補算離線掛機… 0%';
 let worker;
 try{
  const result=await new Promise((resolve,reject)=>{
   worker=new Worker(new URL('offline-worker.js?v=7.0.1-sanctuary',document.baseURI),{type:'module'});
   worker.onmessage=event=>{if(event.data.type==='progress')$('offlineProgressText').textContent=`正在補算離線掛機… ${Math.floor(event.data.value*100)}%`;else if(event.data.type==='result')resolve(event.data.result);else reject(Error(event.data.message||'離線結算失敗'));};
   worker.onerror=()=>reject(Error('離線結算載入失敗，請重新整理再試'));
   const simulatedPlayer=structuredClone(player);simulatedPlayer.cardAlbumGoldBonus=collectionGoldBonus(CARDS,readCardCollection(localStorage,CARDS));worker.postMessage({player:simulatedPlayer,now});
  });
  if(warehouseRaw!==localStorage.getItem(WAREHOUSE_KEY))throw Error('共用倉庫已在其他分頁變更，請重新進入角色結算');
  if(albumRaw!==localStorage.getItem(CARD_COLLECTION_KEY))throw Error('共用卡片收藏已在其他分頁變更，請重新進入角色結算');
  if(raw!==localStorage.getItem(characterSlotKey(slotIndex)))throw Error('此角色存檔已在其他分頁變更，請重新選擇角色');
  const previous=player;player=result.player;delete player.cardAlbumGoldBonus;delete player.autoStoppedReason;auto=!player.manualPaused;player.offline={at:Date.now(),enabled:auto&&!homecomingMap(player.location)&&(!player.trialRun||player.trialRun.continuous===true)};
  let albumChanged=false;
  try{
   const album=readCardCollection(localStorage,CARDS),organized=organizeCards(player,CARDS,album);
   sellSurplusPotions(player,ITEMS);exchangeOverflowGold(player);
   if(!valid(player))throw Error('離線結算資料驗證失敗，原存檔已保留');
   if(organized.changed){localStorage.setItem(CARD_COLLECTION_KEY,JSON.stringify(organized.collection));albumChanged=true;}
   writeCharacterSlot(localStorage,slotIndex,player);
  }catch(error){
   if(albumChanged){try{if(albumRaw===null)localStorage.removeItem(CARD_COLLECTION_KEY);else localStorage.setItem(CARD_COLLECTION_KEY,albumRaw);}catch{}}
   player=previous;throw Error('離線結算儲存空間不足或寫入失敗，原存檔與離線時間已保留：'+error.message);
  }
  return result.summary;
 }finally{worker?.terminate();settlingOffline=false;$('offlineProgress').hidden=true;$('entryScreen').inert=false;$('gameShell').inert=false;}
}

function init(){if(typeof document==='undefined'){self.onmessage=async event=>{try{const result=await simulateOffline(event.data.player,event.data.now,value=>self.postMessage({type:'progress',value}));self.postMessage({type:'result',result});}catch(error){self.postMessage({type:'error',message:error.message,...(globalThis.__spiritBenchmarkStack?{stack:error.stack}:{})});}};return;}document.addEventListener('click',e=>{const button=e.target.closest('[data-homecoming]');if(!button||!player)return;if(button.dataset.homecoming==='open')return openPanel('homecoming');homecomingAction(button.dataset.route,button.dataset.homecoming,button.dataset.choice);});$('homecomingOpen').onclick=()=>openPanel('homecoming');$('returnLastMap').onclick=()=>{if(player.lastMap)travel(player.lastMap);};$('captureRewardClose').onclick=()=>{$('captureRewardModal').hidden=true;};$('evolutionStart').onclick=beginEvolution;$('evolutionClose').onclick=closeEvolution;
 $('enterGameBtn').onclick=()=>enterCharacterSlot(selectedSlot);$('returnEntryBtn').onclick=()=>returnToEntry();$('cancelCreateBtn').onclick=closeCharacterCreation;$('fusionQuickStop').onclick=()=>{stopAutoFusion();renderSide()};$('fusionResultClose').onclick=()=>closeFusionResult();$('fusionResultBag').onclick=()=>closeFusionResult(true);

 bindHeroRename(document,{character:openCharacterRename,pet:openPetRename,activePet:()=>openPetRename(activePet()?.id)});
 // Delegated so the floor picker survives side-panel redraws and equipment changes.
 $('side').addEventListener('click',event=>{const button=event.target.closest('[data-tower-floor-go]');if(!button||button.disabled)return;const selector=button.closest('.tower-region')?.querySelector('[data-tower-floor-select]');if(selector&&!selector.disabled)startTower(Number(selector.value));});
 $('side').addEventListener('click',event=>{
  const enter=event.target.closest('[data-extreme-enter]');
  if(enter&&!enter.disabled){const selector=enter.closest('.extreme-boss-card')?.querySelector('[data-extreme-select]');return startExtreme(enter.dataset.extremeEnter,Number(selector?.value||1));}
 });
 document.addEventListener('click',event=>{
  if(!event.target.closest('[data-extreme-exit]')||!player?.extremeRun)return;
  if(confirm('確定結束極限試煉？已突破階段會保留。'))exitExtreme('主動離場');
 });
 const closeRename=()=>{$('renameModal').style.display='none';delete $('renameModal').dataset.petId;delete $('renameModal').dataset.renameTarget;};$('renameCancel').onclick=closeRename;$('renameForm').onsubmit=e=>{e.preventDefault();const name=$('renameInput').value.trim().slice(0,16);if(!name)return toast('請輸入名稱');const petId=$('renameModal').dataset.petId;if($('renameModal').dataset.renameTarget==='pet'){if(!petId)return toast('夥伴識別遺失，請重新開啟改名');const pet=player?.pets.find(p=>String(p.id)===petId);if(!pet)return toast('夥伴已不存在');const before=pet.nickname,customBefore=pet.customNickname;pet.nickname=name;pet.customNickname=true;if(save()===false){pet.nickname=before;pet.customNickname=customBefore;return toast('夥伴名稱儲存失敗');}closeRename();render();renderSide(true);return toast('夥伴暱稱已更新');}const before=player.name;player.name=name;if(save()===false){player.name=before;return toast('角色名稱儲存失敗');}closeRename();render();toast('角色名稱已更新');};

 $('logFilters')?.querySelectorAll('[data-logview]').forEach(b=>b.onclick=()=>{logView=b.dataset.logview;$('logFilters').querySelectorAll('[data-logview]').forEach(x=>x.classList.toggle('active',x===b));renderLog()});
 $('classChoices').innerHTML=Object.entries(CLASSES).filter(([id])=>!SECOND_JOBS[id]).map(([id,c])=>`<button data-class="${id}" class="${id==='swordsman'?'active':''}"><b>${c.symbol} ${c.name}</b><small>${({swordsman:'近戰 / 耐久',acolyte:'治療 / 聖屬性',mage:'元素 / 魔法',thief:'高速 / 爆擊',archer:'遠程 / 命中 / 精準',spiritist:'靈契 / 夥伴協戰'})[id]}</small><span class="class-range">${rangeLabel(playerRange(id))}</span>${id==='spiritist'?'<small class="spirit-unlock-hint"></small>':''}</button>`).join('');
 for(const b of $('classChoices').querySelectorAll('[data-class]'))b.insertAdjacentHTML('afterbegin',spriteHtml(b.dataset.class,'choice'));
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{if(b.disabled)return;selectedClass=b.dataset.class;document.querySelectorAll('[data-class]').forEach(x=>x.classList.toggle('active',x===b))});refreshSpiritCreationLock();
 $('createBtn').onclick=()=>start($('nameInput').value,selectedClass);$('nameInput').onkeydown=e=>{if(e.key==='Enter')$('createBtn').click()};
 $('attackBtn').onclick=()=>playerAttack();$('skillBtn').onclick=()=>playerAttack(true);$('tacticBtn').onclick=classTactic;$('ultimateBtn').onclick=ultimate;$('captureBtn').onclick=capture;$('fleeBossBtn').onclick=fleeMapBosses;$('autoBtn').onclick=()=>{auto=!auto;player.manualPaused=!auto;if(auto)delete player.autoStoppedReason;save();render()};$('saveBtn').onclick=()=>save(true);
 $('reviveYes').onclick=()=>revive('place');$('reviveTown').onclick=()=>revive('town');$('reviveLater').onclick=()=>$('reviveModal').style.display='none';
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openPanel(b.dataset.tab));document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{const id=b.dataset.nav;if(id==='adventure')$('battlePanel').scrollIntoView({behavior:'smooth',block:'start'});else if(id==='character')$('characterPanel').scrollIntoView({behavior:'smooth',block:'start'});else openPanel(id);});for(const b of document.querySelectorAll('[data-travel]'))b.onclick=()=>travel(b.dataset.travel==='town'?homeTown(player.location):b.dataset.travel);
 renderMapChoices();$('continentSelect').onchange=()=>{selectedContinent=$('continentSelect').value;renderMapChoices();};
 $('mapSelect').onchange=e=>{if(player)travel(e.target.value)};
 window.addEventListener('storage',event=>{if(settlingOffline)return;if(event.key!==WAREHOUSE_KEY&&!event.key?.startsWith(WAREHOUSE_ACK_PREFIX))return;try{if(player&&activeSlot!==null){applyWarehouseCustody(localStorage,activeSlot,player);clearStatSnapshots();player.hp=Math.min(player.hp,stat('hp'));player.mp=Math.min(player.mp,stat('mp'));dirty=true;render();}else renderEntry();}catch(error){toast(error.message);}});
 $('exportBtn').onclick=exportSave;$('importBtn').onclick=()=>{importTargetSlot=activeSlot;$('saveFile').click()};$('saveFile').onchange=async e=>{if(e.target.files[0])await importSave(e.target.files[0]);e.target.value=''};
 $('resetBtn').onclick=()=>{const index=activeSlot;if(index!==null&&returnToEntry())openCharacterCreation(index);};
 try{migrateLegacyCharacter(localStorage,load());const first=lobbySlots().find(slot=>slot.player);selectedSlot=first?.index??0;renderEntry();}catch(error){toast('無法讀取本機存檔：'+error.message);}
 $('gameShell').hidden=true;$('entryScreen').hidden=false;$('createModal').style.display='none';

 setInterval(()=>{if(gameRunning&&player&&!offlineSimulation&&!document.hidden){maybeRevealTrueForm();if(player.hp<=0&&$('reviveModal').style.display==='flex')showReviveDialog();const pet=activePet();if(pet?.hp<=0)render();}},1000);
 setInterval(()=>{if(evolutionRunning||settlingOffline||backgroundPaused||document.hidden||!gameRunning||!player||!enemy)return;combatTick();if(dirty&&gameNow()-lastSave>4500)save();},20);
 setInterval(()=>{if(!settlingOffline&&!backgroundPaused&&!document.hidden&&gameRunning&&player&&auto){if(player.hp>0)autoBuyPotions();if(player.autoSalvage&&player.salvageInventory)salvageBagEquipment();autoSellSelected();if(dirty)save();}},4000);
 setInterval(()=>{if(!document.hidden&&!settlingOffline&&!backgroundPaused)autoFusionTick();},250);
 window.addEventListener('pagehide',()=>{if(gameRunning&&!settlingOffline&&!backgroundPaused)save()});
 document.addEventListener('visibilitychange',async()=>{
  if(document.hidden){if(player?.extremeRun)exitExtreme('離開遊戲畫面');if(player?.towerRun)player.towerRun.pausedAt=gameNow();if(player?.trialRun)player.trialRun.pausedAt=gameNow();deferTrueFormReveal();if(gameRunning&&!settlingOffline){save();backgroundPaused=true;}return;}
  if(!backgroundPaused||!gameRunning||settlingOffline)return;backgroundPaused=false;if(player?.towerRun){resumeTower();return;}if(player?.trialRun&&!player.trialRun.continuous){resumeTrial();return;}
  try{const summary=await settleOffline();resetSession();spawn();save();if(summary){bossCardNotices.push(...(summary.bossCards||[]));showOfflineReport(summary);}else showNextBossCardNotice();if(!player.hp&&(!player.autoRevive||player.trialDefeated))showReviveDialog();}catch(error){returnToEntry(false);toast(error.message);}
 });
 $('offlineClose').onclick=()=>{$('offlineModal').hidden=true;if(!player.hp&&(!player.autoRevive||player.trialDefeated))showReviveDialog();maybeRevealTrueForm();if(!showWeaponCompensation())showNextBossCardNotice();};
}


function sellOneBagStack(key){const category=bagCategory,quote=bulkSaleQuote(player,ITEMS,bagGroup,category,manualSalePrice,rankOf);if(quote.error)return toast(quote.error);const selected=quote.entries.find(x=>(player.bag[x.index]?.uid||player.bag[x.index]?.id)===key);if(!selected)return toast('此物品不可一鍵販售');const item=ITEMS[selected.id];if(!confirm(`確定一鍵出售 ${item.name} ×${selected.qty}，獲得 ${selected.gold.toLocaleString()} 金？此操作不可復原。`))return;player.bag.splice(selected.index,1);player.gold+=selected.gold;delete sellAmounts[key];message(`出售 ${item.name} ×${selected.qty}，獲得 ${selected.gold.toLocaleString()} 金。`,'good','system');dirty=true;save();render();renderSide(true);}
function sellManual(key){const entry=player.bag.find(e=>(e.uid||e.id)===key),it=ITEMS[entry?.id];if(!entry)return;const qty=sellAmounts[key]||1;if((it.quest||it.evolution||it.craft||entry.fusionMatch||entry.swapProtected)&&!confirm(`確定手動出售 ${it.name} ×${qty}？這項材料或裝備將不再保留。`))return;const result=sellBagEntry(player,key,qty,ITEMS);if(result.error)return toast(result.error);delete sellAmounts[key];message(`出售 ${result.name} ×${result.qty}，獲得 ${result.gold} 金。`,'good','system');dirty=true;save();render();renderSide(true);}
function openAscension(id,mode='ascend'){const pet=player.pets.find(p=>p.id===id),error=ascensionError(pet,player.bag,player.location,mode);if(error)return toast(error);evolutionPreview={id,before:structuredClone(pet),ascension:true,mode};$('evolutionModal').style.display='grid';$('gameShell').inert=true;$('evolutionScene').className='evolution-scene preview';$('evolutionBefore').src=petArt(pet);$('evolutionAfter').src=petArt(pet);$('evolutionTitle').textContent=mode==='mutate'?'神話異化儀式':'夥伴界限進化';const cost=ascensionCost(pet,mode);$('evolutionStatus').textContent=mode==='mutate'?'消耗超越靈核50＋蒼穹界限靈髓20；15%變異神話，失敗保留傳說。':`消耗超越靈核${cost.essence_4}＋蒼穹界限靈髓${cost.ascension_core}＋忠誠度${ASCENSION_LOYALTY}；${pet.rarity==='mythic'?'維持神話並界限進化':'保證傳說界限形態，不抽神話'}。`;$('evolutionStart').hidden=false;$('evolutionStart').disabled=false;$('evolutionClose').disabled=false;$('evolutionClose').textContent='取消';}
function telemetryHtml(){const now=gameNow();combatSamples=combatSamples.filter(x=>now-x.at<=60000);const seconds=Math.max(1,Math.min(60,(now-(combatStarted||now))/1000)),total=combatSamples.reduce((a,x)=>({owner:a.owner+x.owner,pet:a.pet+x.pet,kills:a.kills+x.kills}),{owner:0,pet:0,kills:0});return `<b>擊殺／分鐘 ${(total.kills*60/seconds).toFixed(1)}</b><span>主人 DPS ${Math.round(total.owner/seconds).toLocaleString()}</span><span>夥伴 DPS ${Math.round(total.pet/seconds).toLocaleString()}</span><small>依傷害、共鳴與增益來源歸因；最近60秒有效傷害，未滿1分鐘依經過時間折算</small>`;}

function renderThirdResonanceGuide(){return [false,true].map(third=>`<div class="item"><h3>${third?'三轉':'進階二轉'} × 六種無序融合夥伴 · 六條共鳴路線</h3><p>${third?'三轉主攻、範圍與終結技各有獨立效果，不沿用二轉共鳴；未取得融合夥伴無法三轉，也不會啟用三轉共鳴。':'先完成夥伴融合、人物尚未三轉也能使用；未習得轉生主攻時，由原本二轉主攻觸發。'}融合順序僅影響外觀，不改變能力與技能；每條路線六招選三，施放順序可自行調整。</p>${Object.entries(THIRD_JOBS).map(([job,meta])=>`<details><summary>${third?meta.name:SECOND_JOBS[job].name}</summary>${Object.entries(FUSION_PAIRS).filter(([key])=>['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'].includes(key)).map(([key,pair])=>{const [main,sub]=key.split('-'),pet={species:({attack:'fang',magic:'wisp',defense:'shell',support:'sprout'})[main],fusion:{main,sub}},rule=companionResonance({job,thirdJob:third,reborn:true,level:player.level},pet);return `<p><b>${pair.name} · ${rule.name}</b><br>${rule.description}</p>`;}).join('')}</details>`).join('')}</div>`).join('');}

let selectedContinent='icarus';
function renderMapChoices(){
 if(offlineSimulation)return;
 const unlocked=homecomingContinents(player||{}),ids=['icarus','sky','dawn',...unlocked.map(r=>r.continentId)];
 if(!ids.includes(selectedContinent))selectedContinent='icarus';
 const selected=selectedContinent;
 $('continentSelect').innerHTML=ids.map(id=>`<option value="${id}">${CONTINENTS[id].name} · ${CONTINENTS[id].range}</option>`).join('');$('continentSelect').value=selected;
 const route=unlocked.find(r=>r.continentId===selected);
 if(route){const q=player.homecoming.routes[route.id],node=HOMECOMING_ADVENTURES[route.id]?.nodes[q.adventure?.step];$('mapSelect').innerHTML=`<option value="${route.townId}">${route.town}${q.phase==='traveling'?'・繼續首次旅程':''}</option>`+(q.phase==='active'&&node&&node.location!=='town'?`<option value="${adventureLocation(route,node)}">${node.combat?'任務戰鬥':'事件現場'}</option>`:'');}
 else $('mapSelect').innerHTML=(selected==='dawn'?'<option value="dawncity">🌅 曙光聖港</option><option value="dawnrift">🌄 Lv.201–210 黎明斷層</option>'+(spiritSanctuaryUnlocked(player)?'<option value="spirit-sanctuary">✦ 契靈之地 · Lv.100 神話捕捉</option>':''):selected==='sky'?'<option value="skycity">🏙️ 蒼穹樞城</option>':'<option value="town">🏰 靈契主城</option><option value="petland">🌿 夥伴之地 · 可捕捉</option>')+ZONES.filter(z=>(z.min>=101?'sky':'icarus')===selected).map(z=>`<option value="${z.id}">${z.icon} Lv.${z.min}–${z.max} ${z.name}</option>`).join('');
 if(player&&continentFor(player.location)===selected)$('mapSelect').value=player.location;else if(player)$('mapSelect').insertAdjacentHTML('afterbegin','<option value="" disabled selected>請選擇目的地</option>');
}

function renderThirdTransfer(){const reason=thirdJobError(player)||spiritThirdJobExtraError(player,...activePetRoster(player)),meta=THIRD_JOBS[player.job],q=spiritQuestState(player),spirit=isSpiritJob(player.job);return `<div class="item"><h3>覺醒導師・賽菈</h3><p>${player.thirdJob?`已完成三轉：${meta.name}`:`${SECOND_JOBS[player.job]?.name||'二轉職業'} → ${meta?.name||'三轉職業'}`}</p><p>需要Base150／轉生二轉Job70、${THIRD_SEAL_NAME}${THIRD_SEAL_COST}枚。150級天極斷界龍掉落率5%。目前持有 ${player.bag.find(x=>x.id===THIRD_SEAL)?.qty||0}／${THIRD_SEAL_COST}枚。</p><p>三轉保留人物等級、配點、全部原有技能、裝備、卡片與夥伴；Job重設1、上限70。五個主動技能各10級、四個被動各5級，共70點，Job1先學主攻1級，之後每級給1點。Base上限開放200；夥伴需各自融合進化後才能突破150。</p>${spirit?`<section class="quest-row"><h3>✧ 御靈專屬支線：單靈誓約</h3><p>「御靈者與唯一的融合夥伴締結誓約，以一份契約走向覺醒。」——覺醒導師・賽菈</p><p>請帶領一隻融合夥伴，在蒼穹彼岸101–150級區域共同擊敗 ${SPIRIT_TRIAL_KILLS} 名敵人。必須該融合夥伴存活且出戰才計入。完成後回到此地立誓，才可三轉；任務進度會隨角色存檔。</p><p>${q?.done?'✓ 單靈誓約已完成':q?.started?`契約勝利：${q.kills||0}／${SPIRIT_TRIAL_KILLS}`:'尚未接受誓約'}</p>${q?.done?'':`<button data-spirit-quest="${q?.started?'complete':'start'}">${q?.started?'回報單靈試煉':'接受單靈誓約支線'}</button>`}</section>`:''}<button data-third-transfer ${reason?'disabled':''}>${reason||`消耗${THIRD_SEAL_COST}枚聖印，進行三轉`}</button></div>`;}
function spiritQuestAction(action){const previous=structuredClone(player),roster=activePetRoster(player),error=action==='start'?startSpiritQuest(player,roster):completeSpiritQuest(player,roster);if(error)return toast(error);dirty=true;if(save()===false){player=previous;return;}message(action==='start'?'✧ 已立下單靈試煉的初誓，攜一隻融合夥伴前往101–150級地圖。':'✧ 單靈誓約完成，覺醒導師承認你的單靈誓約。','rare','system');render();}
function thirdTransfer(){const error=thirdJobError(player)||spiritThirdJobExtraError(player,...activePetRoster(player));if(error)return toast(error);if(!confirm(`確認轉為${THIRD_JOBS[player.job].name}？消耗天極覺醒聖印${THIRD_SEAL_COST}枚，保留裝備與舊技能，Job回到1；人物上限200。`))return;const previous=structuredClone(player);const seals=player.bag.find(x=>x.id===THIRD_SEAL);seals.qty-=THIRD_SEAL_COST;player.bag=player.bag.filter(x=>x.id!==THIRD_SEAL||x.qty>0);player.secondJobLevel=player.jobLevel;player.thirdJob=true;player.jobLevel=1;player.jobXp=0;player.jobSkills['thirdMain_'+player.job]=1;reconcileSkillPoints(player,JOB_SKILLS[player.job],true);const old='rebirthMain_'+player.job;player.autoSkills.order=player.autoSkills.order.map(id=>id===old?'thirdMain_'+player.job:id);player.equippedJobSkill='thirdMain_'+player.job;clearStatSnapshots();player.hp=stat('hp');player.mp=stat('mp');dirty=true;if(save()===false){player=previous;return;}message(`三轉完成！【${THIRD_JOBS[player.job].name}】開放151–200級。`,'rare');render();}
function renderPetFusion(){return `<section class="item fusion-pet-panel"><h3>✧ 150級融合進化</h3><p>僅在蒼穹樞城進行。兩隻不同系列、150級、已界限進化的神話夥伴融合。主素材保留自身裝備、等級150；副素材永久消耗，副素材裝備退回背包。兩者IV取平均。融合後才可升至151，上限200。</p><p>融合為六組無序能力：主／副順序僅影響外觀，正反順序的能力、技能與專屬共鳴相同。鎖定夥伴請先解除鎖定。</p>${Object.entries(FUSION_PAIRS).map(([key,meta])=>`<details><summary>${meta.name} · ${key.split('-').map(role=>({attack:'攻擊',magic:'魔法',defense:'防禦',support:'輔助'})[role]).join('＋')}</summary><p>${meta.style}；融合技能3選2。</p></details>`).join('')}${player.pets.filter(p=>p.rarity==='mythic'&&p.ascended&&p.level>=150&&!p.fusion).map(p=>`<div class="skill-option"><b>主素材：${escapeHtml(p.nickname)}</b><label>選擇副素材<select data-pet-fuse-donor="${p.id}" aria-label="${escapeHtml(p.nickname)}的融合副素材">${player.pets.filter(q=>q.id!==p.id&&q.rarity==='mythic'&&q.ascended&&q.level>=150&&!q.fusion&&PET_FAMILIES[q.species]!==PET_FAMILIES[p.species]).map(q=>`<option value="${q.id}">${escapeHtml(q.nickname)} · Lv.${q.level}${q.locked?' · 已鎖定':''}</option>`).join('')}</select></label><button data-pet-fuse="${p.id}" ${player.location!=='skycity'||p.locked?'disabled':''}>預覽融合與消耗</button></div>`).join('')}</section>`;}
function openPetFusion(id){const select=$('side').querySelector(`[data-pet-fuse-donor="${id}"]`),donorId=select?.value,error=fusionPetError(player,id,donorId);if(error)return toast(error);const pet=player.pets.find(p=>p.id===id),donor=player.pets.find(p=>p.id===donorId);evolutionPreview={id,donorId,fusion:true,before:structuredClone(pet)};$('evolutionModal').style.display='grid';$('gameShell').inert=true;$('evolutionScene').className='evolution-scene preview';$('evolutionBefore').src=petArt(pet);$('evolutionAfter').src=petArt(pet);$('evolutionTitle').textContent='雙靈融合儀式';$('evolutionStatus').textContent=`主素材 ${pet.nickname} ＋ 副素材 ${donor.nickname}。副素材將永久消耗，其裝備退回背包；結果必為神話融合形態，上限200。`;$('evolutionStart').hidden=false;$('evolutionStart').disabled=false;$('evolutionClose').disabled=false;$('evolutionClose').textContent='取消';}

function checkRankUnlocks(){const unlocked=unlockRankOutfits(player,GEAR_BASE);if(unlocked.length){dirty=true;toast(`已解鎖 ${unlocked.join('／')}階職業外觀！可至角色 → 角色外觀選擇。`);}if(player.dawnUnlocked&&!player.dawnNotified){player.dawnNotified=true;dirty=true;toast('全身SSS階達成！曙界新陸已開放，可從大陸選單前往曙光聖港。');}return unlocked;}
function isControlled(){if(controlEffect&&controlEffect.until<=gameNow())controlEffect=null;return !!controlEffect;}
function tickTrialControl(now){if(!player.trialRun)return;for(const foe of enemies){if(!foe.hp||!foe.trial)continue;if(foe.enrageAfter&&now-foe.appearedAt>=foe.enrageAfter){foe.unragedAtk ||= foe.atk;const rage=2+Math.floor((now-foe.appearedAt-foe.enrageAfter)/15000);foe.atk=Math.round(foe.unragedAtk*rage);if(rage!==foe.enrage){foe.enrage=rage;message(`⚠ ${foe.name} 發動終界裁決！攻擊提升至${rage}倍，之後每15秒繼續強化。`,'bad','system');}}if(foe.controlCast&&now>=foe.controlCast.until){const type=foe.controlCast.type;delete foe.controlCast;foe.controlNext=now+foe.controlCooldown;const chance=controlResistance(player,type,GEAR_BASE);if(chance>=1||Math.random()<chance)message(`✧ 抵抗了【${CONTROL_NAMES[type]}】！`,'good','system');else{controlEffect={type,until:now+foe.controlDuration};casting=null;message(`⚠ ${foe.name} 施放【${CONTROL_NAMES[type]}】，人物暫時無法行動。`,'bad','system');}dirty=true;render();}else if(!foe.controlCast&&now>=(foe.controlNext||Infinity)){const types=Object.keys(CONTROL_NAMES),type=types[(types.indexOf(foe.control)+(foe.controlSequence||0))%types.length];foe.controlSequence=(foe.controlSequence||0)+1;foe.controlCast={type,until:now+foe.controlWindup};message(`⚠ ${foe.name} 準備施放【${CONTROL_NAMES[type]}】！`,'bad','system');dirty=true;render();}}if(controlEffect&&controlEffect.until<=now){controlEffect=null;render();}}
// Continuous trials persist actual combat state, not estimated rewards or a fresh boss.
function validTrialCheckpoint(run){const c=run?.checkpoint;return TRIAL_ROUTES.some(r=>r.map===run.map)&&Number.isInteger(run.index)&&run.index>=0&&run.index<5&&c?.version===1&&Number.isFinite(c.at)&&Array.isArray(c.enemies)&&c.enemies.length<=1&&c.enemies.every(e=>e.trial&&e.trialIndex===run.index&&Number.isFinite(e.hp)&&e.hp>=0&&Number.isFinite(e.maxHp)&&e.maxHp>0)&&!!c.timers&&!!c.petEffects&&!!c.classBuffs;}
function checkpointTrial(){const run=player?.trialRun;if(!run?.continuous)return;run.checkpoint=structuredClone({version:1,at:gameNow(),enemies,timers,jobSkillTimers,petSkillTimers,petEffects,classBuffs,casting,controlEffect,petShield,shield:player.shield});}
function restoreTrialCheckpoint(){const run=player?.trialRun;if(!run?.continuous||!validTrialCheckpoint(run))return false;const c=structuredClone(run.checkpoint),delta=gameNow()-c.at,shift=n=>Number.isFinite(n)&&n!==0?n+delta:n;
 enemies=c.enemies;enemy=enemies[0]||{id:'town',hp:0,maxHp:1};for(const e of enemies){for(const k of ['lastAttack','appearedAt','controlNext'])e[k]=shift(e[k]);if(e.controlCast)e.controlCast.until=shift(e.controlCast.until);}
 timers=c.timers;for(const k of Object.keys(timers))if(!['actionDelay','combo'].includes(k))timers[k]=shift(timers[k]);if(timers.unassisted)for(const k of Object.keys(timers.unassisted))timers.unassisted[k]=shift(timers.unassisted[k]);jobSkillTimers=c.jobSkillTimers||{};petSkillTimers=c.petSkillTimers||{};for(const values of [jobSkillTimers,petSkillTimers])for(const k of Object.keys(values))values[k]=shift(values[k]);
 petEffects=c.petEffects;for(const k of Object.keys(petEffects))if(/(?:Until|Next|Expires)$/.test(k))petEffects[k]=shift(petEffects[k]);classBuffs=c.classBuffs;for(const b of Object.values(classBuffs))if(b&&typeof b==='object'&&Number.isFinite(b.until))b.until=shift(b.until);
 casting=c.casting;controlEffect=c.controlEffect;if(casting)casting.until=shift(casting.until);if(controlEffect)controlEffect.until=shift(controlEffect.until);petShield=c.petShield||0;player.shield=c.shield||0;run.nextAt=shift(run.nextAt);for(const pet of player.pets)if(pet.hp<=0&&pet.reviveAt)pet.reviveAt=shift(pet.reviveAt);run.checkpoint.at=gameNow();checkpointTrial();startReport();render();return true;}
function nextContinuousTrial(route){const run=player.trialRun;if(run.stopAfterRound)return exitTrial('本輪五戰已完成，依設定停止連續試煉');const candidate={...player,location:'skycity',trialRun:null},error=trialEntryError(candidate,route);if(error)return exitTrial(error==='缺少對應入場券'?'入場券已用完，連續挑戰停止':error);consumeStack(player.bag,route.ticket);run.index=0;run.round=(run.round||1)+1;run.nextAt=gameNow()+2500;enemy={id:'town',hp:0,maxHp:1};enemies=[];message(`本輪通關！消耗1張${ITEMS[route.ticket].name}，準備第${run.round}輪。`,'good','system');dirty=true;save();render();}
function toggleTrialStopAfterRound(){const run=player?.trialRun;if(!run?.continuous)return;const previous=run.stopAfterRound===true;run.stopAfterRound=!previous;if(save()===false){run.stopAfterRound=previous;return;}message(run.stopAfterRound?'已設定：完成本輪五戰後停止，不再扣下一張入場券。':'已取消本輪停止設定，將繼續下一輪試煉。','good','system');render();renderSide(true);}
function resumeTrial(){const now=gameNow(),delta=Math.max(0,now-(player.trialRun?.pausedAt||now));if(controlEffect)controlEffect.until+=delta;if(casting)casting.until+=delta;if(player.trialRun){player.trialRun.nextAt+=delta;delete player.trialRun.pausedAt;}for(const foe of enemies){foe.lastAttack=now;foe.appearedAt+=delta;foe.controlNext=(foe.controlNext||now)+delta;if(foe.controlCast)foe.controlCast.until+=delta;}save();render();}
// 三域極限試煉：使用現有戰鬥循環，禁止正常怪物收益、離線推進及死亡復活刷分。
function startExtreme(kind,floor){
 const result=beginExtremeRun(player,kind,floor,gameNow());
 if(result.error)return toast(result.error);
 if(!confirm(`挑戰${EXTREME_TRIALS[kind].name}第 ${floor} 階？\n挑戰將在死亡、離場或關閉頁面時結束。`))return;
 const previous=structuredClone(player);
 player.extremeRun=result.run;player.location='dawnrift';player.offline={at:Date.now(),enabled:false};
 stopAutoFusion('進入極限試煉');spawn();spawnExtremeBoss();tab='extreme';auto=!player.manualPaused;
 if(!save()){player=previous;spawn();return toast('無法保存試煉入場狀態');}
 render();renderSide(true);
}
function renderExtremeEncounter(){
 const run=player.extremeRun,stage=extremeStage(run.kind,run.floor),foe=enemies[0];
 if(!foe)return '<div class="enemy-idle">極限首領準備中…</div>';
 const left=Math.max(0,Math.ceil((run.stageStartedAt+stage.seconds*1000-gameNow())/1000));
 const objective=run.kind==='clear'?`已擊殺 ${run.stageKills||0}／${stage.requiredKills} 隻 · 場上 ${enemies.filter(e=>e.hp>0).length} 隻`:run.kind==='hp'?`傷害 ${Math.round(run.stageDamage||0).toLocaleString()}／${stage.requiredDamage.toLocaleString()}`:`${run.kind.toUpperCase()} 倍率 ${stage.attackMultiplier.toFixed(2)} · 存活挑戰`;
 return `<div class="enemy-target tower-encounter"><div class="tower-encounter-main"><div class="tower-monster-portrait">${spriteHtml(foe.id,'monster')}</div><div class="tower-encounter-info"><b>⚔ 四域極限試煉 · 第 ${run.floor} 階<br>${EXTREME_TRIALS[run.kind].name}</b><div class="tower-objective-banner">${objective}</div><small>⏳ 本階剩餘 ${left} 秒</small><button data-extreme-exit="1">結束挑戰</button></div></div></div>`;
}
function spawnExtremeMinion(now=gameNow()){
 const run=player?.extremeRun;if(run?.kind!=='clear')return;
 const stage=extremeStage('clear',run.floor),base=DAWN_MONSTERS[0];
 const foe={...base,id:`extreme-clear-${++encounterSerial}`,name:`萬軍魔主・第 ${run.floor} 階軍勢`,
  extremeKind:'clear',boss:false,elite:false,map:'extreme',level:210,
  hp:Math.max(1,Math.round(base.hp*stage.hpMultiplier)),maxHp:Math.max(1,Math.round(base.hp*stage.hpMultiplier)),
  atk:0,matk:0,attackType:'physical',xp:0,gold:0,drops:[],
  lastAttack:now,appearedAt:now,instanceId:`extreme-clear-${encounterSerial}`};
 SPECIES[foe.id]={name:foe.name,role:'attack',roleName:'極限清怪',level:210};
 enemies.push(foe);return foe;
}
function spawnExtremeBoss(){
 const run=player?.extremeRun;if(!run)return;
 const now=gameNow(),stage=extremeStage(run.kind,run.floor),base=DAWN_BOSS;
 if(run.kind==='clear'){
  enemies=[];for(let i=0;i<stage.simultaneous;i++)spawnExtremeMinion(now);
  enemy=enemies[0];run.stageStartedAt=now;run.stageKills=0;run.stageDamage=0;
  controlEffect=null;casting=null;startReport();dirty=true;
  message(`⚔ 萬軍魔主 · 第 ${run.floor} 階：30 秒清怪試煉開始！`,'rare','system');return;
 }
 const foe={...base,id:`extreme-${run.kind}`,name:EXTREME_TRIALS[run.kind].name,
   level:210,boss:true,extremeKind:run.kind,elite:false,map:'extreme',
   hp:Number.MAX_SAFE_INTEGER,maxHp:Number.MAX_SAFE_INTEGER,
   atk:run.kind==='hp'?0:Math.max(1,Math.round(base.atk*.2*stage.attackMultiplier)),
   matk:run.kind==='matk'?Math.max(1,Math.round((base.matk||base.atk)*.2*stage.attackMultiplier)):0,
   attackType:run.kind==='matk'?'magic':'physical',xp:0,gold:0,drops:[],
   hit:base.hit||250,def:base.def||0,mdef:base.mdef||0,
   aspd:run.kind==='hp'?1:base.aspd||160,lastAttack:now,appearedAt:now,
   instanceId:`extreme-${run.kind}-${run.floor}-${++encounterSerial}`};
 SPECIES[foe.id]={name:foe.name,role:'attack',roleName:'極限試煉',level:210};
 enemies=[foe];enemy=foe;run.stageStartedAt=now;run.stageDamage=0;
 controlEffect=null;casting=null;startReport();dirty=true;
 message(`⚔ ${foe.name} · 第 ${run.floor} 階開始！`,'rare','system');
}
function awardExtremeEnemy(){
 const defeated=enemy,run=player?.extremeRun;
 if(run?.kind!=='clear'||defeated?.extremeKind!=='clear'||defeated.hp>0||defeated.rewarded)return;
 defeated.rewarded=true;run.stageKills=(run.stageKills||0)+1;
 enemies=enemies.filter(e=>e!==defeated&&e.hp>0);
 spawnExtremeMinion();enemy=selectEncounterTarget(enemies,player.targetPriority)||enemies[0];
 dirty=true;
}
function tickExtreme(now){
 const run=player?.extremeRun;if(!run)return;
 const result=extremeStageResult(run,now,{alive:player.hp>0&&!(['pactWarrior','spiritCommander'].includes(player.job)&&activePet()?.hp<=0)});
 if(result.status==='active')return;
 if(result.status==='failed')return exitExtreme(result.reason);
 const reward=settleExtremeStage(player.extremeProgress,run.kind,run.floor);
 player.extremeProgress=reward.progress;player.extremeCoins=(player.extremeCoins||0)+reward.coins;
 if(reward.coins)message(`✦ 首次突破第 ${run.floor} 階，極限徽記 +${reward.coins}！`,'rare','system');
 run.floor++;run.stageStartedAt=now;run.stageDamage=0;
 player.hp=stat('hp');player.mp=stat('mp');player.shield=0;
 for(const pet of activePetRoster(player)){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;delete pet.reviveAt;}
 spawnExtremeBoss();dirty=true;save();render();renderSide(true);
}
function exitExtreme(reason='主動離場'){
 if(!player?.extremeRun)return;
 const finished=player.extremeRun;endReport(`極限試煉：${reason}`);
 player.extremeLastResult={kind:finished.kind,floor:finished.floor,reason};
 delete player.extremeRun;controlEffect=null;casting=null;
 player.location='dawncity';selectedContinent='dawn';
 player.hp=stat('hp');player.mp=stat('mp');player.shield=0;
 for(const pet of player.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;delete pet.reviveAt;}
 spawn();auto=!player.manualPaused;tab='extreme';dirty=true;save();
 if(!offlineSimulation){$('reviveModal').style.display='none';renderMapChoices();render();renderSide(true);}
 message(`極限試煉結束：${reason}`,'good','system');
}
// First release: one online floor per attempt. Never use the old five-boss ticket/reward path.
function startTower(floor){
 if(player.location!=='dawncity')return toast('請前往曙光聖港挑戰天穹終境');
 const now=gameNow(),result=beginTowerRun(player,floor,now);
 if(result.error)return toast(result.error);
 const stage=towerFloor(floor),objective=stage.objective==='hunt'?`在不斷重生的小怪中撐過 ${stage.goal} 秒，每擊殺小怪就延後王的必殺技；必殺施放即失敗`:stage.objective==='survive'?`在首領追擊下存活 ${stage.goal} 秒`:stage.objective==='assassinate'?'擊敗目標首領即可通關，護衛會一起撤退':'擊敗本層全部指定敵人';
 if(!confirm(`挑戰天穹終境第 ${floor} 層？\n通關條件：${objective}。\n死亡、超時、關閉頁面都會結束本次挑戰。`))return;
 const previous=structuredClone(player);
 player.towerProgress=result.progress;player.towerRun=result.run;player.location='dawnrift';player.offline={at:Date.now(),enabled:false};
 stopAutoFusion('進入天穹終境');spawn();spawnTowerEnemies();tab='tower';auto=!player.manualPaused;
 if(!save()){player=previous;spawn();return;}
 render();renderSide(true);
}
function spawnTowerEnemies(){
 if(!player?.towerRun)return;
 const now=gameNow(),foes=buildTowerEnemies(player.towerRun.floor,{monster:DAWN_MONSTERS[0],boss:DAWN_BOSS},now);
 enemies=foes.map((foe,index)=>({...foe,...monsterRuntimeStats(foe),hp:foe.hp,maxHp:foe.maxHp,
  lastAttack:now,instanceId:`tower-${player.towerRun.floor}-${index}-${++encounterSerial}`}));
 for(const foe of enemies)SPECIES[foe.id]={name:foe.name,role:'attack',roleName:'天穹終境',level:210};
 enemy=enemies[0];player.towerRun.stageStartedAt=now;controlEffect=null;casting=null;startReport();
 message(`✧ 天穹終境第 ${player.towerRun.floor} 層開始！`,'rare','system');dirty=true;
}
function awardTowerEnemy(){
 const defeated=enemy,run=player?.towerRun;if(!run||!defeated||defeated.hp>0||defeated.rewarded)return;
 if(defeated.towerSummon||defeated.towerPursuer||defeated.towerEscort){defeated.rewarded=true;enemies=enemies.filter(e=>e!==defeated&&e.hp>0);enemy=selectEncounterTarget(enemies,player.targetPriority)||{id:'town',hp:0,maxHp:1};message(`已消滅 ${defeated.name}。`,'good','system');dirty=true;return;}
 if(towerFloor(run.floor).objective==='hunt'){
  const now=gameNow(),stage=towerFloor(run.floor);defeated.rewarded=true;run.huntKills=(run.huntKills||0)+1;player.kills++;
  for(const pursuer of enemies.filter(e=>e.towerPursuer&&e.hp>0))postponeTowerPursuer(pursuer,stage.pursuerDelayPerKillSeconds);
  const serial=++encounterSerial,respawn={...defeated,id:`tower-${run.floor}-wave-${serial}`,name:`${stage.name}・增援`,
   hp:defeated.maxHp,atk:defeated.atk,hasReward:false,rewarded:false,appearedAt:now,lastAttack:now,instanceId:`tower-${run.floor}-wave-${serial}`};
  SPECIES[respawn.id]={name:respawn.name,role:'attack',roleName:'天穹追擊增援',level:210};
  enemies=enemies.filter(e=>e!==defeated&&e.hp>0);enemies.push(respawn);
  enemy=selectEncounterTarget(enemies.filter(e=>!e.towerPursuer),player.targetPriority)||respawn;
  message(`✦ 已擊殺 ${run.huntKills} 隻小怪！下一隻立刻補上，首領必殺延後 ${stage.pursuerDelayPerKillSeconds} 秒。`,'good','system');
  dirty=true;save();render();return;
 }
 const now=gameNow(),result=markTowerEnemyDefeated(run,defeated.id,towerFloor(run.floor).enemyCount,now);
 if(result.error)return;
 defeated.rewarded=true;player.towerRun=result.run;player.kills++;
 const wasSelected=enemy===defeated;enemies=enemies.filter(foe=>foe!==defeated&&foe.hp>0);
 enemy=selectEncounterTarget(enemies,player.targetPriority)||{id:'town',hp:0,maxHp:1};
 message(`擊敗 ${defeated.name}！`,'good','system');
 if(result.stageCleared){
  completeTowerRun(now);
 }else if(wasSelected)startReport();
 dirty=true;save();render();
}
function completeTowerRun(now){
 const run=player?.towerRun;if(!run)return;
 const settled=settleTowerRun(player,run,now,{alive:player.hp>0,totalEnemies:run.completedEnemyIds.length});
 if(settled.error)return exitTower(settled.error);
 player.towerProgress=settled.progress;const paid=awardTowerCoins(player,settled.coins,{firstClear:settled.firstClear});
 player.towerLastResult={floor:run.floor,coins:paid,firstReward:settled.firstReward,clearSeconds:settled.clearSeconds,...(towerFloor(run.floor).objective==='hunt'?{huntKills:run.huntKills||0}:{})};
 delete player.towerLastFailure;
 const cleared=run.floor;endReport(`天穹終境第${cleared}層通關`);
 message(`✦ 第${cleared}層達成目標！天穹塔幣 +${paid}${settled.firstReward?' · 解鎖稱號：'+settled.firstReward:''}`,'rare','system');
 exitTower('通關',false);
}
function exitTower(reason='離開挑戰',failed=true){
 if(!player?.towerRun)return;
 if(failed)player.towerLastFailure={floor:player.towerRun.floor,reason:String(reason).slice(0,60),elapsedSeconds:Math.max(0,Math.round((gameNow()-player.towerRun.stageStartedAt)/1000)),...(towerFloor(player.towerRun.floor).objective==='hunt'?{huntKills:player.towerRun.huntKills||0}:{})};
 endReport(`天穹終境：${reason}`);delete player.towerRun;controlEffect=null;casting=null;
 player.location='dawncity';selectedContinent='dawn';
 if(player.hp<=0){delete player.reviveAt;player.hp=stat('hp');player.mp=stat('mp');player.shield=0;
  for(const pet of player.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;delete pet.reviveAt;}}
 spawn();auto=!player.manualPaused;tab='tower';
 message(`天穹終境${reason}，已返回曙光聖港。` ,failed?'bad':'good','system');
 dirty=true;save();if(!offlineSimulation){$('reviveModal').style.display='none';renderMapChoices();render();renderSide(true);}
}
function renderTowerEncounter(){const foe=enemies.find(e=>e.hp>0),run=player.towerRun;if(!foe)return '<div class="enemy-idle">結算中…</div>';
 const skill=foe.bossPattern?towerBossSignature(run.floor,foe.towerPhase||0):null;
 const pursuer=enemies.find(e=>e.towerPursuer&&e.hp>0),pursuerCast=pursuer&&towerFloor(run.floor).objective==='hunt'?`<div class="tower-cast-warning" role="status">⚠ ${pursuer.name} 準備【終境追獵・裁決】 · ${Math.max(0,Math.ceil((pursuer.towerNextStrikeAt-gameNow())/1000))} 秒後施放 · 擊殺 1 隻小怪延後 8 秒</div>`:'';
 const cast=skill?`<div class="tower-cast-warning" role="status">⚠ ${skill.name} · ${foe.towerNextSkill?`約 ${Math.max(0,Math.ceil((foe.towerNextSkill-gameNow())/1000))} 秒後施放`:'蓄力中'}${skill.type==='freeze'?' · 可由控制抗性抵擋':''}</div>`:pursuerCast;
 const stage=towerFloor(run.floor),progress=stage.objective==='hunt'?`逃離倒數 ${Math.max(0,stage.goal-Math.floor((gameNow()-run.stageStartedAt)/1000))} 秒 · 已擊殺 ${run.huntKills||0} 隻`:stage.objective==='survive'?`已存活 ${Math.max(0,Math.floor((gameNow()-run.stageStartedAt)/1000))}／${stage.goal} 秒`:`目標 ${run.completedEnemyIds.length}／${stage.enemyCount}`;
 return `<div class="enemy-target tower-encounter ${run.floor<=10?'tower-dawn':run.floor<=20?'tower-flame':'tower-frost'}"><div class="tower-encounter-main"><div class="tower-monster-portrait">${spriteHtml(foe.id,'monster')}</div><div class="tower-encounter-info"><b>✧ 天穹終境 · 第 ${run.floor} 層<br>${escapeHtml(foe.name)}</b><span>生命值 ${foe.hp.toLocaleString()}／${foe.maxHp.toLocaleString()} HP</span>${meter(foe.hp,foe.maxHp,'red')}<div class="tower-objective-banner">${towerObjectiveLabel(stage)}<br>${progress}</div><small>⏳ 剩餘 ${Math.ceil(towerRemainingSeconds(run,gameNow()))} 秒 · 場上 ${enemies.filter(e=>e.hp>0).length} 名敵人</small>${cast}</div></div></div>`;}
function tickTowerBossMechanics(now){
 if(!player?.towerRun)return;
 const towerStage=towerFloor(player.towerRun.floor);
 if((towerStage.objective==='survive'||towerStage.objective==='hunt')&&player.hp>0&&now-player.towerRun.stageStartedAt>=towerStage.goal*1000){completeTowerRun(now);return;}
 if(towerStage.objective==='hunt')for(const pursuer of enemies.filter(e=>e.towerPursuer&&e.hp>0)){
  if(now<pursuer.towerNextStrikeAt)continue;
  pursuer.towerNextStrikeAt=now+pursuer.towerCastIntervalMs;
  player.hp=0;
  message(`⚠ ${pursuer.name} 完成【終境追獵・裁決】！必殺施放，挑戰直接失敗。`,'bad','system');dirty=true;
  exitTower('追獵裁決必殺');return;
 }
 for(const foe of [...enemies]){
  if(!foe.boss||!foe.tower||foe.hp<=0||!foe.bossPattern)continue;
  const pattern=foe.bossPattern,ratio=foe.hp/foe.maxHp;
  let phase=foe.towerPhase||0;
  while(phase<pattern.phases.length&&ratio<=pattern.phases[phase]){
   phase++;foe.towerPhase=phase;foe.atk=Math.round(foe.atk*1.10);
   message(`⚠ ${foe.name} 進入第 ${phase+1} 階段：${pattern.abilities[Math.min(phase,pattern.abilities.length-1)]}！`,'bad','system');
   const count=Math.min(4,pattern.summons[phase-1]||0);
   for(let i=0;i<count;i++){
    const base=DAWN_MONSTERS[i%DAWN_MONSTERS.length],id=`tower-summon-${player.towerRun.floor}-${phase}-${i}`;
    const hp=Math.max(1,Math.round(foe.maxHp*.07));
    const summon={...base,id,name:`${foe.name}・召喚體`,tower:true,towerSummon:true,boss:false,elite:false,
     level:210,hp,maxHp:hp,atk:Math.round(foe.atk*.22),xp:0,gold:0,drops:[],
     lastAttack:now,appearedAt:now,instanceId:`tower-summon-${++encounterSerial}`};
    SPECIES[id]={name:summon.name,role:'attack',roleName:'天穹召喚體',level:210};enemies.push(summon);
   }
  }
  const skill=towerBossSignature(player.towerRun.floor,foe.towerPhase||0);
  if(!foe.towerNextSkill)foe.towerNextSkill=foe.appearedAt+skill.intervalMs;
  if(now>=foe.towerNextSkill){
   foe.towerNextSkill=now+skill.intervalMs;
   if(skill.type==='strike'){
    const damage=Math.min(Math.floor(stat('hp')*skill.maxHpRatio),incomingMonsterDamage(foe.atk*skill.power,stat('def')));
    player.hp=Math.max(0,player.hp-Math.max(1,damage));
    message(`⚠ ${foe.name} 發動【${skill.name}】！HP -${damage}`,'bad','system');
   }else if(skill.type==='burn'){
    const damage=Math.max(1,Math.floor(stat('hp')*Math.min(skill.hpRatio,skill.maxHpRatio)));
    player.hp=Math.max(0,player.hp-damage);
    message(`⚠ ${foe.name} 發動【${skill.name}】！HP -${damage}`,'bad','system');
   }else if(skill.type==='freeze'){
    const resisted=controlResistance(player,'freeze',GEAR_BASE);
    if(resisted>=1||Math.random()<resisted)message('✧ 抵抗了永凍束縛！','good','system');
    else if(!controlEffect||controlEffect.until<=now){controlEffect={type:'freeze',until:now+Math.min(skill.durationMs,skill.maxDurationMs)};casting=null;message(`⚠ ${foe.name} 施放【${skill.name}】！`,'bad','system');}
   }
   dirty=true;
   if(player.hp<=0){exitTower('首領技能擊敗玩家');return;}
  }
 }
}
function resumeTower(){const run=player?.towerRun;if(!run)return;const now=gameNow(),delta=Math.max(0,now-(run.pausedAt||now));run.stageStartedAt+=delta;delete run.pausedAt;for(const foe of enemies){foe.lastAttack=now;foe.appearedAt+=delta;}save();render();renderSide(true);}
function startTrial(map,continuous=false){const route=TRIAL_ROUTES.find(r=>r.map===map);if(!route)return;const error=trialEntryError(player,route);if(error)return toast(error);if(continuous&&!player.trialClears?.[map])return toast('請先完整通關此試煉一次，解鎖連續挑戰');if(!confirm(`消耗1張${ITEMS[route.ticket].name}，${continuous?'開始連續挑戰':'進入'}${route.name}五連戰？\n${continuous?'每輪再消耗1張對應入場券，支援背景及離線（最多24小時）。失敗、券用完或背包不足即停止；不自動復活續刷。':'首領逐隻出現，死亡、撤退或關閉遊戲皆結束挑戰。首次完整通關後解鎖此試煉的連續挑戰。'}已掉落結晶保留，不退券。`))return;const snapshot=structuredClone(player);consumeStack(player.bag,route.ticket);player.trialRun={map,index:0,nextAt:gameNow()+1000,...(continuous?{continuous:true,round:1}:{})};delete player.trialStopReason;delete player.autoStoppedReason;player.location=map;player.offline={at:Date.now(),enabled:false};if(!save()){player=snapshot;return;}stopAutoFusion('進入試煉');controlEffect=null;spawn();tab='trials';auto=continuous?true:!player.manualPaused;if(continuous)player.manualPaused=false;spawnTrialBoss();render();renderSide(true);}
function spawnTrialBoss(){const run=player.trialRun;if(!run||enemies.some(e=>e.hp>0))return;const route=TRIAL_ROUTES.find(r=>r.map===run.map),template=createTrialBoss(route,run.index,MAP_BOSSES[route.map]);SPECIES[template.id]={name:template.name,role:'attack',roleName:'天穹試煉首領',level:template.level};const now=gameNow(),foe={...template,...monsterRuntimeStats(template),hp:template.hp,maxHp:template.hp,lastAttack:now,appearedAt:now,instanceId:`trial-${route.level}-${run.index}-${++encounterSerial}`,controlNext:now+4000,controlSequence:0};enemies=[foe];enemy=foe;controlEffect=null;casting=null;startReport();message(`第${run.index+1}戰【${foe.name}】現身！`,'rare','system');dirty=true;save();render();}
function awardTrialBoss(){if(!enemy||enemy.hp>0||enemy.rewarded||!player.trialRun)return;enemy.rewarded=true;const run=player.trialRun,route=TRIAL_ROUTES.find(r=>r.map===run.map),name=enemy.name;endReport('試煉首領擊敗');const rewards=trialDrops(route,run.index,Math.random);for(const row of rewards){addStack(player.bag,row.id,row.qty);message(`✦ ${name} 掉落 ${ITEMS[row.id].name} ×1！`,'rare','system');}if(!rewards.length)message(`${name} 未掉落星鑄結晶。`,'','system');player.kills++;awardActivePetProgress(enemy,{trial:true});enemies=[];controlEffect=null;casting=null;run.index++;if(run.index>=5){player.trialClears ||= {};player.trialClears[run.map]=(player.trialClears[run.map]||0)+1;if(run.continuous)return nextContinuousTrial(route);if(player.trialClears[run.map]===1)message('首次通關已解鎖此試煉的連續挑戰。','good','system');return exitTrial('五位首領全部擊敗！');}run.nextAt=gameNow()+2500;enemy={...enemy,hp:0};dirty=true;save();render();}
function exitTrial(reason='離開試煉'){if(!player?.trialRun)return;const defeated=player.hp<=0;const continuous=player.trialRun.continuous;
 if(continuous)player.trialStopReason=reason;
 delete player.autoStoppedReason;
 auto=!player.manualPaused;
 delete player.trialRun;controlEffect=null;casting=null;endReport(reason);
 player.location='skycity';selectedContinent='sky';
 if(defeated){
  // A failed sky trial ends instantly in town; only on-site revives need a timer.
  delete player.trialDefeated;delete player.reviveAt;
  player.hp=stat('hp');player.mp=stat('mp');
  player.shield=0;timers.respawnGrace=gameNow()+3000;
  for(const pet of player.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;delete pet.reviveAt;}
 }
 spawn();message(`${reason} 已返回蒼穹樞城，已獲得的結晶保留。`,'rare','system');dirty=true;save();
 if(!offlineSimulation){$('reviveModal').style.display='none';renderMapChoices();render();
  if(defeated)window.alert('挑戰失敗！\n已立即返回蒼穹樞城，人物與所有夥伴恢復 100% HP／SP。');}
}
function awardDawnMonster(){if(!enemy||enemy.hp>0||enemy.rewarded)return;enemy.rewarded=true;const defeated=enemy;endReport('擊敗');player.kills++;const cash=albumEarnGold(defeated.gold||0,player,passiveBonus('goldPct'));player.gold+=cash;if(offlineMetrics)offlineMetrics.goldEarned+=cash;const qty=enemy.boss?5:1;addStack(player.bag,enemy.junkId,qty);for(const reward of dawnBossRewards(enemy))addStack(player.bag,reward.id,reward.qty);if(Math.random()<cardDropChance(player.location,defeated)&&CARDS[defeated.id]){addCard(defeated.id);if(defeated.boss)queueBossCardNotice(defeated.id);message(`✦ 首領專屬卡片掉落：${CARDS[defeated.id].name}！（0.1%）`,'rare');}const xp=Math.floor(enemy.xp*experienceFactor(player.level,enemy.level,true));player.xp+=xp;player.jobXp+=player.jobLevel<jobLevelCap(player)?Math.floor(xp*.85):0;if(offlineMetrics){offlineMetrics.baseXp+=xp;offlineMetrics.jobXp+=player.jobLevel<jobLevelCap(player)?Math.floor(xp*.85):0;}message(`擊敗 ${enemy.name}！${ITEMS[enemy.junkId].name} ×${qty}、${xp} EXP${cash?'、'+cash+' 金':''}。`,'good','system');while(player.level<characterLevelCap(player)&&player.xp>=threshold()){player.xp-=threshold();player.level++;player.statPoints+=2;clearStatSnapshots();player.hp=stat('hp');player.mp=stat('mp');}if(player.level>=characterLevelCap(player))player.xp=0;while(player.jobLevel<jobLevelCap(player)&&player.jobXp>=jobThreshold()){player.jobXp-=jobThreshold();player.jobLevel++;clearStatSnapshots();reconcileSkillPoints(player,JOB_SKILLS[player.job],!!SECOND_JOBS[player.job]);}if(player.jobLevel>=jobLevelCap(player))player.jobXp=0;syncRebirthSkills();awardActivePetProgress(defeated,{dawn:true});if(!offlineSimulation)combatSamples.push({at:gameNow(),owner:0,pet:0,kills:1});if(!defeated.boss)encounterSlots[defeated.slotIndex]=gameNow()+replacementDelay();enemies=enemies.filter(e=>e!==defeated&&e.hp>0);enemy=selectEncounterTarget(enemies,player.targetPriority)||defeated;dirty=true;save();}
function renderTrialProgress(){const run=player.trialRun,route=TRIAL_ROUTES.find(r=>r.map===run.map);return `<div class="trial-progress"><b>✧ ${TRIAL_PORTAL} · ${route.name}</b><span>${run.continuous?`連續第 ${run.round||1} 輪 · `:''}第 ${Math.min(5,run.index+1)}／5 戰 · ${run.stopAfterRound?'本輪結束即停止':'死亡立即停止'}</span>${run.continuous?`<button data-trial-stop-after aria-pressed="${run.stopAfterRound===true}">${run.stopAfterRound?'取消停止設定':'本輪結束後停止'}</button>`:''}<button data-trial-exit>立即離開試煉</button></div>`;}
function renderTrialEncounter(){const foe=enemies.find(e=>e.hp>0);return foe?`<div class="enemy-target trial-boss">${spriteHtml(foe.id,'monster')}<b>第${foe.trialIndex+1}戰 · ${foe.name}</b><span>Lv.${foe.level} · ${foe.hp.toLocaleString()}／${foe.maxHp.toLocaleString()} HP</span>${meter(foe.hp,foe.maxHp,'red')}<small class="trial-cast">${foe.controlCast?`⚠ ${CONTROL_NAMES[foe.controlCast.type]}即將發動`:'首領會輪流施放十種控制效果'}</small>${foe.enrageAfter?`<small class="trial-cast">${foe.enrage?`終界裁決 · 攻擊${foe.enrage}倍`:`終界裁決倒數 ${Math.max(0,Math.ceil((foe.enrageAfter-(gameNow()-foe.appearedAt))/1000))}秒；發動後攻擊持續提高`}</small>`:''}</div>`:'<div class="enemy-idle">正在前往下一戰…</div>';}
function renderTrials(){return `<section class="item trial-intro"><span class="eyebrow">FIVE GUARDIANS / SKY TRIALS</span><h3>✧ ${TRIAL_PORTAL}</h3><p>每張券開啟一次五連戰，首領逐隻出現、逐漸變強。死亡立即離場，不可在場內復活；前面已取得的結晶保留。各試煉首次擊敗全部五位首領後，解鎖該試煉的連續挑戰。每輪消耗1張對應入場券，支援背景、關閉遊戲及離線結算（最多24小時）；失敗立即停止，不自動復活續刷，券用完或背包不足也會停止。一般單次挑戰仍需在線進行。</p><p>結晶按 D → C → B → A → S → SS → SSS 逐階強化，不能跳階。每位首領最多掉落各階結晶1個，191試煉三種掉落分別獨立抽取。</p><button data-open="enhancement">找${ENHANCER_NAME}強化裝備</button></section>${player.trialStopReason?`<p class="item">連續挑戰已停止：${escapeHtml(player.trialStopReason)}</p>`:''}${player.trialRun?renderTrialProgress():''}${TRIAL_ROUTES.filter(route=>!player.trialRun||route.map===player.trialRun.map).map(route=>{const error=trialEntryError(player,route);return `<section class="item trial-route"><h3>Lv.${route.level} · ${route.name}</h3><small>${ITEMS[route.ticket].name} · 持有 ${player.bag.find(e=>e.id===route.ticket)?.qty||0}張</small><div class="trial-roster">${route.names.map((name,i)=>`<div><img src="assets/sky-trials/boss-${route.level}-${i+1}.webp" alt="${name}" loading="lazy"><b>${i+1}. ${name}</b><small>${trialDropTable(route,i).map(d=>`${d.rank}階 ${(d.chance*100).toFixed(d.chance<.01?1:0)}%`).join('／')}</small></div>`).join('')}</div><p>${route.level===191?'尾王建議接近全身SS至SSS；戰鬥4分鐘後發動終界裁決，攻擊先提升至2倍、每15秒再增加1倍，無法無限拖戰。':'以同階未強化人物與夥伴神話裝為挑戰基準，不要求D／C／B／A強化才能通關；掉落結晶可留作200試煉準備。'}</p><button data-enter-trial="${route.map}" ${error?'disabled':''}>${error||'消耗1張入場券 · 開始挑戰'}</button>${player.trialClears?.[route.map]?`<button data-continuous-trial="${route.map}" ${error?'disabled':''}>連續挑戰 · 每輪1張入場券</button><small>已通關 ${player.trialClears[route.map]} 次 · 失敗即停止</small>`:'<small>完整通關一次後，解鎖此試煉的連續挑戰</small>'}</section>`;}).join('')}`;}
function doEnhance(slot){const g=player.gear[slot],next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rankOf(g))+1];if(!g||!next)return;if(!confirm(`將【${g.name}】強化為${next}階？\n消耗${next}階星鑄結晶1個，成功率100%。強化綁定這件裝備，無法轉移，換裝需重新強化。`))return;const snapshot=structuredClone(player),result=enhanceEquipped(player,g,next);if(result.error)return toast(result.error);clearStatSnapshots();checkRankUnlocks();if(!save()){player=snapshot;clearStatSnapshots();return;}toast(`${g.name} 已達${next}階！${player.dawnUnlocked?'全身SSS已開放曙界新陸，可由大陸選單前往曙光聖港。':''}`);render();renderSide(true);}
function renderEnhancement(){return renderPetEnhancement()+`<section class="item"><span class="eyebrow">STARFORGE / EQUIPMENT RANK</span><h3>⚒ ${ENHANCER_NAME}</h3><p>消耗對應結晶1個，100%成功；依 D → C → B → A → S → SS → SSS 逐階強化。每次強化綁定原裝備，不能轉移；換裝備需重新強化。</p><p>強化提升裝備原本已有的全部能力：固定數值、六項能力值與百分比詞條均按階級倍率成長，不增加原本沒有的詞條。六項能力值各自按上限計算，溢出轉為遞減成長的潛能；完整加成仍顯示在人物能力。ASPD、暴擊率及減傷上限仍生效。不同部位抵抗不同控制，SSS對應異常100%免疫。雙手武器兼具左右手抗性，並按兩部位計算套裝。</p><div class="rank-scale">${ENHANCEMENT_RANKS.map(r=>`<span>${r} · ×${ENHANCEMENT_POWER[r]} · 抗性${Math.round(CONTROL_RESISTANCE[r]*100)}%</span>`).join('')}</div><button data-open="trials">查看天穹試煉與掉落率</button></section>${Object.entries(SLOTS).map(([slot,label])=>{const g=player.gear[slot],double=slot==='leftHand'&&GEAR_BASE[player.gear.rightHand?.id]?.hands===2;if(double)return `<div class="item"><b>${label}</b><p>由雙手武器提供${rankOf(player.gear.rightHand)||'未強化'}階 · 抵抗${CONTROL_NAMES[CONTROL_SLOTS[slot]]}</p></div>`;if(!g)return `<div class="item"><b>${label}</b><p>尚未穿戴裝備</p></div>`;const rank=rankOf(g),next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rank)+1],held=player.bag.find(e=>e.id==='rank_core_'+next)?.qty||0;return `<div class="item" data-ui-key="enhance-${g.uid}"><b>${label} · ${escapeHtml(g.name)}</b><p>目前 ${rank?rank+'階':'未強化'} · 抵抗${CONTROL_NAMES[CONTROL_SLOTS[slot]]} ${Math.round((CONTROL_RESISTANCE[rank]||0)*100)}%</p><small>${Object.entries(enhancedAffixes(g)).map(([k,v])=>affixLabel(k,v)).join('、')}</small>${next?`<p>下一階${next} · 裝備能力 ×${ENHANCEMENT_POWER[next]} · 抗性${Math.round(CONTROL_RESISTANCE[next]*100)}% · 結晶${held}／1</p><button data-enhance-slot="${slot}" ${!isTown(player.location)||!player.hp||!held?'disabled':''}>${isTown(player.location)?`強化至${next}階`:'請回村莊強化'}</button>`:'<p>✦ 已達最高SSS階</p>'}</div>`;}).join('')}`;}
function doPetEnhance(slot){
 const pet=player?.pets.find(p=>p.id===player.activePetId),g=pet?.gear?.[slot];
 const next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rankOf(g))+1];if(!g||!next)return;
 if(!confirm(`強化夥伴【${g.name}】至${next}階？消耗1個結晶，成功率100%。`))return;
 const snapshot=structuredClone(player),result=enhancePetEquipped(player,pet,g,next);
 if(result.error)return toast(result.error);
 const beforeForm=structuredClone(pet),evolution=reconcileHumanoidStages(pet);clearStatSnapshots();
 if(!save()){player=snapshot;clearStatSnapshots();return;}
 toast(evolution.changed?`${pet.nickname}進化成${HUMANOID_STAGES[evolution.stage].label}！`:`${pet.nickname}的${g.name}強化至${next}階`);
 render();renderSide(true);
 if(evolution.changed)showPermanentFormEvolution(pet,beforeForm,`恭喜！${pet.nickname}進化為${HUMANOID_STAGES[evolution.stage].label}！`,'三件夥伴裝備達成進化條件，新的姿態已永久解鎖。');
}
function completePendingPetEvolution(){
 if(!isTown(player.location)||!player.hp)return toast('請在城鎮完成夥伴進化');
 const pet=player?.pets.find(p=>p.id===player.activePetId);
 if(!pet||nextHumanoidStage(pet)===humanoidStage(pet))return toast('目前沒有待完成的人形進化');
 const snapshot=structuredClone(player),before=structuredClone(pet),evolution=reconcileHumanoidStages(pet);
 if(!evolution.changed)return;
 dirty=true;
 if(save()===false){player=snapshot;clearStatSnapshots();return;}
 render();renderSide(true);
 showPermanentFormEvolution(pet,before,`恭喜！${pet.nickname}進化為${HUMANOID_STAGES[evolution.stage].label}！`,'三件夥伴裝備的進化條件已達成，新的姿態永久解鎖。');
}
function renderPetEnhancement(){
 const pet=player?.pets.find(p=>p.id===player.activePetId);
 if(!pet)return '<div class="item">選擇出戰夥伴後可強化夥伴裝備。</div>';
 return `<section class="item"><h3>夥伴星鑄 · ${escapeHtml(pet.nickname)}</h3><p>頭部／身體／鞋子逐階D～SSS強化。已解鎖忠誠度人形後，三件全S、SS、SSS會觸發永久人形進化。不可切換回舊造型。</p><p>目前：${pet.trueForm?HUMANOID_STAGES[humanoidStage(pet)].label:'尚未解鎖忠誠度人形'}</p>${nextHumanoidStage(pet)>humanoidStage(pet)?'<button data-reconcile-pet-evolution>完成已達條件的人形進化</button>':''}</section>${Object.entries(PET_SLOTS).map(([slot,label])=>{const g=pet.gear?.[slot];if(!g)return `<div class="item"><b>${label}</b> · 尚未裝備</div>`;const next=ENHANCEMENT_RANKS[ENHANCEMENT_RANKS.indexOf(rankOf(g))+1],held=player.bag.find(x=>x.id==='rank_core_'+next)?.qty||0;return `<div class="item"><b>${label} · ${escapeHtml(g.name)}</b><p>${rankOf(g)||'未強化'} · ${Object.entries(enhancedAffixes(g)).map(([k,v])=>affixLabel(k,v)).join('、')}</p>${next?`<button data-enhance-pet="${slot}" ${!isTown(player.location)||!player.hp||!held?'disabled':''}>強化至${next}階（結晶${held}）</button>`:'<small>已達SSS階</small>'}</div>`}).join('')}`;
}
function warehouseModalRoot(){return $('warehouseModalContent');}
function refreshWarehouseModal(){const root=warehouseModalRoot();if(root&&$('warehouseModal')?.open){root.innerHTML=renderWarehouse();bindWarehouseControls();}}
function openWarehouseModal(){
 if(!isTown(player.location))return toast('請回村莊或主城使用倉庫');
 const dialog=$('warehouseModal');if(!dialog)return toast('倉庫視窗尚未載入');
 dialog.showModal();refreshWarehouseModal();
}
function renderWarehouse(){
 let gear,stacks,pending=0;
 try{gear=warehouseItems(localStorage);stacks=warehouseStackItems(localStorage);pending=Object.entries(readWarehouse(localStorage).records).filter(([uid,r])=>r.owner===activeSlot&&r.gear&&!(player.warehouseReceipts?.[uid]>=r.revision)).length;}
 catch(error){return `<section class="item"><p>${escapeHtml(error.message)}</p></section>`;}
 const safe=typeof navigator!=='undefined'&&!!navigator.locks?.request;
 const categories=Object.entries(BAG_GROUPS).filter(([id])=>!['tickets','quests'].includes(id));
 const categoryOf=s=>s.kind==='card'?'cards':bagGroup({id:s.id});
 const activeGear=player.bag.filter(warehouseEquipment).filter(g=>warehouseCategory==='equipment'?!!ITEMS[g.id]?.slot:warehouseCategory==='petEquipment'?!!ITEMS[g.id]?.petSlot:false);
 const storedGear=gear.filter(g=>warehouseCategory==='equipment'?!!ITEMS[g.id]?.slot:warehouseCategory==='petEquipment'?!!ITEMS[g.id]?.petSlot:false);
 const bagStacks=warehouseCategory==='cards'?player.cards.filter(c=>warehouseStackAllowed('card',c.id)).map(c=>({kind:'card',...c})):player.bag.filter(i=>!i.uid&&warehouseStackAllowed('item',i.id)&&bagGroup(i)===warehouseCategory).map(i=>({kind:'item',...i}));
 const storedStacks=stacks.filter(i=>categoryOf(i)===warehouseCategory);
 const bossFirst=(a,b)=>Number(b.kind==='card'&&!!CARDS[b.id]?.boss)-Number(a.kind==='card'&&!!CARDS[a.id]?.boss);
 if(warehouseCategory==='cards'){bagStacks.sort(bossFirst);storedStacks.sort(bossFirst);}
 const allUsed=gear.length+stacks.length;
 const buttons=categories.map(([id,label])=>`<button class="${warehouseCategory===id?'active':''}" data-warehouse-category="${id}">${label}</button>`).join('');
 const gearCard=(g,direction)=>`<article class="item warehouse-row"><b>${escapeHtml(g.name||ITEMS[g.id]?.name||g.id)}</b><small>Lv.${g.level} · ${RARITIES.find(r=>r.id===g.rarity)?.name||g.rarity} · ${rankOf(g)||'未強化'}</small><small>${Object.entries(enhancedAffixes(g)).map(([k,v])=>escapeHtml(affixLabel(k,v))).join('、')}</small><button data-warehouse-${direction}="${escapeHtml(g.uid)}" ${warehouseBusy||!safe?'disabled':''}>${direction==='deposit'?'存入':'領取'} 1 件</button></article>`;
 const stackCard=(item,direction)=>{const name=item.kind==='card'?CARDS[item.id]?.name:ITEMS[item.id]?.name;const boss=item.kind==='card'&&CARDS[item.id]?.boss===true;const key=item.kind+':'+item.id;const limit=Math.min(WAREHOUSE_BATCH_LIMIT,item.qty);return `<article class="item warehouse-row ${boss?'warehouse-boss-card':''}"><b>${boss?'<span class="warehouse-boss-badge">♛ 首領卡片</span> ':''}${escapeHtml(name||item.id)} <span class="stack-count">×${item.qty}</span></b><div class="warehouse-quantity"><input type="number" min="1" max="${limit}" value="${limit}" aria-label="${escapeHtml(name||item.id)}數量" data-warehouse-qty="${escapeHtml(key)}"><button data-warehouse-stack="${direction}:${escapeHtml(key)}" ${warehouseBusy||!safe?'disabled':''}>${direction==='deposit'?'存入':'領取'}</button></div></article>`;};
 const column=(title,gearList,stackList,direction)=>`<section class="warehouse-column"><h3>${title}</h3>${gearList.map(g=>gearCard(g,direction)).join('')}${stackList.map(i=>stackCard(i,direction)).join('')}${!gearList.length&&!stackList.length?'<div class="empty">此分類沒有物品。</div>':''}</section>`;
 return `<p class="muted">八角色共用 · ${allUsed}／${WAREHOUSE_CAPACITY} 格 · 單次存取 1～${WAREHOUSE_BATCH_LIMIT} 件。任務道具、入場券與已穿戴裝備不可存入。${pending?'有 '+pending+' 件裝備等待同步。':''}</p>
 <div class="bag-filters warehouse-filters">${buttons}</div>
 <div class="warehouse-columns">${column('此角色背包',activeGear,bagStacks,'deposit')}${column('共用倉庫',storedGear,storedStacks,'withdraw')}</div>
 <div class="warehouse-backup"><small>倉庫存在目前瀏覽器，請定期另外匯出備份。</small><button data-warehouse-export>匯出倉庫備份</button><label>匯入備份 <input type="file" data-warehouse-import accept="application/json,.json" ${warehouseBusy||!safe?'disabled':''}></label></div>${!safe?'<p>此連線不支援安全倉庫操作，請使用 HTTPS。</p>':''}`;
}
async function doWarehouseTransfer(direction,uid){
 if(warehouseBusy)return;const session=player,index=activeSlot;warehouseBusy=true;
 try{await withWarehouseLock(navigator.locks,()=>{
  if(player!==session||activeSlot!==index)throw Error('角色已切換，請重新操作倉庫');
  const result=transferWarehouseEquipment(localStorage,index,player,direction,uid,next=>writeCharacterSlot(localStorage,index,next));
  player=result.player;clearStatSnapshots();dirty=false;lastSave=gameNow();
  toast(result.pendingSync?'裝備轉移已保存，角色存檔待同步；請重新進入角色確認':direction==='deposit'?'裝備已存入共用倉庫':'裝備已領至此角色背包');
 });}catch(error){toast(error.message);}finally{warehouseBusy=false;if(player){render();refreshWarehouseModal();}}
}
function bindWarehouseControls(){
 const root=warehouseModalRoot();if(!root)return;
 for(const b of root.querySelectorAll('[data-warehouse-deposit]'))b.onclick=()=>doWarehouseTransfer('deposit',b.dataset.warehouseDeposit);
 for(const b of root.querySelectorAll('[data-warehouse-withdraw]'))b.onclick=()=>doWarehouseTransfer('withdraw',b.dataset.warehouseWithdraw);
 for(const b of root.querySelectorAll('[data-warehouse-category]'))b.onclick=()=>{warehouseCategory=b.dataset.warehouseCategory;refreshWarehouseModal();};
 for(const b of root.querySelectorAll('[data-warehouse-stack]'))b.onclick=async()=>{
  if(warehouseBusy)return;
  const [direction,kind,id]=b.dataset.warehouseStack.split(':'),input=b.closest('.warehouse-row')?.querySelector('[data-warehouse-qty]'),quantity=Number(input?.value);
  if(!Number.isInteger(quantity)||quantity<1||quantity>WAREHOUSE_BATCH_LIMIT)return toast('請輸入 1～50 件');
  const session=player,index=activeSlot;warehouseBusy=true;
  try{await withWarehouseLock(navigator.locks,()=>{
   if(player!==session||activeSlot!==index)throw Error('角色已切換');
   const result=transferWarehouseStack(localStorage,index,player,direction,kind,id,quantity,next=>writeCharacterSlot(localStorage,index,next));
   player=result.player;dirty=false;lastSave=gameNow();
   toast(result.pendingSync?'共用紀錄已保存，角色資料待同步':`已${direction==='deposit'?'存入':'領取'} ${quantity} 件`);
  });}catch(error){toast(error.message);}finally{warehouseBusy=false;if(player){render();refreshWarehouseModal();}}
 };
 for(const b of root.querySelectorAll('[data-warehouse-export]'))b.onclick=()=>{try{const blob=new Blob([JSON.stringify(exportWarehouse(localStorage),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='spirit-pact-warehouse.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}catch(error){toast(error.message);}};
 for(const input of root.querySelectorAll('[data-warehouse-import]'))input.onchange=async()=>{const file=input.files[0];if(!file||warehouseBusy)return;warehouseBusy=true;try{if(file.size>4*1024*1024)throw Error('倉庫備份超過4MB');const data=JSON.parse(await file.text()),session=player,index=activeSlot;const result=await withWarehouseLock(navigator.locks,()=>{if(player!==session||activeSlot!==index||!isTown(player.location)||!player.hp||player.trialRun)throw Error('請在村莊重新操作倉庫');return importWarehouse(localStorage,data);});applyWarehouseCustody(localStorage,index,player);save();toast(`已匯入${result.imported}件，略過${result.skipped}件已存在或已轉交裝備`);}catch(error){toast(error.message);}finally{warehouseBusy=false;if(player)refreshWarehouseModal();}};
}
function renderOutfits(){return `<section class="item"><h3>角色外觀 · 全身星鑄解鎖</h3><p>全身至少S／SS／SSS階各解鎖一套。較高階可滿足較低階條件，解鎖永久保留；換裝不會失去已解鎖外觀。外觀不影響能力。</p><p>目前全身最低階：${fullSetRank(player,GEAR_BASE)||'未集齊'}${player.dawnUnlocked?' · 已開放曙界新陸':''}</p><button data-outfit="default">使用原職業外觀</button></section>${SECOND_JOBS[player.job]?['S','SS','SSS'].map(rank=>{const unlocked=player.outfitUnlocks?.includes(rank);return `<div class="item outfit-card">${unlocked?`<img src="${rankOutfitArt(player.job,rank)}" alt="${THIRD_JOBS[player.job].name} ${rank}階外觀">`:'<div class="unknown-form">?</div>'}<b>${rankOutfitName(player.job,rank)} · ${rank}階</b><small>${THIRD_JOBS[player.job].name} · ${RANK_OUTFITS[player.job].motif}</small><button data-outfit="${rank}" ${unlocked?'':'disabled'}>${unlocked?(player.selectedOutfit===rank?'使用中':'選用外觀'):`全身至少${rank}階解鎖`}</button></div>`;}).join(''):'<div class="item">完成二轉後可使用對應職業外觀。</div>'}`+renderCosmeticGallery();}
function renderCosmeticGallery(){
 const collection=readCosmeticCollection(localStorage),eligible=!!player.thirdJob&&player.outfitUnlocks?.includes('SSS');
 const jobs=COSMETIC_JOBS[player.job]||[];
 const outfits=jobs.map((name,index)=>{const id=cosmeticOutfitId(player.job,index),owned=collection.outfits.includes(id),selected=player.cosmeticOutfit===id;
  return `<article class="cosmetic-tile"><div class="cosmetic-portrait"><img loading="lazy" src="${cosmeticOutfitArt(player.job,index)}" alt="${escapeHtml(name)}完整立繪"></div><b>${name}</b><small>${(COSMETIC_OUTFIT_PRICES[index]/100_000_000).toLocaleString()} 億金</small><button data-cosmetic-outfit="${id}" ${!owned&&!eligible?'disabled':''}>${owned?(selected?'取消裝備':'裝備幻化'):eligible?'永久收藏':'三轉＋SSS全身裝備'}</button></article>`;}).join('');
 return `<section class="item cosmetic-gallery"><h3>✦ SSS 專屬幻化 · 收藏殿堂</h3><p>十二職業各三套獨立繪製，購買後八角色共享收藏；每位角色獨立指定穿戴。純外觀，無能力加成。購買可使用金幣與 1 億金條。</p><p>總資產：${(cosmeticWealth(player)/100_000_000).toFixed(2)} 億金；已收藏 ${collection.outfits.length}/36 套幻化。</p><div class="cosmetic-grid">${outfits}</div></section>`+renderTowerCostumeGallery();
}
function renderTowerCostumeGallery(){
 const art=towerFrostArt(player.job);if(!art)return '';
 const unlocked=towerFrostUnlocked(player),selected=normalizeTowerCostume(player)==='frost';
 return `<section class="item cosmetic-gallery tower-frost-gallery"><h3>❄ 天穹終境 · 第30層永凍時裝</h3><p>本職業首次通關第30層即可永久解鎖。只能穿戴本職業的外觀，不影響攻擊、防禦、技能或戰鬥能力。</p><div class="cosmetic-grid"><article class="cosmetic-tile"><div class="cosmetic-portrait">${unlocked?`<img loading="lazy" src="${art}" alt="${escapeHtml(THIRD_JOBS[player.job]?.name||player.job)} 永凍時裝">`:'<div class="unknown-form">?</div>'}</div><b>${escapeHtml(THIRD_JOBS[player.job]?.name||player.job)} · 永凍之誓</b><small>${unlocked?'已永久解鎖，可隨時更換':'通關天穹終境第30層解鎖'}</small><button data-tower-costume="${selected?'default':'frost'}" ${unlocked?'':'disabled'}>${selected?'取消穿戴':unlocked?'穿戴永凍時裝':'尚未解鎖'}</button></article></div></section>`;
}
function renderBackgroundGallery(){
 const collection=readCosmeticCollection(localStorage);
 const tower=normalizeTowerCollection(player.towerCollection);
 const towerBackgrounds=towerCollectedBackgrounds(player).map(item=>`<article class="cosmetic-bg"><div class="tower-background-preview tower-background-${item.id.replace('background_','')}"></div><div><b>${escapeHtml(item.name)}</b><small>天穹終境永久收藏</small><button data-tower-background-pick="${item.id}">${tower.selectedBackground===item.id?'使用中':'使用背景'}</button></div></article>`).join('');
 const backgrounds=COSMETIC_BACKGROUNDS.map(bg=>{const owned=collection.backgrounds.includes(bg.id),selected=player.cosmeticBackground===bg.id;
  return `<article class="cosmetic-bg"><img loading="lazy" src="${cosmeticBackgroundArt(bg.id)}" alt="${bg.name}"><div><b>${bg.name}</b><small>${bg.price/100_000_000} 億金</small><button data-cosmetic-background="${bg.id}">${owned?(selected?'取消背景':'使用背景'):'永久收藏'}</button></div></article>`;}).join('');
 return `<section class="item cosmetic-gallery"><h3>角色背景</h3><p>金幣背景與天穹背景只能選用一款，亦可不使用；不影響戰力。</p><p>已收藏 ${collection.backgrounds.length}/8 款金幣背景，${towerBackgrounds? towerCollectedBackgrounds(player).length:0}/3 款天穹背景。</p><button data-cosmetic-background="default">回到預設背景</button><h3>天穹背景</h3><div class="cosmetic-background-grid">${towerBackgrounds||'<p>尚未收藏天穹背景，可在天穹終境商店解鎖。</p>'}</div><h3>金幣背景</h3><div class="cosmetic-background-grid">${backgrounds}</div><label class="cosmetic-control">背景亮度 ${player.cosmeticBrightness||75}%<input type="range" min="30" max="100" step="5" data-cosmetic-brightness value="${player.cosmeticBrightness||75}"></label><label class="cosmetic-control"><input type="checkbox" data-cosmetic-aura ${player.cosmeticAura!==false?'checked':''}> 顯示角色光環</label></section>`;
}
const TOWER_BACKGROUND_STYLES={
 background_dawn:'linear-gradient(140deg,rgba(37,41,73,.3),rgba(65,47,37,.1)),url("assets/tower/background-dawn.webp?v=tower-art-1")',
 background_flame:'linear-gradient(140deg,rgba(27,13,30,.23),rgba(28,14,24,.2)),url("assets/tower/background-flame.webp?v=tower-art-1")',
 background_frost:'linear-gradient(140deg,rgba(16,32,62,.3),rgba(20,37,58,.15)),url("assets/tower/background-frost.webp?v=tower-art-1")'
};
function applyCosmeticHero(){
 const hero=$('character')?.querySelector('.hero');if(!hero)return;
 if(normalizeTowerCostume(player)==='frost'){
  const oldArt=hero.querySelector('.art-sprite');
  if(oldArt){const art=document.createElement('img');art.className=`${oldArt.className} cosmetic-equipped tower-frost-equipped`;art.src=towerFrostArt(player.job);art.alt='第30層永凍限定外觀';oldArt.replaceWith(art);}
 }
 const collection=readCosmeticCollection(localStorage);
 normalizeCosmeticSelection(player,collection);
 const tower=normalizeTowerCollection(player.towerCollection);
 const towerBackground=towerCollectedBackgrounds(player).some(item=>item.id===tower.selectedBackground)?tower.selectedBackground:null;
 if(towerBackground){hero.style.backgroundImage=`linear-gradient(to bottom,transparent 40%,rgba(5,12,23,.9) 100%),${TOWER_BACKGROUND_STYLES[towerBackground]}`;hero.style.backgroundSize='cover';hero.classList.add('cosmetic-scene-active');}
 if(player.cosmeticBackground){
  const darkness=1-player.cosmeticBrightness/100;
  hero.style.backgroundImage=`linear-gradient(to bottom,transparent 44%,rgba(5,12,23,.32) 65%,rgba(5,12,23,.88) 100%),linear-gradient(rgba(7,13,26,${darkness}),rgba(7,13,26,${darkness})),url("${cosmeticBackgroundArt(player.cosmeticBackground)}")`;
  hero.style.backgroundSize='cover';hero.style.backgroundPosition='center';
  hero.classList.add('cosmetic-scene-active');
 }
 $('character').dataset.cosmeticAura=player.cosmeticAura?'on':'off';
}
function bindCosmeticGalleryEvents(){
 if(typeof document==='undefined'||typeof document.addEventListener!=='function')return;
 document.addEventListener('click',event=>{
  const towerButton=event.target.closest('[data-tower-costume]');
  if(towerButton&&player&&$('side')?.contains(towerButton)){
    const prior={towerCostume:player.towerCostume,selectedOutfit:player.selectedOutfit,cosmeticOutfit:player.cosmeticOutfit};
    if(!chooseTowerCostume(player,towerButton.dataset.towerCostume==='frost'?'frost':null))return toast('請先以此職業通關第30層');
    if(save()===false){Object.assign(player,prior);return toast('存檔失敗，已恢復原外觀');}
    render();return;
  }
  const button=event.target.closest('[data-cosmetic-outfit],[data-cosmetic-background]');
  if(!button||!player||!$('side')?.contains(button))return;
  const outfit=button.hasAttribute('data-cosmetic-outfit'),id=outfit?button.dataset.cosmeticOutfit:button.dataset.cosmeticBackground;
  const key=outfit?'cosmeticOutfit':'cosmeticBackground',collection=readCosmeticCollection(localStorage);
  if(id==='default'){player.cosmeticBackground=null;selectTowerBackground(player,'');save();render();return;}
  const owned=collection[outfit?'outfits':'backgrounds'].includes(id);
  if(owned){player[key]=player[key]===id?null:id;if(outfit&&player[key])player.towerCostume=null;if(!outfit)selectTowerBackground(player,'');save();render();return;}
  const oldGold=player.gold,oldBag=structuredClone(player.bag);
  const result=buyCosmetic(player,collection,outfit?'outfit':'background',id);
  if(result.error)return toast(result.error);
  if(!confirm(`確定花費 ${(result.price/100_000_000).toLocaleString()} 億金永久收藏這項外觀？`)){player.gold=oldGold;player.bag=oldBag;return;}
  let previous=null;try{previous=localStorage.getItem(COSMETIC_STORAGE_KEY);localStorage.setItem(COSMETIC_STORAGE_KEY,JSON.stringify(result.collection));}
  catch(error){player.gold=oldGold;player.bag=oldBag;return toast('收藏紀錄無法儲存，未扣款');}
  player[key]=id;
  if(outfit)player.towerCostume=null;
  if(!outfit)selectTowerBackground(player,'');
  if(!save()){
   player.gold=oldGold;player.bag=oldBag;player[key]=null;
   if(previous===null)localStorage.removeItem(COSMETIC_STORAGE_KEY);else localStorage.setItem(COSMETIC_STORAGE_KEY,previous);
   return toast('存檔失敗，已退還金幣');
  }
  render();toast('永久收藏成功，八個角色均可使用');
 });
 document.addEventListener('input',event=>{
  if(!player||!$('side')?.contains(event.target))return;
  if(event.target.matches('[data-cosmetic-brightness]')){player.cosmeticBrightness=Number(event.target.value);save();render();}
  if(event.target.matches('[data-cosmetic-aura]')){player.cosmeticAura=event.target.checked;save();render();}
 });
}
function bindTrialControls(){for(const b of $('side').querySelectorAll('[data-tower-enter]'))b.onclick=()=>startTower(Number(b.dataset.towerEnter));for(const b of $('side').querySelectorAll('[data-tower-exit]'))b.onclick=()=>{if(confirm('確定結束天穹終境挑戰？'))exitTower('主動離場');};bindWarehouseControls();for(const b of $('side').querySelectorAll('[data-continuous-trial]'))b.onclick=()=>startTrial(b.dataset.continuousTrial,true);for(const b of $('side').querySelectorAll('[data-enter-trial]'))b.onclick=()=>startTrial(b.dataset.enterTrial);for(const b of document.querySelectorAll('[data-trial-stop-after]'))b.onclick=toggleTrialStopAfterRound;for(const b of document.querySelectorAll('[data-trial-exit]'))b.onclick=()=>{if(confirm('確定離開試煉？不退還入場券，已取得的結晶保留。'))exitTrial('主動離場');};for(const b of $('side').querySelectorAll('[data-enhance-slot]'))b.onclick=()=>doEnhance(b.dataset.enhanceSlot);for(const b of $('side').querySelectorAll('[data-enhance-pet]'))b.onclick=()=>doPetEnhance(b.dataset.enhancePet);for(const b of $('side').querySelectorAll('[data-reconcile-pet-evolution]'))b.onclick=completePendingPetEvolution;for(const b of $('side').querySelectorAll('[data-reselect-fusion]'))b.onclick=()=>doLegacyFusionReselect(b.dataset.reselectFusion);for(const b of $('side').querySelectorAll('[data-upgrade-sigil]'))b.onclick=()=>doUpgradeSigil();for(const b of $('side').querySelectorAll('[data-outfit]'))b.onclick=()=>{const r=b.dataset.outfit;if(r!=='default'&&!player.outfitUnlocks?.includes(r))return;player.selectedOutfit=r==='default'?null:r;player.cosmeticOutfit=null;save();render();renderSide(true);};}

function openCharacterRename(){
 const modal=$('renameModal');
 delete modal.dataset.petId;
 modal.dataset.renameTarget='character';
 modal.querySelector('h2').textContent='更改角色名稱';
 modal.querySelector('label').textContent='角色名稱（最多 16 字）';
 $('renameInput').value=player.name;
 modal.style.display='flex';
 $('renameInput').focus();
}
function openPetRename(id){
 const pet=player?.pets.find(p=>String(p.id)===String(id));
 if(!pet)return toast('找不到要更名的夥伴');
 const modal=$('renameModal');
 modal.dataset.petId=String(pet.id);
 modal.dataset.renameTarget='pet';
 modal.querySelector('h2').textContent='更改夥伴暱稱';
 modal.querySelector('label').textContent='夥伴暱稱（最多 16 字）';
 $('renameInput').value=pet.nickname||petForm(pet)||SPECIES[pet.species].name;
 modal.style.display='flex';
 $('renameInput').focus();
}
bindCosmeticGalleryEvents();
// Snapshot legacy eligibility once, before later gear drops can change it.
// Newly created characters must never qualify through future Lv190/200 drops.
const normalizeBeforeWeaponCompensation=normalize;
normalize=function(p){initializeWeaponCompensation(p);return normalizeBeforeWeaponCompensation(p);};
const freshBeforeWeaponCompensation=fresh;
fresh=function(...args){const p=freshBeforeWeaponCompensation(...args);p.weaponCompensation={version:WEAPON_COMPENSATION_VERSION,state:'ineligible'};return p;};
const returnBeforeWeaponCompensation=returnToEntry;
returnToEntry=function(...args){const done=returnBeforeWeaponCompensation(...args);if(done)refreshWeaponCompensationReminder();return done;};

function renderQuestTracker(){return renderBaseQuestTracker()+homecomingTracker(player)+spiritSanctuaryTracker(player);}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('click',event=>{
 if(!event.target.closest('[data-spirit-sanctuary-guide]')||!player)return;
 selectedContinent='dawn';renderMapChoices();
 travel(SPIRIT_SANCTUARY_MAP);
});
function discoverHomecomingLetters(){
 if(offlineSimulation||!player||!isTown(player.location)||gameNow()<(timers.homecomingLetterRetryAt||0)||!player.pets?.some(p=>eligibleHomecoming(player,p)&&!player.homecoming?.routes?.[homecomingIdentity(p)]))return;
 const previous=structuredClone(player),found=discoverHomecoming(player,player.pets,{town:true});if(!found.length)return;
 dirty=true;if(save()===false){player=previous;clearStatSnapshots();timers.homecomingLetterRetryAt=gameNow()+5000;return;}
 message(`收到 ${found.length} 封夥伴的家鄉來信，可開啟返鄉契約。`,'rare','system');
}
function homecomingAction(id,action,choice){
 if(offlineSimulation||!player?.hp)return false;
 if(action==='open'){openPanel('homecoming');return true;}
 if(action==='view-art')return showHomecomingPicture(player,id);
 if(player.trialRun){toast('請先離開天穹試煉');return false;}
 if(!['return','revisit'].includes(action)&&!(activePet()?.hp>0)){toast('請先讓同行夥伴恢復');return false;}
 const previous=structuredClone(player),beforeMap=player.location,beforePicture=homecomingPicture(player,id)?.key;
 const homecomingPet=action==='claim'?activePet():null,homecomingBefore=homecomingPet?structuredClone(homecomingPet):null;
 try{
  if(['go','choose'].includes(action)){
   if(action==='go'&&enemies.some(e=>e.hp>0))throw Error('請先完成或離開當前戰鬥');
   homecomingAdventureAction(player,id,choice,{pet:activePet(),offline:offlineSimulation,go:action==='go'});
  }else homecomingTransition(player,id,action,{pet:activePet(),town:isTown(player.location),offline:offlineSimulation});
  if(action==='claim'){clearStatSnapshots();restoreTownPartyFully();}
  dirty=true;if(save()===false){player=previous;clearStatSnapshots();return false;}
 }catch(error){player=previous;clearStatSnapshots();toast(error.message);return false;}
 if(beforeMap!==player.location||['go','choose','arrive','revisit','return'].includes(action)){endReport('離開任務現場');spawn();}
 selectedContinent=continentFor(player.location);if(action==='begin')selectedContinent=HOMECOMING_BY_ID[id].continentId;
 tab='homecoming';renderMapChoices();dirty=true;render();
 const afterPicture=homecomingPicture(player,id)?.key;
 if(action==='claim'&&homecomingPet?.homecomingEvolved){
  showPermanentFormEvolution(homecomingPet,homecomingBefore,`返鄉契約完成！${homecomingPet.nickname}覺醒全新型態！`,'家鄉的羈絆化為新的力量。夥伴完成最終進化，返鄉誓約形態永久解鎖。');
 }else if(afterPicture&&afterPicture!==beforePicture)showHomecomingPicture(player,id);
 return true;
}
function addHomecomingEncounter(now=gameNow()){
 if(offlineSimulation||enemies.some(e=>e.hp>0))return;
 const template=homecomingBattle(player,activePet());if(!template)return;
 const foe={...template,...monsterRuntimeStats(template),hp:template.hp,maxHp:template.hp,lastAttack:now,appearedAt:now,instanceId:`homecoming-${now}-${++encounterSerial}`,slotIndex:0,homecomingPetId:activePet()?.id};
 enemies=[foe];enemy=foe;startReport();message(`${foe.nonlethal?'演武開始：':'任務挑戰：'}${foe.name}`,'rare','system');return foe;
}
function tickHomecomingEncounters(now){
 if(offlineSimulation||isTown(player.location)||!player.hp)return;
 if(enemies.some(e=>e.hp>0))return;
 enemies=[];if(now<(encounterSlots[0]||0))return;
 encounterSlots[0]=now+1000;if(addHomecomingEncounter(now))render();
}
function awardHomecomingEncounter(){
 const foe=enemy;if(!foe||foe.hp>0||foe.rewarded)return;
 const previous=structuredClone(player),advanced=completeHomecomingBattle(player,foe,activePet(),{offline:offlineSimulation});
 foe.rewarded=true;endReport(foe.nonlethal?'演武通過':'任務戰鬥完成');dirty=true;
 if(advanced&&save()===false){player=previous;clearStatSnapshots();return;}
 message(advanced?(foe.nonlethal?'師父收招微笑，認可了夥伴的守鄉誓言。':'挑戰完成，請在返鄉契約繼續事件。'):'未符合同行條件，請帶對應夥伴重新挑戰。',advanced?'good':'rare','system');
 if(advanced&&player.homecoming?.routes?.[foe.homecomingRoute]?.phase==='ready'){
  openPanel('homecoming');toast('演武已通過！請按「返回家鄉」並交付返鄉契約。');
 }else render();
}

function renderPetSkillConfig(){return renderBasePetSkillConfig()+renderCompanionFourthSlot(selectedGearPet());}
function renderCompanionFourthSlot(pet){
 const pair=fourthPair(pet),skill=FOURTH_SKILLS[pair];if(!skill)return '';
 const unlocked=fourthUnlocked(player,pet),state=fourthSkillStates.get(pet.id),energy=Math.floor(state?.energy||0);
 const events={crit:'暴擊',charge:'衝鋒',snatch:'掠奪',combo:'連段',falcon:'鷹擊',skillRefresh:'技能刷新',kill:'擊敗敵人',castComplete:'完成詠唱',shield:'護盾',block:'格擋',autospell:'自動詠唱',song:'歌舞',mana:'魔力恢復',buff:'增益',heal:'治療',overheal:'溢出治療',consecratedCast:'聖化施法'};
 return `<section class="item"><h3>第四格・專屬技能：${skill.name}</h3><p>${unlocked?'已解放':'完成對應返鄉支線，並維持 SSS 高階人形與契印 8 後解放。'}</p><p>${Object.keys(skill.events).map(e=>events[e]||e).join('、')}可累積充能；戰鬥中持續充能，滿 100 時自動施放。${skill.targets} 個目標・消耗 SP ${skill.cost}・冷卻 ${skill.cooldown/1000} 秒。</p>${unlocked?`<p>目前充能 ${energy}／100。暫停自動戰鬥時不施放。</p>`:''}</section>`;
}
init();
import {exchangeOverflowGold,sellSurplusPotions} from './economy-limits.js?v=6.5.1';
