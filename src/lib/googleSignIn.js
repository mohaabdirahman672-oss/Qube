// Web stub — Google Sign-In native module not available on web
export const GoogleSignin = {
  configure:       () => {},
  hasPlayServices: async () => {},
  signIn:          async () => { throw new Error('Google Sign-In is not available on web'); },
  signOut:         async () => {},
};

export const statusCodes = {
  SIGN_IN_CANCELLED:            'SIGN_IN_CANCELLED',
  IN_PROGRESS:                  'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE:  'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED:             'SIGN_IN_REQUIRED',
};
