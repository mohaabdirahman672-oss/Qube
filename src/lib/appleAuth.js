import { Platform } from 'react-native';

let appleAuth = null;
if (Platform.OS === 'ios') {
  appleAuth = require('@invertase/react-native-apple-authentication').default;
}

export default appleAuth;
