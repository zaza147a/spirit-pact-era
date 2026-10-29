// Explicit shop inventory: equipment and progression materials come from play.
export const SHOP_GROUPS=Object.freeze([
 {name:'生命補給',ids:['red_small','red_mid','red_large']},
 {name:'魔力補給',ids:['blue_small','blue_mid','blue_large']},
 {name:'夥伴捕捉',ids:['orb']}
]);
export const SHOP_IDS=Object.freeze(SHOP_GROUPS.flatMap(group=>group.ids));
export const isShopItem=id=>SHOP_IDS.includes(id);
