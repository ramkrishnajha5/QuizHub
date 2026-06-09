// Polyfill to resolve undefined HMRClient.default error in Metro Server Logger on Native devices
try {
  const HMRClient = require('react-native/Libraries/Utilities/HMRClient');
  if (HMRClient && !HMRClient.default) {
    HMRClient.default = HMRClient;
  }
} catch (e) {
  // Silence error if utilities file does not exist or fails to load
}
