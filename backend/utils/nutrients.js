const VITAMIN_KEYS = ['a', 'c', 'd', 'e', 'k', 'b1', 'b2', 'b3', 'b6', 'b12', 'folate'];

const MINERAL_KEYS = ['calcium', 'iron', 'magnesium', 'phosphorus', 'zinc', 'copper', 'manganese', 'selenium'];

const LIPID_KEYS = ['saturated', 'trans', 'monounsaturated', 'polyunsaturated'];

const MICRO_RDA = {
  vitamins: {
    a: { amount: 900, unit: 'mcg' },
    c: { amount: 90, unit: 'mg' },
    d: { amount: 15, unit: 'mcg' },
    e: { amount: 15, unit: 'mg' },
    k: { amount: 120, unit: 'mcg' },
    b1: { amount: 1.2, unit: 'mg' },
    b2: { amount: 1.3, unit: 'mg' },
    b3: { amount: 16, unit: 'mg' },
    b6: { amount: 1.3, unit: 'mg' },
    b12: { amount: 2.4, unit: 'mcg' },
    folate: { amount: 400, unit: 'mcg' },
  },
  minerals: {
    calcium: { amount: 1000, unit: 'mg' },
    iron: { amount: 18, unit: 'mg' },
    magnesium: { amount: 400, unit: 'mg' },
    phosphorus: { amount: 700, unit: 'mg' },
    zinc: { amount: 11, unit: 'mg' },
    copper: { amount: 0.9, unit: 'mg' },
    manganese: { amount: 2.3, unit: 'mg' },
    selenium: { amount: 55, unit: 'mcg' },
  },
  electrolytes: {
    sodium: { amount: 1500, unit: 'mg' },
    potassium: { amount: 4700, unit: 'mg' },
  },
  lipids: {
    saturated: { amount: 20, unit: 'g' },
    trans: { amount: 2, unit: 'g' },
    monounsaturated: { amount: 20, unit: 'g' },
    polyunsaturated: { amount: 20, unit: 'g' },
    cholesterol: { amount: 300, unit: 'mg' },
  },
};

module.exports = {
  VITAMIN_KEYS,
  MINERAL_KEYS,
  LIPID_KEYS,
  MICRO_RDA,
};
