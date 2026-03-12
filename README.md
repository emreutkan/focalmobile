# Focal — AI Nutrition Tracker

Focal is a mobile app that turns a photo of any meal into a complete nutritional breakdown in seconds. Point your camera at food, and the app identifies every ingredient, estimates portion sizes, and delivers a detailed analysis of macros, micronutrients, and an AI-generated health score — no manual logging, no barcode scanning, no guesswork.

---

## How It Works

### 1. Scan Your Food
Tap the **Scan Food** button on the home screen and capture or upload a photo from your camera roll. Focal immediately processes the image through an AI vision model that identifies individual food items and estimates the weight of each in grams.

### 2. Review & Refine
Before committing to an analysis, the app shows you exactly what it detected — a list of every ingredient with its estimated portion. You can edit names, adjust gram amounts, add items that were missed, or remove ones that shouldn't be there. This gives you full control before any calculations happen.

### 3. Full Nutritional Analysis
Once confirmed, Focal sends the item list through a second AI model that calculates:

**Macronutrients**
- Calories, Protein, Carbohydrates, Fat
- Fiber, Sugar, Saturated Fat, Monounsaturated Fat, Trans Fat, Sodium, Cholesterol

**Micronutrients**
- 50+ vitamins and minerals across all identified food items, aggregated into a single view

**Health Score**
- A 0–100 score with a written explanation of why the meal scored that way
- Highlighted "Good Stuff" (beneficial ingredients) and "Watch Out" items (ingredients to be mindful of)

### 4. Log & Track
Save the meal to your daily log. The home dashboard tracks your running daily totals for calories, protein, carbs, and fat, with a scrollable meal history for the day.

---

## Key Design Decisions

**AI on the backend, not the device.** All AI calls run through Supabase Edge Functions — no API keys are ever shipped with the app. The client sends an image or a food list, the edge function handles the AI provider, and the app receives a validated response. This keeps secrets off the device and makes it easy to swap models without a new app release.

**Two-stage AI pipeline.** Vision and text reasoning are intentionally separated. The first call focuses purely on identifying what's in the photo. The second call focuses on nutrition math. This separation makes each model better at its specific task and lets the user correct AI mistakes between steps before any calculations occur.

**Image compression before upload.** Before any image leaves the device, it's resized to a maximum of 1024px and compressed to 80% JPEG quality using `expo-image-manipulator`. This keeps payloads small and analysis fast without sacrificing enough detail for the model to identify food accurately.

**Validated API responses.** Every response from the AI is parsed through a Zod schema before the UI ever touches the data. If the model hallucinates an unexpected shape, the error is caught at the boundary — the UI never renders undefined or broken data.

---

## Authentication

Users sign in with email/password or Google OAuth via Supabase Auth. First-time users are walked through an onboarding flow before being sent to the main app. Auth state persists across app restarts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (managed workflow) |
| Navigation | Expo Router v6 (file-based) |
| State | Zustand (persisted) + React Context |
| Backend | Supabase (Auth, Edge Functions, Database) |
| AI Models | Groq (vision + text) via Edge Functions |
| Validation | Zod |
| Animations | React Native Reanimated v4 |
| Language | TypeScript (strict mode) |
