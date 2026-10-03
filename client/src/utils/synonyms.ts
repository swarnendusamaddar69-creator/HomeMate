export interface NormalizedItem {
  canonical: string;
  hindi: string;
  bengali: string;
  category: 'vegetables' | 'dairy' | 'staples' | 'spices' | 'snacks' | 'other';
  defaultExpiryDays: number;
}

export const SYNONYM_DICTIONARY: Record<string, NormalizedItem> = {
  // Vegetables
  potato: { canonical: 'Potato', hindi: 'आलू (Aloo)', bengali: 'আলু (Alu)', category: 'vegetables', defaultExpiryDays: 14 },
  aloo: { canonical: 'Potato', hindi: 'आलू (Aloo)', bengali: 'আলু (Alu)', category: 'vegetables', defaultExpiryDays: 14 },
  alu: { canonical: 'Potato', hindi: 'आलू (Aloo)', bengali: 'আলু (Alu)', category: 'vegetables', defaultExpiryDays: 14 },

  onion: { canonical: 'Onion', hindi: 'प्याज (Pyaz)', bengali: 'পেঁয়াজ (Peyaj)', category: 'vegetables', defaultExpiryDays: 14 },
  pyaz: { canonical: 'Onion', hindi: 'प्याज (Pyaz)', bengali: 'পেঁয়াজ (Peyaj)', category: 'vegetables', defaultExpiryDays: 14 },
  peyaj: { canonical: 'Onion', hindi: 'प्याज (Pyaz)', bengali: 'পেঁয়াজ (Peyaj)', category: 'vegetables', defaultExpiryDays: 14 },
  kanda: { canonical: 'Onion', hindi: 'कांदा (Kanda)', bengali: 'পেঁয়াজ (Peyaj)', category: 'vegetables', defaultExpiryDays: 14 },

  tomato: { canonical: 'Tomato', hindi: 'टमाटर (Tamatar)', bengali: 'টমেটো (Tomato)', category: 'vegetables', defaultExpiryDays: 5 },
  tamatar: { canonical: 'Tomato', hindi: 'टमाटर (Tamatar)', bengali: 'টমেটো (Tomato)', category: 'vegetables', defaultExpiryDays: 5 },

  ginger: { canonical: 'Ginger', hindi: 'अदरक (Adrak)', bengali: 'আদা (Ada)', category: 'vegetables', defaultExpiryDays: 10 },
  adrak: { canonical: 'Ginger', hindi: 'अदरक (Adrak)', bengali: 'আदा (Ada)', category: 'vegetables', defaultExpiryDays: 10 },
  ada: { canonical: 'Ginger', hindi: 'अदरक (Adrak)', bengali: 'আদা (Ada)', category: 'vegetables', defaultExpiryDays: 10 },

  garlic: { canonical: 'Garlic', hindi: 'लहसुन (Lahsun)', bengali: 'রসুন (Roshun)', category: 'vegetables', defaultExpiryDays: 20 },
  lahsun: { canonical: 'Garlic', hindi: 'लहसुन (Lahsun)', bengali: 'রসুন (Roshun)', category: 'vegetables', defaultExpiryDays: 20 },
  roshun: { canonical: 'Garlic', hindi: 'लहसुन (Lahsun)', bengali: 'রসুন (Roshun)', category: 'vegetables', defaultExpiryDays: 20 },

  coriander: { canonical: 'Coriander', hindi: 'धनिया (Dhaniya)', bengali: 'ধনেপাতা (Dhonepata)', category: 'vegetables', defaultExpiryDays: 3 },
  dhaniya: { canonical: 'Coriander', hindi: 'धनिया (Dhaniya)', bengali: 'ধনেপাতা (Dhonepata)', category: 'vegetables', defaultExpiryDays: 3 },
  dhonepata: { canonical: 'Coriander', hindi: 'धनिया (Dhaniya)', bengali: 'ধনেপাতা (Dhonepata)', category: 'vegetables', defaultExpiryDays: 3 },

  spinach: { canonical: 'Spinach', hindi: 'पालक (Palak)', bengali: 'পালং শাক (Palong Shak)', category: 'vegetables', defaultExpiryDays: 3 },
  palak: { canonical: 'Spinach', hindi: 'पालक (Palak)', bengali: 'পালং শাক (Palong Shak)', category: 'vegetables', defaultExpiryDays: 3 },

  // Dairy
  milk: { canonical: 'Milk', hindi: 'दूध (Doodh)', bengali: 'দুধ (Dudh)', category: 'dairy', defaultExpiryDays: 2 },
  doodh: { canonical: 'Milk', hindi: 'दूध (Doodh)', bengali: 'দুধ (Dudh)', category: 'dairy', defaultExpiryDays: 2 },
  dudh: { canonical: 'Milk', hindi: 'दूध (Doodh)', bengali: 'দুধ (Dudh)', category: 'dairy', defaultExpiryDays: 2 },

  curd: { canonical: 'Curd / Dahi', hindi: 'दही (Dahi)', bengali: 'দই (Doi)', category: 'dairy', defaultExpiryDays: 4 },
  dahi: { canonical: 'Curd / Dahi', hindi: 'दही (Dahi)', bengali: 'দই (Doi)', category: 'dairy', defaultExpiryDays: 4 },
  doi: { canonical: 'Curd / Dahi', hindi: 'दही (Dahi)', bengali: 'দই (Doi)', category: 'dairy', defaultExpiryDays: 4 },

  paneer: { canonical: 'Paneer', hindi: 'पनीर (Paneer)', bengali: 'ছানা/পনির (Ponir)', category: 'dairy', defaultExpiryDays: 4 },
  butter: { canonical: 'Butter', hindi: 'मक्खन (Makkhan)', bengali: 'মাখন (Makhon)', category: 'dairy', defaultExpiryDays: 14 },

  // Staples
  rice: { canonical: 'Rice', hindi: 'चावल (Chawal)', bengali: 'চাল (Chal)', category: 'staples', defaultExpiryDays: 90 },
  chawal: { canonical: 'Rice', hindi: 'चावल (Chawal)', bengali: 'চাল (Chal)', category: 'staples', defaultExpiryDays: 90 },
  chal: { canonical: 'Rice', hindi: 'चावल (Chawal)', bengali: 'চাল (Chal)', category: 'staples', defaultExpiryDays: 90 },

  atta: { canonical: 'Atta / Wheat Flour', hindi: 'आटा (Atta)', bengali: 'আটা (Ata)', category: 'staples', defaultExpiryDays: 60 },
  aata: { canonical: 'Atta / Wheat Flour', hindi: 'आटा (Atta)', bengali: 'আটা (Ata)', category: 'staples', defaultExpiryDays: 60 },

  dal: { canonical: 'Dal / Lentils', hindi: 'दाल (Dal)', bengali: 'ডাল (Dal)', category: 'staples', defaultExpiryDays: 90 },
  daal: { canonical: 'Dal / Lentils', hindi: 'दाल (Dal)', bengali: 'ডাল (Dal)', category: 'staples', defaultExpiryDays: 90 },

  oil: { canonical: 'Cooking Oil', hindi: 'तेल (Tel)', bengali: 'তেল (Tel)', category: 'staples', defaultExpiryDays: 120 },
  tel: { canonical: 'Cooking Oil', hindi: 'तेल (Tel)', bengali: 'তেল (Tel)', category: 'staples', defaultExpiryDays: 120 },

  sugar: { canonical: 'Sugar', hindi: 'चीनी (Chini)', bengali: 'চিনি (Chini)', category: 'staples', defaultExpiryDays: 180 },
  chini: { canonical: 'Sugar', hindi: 'चीनी (Chini)', bengali: 'চিনি (Chini)', category: 'staples', defaultExpiryDays: 180 },

  tea: { canonical: 'Tea Leaves', hindi: 'चाय पत्ती (Chai Patti)', bengali: 'চা পাতা (Cha Pata)', category: 'staples', defaultExpiryDays: 120 },
  cha: { canonical: 'Tea Leaves', hindi: 'चाय पत्ती (Chai Patti)', bengali: 'চা পাতা (Cha Pata)', category: 'staples', defaultExpiryDays: 120 },
};

