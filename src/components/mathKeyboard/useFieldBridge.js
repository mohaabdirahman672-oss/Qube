import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

// The platform-independent half of MathInput: queues commands until the field's
// page says it's ready, tracks its height and latest LaTeX, and exposes the ref
// API (insert / command / setValue / clear / focus / blur). `transport(cmd)`
// is the platform half: WebView.injectJavaScript on iOS, iframe postMessage on web.
export default function useFieldBridge(ref, { transport, onChange, onReady, onFocus, minHeight }) {
  const [height, setHeight] = useState(minHeight);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const queue = useRef([]);
  const latest = useRef('');
  const transportRef = useRef(transport);
  transportRef.current = transport;

  const post = useCallback((cmd) => {
    if (cmd.cmd === 'set') latest.current = cmd.latex || '';
    if (cmd.cmd === 'clear') latest.current = '';
    if (!readyRef.current) queue.current.push(cmd);
    else transportRef.current(cmd);
  }, []);

  useImperativeHandle(ref, () => ({
    insert: (latex) => post({ cmd: 'insert', latex }),
    command: (name) => post({ cmd: 'command', name }),
    setValue: (latex) => post({ cmd: 'set', latex }),
    clear: () => post({ cmd: 'clear' }),
    focus: () => post({ cmd: 'focus' }),
    blur: () => post({ cmd: 'blur' }),
    getValue: () => latest.current,
  }), [post]);

  // Called by the platform half with each parsed message from the page.
  const handleMessage = useCallback((msg) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'ready') {
      readyRef.current = true;
      setReady(true);
      // A fresh page (first load, or iOS reloading a killed WebView) starts
      // empty, so restore the last known value before replaying the queue.
      if (latest.current) transportRef.current({ cmd: 'set', latex: latest.current });
      const pending = queue.current;
      queue.current = [];
      pending.forEach((c) => transportRef.current(c));
      onReady?.();
    } else if (msg.type === 'change') {
      latest.current = msg.latex || '';
      onChange?.(latest.current);
    } else if (msg.type === 'height' && msg.height) {
      setHeight(Math.max(minHeight, Math.ceil(msg.height)));
    } else if (msg.type === 'focus') {
      onFocus?.();
    }
  }, [onChange, onReady, onFocus, minHeight]);

  // The page went away (iOS content process killed in the background): wait for
  // its next 'ready' before sending anything else.
  const markNotReady = useCallback(() => {
    readyRef.current = false;
    setReady(false);
  }, []);

  useEffect(() => () => { queue.current = []; }, []);

  return { height, ready, handleMessage, markNotReady };
}
