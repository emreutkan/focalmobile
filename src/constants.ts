export const Models = {
  main: {
    name: 'llava-phi-3-mini-int4.gguf',
    url: 'https://huggingface.co/xtuner/llava-phi-3-mini-gguf/resolve/main/llava-phi-3-mini-int4.gguf',
    size: 2.32 * 1024 * 1024 * 1024
  },
  mmproj: {
    name: 'llava-phi-3-mini-mmproj-f16.gguf',
    url: 'https://huggingface.co/xtuner/llava-phi-3-mini-gguf/resolve/main/llava-phi-3-mini-mmproj-f16.gguf',
    size: 600 * 1024 * 1024 // ~600MB
  },
};

// ============================================
// NUTRITION REFERENCE LISTS
// AI uses these to identify nutrients in food
// ============================================

// Macronutrients (always tracked)
export const MACRONUTRIENTS = [
  'calories',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'sugar',
  'saturated_fat',
  'unsaturated_fat',
  'cholesterol',
  'sodium',
] as const;

// Micronutrients - Vitamins & Minerals (50 items)
export const MICRONUTRIENTS = [
  // Vitamins (16)
  'vitamin_a',
  'vitamin_b1_thiamine',
  'vitamin_b2_riboflavin',
  'vitamin_b3_niacin',
  'vitamin_b5_pantothenic',
  'vitamin_b6',
  'vitamin_b7_biotin',
  'vitamin_b9_folate',
  'vitamin_b12',
  'vitamin_c',
  'vitamin_d',
  'vitamin_e',
  'vitamin_k',
  'choline',
  'beta_carotene',
  'lycopene',
  // Minerals (20)
  'calcium',
  'iron',
  'magnesium',
  'phosphorus',
  'potassium',
  'zinc',
  'copper',
  'manganese',
  'selenium',
  'chromium',
  'molybdenum',
  'iodine',
  'chloride',
  'fluoride',
  'boron',
  'silicon',
  'vanadium',
  'nickel',
  'cobalt',
  'sulfur',
  // Other beneficial compounds (14)
  'omega_3',
  'omega_6',
  'omega_9',
  'lutein',
  'zeaxanthin',
  'quercetin',
  'resveratrol',
  'curcumin',
  'glucosinolates',
  'anthocyanins',
  'catechins',
  'flavonoids',
  'polyphenols',
  'probiotics',
] as const;

// Bad ingredients to flag (inflammatory, processed, harmful)
export const BAD_INGREDIENTS = [
  // Inflammatory Oils (seed oils)
  'soybean_oil',
  'canola_oil',
  'corn_oil',
  'cottonseed_oil',
  'sunflower_oil',
  'safflower_oil',
  'grapeseed_oil',
  'rice_bran_oil',
  'vegetable_oil',
  'margarine',
  'shortening',
  'partially_hydrogenated_oil',
  // Sugars & Sweeteners
  'high_fructose_corn_syrup',
  'corn_syrup',
  'aspartame',
  'sucralose',
  'saccharin',
  'acesulfame_k',
  'maltodextrin',
  'dextrose',
  // Preservatives & Additives
  'sodium_nitrate',
  'sodium_nitrite',
  'bha',
  'bht',
  'tbhq',
  'sodium_benzoate',
  'potassium_sorbate',
  'sulfites',
  'carrageenan',
  'polysorbate_80',
  // Colors & Dyes
  'red_40',
  'yellow_5',
  'yellow_6',
  'blue_1',
  'blue_2',
  'caramel_color',
  // Trans Fats & Processed
  'trans_fat',
  'interesterified_fat',
  'mono_diglycerides',
  // MSG & Flavor Enhancers
  'msg',
  'autolyzed_yeast',
  'hydrolyzed_protein',
  'natural_flavors',
  // Other Harmful
  'sodium_phosphate',
  'calcium_disodium_edta',
  'propyl_gallate',
  'brominated_vegetable_oil',
] as const;

// Good ingredients to highlight
export const GOOD_INGREDIENTS = [
  // Healthy Fats
  'olive_oil',
  'avocado_oil',
  'coconut_oil',
  'grass_fed_butter',
  'ghee',
  'nuts',
  'seeds',
  'avocado',
  // Proteins
  'grass_fed_beef',
  'wild_caught_fish',
  'pasture_raised_eggs',
  'organic_chicken',
  'legumes',
  'lentils',
  'beans',
  'tofu',
  'tempeh',
  // Whole Grains
  'quinoa',
  'brown_rice',
  'oats',
  'whole_wheat',
  'barley',
  'buckwheat',
  // Vegetables
  'leafy_greens',
  'cruciferous_vegetables',
  'root_vegetables',
  'alliums',
  'peppers',
  'tomatoes',
  'mushrooms',
  // Fruits
  'berries',
  'citrus',
  'apples',
  'bananas',
  'stone_fruits',
  // Fermented Foods
  'yogurt',
  'kefir',
  'sauerkraut',
  'kimchi',
  'miso',
  'kombucha',
  // Herbs & Spices
  'turmeric',
  'ginger',
  'garlic',
  'cinnamon',
  'oregano',
  'rosemary',
  // Other Healthy
  'dark_chocolate',
  'green_tea',
  'bone_broth',
  'collagen',
] as const;

// Type exports for TypeScript
export type Macronutrient = typeof MACRONUTRIENTS[number];
export type Micronutrient = typeof MICRONUTRIENTS[number];
export type BadIngredient = typeof BAD_INGREDIENTS[number];
export type GoodIngredient = typeof GOOD_INGREDIENTS[number];