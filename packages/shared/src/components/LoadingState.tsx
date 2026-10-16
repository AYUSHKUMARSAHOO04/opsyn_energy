import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export interface LoadingStateProps {
  count?: number;
  variant?: 'card' | 'compact' | 'metrics';
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  count = 3,
  variant = 'card',
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [animatedValue]);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.topRow}>
            <Animated.View style={[styles.bar, { width: '40%', height: 14, opacity: animatedValue }]} />
            <Animated.View style={[styles.pill, { width: 70, height: 20, opacity: animatedValue }]} />
          </View>

          <Animated.View
            style={[
              styles.bar,
              { width: '75%', height: 18, marginTop: 12, opacity: animatedValue },
            ]}
          />
          <Animated.View
            style={[
              styles.bar,
              { width: '90%', height: 12, marginTop: 8, opacity: animatedValue },
            ]}
          />

          <View style={styles.bottomRow}>
            <Animated.View style={[styles.bar, { width: '30%', height: 14, opacity: animatedValue }]} />
            <Animated.View style={[styles.bar, { width: '25%', height: 14, opacity: animatedValue }]} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
  },
  bar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
  },
  pill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
  },
});
