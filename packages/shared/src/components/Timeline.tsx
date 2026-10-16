import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  status: 'completed' | 'current' | 'pending' | 'alert';
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  style?: ViewStyle;
}

export const Timeline: React.FC<TimelineProps> = ({ items, style }) => {
  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        let dotColor = colors.textMuted;
        let dotBorder = colors.surfaceBorder;
        let iconName: keyof typeof Feather.glyphMap = 'circle';

        if (item.status === 'completed') {
          dotColor = colors.secondary;
          dotBorder = colors.secondary;
          iconName = 'check';
        } else if (item.status === 'current') {
          dotColor = colors.primary;
          dotBorder = colors.primary;
          iconName = 'radio';
        } else if (item.status === 'alert') {
          dotColor = colors.status.delayed;
          dotBorder = colors.status.delayed;
          iconName = 'alert-circle';
        }

        return (
          <View key={item.id} style={styles.itemRow}>
            {/* Left timeline axis */}
            <View style={styles.axisCol}>
              <View
                style={[
                  styles.nodeCircle,
                  {
                    borderColor: dotBorder,
                    backgroundColor:
                      item.status === 'completed'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : item.status === 'current'
                        ? 'rgba(0, 210, 255, 0.2)'
                        : colors.surface,
                  },
                ]}
              >
                <Feather name={iconName} size={12} color={dotColor} />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor:
                        item.status === 'completed'
                          ? colors.secondary
                          : colors.surfaceBorder,
                    },
                  ]}
                />
              )}
            </View>

            {/* Right content */}
            <View style={[styles.contentCol, isLast && styles.lastContent]}>
              <View style={styles.headerLine}>
                <Text
                  style={[
                    styles.title,
                    item.status === 'current' && { color: colors.primary },
                    item.status === 'alert' && { color: colors.status.delayed },
                  ]}
                >
                  {item.title}
                </Text>
                {item.time && <Text style={styles.time}>{item.time}</Text>}
              </View>
              {item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
  },
  axisCol: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  lastContent: {
    paddingBottom: 4,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  time: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 4,
    lineHeight: 16,
  },
});
