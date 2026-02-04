import { create } from "zustand";


interface NutritionStore {
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  setMacros: (macros: NutritionStore["macros"]) => void;
  resetMacros: () => void;
  addMacro: (macro: keyof NutritionStore["macros"], value: number) => void;
  removeMacro: (macro: keyof NutritionStore["macros"]) => void;
  micros: {
    VitaminA: number;
    VitaminB1: number;
    VitaminB2: number;
    VitaminB3: number;
    VitaminB5: number;
    VitaminB6: number;
    VitaminB7: number;
    VitaminB9: number;
    VitaminB12: number;
    VitaminC: number;
    VitaminD: number;
    VitaminE: number;
    VitaminK: number;
    Calcium: number;
    Iron: number;
    Magnesium: number;
    Phosphorus: number;
    Potassium: number;
    Sodium: number;
    Zinc: number;
    Copper: number;
    Manganese: number;
    Selenium: number;
    Chromium: number;
    Molybdenum: number;
    Iodine: number;
    Chloride: number;
    Fluoride: number;
    Boron: number;
    Silicon: number;
    Vanadium: number;
    Nickel: number;
    Cobalt: number;
    Sulfur: number;
    Omega3: number;
    Omega6: number;
    Omega9: number;
    Lutein: number;
    Zeaxanthin: number;
    Quercetin: number;
    Resveratrol: number;
    Curcumin: number;
    Glucosinolates: number;
    Anthocyanins: number;
    Catechins: number;
    Flavonoids: number;
    Polyphenols: number;
    Probiotics: number;
  };
  setMicros: (micros: string[]) => void;
  resetMicros: () => void;
  addMicro: (micro: keyof NutritionStore["micros"], value: number) => void;
  removeMicro: (micro: keyof NutritionStore["micros"]) => void;
  healthScore: number;
}

const initialMacros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const initialMicros = {
  VitaminA: 0,
  VitaminB1: 0,
  VitaminB2: 0,
  VitaminB3: 0,
  VitaminB5: 0,
  VitaminB6: 0,
  VitaminB7: 0,
  VitaminB9: 0,
  VitaminB12: 0,
  VitaminC: 0,
  VitaminD: 0,
  VitaminE: 0,
  VitaminK: 0,
  Calcium: 0,
  Iron: 0,
  Magnesium: 0,
  Phosphorus: 0,
  Potassium: 0,
  Sodium: 0,
  Zinc: 0,
  Copper: 0,
  Manganese: 0,
  Selenium: 0,
  Chromium: 0,
  Molybdenum: 0,
  Iodine: 0,
  Chloride: 0,
  Fluoride: 0,
  Boron: 0,
  Silicon: 0,
  Vanadium: 0,
  Nickel: 0,
  Cobalt: 0,
  Sulfur: 0,
  Omega3: 0,
  Omega6: 0,
  Omega9: 0,
  Lutein: 0,
  Zeaxanthin: 0,
  Quercetin: 0,
  Resveratrol: 0,
  Curcumin: 0,
  Glucosinolates: 0,
  Anthocyanins: 0,
  Catechins: 0,
  Flavonoids: 0,
  Polyphenols: 0,
  Probiotics: 0,
};


// const useNutritionStore = create<NutritionStore>((set,get) => ({
//   macros: initialMacros,
//   micros: initialMicros,
//   healthScore: 0,

//   setMacros: (macros) => set({ 
//     set({ macros }),
//     get().calculateHealthScore(),
//   }),