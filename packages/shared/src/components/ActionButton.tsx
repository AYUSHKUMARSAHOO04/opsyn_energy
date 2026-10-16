import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ai';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  let btnBg = colors.primary;
  let btnBorder = colors.primary;
  let textColor = '#090D16'; // High contrast dark text on cyan

  if (variant === 'secondary') {
    btnBg = colors.secondary;
    btnBorder = colors.secondary;
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    btnBg = 'transparent';
    btnBorder = colors.surfaceBorder;
    textColor = colors.textPrimary;
  } else if (variant === 'danger') {
    btnBg = colors.status.delayed;
    btnBorder = colors.status.delayed;
    textColor = '#FFFFFF';
  } else if (variant === 'ai') {
    btnBg = 'rgba(0, 210, 255, 0.16)';
    btnBorder = colors.primary;
    textColor = colors.primary;
  }

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? 'rgba(255, 255, 255, 0.08)' : btnBg,
          borderColor: isDisabled ? 'rgba(255, 255, 255, 0.12)' : btnBorder,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator
            size="small"
            color={textColor}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Feather
              name={icon}
              size={16}
              color={isDisabled ? colors.textMuted : textColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: isDisabled ? colors.textMuted : textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
