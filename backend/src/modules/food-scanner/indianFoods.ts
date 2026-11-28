/**
 * FACHS curated Indian food fallback.
 *
 * Nutrients are approximate generic-food estimates per 100 g edible portion,
 * not brand-label values. Packaged products must be verified against their
 * own nutrition panel or barcode. Aliases support common Indian spellings.
 */
export interface IndianFoodRecord {
  name: string;
  aliases: string[];
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  category: string;
}
export const INDIAN_FOODS: IndianFoodRecord[] = [
  { name: "Protein Muesli (generic)", aliases: ["protein muesli", "protein museli", "protein musli", "protein musleli", "musleli", "museli", "muesli", "musli"], caloriesKcal: 390, proteinG: 18, carbsG: 58, fatG: 9, fiberG: 9, category: "packaged breakfast" },
  { name: "Plain Muesli", aliases: ["plain muesli", "fruit muesli"], caloriesKcal: 370, proteinG: 10, carbsG: 68, fatG: 7, fiberG: 8, category: "packaged breakfast" },
  { name: "Soya Chunks (dry)", aliases: ["soya chunks", "soy chunks", "nutrela", "meal maker"], caloriesKcal: 345, proteinG: 52, carbsG: 33, fatG: 0.5, fiberG: 13, category: "high protein" },
  { name: "Sattu (roasted gram flour)", aliases: ["sattu", "roasted chana flour", "chana sattu"], caloriesKcal: 400, proteinG: 20, carbsG: 60, fatG: 7, fiberG: 18, category: "high protein" },
  { name: "Roasted Chana", aliases: ["roasted chana", "bhuna chana", "roasted gram"], caloriesKcal: 380, proteinG: 20, carbsG: 58, fatG: 6, fiberG: 17, category: "snack" },
  { name: "Besan (gram flour)", aliases: ["besan", "gram flour", "chickpea flour"], caloriesKcal: 387, proteinG: 22, carbsG: 58, fatG: 7, fiberG: 11, category: "flour" },
  { name: "Paneer", aliases: ["paneer", "cottage cheese indian"], caloriesKcal: 265, proteinG: 18, carbsG: 3.5, fatG: 20, fiberG: 0, category: "dairy" },
  { name: "Tofu", aliases: ["tofu", "soy paneer"], caloriesKcal: 145, proteinG: 16, carbsG: 3, fatG: 8, fiberG: 2, category: "high protein" },
  { name: "Plain Curd", aliases: ["curd", "dahi", "plain yogurt", "set curd"], caloriesKcal: 61, proteinG: 3.5, carbsG: 4.7, fatG: 3.3, fiberG: 0, category: "dairy" },
  { name: "Greek Yogurt (plain)", aliases: ["greek yogurt", "hung curd"], caloriesKcal: 97, proteinG: 9, carbsG: 3.6, fatG: 5, fiberG: 0, category: "dairy" },
  { name: "Milk (whole)", aliases: ["milk", "full cream milk", "cow milk"], caloriesKcal: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3, fiberG: 0, category: "dairy" },
  { name: "Makhana (dry)", aliases: ["makhana", "fox nuts", "lotus seeds"], caloriesKcal: 350, proteinG: 9.7, carbsG: 76, fatG: 0.1, fiberG: 7.6, category: "snack" },
  { name: "Peanuts", aliases: ["peanuts", "groundnuts", "moongfali"], caloriesKcal: 567, proteinG: 25.8, carbsG: 16.1, fatG: 49.2, fiberG: 8.5, category: "snack" },
  { name: "Almonds", aliases: ["almonds", "badam"], caloriesKcal: 579, proteinG: 21.2, carbsG: 21.6, fatG: 49.9, fiberG: 12.5, category: "nuts" },
  { name: "Pumpkin Seeds", aliases: ["pumpkin seeds", "pepitas"], caloriesKcal: 559, proteinG: 30.2, carbsG: 10.7, fatG: 49.1, fiberG: 6, category: "seeds" },
  { name: "Poha (prepared)", aliases: ["poha", "kanda poha", "aval"], caloriesKcal: 130, proteinG: 2.5, carbsG: 25, fatG: 2.5, fiberG: 1.5, category: "breakfast" },
  { name: "Upma (prepared)", aliases: ["upma", "rava upma", "suji upma"], caloriesKcal: 150, proteinG: 4, carbsG: 25, fatG: 4, fiberG: 2, category: "breakfast" },
  { name: "Idli (plain)", aliases: ["idli", "steamed idli"], caloriesKcal: 58, proteinG: 3.5, carbsG: 28, fatG: 0.5, fiberG: 1, category: "breakfast" },
  { name: "Dosa (plain)", aliases: ["dosa", "plain dosa", "dosai"], caloriesKcal: 168, proteinG: 4, carbsG: 27, fatG: 4.5, fiberG: 1.5, category: "breakfast" },
  { name: "Besan Chilla", aliases: ["besan chilla", "chilla", "cheela"], caloriesKcal: 190, proteinG: 9, carbsG: 22, fatG: 7, fiberG: 5, category: "breakfast" },
  { name: "Thepla", aliases: ["thepla", "methi thepla"], caloriesKcal: 260, proteinG: 7, carbsG: 39, fatG: 8, fiberG: 5, category: "Gujarati" },
  { name: "Khaman Dhokla", aliases: ["khaman", "dhokla", "khaman dhokla"], caloriesKcal: 160, proteinG: 8, carbsG: 24, fatG: 4, fiberG: 3, category: "Gujarati" },
  { name: "Handvo", aliases: ["handvo", "handwa"], caloriesKcal: 210, proteinG: 8, carbsG: 30, fatG: 7, fiberG: 4, category: "Gujarati" },
  { name: "Khakhra", aliases: ["khakhra", "khakra"], caloriesKcal: 430, proteinG: 12, carbsG: 65, fatG: 14, fiberG: 8, category: "Gujarati snack" },
  { name: "Dal (cooked)", aliases: ["dal", "toor dal", "arhar dal", "moong dal", "masoor dal"], caloriesKcal: 116, proteinG: 9, carbsG: 20, fatG: 0.4, fiberG: 7.5, category: "Indian meal" },
  { name: "Rajma (cooked)", aliases: ["rajma", "kidney beans cooked"], caloriesKcal: 127, proteinG: 8.7, carbsG: 22.8, fatG: 0.5, fiberG: 6.4, category: "Indian meal" },
  { name: "Chole (cooked)", aliases: ["chole", "chana masala", "chickpeas curry"], caloriesKcal: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6, fiberG: 7.6, category: "Indian meal" },
  { name: "Chickpeas (boiled)", aliases: ["boiled chana", "kabuli chana", "chickpeas", "chana"], caloriesKcal: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6, fiberG: 7.6, category: "pulses" },
  { name: "Moong Sprouts", aliases: ["moong sprouts", "sprouts", "green gram sprouts"], caloriesKcal: 30, proteinG: 3, carbsG: 6, fatG: 0.2, fiberG: 1.8, category: "snack" },
  { name: "Khichdi (dal rice)", aliases: ["khichdi", "khichri", "dal khichdi"], caloriesKcal: 120, proteinG: 4, carbsG: 21, fatG: 2.5, fiberG: 2, category: "Indian meal" },
  { name: "Kadhi (prepared)", aliases: ["kadhi", "Gujarati kadhi", "pakora kadhi"], caloriesKcal: 90, proteinG: 4, carbsG: 8, fatG: 4, fiberG: 0.5, category: "Indian meal" },
  { name: "Cooked White Rice", aliases: ["white rice cooked", "cooked rice", "steamed rice", "chawal"], caloriesKcal: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3, fiberG: 0.4, category: "grain" },
  { name: "Roti (whole wheat)", aliases: ["roti", "chapati", "phulka"], caloriesKcal: 297, proteinG: 9.8, carbsG: 53, fatG: 7.5, fiberG: 7.5, category: "grain" },
  { name: "Jowar Flour", aliases: ["jowar", "jowar flour", "sorghum flour"], caloriesKcal: 329, proteinG: 10.6, carbsG: 72, fatG: 3.5, fiberG: 6.7, category: "grain" },
  { name: "Bajra Flour", aliases: ["bajra", "bajra flour", "pearl millet flour"], caloriesKcal: 361, proteinG: 11.6, carbsG: 67.5, fatG: 5, fiberG: 11, category: "grain" },
  { name: "Ragi Flour", aliases: ["ragi", "nachni", "finger millet flour"], caloriesKcal: 336, proteinG: 7.3, carbsG: 72, fatG: 1.5, fiberG: 11.5, category: "grain" },
  { name: "Samosa (vegetable)", aliases: ["samosa", "aloo samosa"], caloriesKcal: 260, proteinG: 5, carbsG: 32, fatG: 13, fiberG: 3, category: "snack" },
  { name: "Pav Bhaji", aliases: ["pav bhaji", "pao bhaji"], caloriesKcal: 150, proteinG: 4, carbsG: 22, fatG: 5, fiberG: 3, category: "Indian meal" },
  { name: "Sev Usal", aliases: ["sev usal", "usal"], caloriesKcal: 190, proteinG: 8, carbsG: 25, fatG: 7, fiberG: 6, category: "Gujarati meal" },
  { name: "Murmura (puffed rice)", aliases: ["murmura", "mamra", "puffed rice"], caloriesKcal: 402, proteinG: 6, carbsG: 90, fatG: 0.5, fiberG: 1, category: "snack" },
];

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\\s+/g, " ");
const indexedFoods = INDIAN_FOODS.map((food) => ({ food, terms: [food.name, ...food.aliases].map(normalize) }));
export function searchIndianFoods(query: string) {
  const q = normalize(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ");
  return indexedFoods
    .map(({ food, terms }) => {
      const exact = terms.some((term) => term === q);
      const starts = terms.some((term) => term.startsWith(q) || q.startsWith(term));
      const tokenMatch = tokens.every((token) => terms.some((term) => term.split(" ").some((word) => word.startsWith(token))));
      return { food, score: exact ? 3 : starts ? 2 : tokenMatch ? 1 : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, 12)
    .map(({ food }) => ({
      code: "",
      externalFoodId: "fachs-indian-" + normalize(food.name).replace(/ /g, "-"),
      name: food.name,
      brand: "",
      quantity: "",
      servingSize: "100 g",
      servingQuantityG: 100,
      imageUrl: null,
      ingredients: "",
      allergens: "",
      nutrimentsPer100g: {
        basis: "Approximate generic-food estimate per 100 g; check package label for branded products",
        caloriesKcal: food.caloriesKcal,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        fiberG: food.fiberG,
        saturatedFatG: null,
        sugarsG: null,
        saltG: null,
        sodiumMg: null,
        caffeineMg: null,
      },
      source: "FACHS Indian Food Database",
      sourceUrl: null,
      verificationStatus: "generic_estimate_needs_label_check",
      category: food.category,
    }));
}
