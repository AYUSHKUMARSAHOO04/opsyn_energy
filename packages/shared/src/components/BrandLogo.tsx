import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// We bundle the copied logo file in shared assets
const LOGO_SOURCE = require('../../assets/opsyn-logo.png');

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  style,
}) => {
  const imageDimensions = {
    sm: { width: 110, height: 28 },
    md: { width: 140, height: 36 },
    lg: { width: 180, height: 46 },
  }[size];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={LOGO_SOURCE}
        style={[styles.logoImage, imageDimensions]}
        resizeMode="contain"
      />
      {showSubtitle && size !== 'sm' && (
        <View style={styles.badgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.subtitle}>ENERGY INTELLIGENCE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoImage: {
    maxHeight: 50,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
