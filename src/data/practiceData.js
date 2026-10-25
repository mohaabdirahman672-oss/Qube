export const CATEGORIES = ['All', 'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'];

export const PRACTICE_DATA = {
  Algebra: {
    cards: [
      { tag: 'FORMULA',  front: 'Quadratic Formula',        back: 'x = (-b ± √(b²-4ac)) / 2a',
        backLatex: String.raw`x = \frac{-b \pm \sqrt{b^{2} - 4ac}}{2a}` },
      { tag: 'FORMULA',  front: 'Slope-Intercept Form',     back: 'y = mx + b\n(m = slope, b = y-intercept)',
        backLatex: String.raw`y = mx + b`, backNote: 'm = slope, b = y-intercept' },
      { tag: 'FORMULA',  front: 'Point-Slope Form',         back: 'y - y₁ = m(x - x₁)',
        backLatex: String.raw`y - y_{1} = m(x - x_{1})` },
      { tag: 'IDENTITY', front: 'Difference of Squares',    back: 'a² - b² = (a + b)(a - b)',
        backLatex: String.raw`a^{2} - b^{2} = (a + b)(a - b)` },
      { tag: 'IDENTITY', front: 'Perfect Square Trinomial', back: 'a² + 2ab + b² = (a + b)²',
        backLatex: String.raw`a^{2} + 2ab + b^{2} = (a + b)^{2}` },
      { tag: 'METHOD',   front: 'FOIL Method',              back: '(a+b)(c+d) = ac + ad + bc + bd',
        backLatex: String.raw`(a + b)(c + d) = ac + ad + bc + bd` },
    ],
    problems: [
      { question: 'Solve for x:  3x − 7 = 14',             answer: 'x = 7',               difficulty: 'Easy'   },
      { question: 'Solve:  x² − 5x + 6 = 0',              answer: 'x = 2  or  x = 3',    difficulty: 'Medium' },
      { question: 'Solve:  2x² + 7x − 15 = 0',            answer: 'x = 3/2  or  x = −5', difficulty: 'Hard'   },
    ],
  },
  Geometry: {
    cards: [
      { tag: 'FORMULA',  front: 'Area of a Circle',         back: 'A = πr²',
        backLatex: String.raw`A = \pi r^{2}` },
      { tag: 'THEOREM',  front: 'Pythagorean Theorem',      back: 'a² + b² = c²\n(c = hypotenuse)',
        backLatex: String.raw`a^{2} + b^{2} = c^{2}`, backNote: 'c = hypotenuse' },
      { tag: 'FORMULA',  front: 'Area of a Triangle',       back: 'A = ½ × base × height',
        backLatex: String.raw`A = \frac{1}{2} \times \text{base} \times \text{height}` },
      { tag: 'FORMULA',  front: 'Volume of a Cylinder',     back: 'V = πr²h',
        backLatex: String.raw`V = \pi r^{2} h` },
      { tag: 'FORMULA',  front: 'Surface Area of Sphere',   back: 'A = 4πr²',
        backLatex: String.raw`A = 4\pi r^{2}` },
      { tag: 'RULE',     front: 'Sum of Interior Angles',   back: '(n − 2) × 180°\nn = number of sides',
        backLatex: String.raw`(n - 2) \times 180^{\circ}`, backNote: 'n = number of sides' },
    ],
    problems: [
      { question: 'Find the hypotenuse when a = 3 and b = 4.',           answer: 'c = 5',              difficulty: 'Easy'   },
      { question: 'Find the area of a circle with radius 7.',            answer: 'A = 49π ≈ 153.94',  difficulty: 'Medium' },
      { question: 'A cylinder has r = 5 and h = 12. Find its volume.',   answer: 'V = 300π ≈ 942.48', difficulty: 'Hard'   },
    ],
  },
  Trigonometry: {
    cards: [
      { tag: 'MNEMONIC', front: 'SOH-CAH-TOA',             back: 'sin = Opp/Hyp\ncos = Adj/Hyp\ntan = Opp/Adj',
        backLatex: String.raw`\begin{aligned} \sin &= \frac{\text{Opp}}{\text{Hyp}} \\ \cos &= \frac{\text{Adj}}{\text{Hyp}} \\ \tan &= \frac{\text{Opp}}{\text{Adj}} \end{aligned}` },
      { tag: 'IDENTITY', front: 'Pythagorean Identity',    back: 'sin²θ + cos²θ = 1',
        backLatex: String.raw`\sin^{2}\theta + \cos^{2}\theta = 1` },
      { tag: 'FORMULA',  front: 'Sine Rule',               back: 'a/sin(A) = b/sin(B) = c/sin(C)',
        backLatex: String.raw`\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}` },
      { tag: 'FORMULA',  front: 'Cosine Rule',             back: 'c² = a² + b² − 2ab·cos(C)',
        backLatex: String.raw`c^{2} = a^{2} + b^{2} - 2ab\cos C` },
      { tag: 'IDENTITY', front: 'Double Angle — Sine',     back: 'sin(2θ) = 2·sin(θ)·cos(θ)',
        backLatex: String.raw`\sin 2\theta = 2\sin\theta\cos\theta` },
      { tag: 'IDENTITY', front: 'Double Angle — Cosine',   back: 'cos(2θ) = cos²θ − sin²θ',
        backLatex: String.raw`\cos 2\theta = \cos^{2}\theta - \sin^{2}\theta` },
    ],
    problems: [
      { question: 'Find the exact value of sin(30°).',                         answer: '1/2',                  difficulty: 'Easy'   },
      { question: 'Solve sin(x) = √2/2 for 0° ≤ x ≤ 360°.',                  answer: 'x = 45° or x = 135°', difficulty: 'Medium' },
      { question: 'Simplify: sin²x · cos²x using double angle identities.',   answer: '¼ sin²(2x)',           difficulty: 'Hard'   },
    ],
  },
  Calculus: {
    cards: [
      { tag: 'RULE',    front: 'Power Rule',                      back: 'd/dx[xⁿ] = n·xⁿ⁻¹',
        backLatex: String.raw`\frac{d}{dx}\left[x^{n}\right] = n x^{n-1}` },
      { tag: 'RULE',    front: 'Product Rule',                    back: "d/dx[u·v] = u'v + uv'",
        backLatex: String.raw`\frac{d}{dx}\left[uv\right] = u'v + uv'` },
      { tag: 'RULE',    front: 'Quotient Rule',                   back: "d/dx[u/v] = (u'v − uv') / v²",
        backLatex: String.raw`\frac{d}{dx}\left[\frac{u}{v}\right] = \frac{u'v - uv'}{v^{2}}` },
      { tag: 'RULE',    front: 'Chain Rule',                      back: "d/dx[f(g(x))] = f'(g(x)) · g'(x)",
        backLatex: String.raw`\frac{d}{dx}\left[f(g(x))\right] = f'(g(x)) \cdot g'(x)` },
      { tag: 'THEOREM', front: 'Fundamental Theorem of Calculus', back: '∫[a→b] f(x)dx = F(b) − F(a)',
        backLatex: String.raw`\int_{a}^{b} f(x)\,dx = F(b) - F(a)` },
      { tag: 'FORMULA', front: 'Integral Power Rule',             back: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C   (n ≠ −1)',
        backLatex: String.raw`\int x^{n}\,dx = \frac{x^{n+1}}{n+1} + C`, backNote: 'n ≠ −1' },
    ],
    problems: [
      { question: 'Differentiate f(x) = 3x⁴ − 2x² + 5.',          answer: "f'(x) = 12x³ − 4x",  difficulty: 'Easy'   },
      { question: 'Evaluate: ∫(2x + 3) dx',                        answer: 'x² + 3x + C',         difficulty: 'Medium' },
      { question: 'Differentiate f(x) = sin(x²) using chain rule.', answer: "f'(x) = 2x·cos(x²)", difficulty: 'Hard'   },
    ],
  },
  Statistics: {
    cards: [
      { tag: 'DEFINITION', front: 'Mean (Average)',         back: 'μ = (Σxᵢ) / n\nSum of all values ÷ count',
        backLatex: String.raw`\mu = \frac{\sum x_{i}}{n}`, backNote: 'Sum of all values ÷ count' },
      { tag: 'FORMULA',    front: 'Standard Deviation',     back: 'σ = √( Σ(xᵢ − μ)² / N )',
        backLatex: String.raw`\sigma = \sqrt{\frac{\sum (x_{i} - \mu)^{2}}{N}}` },
      { tag: 'RULE',       front: 'Empirical Rule (Normal)',back: '68% within 1σ\n95% within 2σ\n99.7% within 3σ',
        backLatex: String.raw`\begin{aligned} 68\% &\text{ within } 1\sigma \\ 95\% &\text{ within } 2\sigma \\ 99.7\% &\text{ within } 3\sigma \end{aligned}` },
      { tag: 'FORMULA',    front: 'Permutation',            back: 'P(n,r) = n! / (n−r)!',
        backLatex: String.raw`P(n, r) = \frac{n!}{(n - r)!}` },
      { tag: 'FORMULA',    front: 'Combination',            back: 'C(n,r) = n! / (r!(n−r)!)',
        backLatex: String.raw`C(n, r) = \frac{n!}{r!\,(n - r)!}` },
      { tag: 'DEFINITION', front: 'Probability of Event A', back: 'P(A) = favourable outcomes / total outcomes',
        backLatex: String.raw`P(A) = \frac{\text{favourable outcomes}}{\text{total outcomes}}` },
    ],
    problems: [
      { question: 'Find the mean of: 4, 8, 6, 5, 3, 2, 8, 9, 2, 5.',         answer: 'Mean = 5.2', difficulty: 'Easy'   },
      { question: 'How many ways can you choose 2 items from 6?  C(6,2) = ?', answer: '15',         difficulty: 'Medium' },
      { question: 'P(A)=0.4, P(B)=0.3, P(A∩B)=0.1.  Find P(A∪B).',          answer: '0.6',        difficulty: 'Hard'   },
    ],
  },
};

export function getCards(category) {
  if (category === 'All') return Object.values(PRACTICE_DATA).flatMap(d => d.cards);
  return PRACTICE_DATA[category]?.cards ?? [];
}

export function getProblems(category) {
  if (category === 'All') return Object.values(PRACTICE_DATA).flatMap(d => d.problems);
  return PRACTICE_DATA[category]?.problems ?? [];
}