export function normalizeGroceryInput(rawInput: string, lang: 'en' | 'hi' | 'bn' = 'en') {
  const clean = rawInput.toLowerCase().trim().replace(/^(add|bring|buy|need|chahiye|dao|lagbe)\s+/i, '');
  
  // Extract simple quantity if present, e.g., "2 kg aloo", "1 packet doodh"
  const qtyMatch = clean.match(/^(\d+(?:\.\d+)?\s*(?:kg|g|litre|ltr|l|packet|pkt|dozen|bunch|dabba|can)?)\s*(.*)$/i);
  let quantity = '';
  let itemName = clean;

  if (qtyMatch && qtyMatch[1] && qtyMatch[2]) {
    quantity = qtyMatch[1].trim();
    itemName = qtyMatch[2].trim();
  }

  // Look for lookup match
  const lookupKey = itemName.toLowerCase().replace(/[^a-z]/g, '');
  const found = SYNONYM_DICTIONARY[lookupKey];

  if (found) {
    let localName = found.canonical;
    if (lang === 'hi') localName = found.hindi;
    if (lang === 'bn') localName = found.bengali;

    return {
      title: found.canonical,
      localTitle: localName,
      category: found.category,
      quantity: quantity || '1 unit',
      expiryDays: found.defaultExpiryDays
    };
  }

  // Fallback if not in dictionary
  const titleCase = rawInput.charAt(0).toUpperCase() + rawInput.slice(1);
  return {
    title: titleCase,
    localTitle: titleCase,
    category: 'other' as const,
    quantity: quantity || '1 unit',
    expiryDays: 7
  };
}
