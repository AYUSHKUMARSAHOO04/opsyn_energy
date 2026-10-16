import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'default' | 'alert' | 'success' | 'cyan';
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'default',
  style,
}) => {
  let accentColor = colors.primary;
  let bgGradient = colors.surface;
  let borderColor = colors.surfaceBorder;

  if (variant === 'alert') {
    accentColor = colors.status.delayed;
    borderColor = 'rgba(239, 68, 68, 0.35)';
  } else if (variant === 'success') {
    accentColor = colors.secondary;
    borderColor = 'rgba(16, 185, 129, 0.35)';
  } else if (variant === 'cyan') {
    accentColor = colors.primary;
    borderColor = 'rgba(0, 210, 255, 0.4)';
  }

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgGradient }, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: accentColor + '18' }]}>
            <Feather name={icon} size={15} color={accentColor} />
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: variant === 'default' ? colors.textPrimary : accentColor }]} numberOfLines={1}>
        {value}
      </Text>
      {subValue ? (
        <Text style={styles.subValue} numberOfLines={1}>
          {subValue}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.2,
  },
  subValue: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
