import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export type BadgeStatus =
  | 'DELIVERED'
  | 'IN_TRANSIT'
  | 'PENDING'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REQUIRES_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export interface StatusBadgeProps {
  status: BadgeStatus | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  style,
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let badgeColor = colors.textSecondary;
  let badgeBg = 'rgba(148, 163, 184, 0.12)';
  let label = status.replace(/_/g, ' ');

  switch (normalized) {
    case 'DELIVERED':
    case 'COMPLETED':
    case 'RESOLVED':
      badgeColor = colors.status.delivered;
      badgeBg = colors.status.deliveredBg;
      label = normalized === 'DELIVERED' ? 'Delivered' : normalized === 'COMPLETED' ? 'Completed' : 'Resolved';
      break;
    case 'IN_TRANSIT':
    case 'IN_PROGRESS':
      badgeColor = colors.status.inTransit;
      badgeBg = colors.status.inTransitBg;
      label = normalized === 'IN_TRANSIT' ? 'In Transit' : 'In Progress';
      break;
    case 'PENDING':
      badgeColor = colors.status.pending;
      badgeBg = colors.status.pendingBg;
      label = 'Pending';
      break;
    case 'DELAYED':
    case 'REQUIRES_REVIEW':
      badgeColor = colors.status.delayed;
      badgeBg = colors.status.delayedBg;
      label = normalized === 'DELAYED' ? 'Delayed' : 'Requires Review';
      break;
    case 'CANCELLED':
      badgeColor = colors.status.cancelled;
      badgeBg = colors.status.cancelledBg;
      label = 'Cancelled';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          borderColor: badgeColor + '40', // 25% opacity border
          paddingHorizontal: isSmall ? 7 : 10,
          paddingVertical: isSmall ? 3 : 5,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: badgeColor,
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: badgeColor,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 999,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
