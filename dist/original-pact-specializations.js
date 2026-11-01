// Original classic pair specialization: each entry composes existing bounded combat actions.
// These actions are FIRST PASS implementations, not yet full source-design behavioral acceptance.
export const ORIGINAL_PACT_SPECIALIZATIONS=Object.freeze({
  "knight/attack-magic": {
    "payload": [
      "stackStrike",
      "elementBurn"
    ]
  },
  "knight/attack-support": {
    "payload": [
      "haste",
      "counterStrike"
    ]
  },
  "knight/magic-defense": {
    "payload": [
      "ward",
      "splash"
    ]
  },
  "knight/magic-support": {
    "payload": [
      "manaRefund",
      "haste"
    ]
  },
  "crusader/attack-magic": {
    "payload": [
      "arcaneStrike",
      "elementBurn"
    ]
  },
  "crusader/attack-support": {
    "payload": [
      "comboLeech",
      "counterStrike"
    ]
  },
  "crusader/magic-defense": {
    "payload": [
      "stackStrike",
      "arcaneStrike"
    ]
  },
  "crusader/magic-support": {
    "payload": [
      "manaRefund",
      "ward"
    ]
  },
  "crusader/defense-support": {
    "payload": [
      "ward",
      "counterStrike"
    ]
  },
  "wizard/attack-magic": {
    "payload": [
      "elementBurn",
      "splash"
    ]
  },
  "wizard/attack-defense": {"payload": ["storedSpellCharge"]},
  "wizard/attack-support": {
    "payload": [
      "haste",
      "mark"
    ]
  },
  "wizard/magic-defense": {
    "payload": ["wardCharge"]
  },
  "wizard/magic-support": {
    "payload": [
      "splash",
      "manaRefund"
    ]
  },
  "wizard/defense-support": {
    "payload": [
      "ward",
      "mark"
    ]
  },
  "sage/attack-magic": {
    "payload": [
      "mark",
      "elementBurn"
    ]
  },
  "sage/attack-defense": {
    "payload": [
      "armorBreak",
      "stackStrike"
    ]
  },
  "sage/attack-support": {
    "payload": [
      "manaRefund",
      "counterStrike"
    ]
  },
  "sage/magic-defense": {
    "payload": [
      "stackStrike",
      "splash"
    ]
  },
  "sage/magic-support": {
    "payload": ["starRainChain"]
  },
  "sage/defense-support": {"payload": ["guardianAutoChase", "ward"]},
  "assassin/attack-defense": {
    "payload": [
      "armorBreak",
      "counterStrike"
    ]
  },
  "assassin/attack-support": {
    "payload": [
      "comboLeech",
      "mark"
    ]
  },
  "assassin/magic-defense": {
    "payload": [
      "arcaneStrike",
      "mark"
    ]
  },
  "assassin/magic-support": {
    "payload": [
      "arcaneStrike",
      "manaRefund"
    ]
  },
  "assassin/defense-support": {"payload": ["lowHpRiposte", "ward"]},
  "rogue/attack-magic": {
    "payload": [
      "arcaneStrike",
      "elementBurn"
    ]
  },
  "rogue/attack-defense": {
    "payload": [
      "armorBreak",
      "counterStrike"
    ]
  },
  "rogue/attack-support": {"payload": ["hunterSummon", "mark"]},
  "rogue/magic-defense": {
    "payload": [
      "splash",
      "haste"
    ]
  },
  "rogue/magic-support": {
    "payload": [
      "manaRefund",
      "splash"
    ]
  },
  "priest/attack-magic": {
    "payload": [
      "arcaneStrike",
      "elementBurn"
    ]
  },
  "priest/attack-defense": {
    "payload": [
      "armorBreak",
      "ward"
    ]
  },
  "priest/attack-support": {
    "payload": [
      "haste",
      "counterStrike"
    ]
  },
  "priest/magic-defense": {
    "payload": [
      "stackStrike",
      "arcaneStrike"
    ]
  },
  "priest/defense-support": {
    "payload": [
      "ward",
      "counterStrike"
    ]
  },
  "monk/attack-magic": {
    "payload": [
      "arcaneStrike",
      "elementBurn"
    ]
  },
  "monk/attack-defense": {
    "payload": [
      "stackStrike",
      "armorBreak"
    ]
  },
  "monk/magic-defense": {
    "payload": [
      "arcaneStrike",
      "splash"
    ]
  },
  "monk/magic-support": {
    "payload": [
      "manaRefund",
      "splash"
    ]
  },
  "monk/defense-support": {
    "payload": [
      "manaRefund",
      "stackStrike"
    ]
  },
  "hunter/attack-magic": {
    "payload": [
      "mark",
      "elementBurn"
    ]
  },
  "hunter/attack-defense": {
    "payload": [
      "armorBreak",
      "counterStrike"
    ]
  },
  "hunter/attack-support": {
    "payload": ["falconVolley"]
  },
  "hunter/magic-defense": {
    "payload": [
      "arcaneStrike",
      "splash"
    ]
  },
  "hunter/magic-support": {
    "payload": [
      "splash",
      "elementBurn"
    ]
  },
  "hunter/defense-support": {
    "payload": [
      "ward",
      "counterStrike"
    ]
  },
  "performer/attack-magic": {
    "payload": [
      "elementBurn",
      "haste"
    ]
  },
  "performer/attack-defense": {"payload": ["soundShield"]},
  "performer/attack-support": {
    "payload": [
      "haste",
      "counterStrike"
    ]
  },
  "performer/magic-defense": {
    "payload": [
      "arcaneStrike",
      "ward"
    ]
  },
  "performer/magic-support": {
    "payload": [
      "splash",
      "haste"
    ]
  },
  "performer/defense-support": {
    "payload": [
      "ward",
      "arcaneStrike"
    ]
  }
});
