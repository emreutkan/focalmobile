export const Models = {
  main: {
    name: 'llava-phi-3-mini-int4.gguf',
    url: 'https://huggingface.co/xtuner/llava-phi-3-mini-gguf/resolve/main/llava-phi-3-mini-int4.gguf',
    size: 2.32 * 1024 * 1024 * 1024,
  },
  mmproj: {
    name: 'llava-phi-3-mini-mmproj-f16.gguf',
    url: 'https://huggingface.co/xtuner/llava-phi-3-mini-gguf/resolve/main/llava-phi-3-mini-mmproj-f16.gguf',
    size: 600 * 1024 * 1024, // ~600MB
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

// export const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
// export const GROQ_MODEL_TEMPERATURE = 0.6;
// export const GROQ_MODEL_TOP_P = 0.95;
// export const GROQ_MODEL_MAX_COMPLETION_TOKENS = 4096;

// export const GROQ_FOOD_ANALYSIS_PROMPT = `Look at this food image and identify ONLY the edible food items.

//     RULES:
//     1. Name the dish specifically (Turkish, Indian, Italian, etc.)
//     2. List ONLY edible food components - ignore plates, utensils, napkins, etc.
//     3. Break down each distinct food item separately with weight in grams
//     4. Estimate realistic portions based on visual context
//     5. Be accurate with gram estimations
//     6. "quantity" MUST be a precise numeric amount (e.g. "250g", "2 slices", "150ml", "3 pieces"). NEVER use vague terms like "a bowlful", "some", "sprinkled", "a handful", "a bit". Always estimate a specific number.

//     JSON format:
//     {
//       "isFood": true,
//       "mealName": "Dish Name",
//       "items": [
//         {
//           "name": "Grilled Chicken Breast",
//           "quantity": "1 piece (150)",
//           "estimatedGrams": 150
//         },
//         {
//           "name": "White Rice",
//           "quantity": "200",
//           "estimatedGrams": 200
//         },
//         {
//           "name": "Grated Parmesan",
//           "quantity": "15",
//           "estimatedGrams": 15
//         }
//       ]
//     }

//     If no food visible:
//     {
//       "isFood": false,
//       "items": [],
//       "message": "No food detected in image"
//     }

//     Analyze the image and respond with ONLY valid JSON, no other text:`;

// export const GROQ_NUTRITION_CALCULATION_PROMPT = `You are a nutrition calculator. Calculate macros and micros for the given meal.

//     MACRO CALCULATION:
//     - Food is NOT pure macronutrient. Always account for water content and real composition.
//     - Use your knowledge of real nutritional composition per 100g of each food, then scale by the given weight.
//     - Cross-check: calories must ≈ (protein*4)+(carbs*4)+(fat*9). If it doesn't add up, recalculate.

//     HEALTH SCORE (0-100) - SCORING PHILOSOPHY:
//     Score based on how NATURAL and UNPROCESSED the food is. This is the ONLY criteria.

//     95-100: Single-ingredient whole foods in their natural state
//     80-94: Minimally processed whole foods
//     60-79: Moderately processed foods
//     30-59: Processed foods with additives
//     0-29: Ultra-processed foods

//     NUTRITIONAL PRINCIPLES (apply these when scoring and analyzing):
//     - Saturated fat and cholesterol from whole foods are NOT negatives. Dietary cholesterol is essential for hormone production (testosterone, vitamin D synthesis). Never penalize whole foods for cholesterol or saturated fat content.
//     - Seed oils (soybean, canola, corn, sunflower, safflower, grapeseed, cottonseed, rice bran, vegetable oil, margarine) are highly inflammatory. Any food cooked in or containing seed oils gets a significant score penalty. Flag them as bad ingredients.
//     - Omega-3 EPA/DHA are beneficial, BUT if the food also contains seed oils (e.g. deep-fried fish), the omega-6 from seed oils cancels out the omega-3 benefit. Note this in reasoning when applicable. Do not list omega_3 as a micro benefit if the food is cooked in seed oils.
//     - Phytic acid: Know which foods contain phytic acid (grains, legumes, nuts, seeds) and how much. Flag phytic_acid as a bad ingredient when present in significant amounts, as it binds minerals (iron, zinc, calcium, magnesium) and reduces their absorption. Note in reasoning which micros are affected.
//     - The enemy is PROCESSING and INDUSTRIAL INGREDIENTS, not any naturally occurring macronutrient.
//     - Whole animal products, whole vegetables, whole fruits, and minimally processed foods are top tier nutrition.

//     MICRONUTRIENTS - only list those present in meaningful amounts with their estimated amounts:
//     vitamin_a, vitamin_b1_thiamine, vitamin_b2_riboflavin, vitamin_b3_niacin, vitamin_b5_pantothenic, vitamin_b6, vitamin_b7_biotin, vitamin_b9_folate, vitamin_b12, vitamin_c, vitamin_d, vitamin_e, vitamin_k, choline, beta_carotene, lycopene, calcium, iron, magnesium, phosphorus, potassium, zinc, copper, manganese, selenium, omega_3, omega_6, lutein, zeaxanthin, flavonoids, polyphenols

//     BAD INGREDIENTS - flag if the food likely contains them:
//     soybean_oil, canola_oil, corn_oil, sunflower_oil, safflower_oil, grapeseed_oil, cottonseed_oil, rice_bran_oil, vegetable_oil, margarine, high_fructose_corn_syrup, aspartame, sucralose, maltodextrin, sodium_nitrate, sodium_nitrite, msg, trans_fat, red_40, yellow_5, natural_flavors, carrageenan, phytic_acid

//     GOOD INGREDIENTS - highlight what is present:
//     olive_oil, avocado_oil, grass_fed_butter, ghee, coconut_oil, nuts, seeds, avocado, eggs, red_meat, organ_meats, bone_broth, fermented_foods, leafy_greens, cruciferous_vegetables, berries, turmeric, ginger, garlic, yogurt, kefir, wild_caught_fish

//     IMPORTANT: Return nutrition data PER FOOD ITEM, not as a total. Calculate each food item's macros and micros separately based on its weight.

//     Respond with ONLY valid JSON (no markdown, no code fences, no extra text):
//     {
//       "healthScore": 0,
//       "reasoning": "",
//       "badIngredients": [],
//       "goodIngredients": [],
//       "foodItems": [
//         {
//           "itemName": "Food Name",
//           "amountGrams": 400,
//           "macros": {
//             "protein": 0,
//             "carbs": 0,
//             "fat": 0,
//             "calories": 0,
//             "fiber": 0,
//             "sugar": 0,
//             "saturatedFat": 0,
//             "monounsaturatedFat": 0,
//             "transFat": 0,
//             "sodium": 0,
//             "cholesterol": 0
//           },
//           "micros": [
//             {
//               "name": "vitamin_b12",
//               "amount": 2.4,
//               "unit": "µg"
//             }
//           ]
//         }
//       ]
//     }`;
export type Macronutrient = (typeof MACRONUTRIENTS)[number];
export type Micronutrient = (typeof MICRONUTRIENTS)[number];
export type BadIngredient = (typeof BAD_INGREDIENTS)[number];
export type GoodIngredient = (typeof GOOD_INGREDIENTS)[number];
