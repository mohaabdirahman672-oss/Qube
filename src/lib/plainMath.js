// Cleans math-in-plain-text for the places that can't typeset (Saved titles, Home's
// Recent list, answer chips, explanation prose, and MathView's own fallback):
// caret/underscore notation becomes real Unicode super/subscripts and any stray
// LaTeX becomes symbols, so users never see `a^10` or `\frac{…}`
// (docs/plans/latex-math-rendering.md, decision 2).
//
// Display-time only, never written back — that way old saved rows written before
// this existed get cleaned too. Best-effort: anything it can't map (e.g. a
// superscript containing a letter Unicode has no superscript for) is left readable
// rather than mangled, e.g. a^(q+1) stays as-is.

const SUP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ',
  n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
};
const SUB = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};

const SYMBOLS = {
  times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥',
  ne: '≠', neq: '≠', approx: '≈', equiv: '≡', infty: '∞', circ: '°', degree: '°',
  to: '→', rightarrow: '→', Rightarrow: '⇒', implies: '⇒', leftarrow: '←', iff: '⇔',
  cup: '∪', cap: '∩', in: '∈', notin: '∉', subset: '⊂', emptyset: '∅',
  sum: 'Σ', prod: 'Π', int: '∫', partial: '∂', nabla: '∇', angle: '∠', perp: '⊥', parallel: '∥',
  ldots: '…', cdots: '⋯', dots: '…', quad: ' ', qquad: '  ', ',': ' ', ';': ' ', '!': '',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ',
  sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Omega: 'Ω',
};

// Reads one {…} group starting at s[i] === '{', honouring nesting. Returns [inner, nextIndex].
function readGroup(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1];
  }
  return [s.slice(i + 1), s.length];
}

// "a+b" needs brackets to stay unambiguous as a/b's numerator or a √ argument; "12" doesn't.
const SCRIPT_CHARS = Object.values(SUP).concat(Object.values(SUB)).join('');
const SIMPLE = new RegExp(`^[\\w.πθ${SCRIPT_CHARS}]+$`);
const wrap = (x) => (SIMPLE.test(x) ? x : `(${x})`);
// A fraction's or root's contents, cleaned all the way so wrap() sees a¹⁰, not a^{10}.
const inner = (x) => scriptsToUnicode(latexToPlain(x));

function latexToPlain(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      const name = m ? m[1] : '';
      i += m ? m[0].length : 1;
      if (/^[dt]?frac$/.test(name)) {
        while (s[i] === ' ') i++;
        const [num, a] = s[i] === '{' ? readGroup(s, i) : [s[i] || '', i + 1];
        i = a;
        while (s[i] === ' ') i++;
        const [den, b] = s[i] === '{' ? readGroup(s, i) : [s[i] || '', i + 1];
        i = b;
        out += `${wrap(inner(num))}/${wrap(inner(den))}`;
      } else if (name === 'sqrt') {
        while (s[i] === ' ') i++;
        let root = '';
        if (s[i] === '[') { const close = s.indexOf(']', i); root = s.slice(i + 1, close); i = close + 1; }
        const [arg, a] = s[i] === '{' ? readGroup(s, i) : [s[i] || '', i + 1];
        i = a;
        out += (root === '3' ? '∛' : root === '4' ? '∜' : '√') + wrap(inner(arg));
      } else if (/^(text|mathrm|mathbf|mathit|operatorname|textbf|boxed)$/.test(name)) {
        while (s[i] === ' ') i++;
        if (s[i] === '{') { const [inner, a] = readGroup(s, i); i = a; out += latexToPlain(inner); }
      } else if (/^(left|right|big|Big|bigg|Bigg|displaystyle)$/.test(name)) {
        if (s[i] === '.') i++; // \left. / \right.
      } else if (name === '\\') {
        out = out.trimEnd() + '; ';
      } else if (name === 'begin' || name === 'end') {
        if (s[i] === '{') i = readGroup(s, i)[1]; // drop \begin{aligned} etc.
      } else if (SYMBOLS[name] !== undefined) {
        out += SYMBOLS[name];
      } else if (/^[{}%$&#_ ]$/.test(name)) {
        out += name; // escaped literal
      } else {
        out += name; // \sin, \log, \max… read fine as plain words
      }
    } else if (ch === '&') {
      i++; // alignment marker
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

function toScript(raw, map) {
  // A whole-group "(10-4)" reads better as ¹⁰⁻⁴ than ⁽¹⁰⁻⁴⁾.
  const body = /^\(.*\)$/.test(raw) && !raw.slice(1, -1).includes(')') ? raw.slice(1, -1) : raw;
  const chars = [...body.replace(/\s+/g, '')];
  return chars.every(c => map[c]) ? chars.map(c => map[c]).join('') : null;
}

// ^{…} / ^(…) / ^token  and  _{…} / _token  →  Unicode scripts when every character maps.
function scriptsToUnicode(s) {
  return s.replace(/([\^_])(\{([^{}]*)\}|\(([^()]*)\)|(-?[0-9]+|[a-zA-Z]))/g, (whole, op, _g, brace, paren, token) => {
    const map = op === '^' ? SUP : SUB;
    const raw = brace ?? (paren !== undefined ? `(${paren})` : token);
    return toScript(raw, map) ?? whole;
  });
}

export function toPlainMath(text) {
  if (text == null) return text;
  let s = String(text);
  if (s.includes('\\')) s = latexToPlain(s);
  s = scriptsToUnicode(s.replace(/\^\{?\s*°\s*\}?/g, '°')); // 180^\circ → 180°
  return s
    .replace(/(\S)\s*\*\s*(\S)/g, '$1 × $2')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/!=/g, '≠')
    .replace(/\+-/g, '±')
    .replace(/\bsqrt\(/g, '√(')
    .replace(/[{}]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
