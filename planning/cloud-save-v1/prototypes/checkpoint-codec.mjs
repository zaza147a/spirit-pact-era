// Cloud-only staging prototype; NOT wired into existing single-player game.
export const CHECKPOINT_VERSION = 1;
const TAG = '__sp_checkpoint_type__';
const isPlain = x => Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null;
export function encodeState(value) {
  const active = new WeakSet();
  function encode(x, depth = 0) {
    if (depth > 128) throw new Error('state nesting too deep');
    if (x === undefined) return { [TAG]: 'undefined' };
    if (typeof x === 'number' && !Number.isFinite(x)) return { [TAG]: 'number', value: String(x) };
    if (typeof x === 'bigint') return { [TAG]: 'bigint', value: String(x) };
    if (x === null || ['string','boolean','number'].includes(typeof x)) return x;
    if (typeof x !== 'object') throw new Error('unsupported value type');
    if (active.has(x)) throw new Error('cyclic state unsupported');
    active.add(x);
    let out;
    if (x instanceof Map) out = { [TAG]: 'map', entries: [...x].map(([k,v]) => [encode(k, depth+1), encode(v, depth+1)]) };
    else if (x instanceof Set) out = { [TAG]: 'set', entries: [...x].map(v => encode(v, depth+1)) };
    else if (Array.isArray(x)) out = x.map(v => encode(v, depth+1));
    else if (isPlain(x)) {
      if (Object.hasOwn(x, TAG)) throw new Error('reserved checkpoint field');
      out = Object.fromEntries(Object.entries(x).map(([k,v]) => [k, encode(v, depth+1)]));
    } else throw new Error('unsupported object prototype');
    active.delete(x);
    return out;
  }
  return encode(value);
}
export function decodeState(value) {
  function decode(x, depth = 0) {
    if (depth > 128) throw new Error('checkpoint nesting too deep');
    if (x === null || ['string','boolean','number'].includes(typeof x)) return x;
    if (Array.isArray(x)) return x.map(v => decode(v, depth+1));
    if (!x || typeof x !== 'object') throw new Error('malformed checkpoint');
    if (Object.hasOwn(x, TAG)) {
      switch(x[TAG]) {
        case 'undefined': return undefined;
        case 'number': {
          if (!['Infinity','-Infinity','NaN'].includes(x.value)) throw new Error('invalid tagged number');
          return Number(x.value);
        }
        case 'bigint': return BigInt(x.value);
        case 'map': return new Map(x.entries.map(([k,v]) => [decode(k,depth+1),decode(v,depth+1)]));
        case 'set': return new Set(x.entries.map(v => decode(v,depth+1)));
        default: throw new Error('unknown checkpoint tag');
      }
    }
    const out = {};
    for (const [k,v] of Object.entries(x)) Object.defineProperty(out,k,{value:decode(v,depth+1),writable:true,enumerable:true,configurable:true});
    return out;
  }
  return decode(value);
}
export function serializeCheckpoint({ cursor, clock, rulesetHash, rngState, combat }) {
  if (!Number.isSafeInteger(cursor) || cursor < 0 || cursor > 864000) throw new Error('invalid cursor');
  if (!Number.isSafeInteger(clock) || clock < 0) throw new Error('invalid clock');
  if (!/^[0-9a-f]{16,128}$/i.test(rulesetHash ?? '')) throw new Error('missing ruleset hash');
  if (!Number.isInteger(rngState) || rngState <= 0 || rngState > 0xffffffff) throw new Error('invalid rng state');
  return JSON.stringify({version:CHECKPOINT_VERSION,cursor,clock,rulesetHash,rngState,combat:encodeState(combat)});
}
export function restoreCheckpoint(serialized, expectedRulesetHash) {
  if (typeof serialized !== 'string' || serialized.length > 8_000_000) throw new Error('checkpoint size invalid');
  const x = JSON.parse(serialized);
  if (x.version !== CHECKPOINT_VERSION) throw new Error('unsupported checkpoint version');
  if (x.rulesetHash !== expectedRulesetHash) throw new Error('ruleset mismatch');
  if (!Number.isSafeInteger(x.cursor) || x.cursor < 0 || x.cursor > 864000) throw new Error('invalid cursor');
  if (!Number.isSafeInteger(x.clock) || x.clock < 0) throw new Error('invalid clock');
  if (!Number.isInteger(x.rngState) || x.rngState <= 0 || x.rngState > 0xffffffff) throw new Error('invalid RNG state');
  return {...x,combat:decodeState(x.combat)};
}
// Non-cryptographic deterministic PRNG for reproducibility only. Seed must originate on server.
export function nextRandom(state) {
  if (!Number.isInteger(state) || state <= 0 || state > 0xffffffff) throw new Error('invalid RNG state');
  let x = state >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return {state:x >>> 0, value:(x >>> 0) / 4294967296};
}
