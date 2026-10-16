/**
 * Format ISO date string or Date object to readable date
 */
export function formatDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format time
 */
export function formatTime(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' IST';
  } catch {
    return String(dateInput);
  }
}

/**
 * Get current date for headers (e.g. "Thu, 8 Oct 2026")
 */
export function getCurrentDateHeader(): string {
  const now = new Date();
  return now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculates ETA deviation text
 */
export function formatEtaDeviation(deviationMinutes: number): {
  text: string;
  isDelayed: boolean;
  isEarly: boolean;
} {
  if (deviationMinutes > 0) {
    return {
      text: `+${deviationMinutes}m delay`,
      isDelayed: true,
      isEarly: false
    };
  } else if (deviationMinutes < 0) {
    return {
      text: `${Math.abs(deviationMinutes)}m ahead`,
      isDelayed: false,
      isEarly: true
    };
  }
  return {
    text: 'On Schedule',
    isDelayed: false,
    isEarly: false
  };
}
