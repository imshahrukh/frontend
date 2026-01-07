/**
 * Currency utility functions for handling USD/PKR conversions and formatting
 */

// Default rate (will be overridden by settings from backend)
let currentUsdToPkrRate = 278.50;

/**
 * Set the current USD to PKR conversion rate
 */
export const setUsdToPkrRate = (rate: number): void => {
  currentUsdToPkrRate = rate;
};

/**
 * Get the current USD to PKR conversion rate
 */
export const getUsdToPkrRate = (): number => {
  return currentUsdToPkrRate;
};

/**
 * Convert USD to PKR
 */
export const usdToPkr = (usdAmount: number): number => {
  return usdAmount * currentUsdToPkrRate;
};

/**
 * Convert PKR to USD
 */
export const pkrToUsd = (pkrAmount: number): number => {
  return pkrAmount / currentUsdToPkrRate;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: 'USD' | 'PKR' = 'PKR'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

/**
 * Format amount showing both USD and PKR
 */
export const formatDualCurrency = (pkrAmount: number): string => {
  const usdAmount = pkrToUsd(pkrAmount);
  return `${formatCurrency(pkrAmount, 'PKR')} (${formatCurrency(usdAmount, 'USD')})`;
};

/**
 * Format amount showing both currencies from USD source
 */
export const formatDualCurrencyFromUsd = (usdAmount: number): string => {
  const pkrAmount = usdToPkr(usdAmount);
  return `${formatCurrency(usdAmount, 'USD')} (${formatCurrency(pkrAmount, 'PKR')})`;
};


