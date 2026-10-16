import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { PriorityLevel } from '../types/order';

export interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  style,
}) => {
  const norm = (priority || '').toUpperCase() as PriorityLevel;

  let color = colors.priority.low;
  let bg = colors.priority.lowBg;

  switch (norm) {
    case 'CRITICAL':
      color = colors.priority.critical;
      bg = colors.priority.criticalBg;
      break;
    case 'HIGH':
      color = colors.priority.high;
      bg = colors.priority.highBg;
      break;
    case 'MEDIUM':
      color = colors.priority.medium;
      bg = colors.priority.mediumBg;
      break;
    case 'LOW':
    default:
      color = colors.priority.low;
      bg = colors.priority.lowBg;
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: color + '55',
          paddingHorizontal: isSmall ? 6 : 9,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {norm}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
