/**
 * Formats amount in paise to Indian Rupee currency format (e.g. 12345600 paise -> ₹1,23,456)
 * Follows the Indian numbering system: 3 digits for hundreds, followed by pairs of 2 digits (Lakhs, Crores).
 */
export function formatCurrency(amountInPaise: number | undefined | null): string {
  if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
    return '₹0';
  }

  const isNegative = amountInPaise < 0;
  const absPaise = Math.abs(amountInPaise);
  const rupees = Math.floor(absPaise / 100);

  const rupeeString = rupees.toString();
  
  let formattedRupees: string;
  if (rupeeString.length <= 3) {
    formattedRupees = rupeeString;
  } else {
    const lastThree = rupeeString.substring(rupeeString.length - 3);
    const otherDigits = rupeeString.substring(0, rupeeString.length - 3);
    const withCommas = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = `${withCommas},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${formattedRupees}`;
}

/**
 * Formats amount in paise with paise decimals if present (e.g. 12345650 -> ₹1,23,456.50)
 */
export function formatCurrencyDetailed(amountInPaise: number | undefined | null): string {
  if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
    return '₹0.00';
  }

  const isNegative = amountInPaise < 0;
  const absPaise = Math.abs(amountInPaise);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = Math.floor(absPaise % 100);

  const baseFormatted = formatCurrency(rupees * 100).replace('₹', '').replace('-', '');
  const decimalPart = remainderPaise.toString().padStart(2, '0');

  return `${isNegative ? '-' : ''}₹${baseFormatted}.${decimalPart}`;
}
