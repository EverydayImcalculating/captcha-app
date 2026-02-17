# Simple Captcha Test Web app 

## Project Description
This test evaluates the user experience of different types of captcha tests. Users complete 5 rounds of each captcha type (15 total), then rate their frustration level once per type. All data is recorded and displayed on a summary page with detailed analytics and raw data export.

## Context
3 types of captcha:
1. **Image captcha** - Select target images from a 3x3 grid
2. **Text captcha** - Type distorted text from a canvas
3. **Slider puzzle captcha** - Slide a piece to match the target position

Each type has 5 rounds with progressive difficulty (1, 2, 3, 2, 3). Users provide one frustration rating per captcha type (3 ratings total).

## Features
- **15 test rounds** (5 per captcha type)
- **Variable difficulty** for each round
- **Type-based frustration ratings** (one per captcha type, not per individual test)
- **Data collection**: time, accuracy, frustration scores, and timestamps
- **Raw data table** with detailed test information
- **CSV export** for analysis

## Site Theme
**Minimal Pastel Cute** design aesthetic:
- Soft pastel colors (pink #ffb7b2, mint #b5ead7, periwinkle #c7ceea, cream #ffeea5)
- Extra rounded corners (2rem radius on cards and buttons)
- Soft shadows for visual depth
- Nunito font with multiple weights (400, 600, 700, 800)
- Smooth transitions and hover effects
- Fully responsive design

## Recent Updates (Feb 10, 2026)

### Image Captcha Improvements
- **Larger display**: Container increased from `max-w-md` to `max-w-2xl`
- **Reduced corner radius**: Changed from `rounded-2xl` to `rounded-lg` for a sleeker look  
- **Unique images per test**: Uses timestamp-based seeding to show different images each round

### Landing Page Simplification
- Removed detailed test breakdown (bullet points)
- Simplified to: Title + subtitle + start button
- More welcoming and less overwhelming for users

### Frustration Rating Flow
- **Major change**: Moved from 15 ratings to 3 ratings
- Users now rate frustration **once per captcha type** (after completing all 5 rounds)
- Appears after rounds 5, 10, and 15
- Store updated with `updateTypeFrustration()` method to apply rating to all 5 tests of a type

### Slider Captcha UX
- **Auto-submit on release**: Puzzle verifies automatically when user releases the slider
- Removed manual "Verify" button
- Added instruction: "Release the slider to submit"
- Smoother, faster user experience

### Enhanced Data Collection
- Added `startTimestamp` and `endTimestamp` fields to TestResult interface
- Created `RawDataTable` component displaying all test details in tabular format
- CSV export button for downloading complete dataset
- Summary page now shows comprehensive analytics + raw data

## Advanced Text Captcha Difficulty (Feb 17, 2026)

Five HCI-based anti-bot techniques applied to the text captcha canvas, all scaling with difficulty 1–3:

1. **Occlusion Overlap** — Negative character spacing (10%/20%/30% overlap) exploits Gestalt continuation
2. **Perlin Noise Overlay** — 2D noise background at stroke-width frequency disrupts OCR edge detection
3. **Elastic Distortion** — Sinusoidal mesh warp (3/6/9px amplitude) makes font geometry unrecognizable to OCR
4. **Color Camouflage** — Per-pixel background-color replacement (5%/10%/15% chance) creates "swiss-cheese" effect
5. **Multi-Point Bézier Strikes** — 4/5/6 cubic Bézier curves at font stroke width create false-positive loops