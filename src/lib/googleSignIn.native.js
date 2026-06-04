// Native — real Google Sign-In for iOS/Android dev builds
// Falls back to no-op if native module isn't registered (e.g. Expo Go)
let GoogleSignin, statusCodes;

try {
  const mod  = require('@react-native-google-signin/google-signin');
  GoogleSignin  = mod.GoogleSignin;
  statusCodes   = mod.statusCodes;
} catch {
  GoogleSignin = {
    configure:       () => {},
    hasPlayServices: async () => {},
    signIn:          async () => { throw new Error('Google Sign-In requires a dev build — not available in Expo Go'); },
    signOut:         async () => {},
  };
  statusCodes = {
    SIGN_IN_CANCELLED:           'SIGN_IN_CANCELLED',
    IN_PROGRESS:                 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED:            'SIGN_IN_REQUIRED',
  };
}

export { GoogleSignin, statusCodes };
