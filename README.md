# Atlas Bike Tours — Booking Flow UI Concept

An original booking and checkout flow UI concept for a fictional guided bike tour company: choose a tour, pick a date, riders, bikes and add-ons, then check out and land on a clear confirmation — three steps, with the price visible the whole way through.

**Live demo:** https://brittanynation.github.io/booking-flow-ui/

## Roles this supports

Built to support applications for **UI Designer**, **Front-End Designer**, **Web Designer**, and **Junior UI/UX Designer** roles — flow and checkout-interface work that sits between visual design and front-end implementation.

## What it demonstrates

- **Booking-flow information architecture** — one job per step: Choose a tour → Date & bikes → Checkout, with a numbered stepper that shows progress on every screen
- **No-surprise pricing** — the tour price starts on the selection card, and an identical order summary travels through steps 2 and 3 so the checkout total always matches what the rider first saw
- **Designed states, not just screens** — selected tour, completed steps, add-on choices, and a confirmation state that repeats the reference, date, and total in plain words
- **Form design with help built in** — hints where a rider would actually pause (what's included, where the confirmation goes, reschedule terms before the pay button, not after)
- **Accessibility-minded choices** — contrast-safe pairings, badges and selected states that use words and borders, never color alone, skip link, `aria-current` navigation, real labels on every field
- **Responsive layout** — tour cards and the summary layout stack cleanly on small screens, and the stepper becomes a vertical list on phones
- **Semantic, framework-free build** — hand-written HTML/CSS, one stylesheet, no JavaScript required, no external images; all visuals are CSS-only

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Midnight Navy | `#16233A` | Header, headings, primary actions |
| Sky | `#4EA8DE` | Selected states, stepper, highlights |
| Signal Yellow | `#FFD23F` | Pay action, key accents |
| Cloud | `#F2F5F7` | Page background |
| Ink | `#1B2735` | Body text |

## Contents

| Page | What it covers |
| --- | --- |
| `index.html` | Step 1 — choose a tour (three tour cards, selected state) + design notes and palette |
| `details.html` | Step 2 — date, riders, bike type, add-ons, and the travelling order summary |
| `checkout.html` | Step 3 — lead rider details, payment mock, reschedule terms, and matching summary |
| `confirmation.html` | Confirmed state — booking reference, what happens next, and ride summary |

## Workflow note

My design workflow runs in **Sketch and Webflow**, where I design interfaces and systems visually. This demo is hand-built in HTML/CSS to show the same flow thinking — step structure, hierarchy, pricing clarity, and states — expressed directly in code.

## Files

- `index.html` — step 1 / landing for the concept
- `details.html` — step 2 view
- `checkout.html` — step 3 view
- `confirmation.html` — confirmation state
- `styles.css` — design tokens and all component styles
- `og-image.png` — 1200×627 social preview image in the project palette

## Note

This is an original portfolio concept created by Brittany Nation. Atlas Bike Tours is a fictional business; this project is not affiliated with any real tour company. All names, tours, and data shown are sample data, and the checkout takes no real payment.
