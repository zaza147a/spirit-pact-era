export const FRONTIER_DIFFICULTY=Object.freeze([{min:151,max:160,hp:1.15,atk:1.10},{min:161,max:170,hp:1.30,atk:1.10},{min:171,max:180,hp:1.15,atk:1.15},{min:181,max:190,hp:1.30,atk:1.15},{min:191,max:200,hp:1.20,atk:1.25}].map(Object.freeze));
export const FRONTIER_BOSS_DIFFICULTY=Object.freeze({hp:1.70,atk:1.90});
export const frontierDifficulty=level=>FRONTIER_DIFFICULTY.find(r=>level>=r.min&&level<=r.max)||null;
