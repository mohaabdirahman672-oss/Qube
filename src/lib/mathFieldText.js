// Helpers between the math keypad's LaTeX and the rest of the app.

// True if the field still has an empty template slot (MathLive writes those as
// \placeholder{}), e.g. a fraction whose denominator was never filled in.
export function hasEmptySlot(latex) {
  return /\\placeholder\b/.test(latex || '');
}

// The text Solve sends for a keypad problem. The model reads LaTeX well, so this
// stays LaTeX, with three exceptions so the server's existing ambiguity check
// (AMBIGUOUS_DIVISION in supabase/functions/solve/prompt.js, which looks for
// "÷ 2(" / "/ 2x") keeps working without a server deploy: \div → ÷, \times → ×,
// and \left( / \right) → plain brackets.
export function latexForSolve(latex) {
  return String(latex || '')
    .replace(/\\div(?![a-zA-Z])\s*/g, '÷')
    .replace(/\s*\\times(?![a-zA-Z])\s*/g, ' × ')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\placeholder\{\}/g, '')
    .trim();
}

// A plain-text problem (a "Try this next" practice question, an old History entry)
// as LaTeX the field can load: Unicode super/subscripts and symbols become their
// LaTeX forms. Word problems are not math, so callers send those to the text box.
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+', 'ⁿ': 'n', 'ˣ': 'x' };
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₙ': 'n' };
const SYM = { '−': '-', '×': '\\times ', '÷': '\\div ', '·': '\\cdot ', '≤': '\\le ', '≥': '\\ge ', '≠': '\\ne ', '±': '\\pm ', 'π': '\\pi ', 'θ': '\\theta ', '∞': '\\infty ', '°': '^{\\circ}' };

export function plainToLatex(text) {
  let s = String(text || '');
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿˣ]+/g, (m) => `^{${[...m].map((c) => SUP[c]).join('')}}`);
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉ₙ]+/g, (m) => `_{${[...m].map((c) => SUB[c]).join('')}}`);
  s = s.replace(/√\(([^()]*)\)/g, '\\sqrt{$1}').replace(/√(\w+)/g, '\\sqrt{$1}');
  s = s.replace(/[−×÷·≤≥≠±πθ∞°]/g, (c) => SYM[c]);
  return s.replace(/ {2,}/g, ' ').trim();
}

// The AI's restatement of a scanned problem ("Solve x² − 9 = 0") as something the
// keypad field can load: the leading instruction word is dropped (the field holds
// math, not words) and the rest converted. Prefers the server's own LaTeX when it
// sends one (`problemLatex`, planned in docs/plans/solve-quality.md).
const LEADING_VERB = /^\s*(solve|simplify|evaluate|find|factor|factorise|factorize|expand|differentiate|integrate|compute|calculate)\b(\s+for\s+[a-z])?\s*[:,]?\s*/i;
export function readProblemToLatex(result) {
  if (result?.problemLatex) return String(result.problemLatex);
  return plainToLatex(String(result?.problem || '').replace(LEADING_VERB, ''));
}

// Rough test for "this is a sentence, not an expression": three or more words of
// three or more letters that aren't function names. Used to decide whether a
// practice question goes into the math field or the ABC text box.
const MATH_WORDS = /^(sin|cos|tan|sec|csc|cot|log|ln|lim|sinh|cosh|tanh)$/i;
export function looksLikeWords(text) {
  const words = String(text || '').match(/[A-Za-z]{3,}/g) || [];
  return words.filter((w) => !MATH_WORDS.test(w)).length >= 3;
}
