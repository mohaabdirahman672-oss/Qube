// TeX → SVG string, for MathView (docs/plans/latex-math-rendering.md).
//
// MathJax is required lazily inside getDocument(), not at module top level, so
// importing this file costs nothing at app launch — the ~1 MB of MathJax code
// only runs the first time a formula is converted (or warmMath() is called).
//
// Only the `base` + `ams` TeX packages are loaded: that covers everything the
// solve prompt allows (\frac, \sqrt, \div, \times, aligned, …) and keeps the
// bundle small. There's deliberately no `noundefined` package, and formatError
// rethrows — so an unknown macro or unbalanced brace THROWS instead of drawing
// a red error box, which is what lets MathView fall back to raw text.

let doc = null;
let adaptor = null;
const cache = new Map();
const CACHE_LIMIT = 300;

function getDocument() {
  if (doc) return doc;
  const { mathjax } = require('mathjax-full/js/mathjax.js');
  const { TeX } = require('mathjax-full/js/input/tex.js');
  const { SVG } = require('mathjax-full/js/output/svg.js');
  const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
  const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
  require('mathjax-full/js/input/tex/base/BaseConfiguration.js');
  require('mathjax-full/js/input/tex/ams/AmsConfiguration.js');

  adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const tex = new TeX({
    packages: ['base', 'ams'],
    formatError: (_jax, err) => { throw err; },
  });
  // fontCache 'none': every glyph is an inline <path>, no <defs>/<use> indirection
  // for react-native-svg to resolve.
  const svg = new SVG({ fontCache: 'none' });
  doc = mathjax.document('', { InputJax: tex, OutputJax: svg });
  return doc;
}

// Returns { xml, widthEm, heightEm } or throws if the TeX doesn't parse. Size comes
// from the viewBox, which MathJax writes in exact 1/1000-em units — so the caller's
// pixel size is just em × fontSize, known synchronously before first paint (this is
// what lets MathView reserve its exact space: no measure pass, no layout jump).
// Results are memoised by string.
export function texToSvg(latex) {
  const key = String(latex);
  const hit = cache.get(key);
  if (hit) return hit;

  const d = getDocument();
  const node = d.convert(key, { display: true, em: 16, ex: 8, containerWidth: 80 * 16 });
  const svgNode = adaptor.firstChild(node);
  const [, , vbWidth, vbHeight] = String(adaptor.getAttribute(svgNode, 'viewBox')).split(/\s+/).map(Number);
  if (!(vbWidth > 0) || !(vbHeight > 0)) throw new Error('MathJax returned an empty SVG');

  // Strip the ex-based width/height/style: the caller sets real pixel sizes, and
  // react-native-svg doesn't understand `ex` units.
  adaptor.removeAttribute(svgNode, 'width');
  adaptor.removeAttribute(svgNode, 'height');
  adaptor.removeAttribute(svgNode, 'style');
  const result = { xml: adaptor.outerHTML(svgNode), widthEm: vbWidth / 1000, heightEm: vbHeight / 1000 };

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}

// Initialises MathJax off the critical path (e.g. while a solve request is in
// flight) so the first real formula renders without a noticeable pause.
export function warmMath() {
  try { texToSvg('x^{2}'); } catch { /* warm-up only */ }
}
