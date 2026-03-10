# Focal Design Manifest: Comprehensive Mandates

These rules are foundational for all development. They take absolute precedence over default behaviors.

## 1. Color System & Hierarchy
### The 60/30/10 Rule
*   **60% Dominant:** Main surfaces, backgrounds, primary text areas.
*   **30% Secondary:** Cards, sidebars, supporting UI elements.
*   **10% Accent:** CTAs, highlights, warnings, active icons.
*   *Note:* In monochromatic systems, use lightness variations rather than hue shifts.

### Saturation & Signal Value
*   **Low (0-25%):** Backgrounds, body text. Professional and calm.
*   **Medium (25-60%):** Buttons, links, cards. Balanced attention.
*   **High (60-100%):** CTAs, errors, warnings. Demands immediate attention.
*   *Mandate:* Structure must work in grey first. Color is an enhancement, not a fix.

### Greyscale & Neutrals
*   **9-Step Scale:** Use 100-900 (100=lightest background, 900=darkest text).
*   **Base Point:** Start at 500 (neither too light nor too dark).
*   **Warmth/Coolness:** Avoid 0% saturation grey. Add 2-10% tint to keep neutrals "alive."

### Semantic Architecture
*   **Primitives:** Value stores only (`Neutral/900`, `Primary/600`).
*   **Semantics:** Meaning-based tokens (`Text/Primary`, `Background/Page`).
*   **Format:** `[Element]/[Purpose]/[State]` (e.g., `Text/Primary/Hover`).
*   *Mandate:* Semantics reference primitives, never raw hex. Dark mode is a reference swap of the same semantic token.

### Luminance & Contrast
*   **Metric:** Use Luminance (Y), not HSL-L. Formula: `Y = 0.2126R + 0.7152G + 0.0722B`.
*   **WCAG 2.2 AA:** 4.5:1 for normal text, 3:1 for large text and UI components.
*   *Warning:* Yellow (#FFFF00) on white is a 1.07:1 failure despite high HSL-L.

### Color Psychology
*   **Red:** Energy, urgency, danger. Increases heart rate.
*   **Blue:** Trust, calm, competence. 
*   **Green:** Growth, success, confirmation.
*   **Yellow:** Optimism, warning. Highest visibility, lowest luminance contrast.

## 2. Typography
### Line Height & Length
*   **Headings (H1-H3):** 1.1–1.3. Larger text needs tighter line height.
*   **Body Text (16-18px):** 1.5–1.6 (WCAG minimum is 1.5).
*   **Small Text (12-14px):** 1.5–1.7. 
*   **Line Length:** 50-75 Characters Per Line (CPL). Max 80 per WCAG. Mobile: 30-50 CPL.
*   **CSS:** Apply `max-width: 65ch` to article containers.

### Hierarchy & Alignment
*   **Modular Scale:** Use **Major Third (1.25x)** ratio. (e.g., 16, 20, 25, 31, 39, 49px).
*   **X-Height:** Perceived size matters more than point size. High x-height (Inter/Verdana) for small UI text.
*   **Alignment:** Left-align body text (fixed anchor for saccadic return sweeps). Right-align numeric columns.
*   **Centered Text:** Max 1–3 lines for headlines/captions only.

### Cases & Pairing
*   **All Caps:** 9.5–19% slower to read. Removes word shape recognition. Short labels/tags only.
*   **CSS Mandate:** Use `text-transform: uppercase` instead of manual typing for screen readers.
*   **Pairing:** Match x-heights. Serif + Sans is classic; Superfamilies (e.g., IBM Plex) are safest.

## 3. Spacing & Grids
### The 8pt/4pt System
*   **8pt Base:** All margins, padding, and component dimensions.
*   **4pt Half-Step:** For typography line-heights, icon gaps, and dense interfaces.
*   **Line Heights:** MUST be multiples of 4 (e.g., 20, 24, 28px).

### Proximity & Hierarchy
*   **Related Elements:** 4–8px (Labels to inputs, icons to text).
*   **Within Section:** 16–24px.
*   **Between Sections:** 32–48px+. Proximity is stronger than color or shape.

### Grid Types
*   **12-Column Grid:** Divisible by 2, 3, 4, 6. 16px gutters (mobile), 24-32px (desktop).
*   **Modular Grid:** Column + Row matrix for dashboards/editorials.
*   **Baseline Grid:** 4px horizontal rhythm for text baselines.

## 4. Shadows & Depth
### Fundamentals
*   **Light Source:** Single source from above. Shadows always point DOWN.
*   **Edge Contrast:** Depth starts with edges (lighter top, darker bottom), not just shadows.
*   **Shadow Colors:** Never pure black. Use `rgba(0,0,0,0.1–0.3)` or tinted to background hue.

### Elevation Levels
*   **5-7 Levels:** Higher elevation = larger blur, larger offset, lighter/softer shadow.
*   **Raised:** Shadow below + light top edge (`inset 0 1px rgba(255,255,255,0.2)`).
*   **Inset:** Shadow above + dark top edge (`inset 0 1px 2px rgba(0,0,0,0.3)`).

## 5. Interaction Design
### Touch Targets
*   **Min Size:** 44×44px (Apple/WCAG AAA) or 48×48dp (Material Design).
*   **WCAG AA Min:** 24×24px with 8px surrounding spacing.
*   *Mandate:* Padding counts as target area.

### Button States
*   **Normal:** 4.5:1 label contrast.
*   **Hover:** Darken background 10–15% (Lighten in dark mode). Transition 150ms.
*   **Focus:** 2px solid outline, 2px offset. Color must contrast 3:1 against background.
*   **Active:** Darken background 20–30%. 1px downward translate + optional inset shadow.
*   **Disabled:** 40% opacity. `cursor:not-allowed`. `aria-disabled='true'`.

### Padding & Links
*   **Button Padding Compensation:** Reduce icon-side padding by the gap value (e.g., MD3: 16px icon-side, 24px text-side).
*   **Link Design:** Underline is the universal affordance. Visited states are required.

## 6. Icons & Visual Perception
### Icon Construction
*   **Bounding Box:** Fixed frames (e.g., 24px). Padding varies by shape weight.
*   **Optical Alignment:** Circular icons need upward offset (1–2px).
*   **Blur Test:** Verify visual mass balance with a 2px blur.

### UX Laws
*   **Miller's Law:** Chunk information into groups of ~4 items.
*   **Hick's Law:** Minimize options; RT increases logarithmically with `n`.
*   **Jakob's Law:** Follow established patterns (logo top-left, cart top-right).
*   **Center Bias:** Optical center is ~10% above geometric midpoint.
*   **Banner Blindness:** Users ignore ad-like rectangles in top/right positions.

### Composition
*   **Visual Weight:** Determined by Size, Saturation, Contrast, Position, Isolation, Shape.
*   **Rule of Thirds:** Place focal points on 33/67% grid intersections.
