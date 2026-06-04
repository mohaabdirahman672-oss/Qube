# Qube — Solver + Quizlet Upgrade Plan
**Created:** 2026-06-04  
**Scope:** Remove Learn tab, add Quizlet-style Practice tab, upgrade math solver engine  
**Out of scope:** Login, paywall, subscriptions, accounts

---

## Audit Findings

### Where things live

| Concern | Location |
|---|---|
| Tab navigation (HTML) | `preview.html` — `switchTab()` fn, `TABS` array, bottom nav HTML (lines ~1308–1350) |
| Tab navigation (React Native) | `src/components/BottomNav.js` — `TABS` constant |
| Learn tab panel | `preview.html` — `#panel-learn` (lines ~1167–1211) |
| Practice Quiz panel | `preview.html` — `#panel-practice` (lines ~1213–1242) |
| Math solver panel | `preview.html` — `#panel-scan` |
| Solver logic / API calls | `preview.html` — `solveProblem()`, `OPENAI_KEY`, `SOLVE_SYSTEM_PROMPT` |
| Solver response rendering | `preview.html` — `renderSolution()`, `renderSolution()`, `formatStepBody()` |
| Saved / history | `preview.html` — `#panel-saved`, `saveScanResult()`, `localStorage` |
| Reusable card components | `preview.html` — `.practice-card`, `.course-card` CSS classes |
| React Native home screen | `src/screens/HomeScreen.js` — references `switchTab('learn')` |
| Design system | `src/theme.js`, `preview.html` CSS variables |

### Learn tab — what it contains
- 3-view nested navigator: Course List → Lesson List → Lesson Detail
- Powered by `COURSES` array from `courses_data.js` (137 KB)
- JS functions: `showCourseList`, `filterCourses`, `renderCourses`, `openCourse`, `openLesson`, `renderPracticeCards`, `revealAnswer`, `levelColor`
- CSS sections: `LEARN TAB`, `LESSON LIST`, `LESSON DETAIL / PRACTICE`

### Practice Quiz tab — what it contains (currently)
- Dropdown selectors: course → lesson
- Difficulty filter buttons (all / easy / medium / hard)
- Renders lesson practice cards via `renderPracticeCards` (shared with Learn tab)
- JS: `initPracticeTab`, `onQuizCourseChange`, `setDiffFilter`, `renderQuizProblems`
- CSS: `PRACTICE QUIZ TAB` section

### Cross-references to `learn` that need updating
- `preview.html` line ~1011: `onclick="switchTab('learn')"` (home "See all →" link)
- `preview.html` line ~1024: `onclick="switchTab('learn')"` (home purple feature card)
- `preview.html` line ~1321: `nav-learn` bottom nav tab
- `preview.html` line ~1335: `TABS` array includes `'learn'`
- `preview.html` line ~1349: `if (tab === 'learn') showCourseList();`
- `src/components/BottomNav.js` line 19: `{ key: 'learn', label: 'Learn', icon: 'book' }`
- `src/screens/HomeScreen.js` line 38: feature card key `'learn'`

---

## Files to Remove
None — no files are exclusively owned by the Learn tab. All Learn logic lives inside `preview.html` blocks that will be replaced in-place.

## Files to Edit

| File | What changes |
|---|---|
| `preview.html` | Remove Learn tab HTML + CSS + JS; replace Practice tab; upgrade solver |
| `src/components/BottomNav.js` | Change `learn` tab → `practice` tab |
| `src/screens/HomeScreen.js` | Update feature card key + nav target from `learn` → `practice` |

## Files to Create
| File | Purpose |
|---|---|
| `docs/reviews/qube-solver-practice-review.md` | Part 4 completion summary |

---

## Part 2 — Remove Learn + Add Practice Tab

### UI changes

**Bottom nav (4th slot):**
- Icon: 📖 Learn → 🃏 Practice  
- Label: "Learn" → "Practice"
- ID: `nav-learn` → `nav-practice`

**New `#panel-practice` layout:**
```
┌─────────────────────────────────┐
│  Qube logo row                  │
│  "Practice"  (page title)       │
│  "Sharpen your math skills"     │
├─────────────────────────────────┤
│  Category filter pills          │
│  All · Algebra · Geometry ·     │
│  Trig · Calculus · Statistics   │
├─────────────────────────────────┤
│  [Flashcard deck counter]       │
│  ┌───────────────────────────┐  │
│  │  QUESTION (front face)    │  │
│  │                           │  │
│  │  Tap to reveal answer →   │  │
│  └───────────────────────────┘  │
│  [← prev]   1 of 12   [next →] │
├─────────────────────────────────┤
│  Practice Problems              │
│  ┌───────────────────────────┐  │
│  │ 🟢 Easy  Algebra          │  │
│  │ Solve: 2x + 5 = 13        │  │
│  │ [Show Answer]             │  │
│  └───────────────────────────┘  │
│  ...                            │
└─────────────────────────────────┘
```

**Components (all inside preview.html):**
- `PracticeScreen` — full tab panel  
- `FlashcardDeck` — card + flip + prev/next navigation  
- `FlashcardCard` — single card, tap to reveal  
- `PracticeCategoryTabs` — pill filter row  
- `PracticeQuestionCard` — show/reveal practice problem card  

