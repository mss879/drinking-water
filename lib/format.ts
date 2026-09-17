const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });

/** Formats an LKR amount the way the brief writes it: "Rs. 4,990". */
export function formatLKR(amount: number) {
  return `Rs. ${lkr.format(amount)}`;
}
