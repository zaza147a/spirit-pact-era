export const GOLD_BAR_THRESHOLD = 500_000_000;
export const GOLD_BAR_VALUE = 100_000_000;
export const POTION_KEEP_LIMIT = 50_000;
export const GOLD_BAR_ITEM_ID = 'gold_bar';

// Retains the full value of earned gold without ever letting a valid save
// exceed its monetary validation limit. This is also safe to repeat.
export function exchangeOverflowGold(player) {
  if (!player || !Number.isFinite(player.gold) || player.gold <= GOLD_BAR_THRESHOLD) return 0;
  const count = Math.ceil((player.gold - GOLD_BAR_THRESHOLD) / GOLD_BAR_VALUE);
  player.gold -= count * GOLD_BAR_VALUE;
  const existing = player.bag.find(item => item.id === GOLD_BAR_ITEM_ID && !item.uid);
  if (existing) existing.qty += count;
  else player.bag.push({ id: GOLD_BAR_ITEM_ID, qty: count });
  return count;
}

// Sell only the surplus and preserve 50,000 of each potion type. This is
// idempotent, and works for immediate loot, offline rewards and old saves.
export function sellSurplusPotions(player, items) {
  if (!player?.bag) return { count: 0, gold: 0 };
  let count = 0, gold = 0;
  for (const entry of player.bag) {
    if (entry.uid || !Number.isInteger(entry.qty) || entry.qty <= POTION_KEEP_LIMIT) continue;
    const item = items[entry.id];
    if (!item || !('heal' in item || 'energy' in item)) continue;
    const extra = entry.qty - POTION_KEEP_LIMIT;
    entry.qty = POTION_KEEP_LIMIT;
    count += extra;
    gold += extra * Math.max(1, Math.floor((item.cost || 1) * 0.5));
  }
  if (gold) player.gold += gold;
  return { count, gold };
}
