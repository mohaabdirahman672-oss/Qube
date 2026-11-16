import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, TurboModuleRegistry, ActivityIndicator } from 'react-native';
import useFieldBridge from './useFieldBridge';
import { colors } from '../../theme';

// react-native-webview calls TurboModuleRegistry.getEnforcing() at import time, so
// on a dev-client build that predates it a top-level import would throw and
// red-screen the app. Same guard as react-native-svg in MathView.js: load it only
// when the native module is in the binary. SolveScreen checks
// MATH_INPUT_AVAILABLE and falls back to the plain text box otherwise.
let WebView = null;
try {
  if (TurboModuleRegistry.get('RNCWebViewModule')) WebView = require('react-native-webview').WebView;
} catch {
  WebView = null;
}
export const MATH_INPUT_AVAILABLE = !!WebView;

// The math field: a MathLive editor in a transparent WebView, driven entirely by
// MathKeypad through the ref API (useFieldBridge). The iOS keyboard never opens:
// MathLive's input element is inputmode=none. docs/plans/math-keyboard.md
const MathInput = forwardRef(function MathInput({ onChange, onReady, onFocus, minHeight = 64, style }, ref) {
  const webRef = useRef(null);
  // Lazy: the 1.2 MB page module is only evaluated when the field first mounts,
  // never at app launch.
  const html = useMemo(() => require('./mathfieldHtml').default, []);

  const transport = useCallback((cmd) => {
    webRef.current?.injectJavaScript(`window.qubeField&&window.qubeField.handle(${JSON.stringify(cmd)});true;`);
  }, []);
  const { height, ready, handleMessage, markNotReady } = useFieldBridge(ref, { transport, onChange, onReady, onFocus, minHeight });

  const onMessage = useCallback((e) => {
    try { handleMessage(JSON.parse(e.nativeEvent.data)); } catch {}
  }, [handleMessage]);

  if (!WebView) return null;

  return (
    <View style={[{ height }, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        style={styles.web}
        containerStyle={styles.web}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        hideKeyboardAccessoryView
        keyboardDisplayRequiresUserAction={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        allowsLinkPreview={false}
        textInteractionEnabled={false}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        // iOS can kill a WebView's content process while the app is backgrounded,
        // leaving it blank. Reload; useFieldBridge restores the value on 'ready'.
        onContentProcessDidTerminate={() => { markNotReady(); webRef.current?.reload(); }}
        accessibilityLabel="Math problem input"
      />
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
  web: { flex: 1, backgroundColor: 'transparent' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 8 },
});
