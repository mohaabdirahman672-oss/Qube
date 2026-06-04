# Qube — Solver + Practice Upgrade Review
**Completed:** 2026-06-04  
**Parts:** 1 (Audit), 2 (Practice Tab), 3 (Solver Engine), 4 (QA + Cleanup)

---

## What Changed

### Part 2 — Learn Tab Removed, Practice Tab Added

**Removed:**
- `panel-learn` — 3-view course browser (course list → lesson list → lesson detail)
- Old `panel-practice` — dropdown-based quiz with course/lesson selectors
- All Learn JS: `showCourseList`, `filterCourses`, `renderCourses`, `openCourse`, `openLesson`, `renderPracticeCards`, `revealAnswer`, `levelColor`
- All old Practice JS: `initPracticeTab` (old), `onQuizCourseChange`, `setDiffFilter`, `renderQuizProblems`
- ~350 lines of Learn/Practice CSS

**Added:**
- New `panel-practice` with Quizlet-style layout
- 5 category filter pills: All / Algebra / Geometry / Trig / Calculus / Statistics
- Flashcard deck: tap to flip front↔back, ← → navigation, position counter
- 30 curated flashcards across 5 categories (formulas, theorems, identities, methods)
- 15 practice problems with difficulty badges (Easy/Medium/Hard) and tap-to-reveal answers
- Bottom nav: `📖 Learn` → `🃏 Practice`

**Updated:**
- `src/components/BottomNav.js` — `learn` tab → `practice` tab (`icon: 'layers'`)
- `src/screens/HomeScreen.js` — feature card key + subtitle updated
- Home screen "See all →" link and purple feature card now point to Practice

---

### Part 3 — Math Solver Engine Upgraded

**Solver schema (old → new):**

| Field | Before | After |
|---|---|---|
| `hasMath` | ✓ | ✓ |
| `steps[]` | ✓ | ✓ (verb-led titles) |
| `answer` | ✓ | ✓ |
| `problemType` | — | ✓ e.g. "Quadratic Equation" |
| `difficulty` | — | ✓ Easy / Medium / Hard / Advanced |
| `explanation` | — | ✓ One-sentence method summary |
| `commonMistake` | — | ✓ Most frequent student error |
| `formula` | — | ✓ Key formula (optional) |
| `practiceQuestion` | — | ✓ Follow-up problem |

**Engine improvements:**
- `callOpenAI()` extracted as reusable function
- 20-second `AbortController` timeout
- 1 automatic retry on network failure (not on 4xx)
- `max_tokens` raised from 1500 → 2000 for complex problems
- System prompt now covers 20+ problem types explicitly
- Step titles enforced as verb-led (3-6 words)

**Solution card UI additions:**
- Problem type + difficulty pill badges at top
- Method explanation (italic blue-border blurb)
- Common mistake warning (amber box)
- Key formula chip (blue monospace, only shown when applicable)
- "Try This Next" practice card — button auto-loads question into solver

---

### Part 4 — Cleanup

**Removed:**
- Orphaned `.scan-panel-inner`, `.scan-viewfinder`, `.scan-corner`, `.scan-cta-*`, `.scan-big-btn`, `.scan-tip` CSS (placeholder scan UI from before AI solver was built)
- Orphaned `.scan-settings-row`, `.scan-settings-btn`, `.scan-api-*` CSS (API key settings panel removed in earlier session)

---

## Files Edited

| File | What changed |
|---|---|
| `preview.html` | All UI changes — Practice tab, solver engine, cleanup |
| `src/components/BottomNav.js` | `learn` → `practice` tab |
| `src/screens/HomeScreen.js` | Feature card key + label |

## Files Created

| File | Purpose |
|---|---|
| `docs/plans/qube-solver-quizlet-upgrade.md` | Implementation plan (Part 1) |
| `docs/reviews/qube-solver-practice-review.md` | This file |

---

## How to Test

1. Open `http://192.168.1.177:3000/preview.html`
2. **Learn tab gone** — confirm bottom nav shows 🃏 Practice, not 📖 Learn
3. **Practice tab** — tap each category pill and verify flashcards + problems filter correctly
4. **Flashcard flip** — tap a card, confirm it flips to show the answer; ← → navigation works
5. **Practice problems** — tap "Show Answer", confirm answer reveals and border turns green
6. **Solve tab — image** — upload a math photo, confirm auto-solve fires with no button press
7. **Solve tab — type** — type `2x + 5 = 13`, tap Solve, verify full result with type badge, explanation, mistake warning, formula, and practice question
8. **Try This Next** — tap "Solve This →" on the practice card, confirm it auto-loads and solves
9. **Save** — tap "📌 Save to Saved", confirm toast changes to "✅ Saved!"
10. **Home links** — purple feature card and "See all →" both navigate to Practice

---

## Known Issues

- `courses_data.js` (137 KB) is still loaded in `<head>` — it's no longer used by any active UI, but removing it is safe whenever desired.
- The solver's `OPENAI_KEY` is hardcoded in `preview.html`. Before any public deployment this should move to a server-side proxy or environment variable.
- `initScanFeature()` is an empty stub — kept for structural consistency, can be removed if desired.
- Practice flashcard data is hand-curated (30 cards). Expanding categories or adding more cards means editing `PRACTICE_DATA` in JS.

---

## Next Recommended Improvements

1. **Navigation stack** — wire React Navigation so all 5 tabs work natively on device
2. **Supabase** — persist saved problems and user progress server-side
3. **Remaining screens** — build Saved, Practice, Profile as React Native screens (currently only `HomeScreen` exists)
4. **Solver proxy** — move OpenAI key to a server-side edge function to avoid exposing it in the browser
5. **Practice expansion** — add more categories (Number Theory, Matrices, Complex Numbers) and more cards per category
6. **EAS dev build** — required to test Google/Apple sign-in on a real device
