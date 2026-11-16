import React from 'react';
import { Image } from 'react-native';

// The Qube cube mark (same asset as the launch splash), replacing the old blue
// "Q" placeholder badge (pre-launch checklist, Part H). One component so every
// place the logo appears stays identical.
const LOGO = require('../../assets/logo.png');

export default function BrandLogo({ size = 56, style }) {
  return (
    <Image
      source={LOGO}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Qube"
    />
  );
}
