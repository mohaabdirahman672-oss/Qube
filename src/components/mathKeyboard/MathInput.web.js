import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import useFieldBridge from './useFieldBridge';
import { colors } from '../../theme';

// Web twin of MathInput.js: the same generated page in an iframe instead of a
// WebView, so the keyboard can be developed and tested with `expo start --web`.
export const MATH_INPUT_AVAILABLE = true;

const MathInput = forwardRef(function MathInput({ onChange, onReady, onFocus, minHeight = 64, style }, ref) {
  const frameRef = useRef(null);
  const html = useMemo(() => require('./mathfieldHtml').default, []);

  const transport = useCallback((cmd) => {
    frameRef.current?.contentWindow?.postMessage({ qubeCmd: cmd }, '*');
  }, []);
  const { height, ready, handleMessage } = useFieldBridge(ref, { transport, onChange, onReady, onFocus, minHeight });

  useEffect(() => {
    function onMessage(e) {
      if (e.source !== frameRef.current?.contentWindow || typeof e.data?.qubeField !== 'string') return;
      try { handleMessage(JSON.parse(e.data.qubeField)); } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleMessage]);

  return (
    <View style={[{ height }, style]}>
      {React.createElement('iframe', {
        ref: frameRef,
        srcDoc: html,
        title: 'Math problem input',
        'data-testid': 'math-field-frame',
        style: { border: 0, width: '100%', height: '100%', background: 'transparent', colorScheme: 'dark' },
      })}
      {!ready ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : null}
    </View>
  );
});

export default MathInput;

const styles = StyleSheet.create({
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 8 },
});
