// Single-companion Commander: apply each equipped owner card to the pet once.
// The owner's transferable stats must be calculated without these same cards.
export function synchronizeCommanderCards(base,effects={}){
 const b=key=>Number.isFinite(effects[key])?effects[key]:0;
 const scale=(stat,pct)=>Math.max(0,Math.round((base[stat]+b(stat))*(1+b(pct)/100)));
 return {...base,
  hp:scale('hp','hpPct'),sp:scale('sp','mpPct'),
  atk:scale('atk','atkPct')+b('STR')*2,
  matk:Math.round((scale('matk','matkPct')+b('INT')*2)*(1+b('magicDamage')/100)),
  def:scale('def','defPct')+b('VIT'),mdef:scale('mdef','mdefPct')+b('INT'),
  hit:base.hit+b('hit')+b('DEX'),
  flee:Math.round((base.flee+b('flee')+b('AGI'))*(1+b('fleePct')/100)),
  aspd:Math.min(193,base.aspd+b('AGI')*.1),
  aspdPct:(base.aspdPct||0)+b('aspdPct'),
  crit:Math.min(100,(base.crit||0)+b('crit')+b('LUK')*.3),
  critDmg:(base.critDmg||140)+b('critDmg')+b('LUK')*.5,
  ignoreDef:Math.min(60,(base.ignoreDef||0)+b('ignoreDef')),
  magicDamage:Math.min(60,(base.magicDamage||0)+b('magicDamage')),
  damageReduction:Math.min(40,(base.damageReduction||0)+b('damageReduction'))};
}
