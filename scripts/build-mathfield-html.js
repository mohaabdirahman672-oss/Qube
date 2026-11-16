// Generates src/components/mathKeyboard/mathfieldHtml.js: one self-contained HTML
// page (MathLive + its fonts inlined as base64) that the math keyboard's field runs
// in — a WebView on iOS, an iframe on web. Fully offline: no CDN, works on bad
// Wi-Fi, nothing for App Review to flag. Re-run after upgrading mathlive:
//
//   node scripts/build-mathfield-html.js
//
// The output is checked in so EAS builds don't depend on a postinstall step.
// docs/plans/math-keyboard.md

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ML = path.join(ROOT, 'node_modules', 'mathlive');
const OUT = path.join(ROOT, 'src', 'components', 'mathKeyboard', 'mathfieldHtml.js');
const { colors } = loadTheme();

function loadTheme() {
  // theme.js is an ES module; pull the colour table out without a bundler.
  const src = fs.readFileSync(path.join(ROOT, 'src', 'theme.js'), 'utf8');
  const block = src.match(/export const colors = (\{[\s\S]*?\});/)[1];
  return { colors: Function(`return (${block})`)() };
}

const version = require(path.join(ML, 'package.json')).version;
const js = fs.readFileSync(path.join(ML, 'mathlive.min.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const fontsCss = fs
  .readFileSync(path.join(ML, 'mathlive-fonts.css'), 'utf8')
  .replace(/url\(fonts\/([^)]+)\)/g, (_, file) => {
    const b64 = fs.readFileSync(path.join(ML, 'fonts', file)).toString('base64');
    return `url(data:font/woff2;base64,${b64})`;
  });

const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="color-scheme" content="dark">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>${fontsCss}
html{color-scheme:dark}
html,body{margin:0;padding:0;background:transparent;overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
math-field{display:block;width:100%;box-sizing:border-box;font-size:24px;padding:10px 6px;background:transparent;border:none;outline:none;color:${colors.textPrimary};
  --caret-color:${colors.gold};--primary:${colors.gold};--selection-background-color:${colors.blue}55;--selection-color:${colors.textPrimary};
  --placeholder-color:${colors.gold};--placeholder-opacity:0.9;--contains-highlight-background-color:${colors.blue}1f;--smart-fence-color:${colors.textSub};--smart-fence-opacity:0.6}
math-field:focus-within{outline:none}
math-field::part(menu-toggle),math-field::part(virtual-keyboard-toggle){display:none}
math-field::part(content){padding:0}
math-field::part(placeholder){color:${colors.textMuted};opacity:1;font-size:18px;background:transparent}
math-field::selection,math-field *::selection{background:transparent}
</style></head><body>
<script>
// MathLive looks up its own script URL at load time (for relative font/sound
// paths), which can't work for an inlined script and isn't needed here (both are
// disabled below). Silence exactly that message and the stack trace it logs.
(function(){ var ce = console.error; window.__qubeRestoreConsole = function(){ console.error = ce; };
  console.error = function(a){ if ((typeof a === 'string' && a.indexOf('relative paths to specify assets') >= 0) || (Array.isArray(a) && /^\\s+at /.test(a[0]))) return; ce.apply(console, arguments); }; })();
</script>
<script>${js}</script>
<script>
window.__qubeRestoreConsole();
(function(){
  // Configure BEFORE any <math-field> exists: the element starts loading fonts and
  // sounds the moment it connects, from relative paths that don't exist here.
  MathfieldElement.fontsDirectory = null;   // fonts are inlined above
  MathfieldElement.soundsDirectory = null;  // no keypress sounds
  var mf = new MathfieldElement();
  mf.id = 'mf';
  mf.setAttribute('math-virtual-keyboard-policy', 'manual');
  mf.setAttribute('smart-fence', 'true');
  mf.setAttribute('placeholder', '\\\\text{Type a problem}');
  document.body.appendChild(mf);
  mf.menuItems = [];                        // no long-press context menu
  mf.mathModeSpace = '\\\\,';
  function send(m){
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage({ qubeField: s }, '*');
  }
  var lastHeight = 0;
  function reportHeight(){
    var h = Math.ceil(mf.getBoundingClientRect().height);
    if (h && h !== lastHeight){ lastHeight = h; send({ type: 'height', height: h }); }
  }
  function changed(){ send({ type: 'change', latex: mf.value }); reportHeight(); }
  mf.addEventListener('input', changed);
  mf.addEventListener('selection-change', reportHeight);
  mf.addEventListener('pointerdown', function(){ send({ type: 'focus' }); });
  if (window.ResizeObserver) new ResizeObserver(reportHeight).observe(mf);
  function handle(msg){
    switch (msg.cmd){
      case 'insert': mf.executeCommand(['insert', msg.latex, { selectionMode: 'placeholder', focus: true }]); break;
      case 'command': mf.executeCommand(msg.name); break;
      case 'set': mf.value = msg.latex || ''; mf.position = mf.lastOffset; break;
      case 'clear': mf.value = ''; break;
      case 'focus': mf.focus(); return;
      case 'blur': mf.blur(); return;
    }
    mf.focus();
    changed();
  }
  window.qubeField = { handle: handle };
  function onMessage(e){
    var d = e.data;
    if (typeof d === 'string'){ try { d = JSON.parse(d); } catch(_) { return; } }
    if (d && d.qubeCmd) handle(d.qubeCmd);
  }
  window.addEventListener('message', onMessage);
  document.addEventListener('message', onMessage); // Android WebView
  mf.focus();
  send({ type: 'ready', version: '${version}' });
  reportHeight();
})();
</script></body></html>`;

const banner = `// GENERATED by scripts/build-mathfield-html.js from mathlive@${version}. Do not edit by hand.\n`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${banner}export const MATHLIVE_VERSION = ${JSON.stringify(version)};\nexport default ${JSON.stringify(html)};\n`);
console.log(`Wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB, mathlive ${version})`);
