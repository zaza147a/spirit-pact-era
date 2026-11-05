// Per-job weapon style: enhances the owner's ATK/MATK skill source before
// enemy DEF, critical, cards and pet support. Never scales final damage or pets.
// Calibration: verified Lv210 sigil-8 user saves, 120s real-map Worker, 3 seeds.
const JOB_WEAPON_SOURCE_FACTORS=Object.freeze({
 rogue:Object.freeze({rifle:.86}),
 hunter:Object.freeze({shortBow:1.13,longBow:1.04,crossbow:1.055}),
 sage:Object.freeze({oneStaff:1.38,spellFist:1.25}),
 performer:Object.freeze({instrument:1.23})
});
export function weaponOffenseSourceFactor(job,weaponId){
 return JOB_WEAPON_SOURCE_FACTORS[job]?.[weaponId]??1;
}