**Data source:** Built-in JS object (`PRACTICE_DATA`) — curated formulas + definitions + quick problems per category. Does NOT depend on `courses_data.js` (keeping things simple).

### JS functions to remove (Learn + old Practice)
`showCourseList`, `filterCourses`, `renderCourses`, `openCourse`, `openLesson`, `renderPracticeCards`, `revealAnswer`, `levelColor`, `currentFilter`, `currentCourse`, `initPracticeTab`, `onQuizCourseChange`, `setDiffFilter`, `renderQuizProblems`, `quizDiffFilter`

### CSS to remove
`.level-filters`, `.level-pill`, `.courses-grid`, `.course-card`, `.course-accent`, `.course-icon-wrap`, `.course-info`, `.course-card-title`, `.course-meta`, `.course-level-badge`, `.course-lessons-count`, `.course-chevron`, `.lessons-list`, `.lesson-row`, `.lesson-num`, `.lesson-info`, `.lesson-title-text`, `.lesson-duration`, `.lesson-row-chevron`, `.practice-header`, `.practice-lesson-name`, `.practice-course-name`, `.practice-cards`, `.practice-card`, `.diff-badge`, `.practice-question`, `.reveal-btn`, `.answer-block`, `.answer-label`, `.answer-text`, `.quiz-course-selector`, `.quiz-lesson-selector`, `.quiz-lesson-selector select`, `.select-label`, `.quiz-difficulty-row`, `.diff-filter-btn`

### CSS to add (Practice tab)
`.practice-category-tabs`, `.practice-pill`, `.flashcard-deck`, `.flashcard`, `.flashcard.flipped`, `.flashcard-front`, `.flashcard-back`, `.flashcard-nav`, `.flashcard-counter`, `.practice-section-title`, `.pq-card`, `.pq-badge`, `.pq-question`, `.pq-reveal-btn`, `.pq-answer`, `.practice-empty`

---

## Part 3 — Upgrade Math Solver Engine

### Current solver schema (minimal)
```json
{
  "hasMath": true,
  "steps": [{ "title": "...", "body": "..." }],
  "answer": "..."
}
```

### New solver schema (rich)
```json
{
  "hasMath": true,
  "problemType": "Quadratic Equation",
  "difficulty": "Medium",
  "steps": [
    { "title": "Step title", "body": "Full explanation" }
  ],
  "answer": "x = 2 or x = -3",
  "explanation": "One sentence summary of the method used",
  "commonMistake": "Forgetting the ± when taking the square root",
  "formula": "Quadratic Formula: x = (-b ± √(b²-4ac)) / 2a",
  "practiceQuestion": "Solve: x² + 7x + 10 = 0"
}
```

### Solver prompt improvements
- Explicit problem type classification
- Difficulty rating (Easy / Medium / Hard / Advanced)
- Step titles that are verb-led ("Identify coefficients", "Apply the formula")
- Common mistake field — helps students avoid re-solving incorrectly
- Related formula — reinforces theory
- Follow-up practice question — bridges to the Practice tab

### UI upgrades (scan solution card)
- Add problem type badge below title (e.g. `QUADRATIC EQUATION · MEDIUM`)
- Add explanation blurb in italic below steps
- Add common mistake warning box (amber)
- Add formula chip (blue)
- Add "Try This Next" practice question card at the bottom
- Keep save button + new problem button

### Error handling improvements
- Retry once automatically on network error before showing error message
- Better empty-image message: "No problem found — try a clearer photo or switch to Type mode"
- Timeout after 20s with friendly message

---

## Risks

| Risk | Mitigation |
|---|---|
| `renderPracticeCards` used by both Learn and old Practice | New Practice tab has its own `renderPQCard` — safe to delete old one |
| `courses_data.js` still loaded in `<head>` | Keep the script tag — it doesn't break anything even if unused, and we may re-use the data later |
| `switchTab('learn')` references on home screen | All identified above — simple string replacements |
| New flashcard data has to be curated by hand | Using compact JS objects — fast to write, easy to extend |
| Solver JSON parse can fail on malformed GPT-4o output | Already handled with `raw.match(/\{[\s\S]*\}/)` — will add fallback plain-text path |

---

## Edge Cases

- User taps Practice tab with no cards in a category → empty state shown
- User flips last flashcard → loops back to first
- Solver returns `hasMath: false` → shows warning, doesn't crash
- GPT-4o returns plain text instead of JSON → fallback parser shows raw text in a single step
- No image selected in camera/upload mode → early return, no API call

---

## Testing Strategy
1. Open `http://192.168.1.177:3000/preview.html`
2. Verify Learn tab is completely gone from bottom nav
3. Tap Practice — verify category pills, flashcards, practice questions all render
4. Tap each category — verify filtered content shows
5. Tap a flashcard — verify answer reveals
6. Go to Scan tab, upload an image — verify auto-solve still fires
7. Verify new solver fields (problemType, difficulty, commonMistake) appear in solution
8. Verify home screen purple feature card now links to Practice
9. Verify saved functionality still works

---

## Open Questions
- Should the flashcard "Save to Saved" feature be wired in Part 2 or deferred?  
  → Defer. Save button on flashcards can be added in a later pass.
- Should `courses_data.js` script tag be removed from `<head>`?  
  → Keep for now. Zero cost, and data may be needed for future features.
