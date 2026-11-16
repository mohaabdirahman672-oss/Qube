// Every key on the math keypad, as data. Adding a key is a one-line change.
//
// A key is { label, latex? | cmd?, a11y?, alts?, style? }:
// - latex: MathLive insert template. #0 = where the caret lands (or the current
//   selection), #? = an empty slot, #@ = the thing just before the caret (so x then
//   x² gives x², and 3 then a/b gives 3 over an empty denominator).
// - cmd: a MathLive command name (cursor movement, delete).
// - display: optional LaTeX to typeset on the key instead of the plain label.
// - alts: long-press alternates, same shape.
// - style: 'num' (digit), 'op' (operator, orange), 'fn' (default).
// docs/plans/math-keyboard.md

const k = (label, latex, extra = {}) => ({ label, latex, ...extra });

const SIN_ALTS = [k('sin⁻¹', '\\sin^{-1}\\left(#0\\right)', { a11y: 'inverse sine' }), k('sinh', '\\sinh\\left(#0\\right)')];
const COS_ALTS = [k('cos⁻¹', '\\cos^{-1}\\left(#0\\right)', { a11y: 'inverse cosine' }), k('cosh', '\\cosh\\left(#0\\right)')];
const TAN_ALTS = [k('tan⁻¹', '\\tan^{-1}\\left(#0\\right)', { a11y: 'inverse tangent' }), k('tanh', '\\tanh\\left(#0\\right)')];

export const TABS = [
  { id: 'history', label: 'History', icon: 'time-outline' },
  { id: 'basic', label: '123' },
  { id: 'functions', label: 'f(x)' },
  { id: 'calculus', label: '∫ d/dx' },
  { id: 'symbols', label: '≤ ≠' },
];

