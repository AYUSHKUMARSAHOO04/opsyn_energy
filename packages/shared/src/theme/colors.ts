export const colors = {
  // Brand Base - Inspired by Opsyn Obsidian Energy Palette
  background: '#090D16',       // Deepest space obsidian
  backgroundAlt: '#0D1322',    // Slightly raised background
  surface: '#121A2D',          // Standard card surface
  surfaceElevated: '#18243E',  // Highlighted card / popover surface
  surfaceBorder: '#223254',    // Visible crisp card border
  surfaceBorderSubtle: '#192640', // Faint separator

  // Brand Accents - Extracted directly from Opsyn Logo
  primary: '#00D2FF',          // Electric Cyan (Opsyn Signature Glow)
  primaryDark: '#0284C7',      // Deep Cyan
  secondary: '#10B981',        // Energy Emerald (Clean Energy / Success)
  secondaryDark: '#059669',    // Deep Emerald
  royalBlue: '#2563EB',        // Opsyn Core Blue
  royalBlueDark: '#1E3A8A',    // Deep Royal Navy

  // Text Hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',    // Muted slate
  textMuted: '#64748B',        // Deep slate hint
  textInverse: '#090D16',

  // Semantic Status
  status: {
    delivered: '#10B981',      // Emerald Green
    deliveredBg: 'rgba(16, 185, 129, 0.12)',
    inTransit: '#00D2FF',      // Electric Cyan
    inTransitBg: 'rgba(0, 210, 255, 0.12)',
    pending: '#F59E0B',        // Amber
    pendingBg: 'rgba(245, 158, 11, 0.12)',
    delayed: '#EF4444',        // Crimson Alert
    delayedBg: 'rgba(239, 68, 68, 0.15)',
    cancelled: '#64748B',
    cancelledBg: 'rgba(100, 116, 139, 0.12)'
  },

  // Priority Hierarchy
  priority: {
    critical: '#EF4444',
    criticalBg: 'rgba(239, 68, 68, 0.18)',
    high: '#F97316',
    highBg: 'rgba(249, 115, 22, 0.16)',
    medium: '#F59E0B',
    mediumBg: 'rgba(245, 158, 11, 0.14)',
    low: '#10B981',
    lowBg: 'rgba(16, 185, 129, 0.12)'
  },

  // AI & Intelligence Glow
  ai: {
    glowCyan: 'rgba(0, 210, 255, 0.25)',
    glowEmerald: 'rgba(16, 185, 129, 0.25)',
    cardBg: '#131E35',
    cardBorder: '#00D2FF',
    badgeBg: 'rgba(0, 210, 255, 0.15)',
    accentGradientStart: '#00D2FF',
    accentGradientEnd: '#10B981'
  }
};
