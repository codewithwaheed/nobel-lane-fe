// Shared utilities and types for email templates

interface PricingBreakdown {
  baseRate: number;
  gratuity: number;
  gratuityPercentage?: number;
  additionalFees: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  totalAmount: number;
}

interface BookingEmailData {
  customerName: string;
  confirmationNumber: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  totalAmount: number;
  pricingBreakdown?: PricingBreakdown;
}

interface QuoteEmailData {
  customerName: string;
  quoteNumber: string;
  quoteId: string;
  pickupAddress: string;
  destinationAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleName: string;
  pricingBreakdown?: PricingBreakdown;
}

/** ---------------------------
 * Shared helpers for HTML
 * -------------------------- */

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

/**
 * Reliable pricing table for email clients (Gmail/Outlook).
 * Uses role="presentation" and inline styles to enforce alignment.
 * theme: "amber" | "blue" to match booking/quote accents.
 */
function buildPricingTable(
  breakdown: PricingBreakdown,
  theme: "amber" | "blue",
) {
  const accent = theme === "amber"
    ? { border: "#f59e0b", bg: "#fffbeb", text: "#92400e" }
    : { border: "#3b82f6", bg: "#f0f9ff", text: "#1e40af" };

  const addFees = (breakdown.additionalFees || [])
    .map((fee) => `
      <tr>
        <td style="padding:8px 0 4px 0; vertical-align:top;">
          <span style="font-weight:600; color:#374151;">${
      escapeHtml(fee.name)
    }</span>
          ${
      fee.description
        ? `<div style="color:#6b7280; font-size:12px; line-height:1.4; margin-top:2px;">${
          escapeHtml(fee.description)
        }</div>`
        : ""
    }
        </td>
        <td align="right" style="padding:8px 0 4px 0; font-weight:600; color:#111827; white-space:nowrap;">
          ${formatCurrency(fee.amount)}
        </td>
      </tr>
    `).join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td colspan="2" style="padding:0 0 6px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-weight:600;">Base Rate</td>
            <td align="right" style="padding:8px 0; border-bottom:1px solid #e5e7eb; font-weight:700; color:#111827; white-space:nowrap;">${
    formatCurrency(breakdown.baseRate)
  }</td>
          </tr>
          ${
    addFees
      ? `
            <tr>
              <td colspan="2" style="padding:10px 0 4px 0; color:#6b7280; font-size:13px; font-weight:600;">Additional Fees</td>
            </tr>
            ${addFees}
          `
      : ""
  }
          <tr>
            <td style="padding:12px 0; border-top:1px solid #e5e7eb; color:#374151; font-weight:600;">
              Gratuity ${
    breakdown.gratuityPercentage
      ? `(${escapeHtml(String(breakdown.gratuityPercentage))}%)`
      : ""
  }
              <div style="color:#6b7280; font-size:12px; line-height:1.4; margin-top:2px;">Recommended for exceptional service</div>
            </td>
            <td align="right" style="padding:12px 0; border-top:1px solid #e5e7eb; font-weight:700; color:#111827; white-space:nowrap;">
              ${formatCurrency(breakdown.gratuity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td colspan="2" style="padding:0; height:12px;"></td>
    </tr>

    <tr>
      <td colspan="2" style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:${accent.bg}; border-top:2px solid ${accent.border};">
          <tr>
            <td style="padding:16px 12px; font-weight:800; color:${accent.text}; font-size:16px;">${
    theme === "amber" ? "TOTAL AMOUNT" : "ESTIMATED TOTAL"
  }</td>
            <td align="right" style="padding:16px 12px; font-weight:800; font-size:20px; color:${
    theme === "amber" ? "#f59e0b" : "#3b82f6"
  }; white-space:nowrap;">
              ${formatCurrency(breakdown.totalAmount)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (
      c,
    ) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]!),
  );
}

// Export types and utilities for use in template files
export type { BookingEmailData, PricingBreakdown, QuoteEmailData };
export { buildPricingTable, escapeHtml, formatCurrency };
