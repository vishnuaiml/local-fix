/**
 * Currency utilities for Indian Rupee (₹) handling in integer paise.
 * 1 Rupee = 100 Paise.
 * Always store and calculate monetary values as integer paise to prevent floating-point rounding issues.
 */

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatCurrency(paise: number): string {
  const rupees = Math.round(paise) / 100;
  // Use Indian Numbering System formatting (e.g. ₹1,499)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

export function calculateBookingBreakdown(
  servicePricePaise: number,
  addOnsPricePaise: number = 0,
  commissionRatePercent: number = 12
) {
  const baseServicePaise = Math.round(servicePricePaise + addOnsPricePaise);
  
  // Platform fee (nominal ₹49 convenience/safety fee = 4900 paise)
  const platformFeePaise = 4900;
  
  // GST 18% applied on the total platform fee + service commission
  const taxableAmountPaise = platformFeePaise;
  const taxesPaise = Math.round(taxableAmountPaise * 0.18);
  
  const totalAmountPaise = baseServicePaise + platformFeePaise + taxesPaise;
  
  // Platform commission deducted from provider gross payout
  const commissionAmountPaise = Math.round((baseServicePaise * commissionRatePercent) / 100);
  const providerNetPayoutPaise = baseServicePaise - commissionAmountPaise;

  return {
    baseServicePaise,
    platformFeePaise,
    taxesPaise,
    totalAmountPaise,
    commissionAmountPaise,
    providerNetPayoutPaise,
  };
}
