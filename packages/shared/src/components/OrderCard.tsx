import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { formatCurrency } from '../utils/formatCurrency';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { PriorityLevel } from '../types/order';

export type OrderCardMode = 'customer' | 'driver' | 'operations';

export interface OrderCardProps {
  /** Mode governs the layout perspective: customer, driver, or operations */
  mode: OrderCardMode;

  /** Primary identification */
  id: string; // Order ID, Stop ID, or Action ID
  orderId?: string; // Explicit order reference
  title: string; // Customer name or Action summary
  subtitle?: string; // Facility, driver, or SKU

  /** Operational details */
  status: string;
  priority?: PriorityLevel;
  amountInPaise?: number;
  address?: string;
  eta?: string;
  expectedEta?: string;
  etaDeviationMinutes?: number;
  sku?: string;
  quantity?: string;
  stopNumber?: number;

  /** Interaction */
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;

  /** Composable Named Slots & Render Props */
  renderHeaderRight?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderActionSlot?: () => React.ReactNode;

  style?: ViewStyle;
}

/**
 * Unified, polymorphic OrderCard component.
 * Serves all three Opsyn applications via explicit `mode` variants while supporting
 * named slots and composable render-props.
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  mode,
  id,
  orderId,
  title,
  subtitle,
  status,
  priority,
  amountInPaise,
  address,
  eta,
  expectedEta,
  etaDeviationMinutes,
  sku,
  quantity,
  stopNumber,
  onPress,
  actionLabel,
  onActionPress,
  renderHeaderRight,
  renderFooter,
  renderActionSlot,
  style,
}) => {
  const isDelayed = status === 'DELAYED' || Boolean(etaDeviationMinutes && etaDeviationMinutes > 15);
  const isDriver = mode === 'driver';
  const isCustomer = mode === 'customer';
  const isOperations = mode === 'operations';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDelayed && styles.delayedCardBorder,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      {/* 1. CARD HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.idBadgeGroup}>
          {isDriver && stopNumber !== undefined && (
            <View style={styles.stopNumberBadge}>
              <Text style={styles.stopNumberText}>#{stopNumber}</Text>
            </View>
          )}
          <View style={styles.idChip}>
            <Text style={styles.idChipText}>{id}</Text>
          </View>
          {orderId && orderId !== id && (
            <Text style={styles.orderRefText}>Ref: {orderId}</Text>
          )}
        </View>

        {/* Header Right Slot or Default Status/Priority Badges */}
        {renderHeaderRight ? (
          renderHeaderRight()
        ) : (
          <View style={styles.badgesWrap}>
            {priority && (
              <PriorityBadge
                priority={priority}
                size="sm"
                style={{ marginRight: 6 }}
              />
            )}
            <StatusBadge status={status} size="sm" />
          </View>
        )}
      </View>

      {/* 2. CARD TITLE & SUBTITLE */}
      <View style={styles.contentBody}>
        <Text style={styles.titleText} numberOfLines={isOperations ? 2 : 1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* 3. MODE-SPECIFIC BODY DETAILS */}

      {/* Mode A: CUSTOMER VIEW (Focus: Amount, SKU, Delivery Window) */}
      {isCustomer && (
        <View style={styles.customerDetailRow}>
          <View style={styles.skuContainer}>
            <MaterialCommunityIcons
              name="gas-cylinder"
              size={15}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.skuText} numberOfLines={1}>
              {sku || 'Standard Energy Dispatch'}
            </Text>
          </View>
          {amountInPaise !== undefined && (
            <Text style={styles.amountText}>{formatCurrency(amountInPaise)}</Text>
          )}
        </View>
      )}

      {/* Mode B: DRIVER VIEW (Focus: Truncated Address, Stop ETA, SKU) */}
      {isDriver && (
        <View style={styles.driverDetailContainer}>
          {address && (
            <View style={styles.addressRow}>
              <Feather
                name="map-pin"
                size={14}
                color={colors.secondary}
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            </View>
          )}
          {sku && (
            <View style={styles.cargoRow}>
              <Feather
                name="package"
                size={13}
                color={colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.cargoText} numberOfLines={1}>
                {sku} {quantity ? `(${quantity})` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Mode C: OPERATIONS VIEW (Focus: Telemetry Deviation, Driver, Issue) */}
      {isOperations && (
        <View style={styles.operationsDetailContainer}>
          {sku && (
            <View style={styles.skuContainer}>
              <MaterialCommunityIcons
                name="shield-alert-outline"
                size={15}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.skuText} numberOfLines={1}>
                {sku}
              </Text>
            </View>
          )}
          {etaDeviationMinutes !== undefined && etaDeviationMinutes > 0 && (
            <View style={styles.deviationAlertRow}>
              <Feather name="clock" size={13} color={colors.status.delayed} />
              <Text style={styles.deviationAlertText}>
                Telemetry Alert: +{etaDeviationMinutes}m delay vs expected schedule
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 4. CARD FOOTER / META STRIP */}
      {renderFooter ? (
        renderFooter()
      ) : (
        <View style={styles.footerRow}>
          {eta && (
            <View style={styles.etaContainer}>
              <Feather
                name="clock"
                size={13}
                color={isDelayed ? colors.status.delayed : colors.textSecondary}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.etaText,
                  isDelayed && { color: colors.status.delayed, fontWeight: '700' },
                ]}
              >
                ETA: {eta}
              </Text>
            </View>
          )}

          {/* Action affordance slot or button chip */}
          {renderActionSlot ? (
            renderActionSlot()
          ) : actionLabel && onActionPress ? (
            <TouchableOpacity
              style={styles.actionChip}
              onPress={onActionPress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionChipText}>{actionLabel}</Text>
              <Feather
                name="chevron-right"
                size={13}
                color={colors.primary}
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowSlot}>
              <Feather name="arrow-right" size={14} color={colors.textMuted} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    ...shadows.subtle,
  },
  delayedCardBorder: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  idBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopNumberBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  stopNumberText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '800',
  },
  idChip: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  idChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderRefText: {
    color: colors.textMuted,
    fontSize: 10,
    marginLeft: 6,
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentBody: {
    marginBottom: 10,
  },
  titleText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: 20,
  },
  subtitleText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  customerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  skuText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  amountText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  driverDetailContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  addressText: {
    color: colors.textPrimary,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  cargoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cargoText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  operationsDetailContainer: {
    marginBottom: 10,
  },
  deviationAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6,
  },
  deviationAlertText: {
    color: colors.status.delayed,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderColor: 'rgba(0, 210, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  arrowSlot: {
    padding: 2,
  },
});