// Rows of keys per tab. Each row is laid out with equal-width keys.
export const LAYOUTS = {
  basic: [
    [k('x', 'x'), k('y', 'y'), k('x²', '#@^{2}', { a11y: 'squared', alts: [k('x³', '#@^{3}', { a11y: 'cubed' }), k('x⁻¹', '#@^{-1}', { a11y: 'inverse' })] }),
      k('7', '7', { style: 'num' }), k('8', '8', { style: 'num' }), k('9', '9', { style: 'num' }), k('÷', '\\div', { style: 'op', a11y: 'divide' })],
    [k('(', '(', { a11y: 'open bracket', alts: [k('[', '['), k('{', '\\lbrace')] }), k(')', ')', { a11y: 'close bracket', alts: [k(']', ']'), k('}', '\\rbrace')] }),
      k('xⁿ', '#@^{#?}', { a11y: 'power' }),
      k('4', '4', { style: 'num' }), k('5', '5', { style: 'num' }), k('6', '6', { style: 'num' }), k('×', '\\times', { style: 'op', a11y: 'times', alts: [k('·', '\\cdot', { a11y: 'dot' })] })],
    [k('<', '<', { a11y: 'less than', alts: [k('≤', '\\le', { a11y: 'less than or equal' })] }), k('>', '>', { a11y: 'greater than', alts: [k('≥', '\\ge', { a11y: 'greater than or equal' })] }),
      k('√', '\\sqrt{#0}', { a11y: 'square root', alts: [k('∛', '\\sqrt[3]{#0}', { a11y: 'cube root' }), k('ⁿ√', '\\sqrt[#?]{#0}', { a11y: 'nth root' })] }),
      k('1', '1', { style: 'num' }), k('2', '2', { style: 'num' }), k('3', '3', { style: 'num' }), k('−', '-', { style: 'op', a11y: 'minus', alts: [k('±', '\\pm', { a11y: 'plus or minus' })] })],
    [k('a/b', '\\frac{#@}{#?}', { a11y: 'fraction', display: '\\frac{\\square}{\\square}' }), k('|x|', '\\left|#0\\right|', { a11y: 'absolute value' }), k('π', '\\pi', { a11y: 'pi' }),
      k('0', '0', { style: 'num' }), k('.', '.', { style: 'num', a11y: 'point' }), k('=', '=', { style: 'op', a11y: 'equals' }), k('+', '+', { style: 'op', a11y: 'plus' })],
  ],
  functions: [
    [k('sin', '\\sin\\left(#0\\right)', { alts: SIN_ALTS }), k('cos', '\\cos\\left(#0\\right)', { alts: COS_ALTS }), k('tan', '\\tan\\left(#0\\right)', { alts: TAN_ALTS }),
      k('sec', '\\sec\\left(#0\\right)'), k('csc', '\\csc\\left(#0\\right)'), k('cot', '\\cot\\left(#0\\right)')],
    [k('sin⁻¹', '\\sin^{-1}\\left(#0\\right)', { a11y: 'inverse sine' }), k('cos⁻¹', '\\cos^{-1}\\left(#0\\right)', { a11y: 'inverse cosine' }), k('tan⁻¹', '\\tan^{-1}\\left(#0\\right)', { a11y: 'inverse tangent' }),
      k('ln', '\\ln\\left(#0\\right)', { a11y: 'natural log' }), k('log', '\\log\\left(#0\\right)'), k('logₙ', '\\log_{#?}\\left(#0\\right)', { a11y: 'log base n' })],
    [k('eˣ', 'e^{#0}', { a11y: 'e to the power' }), k('10ˣ', '10^{#0}', { a11y: 'ten to the power' }), k('ⁿ√', '\\sqrt[#?]{#0}', { a11y: 'nth root' }),
      k('|x|', '\\left|#0\\right|', { a11y: 'absolute value' }), k('f(x)', 'f\\left(#0\\right)', { a11y: 'f of x', alts: [k('g(x)', 'g\\left(#0\\right)'), k('f⁻¹', 'f^{-1}\\left(#0\\right)')] }), k('θ', '\\theta', { a11y: 'theta', alts: [k('α', '\\alpha'), k('β', '\\beta'), k('φ', '\\phi')] })],
    [k('π', '\\pi', { a11y: 'pi' }), k('e', 'e'), k('n!', '!', { a11y: 'factorial' }), k('°', '^{\\circ}', { a11y: 'degrees' }), k('x', 'x'), k('xⁿ', '#@^{#?}', { a11y: 'power' })],
  ],
  calculus: [
    [k('d/dx', '\\frac{d}{dx}\\left(#0\\right)', { a11y: 'derivative with respect to x', display: '\\frac{d}{dx}' }), k('d²/dx²', '\\frac{d^{2}}{dx^{2}}\\left(#0\\right)', { a11y: 'second derivative', display: '\\frac{d^2}{dx^2}' }),
      k("f′", "#@'", { a11y: 'prime' }), k('∫', '\\int #0\\,dx', { a11y: 'integral' }), k('∫ₐᵇ', '\\int_{#?}^{#?} #0\\,dx', { a11y: 'definite integral', display: '\\int_a^b' })],
    [k('lim', '\\lim_{x\\to #?} #0', { a11y: 'limit', display: '\\lim_{x\\to a}' }), k('lim∞', '\\lim_{x\\to\\infty} #0', { a11y: 'limit as x goes to infinity', display: '\\lim_{x\\to\\infty}' }),
      k('Σ', '\\sum_{n=#?}^{#?} #0', { a11y: 'sum', display: '\\sum' }), k('∞', '\\infty', { a11y: 'infinity' }), k('→', '\\to', { a11y: 'approaches' })],
    [k('x', 'x'), k('t', 't'), k('n', 'n'), k('dx', '\\,dx'), k('dt', '\\,dt')],
    [k('(', '(', { a11y: 'open bracket' }), k(')', ')', { a11y: 'close bracket' }), k('xⁿ', '#@^{#?}', { a11y: 'power' }), k('a/b', '\\frac{#@}{#?}', { a11y: 'fraction', display: '\\frac{\\square}{\\square}' }), k('e', 'e')],
  ],
  symbols: [
    [k('<', '<', { a11y: 'less than' }), k('>', '>', { a11y: 'greater than' }), k('≤', '\\le', { a11y: 'less than or equal' }), k('≥', '\\ge', { a11y: 'greater than or equal' }), k('≠', '\\ne', { a11y: 'not equal' }), k('≈', '\\approx', { a11y: 'approximately' })],
    [k('%', '\\%', { a11y: 'percent' }), k('!', '!', { a11y: 'factorial' }), k(',', ',', { a11y: 'comma' }), k(':', ':', { a11y: 'colon' }), k('[ ]', '\\left[#0\\right]', { a11y: 'square brackets' }), k('{ }', '\\left\\lbrace #0\\right\\rbrace', { a11y: 'braces' })],
    [k('±', '\\pm', { a11y: 'plus or minus' }), k('°', '^{\\circ}', { a11y: 'degrees' }), k('∠', '\\angle', { a11y: 'angle' }), k('⊥', '\\perp', { a11y: 'perpendicular' }), k('∥', '\\parallel', { a11y: 'parallel' }), k('△', '\\triangle', { a11y: 'triangle' })],
    [k('x', 'x'), k('y', 'y'), k('z', 'z'), k('a', 'a'), k('b', 'b'), k('n', 'n')],
  ],
};

export const CMD = {
  left: { cmd: 'moveToPreviousChar', a11y: 'move cursor left' },
  right: { cmd: 'moveToNextChar', a11y: 'move cursor right' },
  backspace: { cmd: 'deleteBackward', a11y: 'delete' },
};
