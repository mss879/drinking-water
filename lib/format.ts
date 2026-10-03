const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Formats an LKR amount the way the client writes it: "LKR 4,990", with a no-break space so the two stay together. */
export function formatLKR(amount: number) {
  return `LKR\u00a0${lkr.format(amount)}`;
}

/** An amount with cents, as the AMC proposal writes daily costs and discounted prices: "2,137.50". */
export function formatCents(amount: number) {
  return cents.format(amount);
}

/** "LKR 22.98", for daily costs. */
export function formatLKRCents(amount: number) {
  return `LKR\u00a0${cents.format(amount)}`;
}

/**
 * Joins the last two words with a no-break space, so a wrapped line never ends on a single word. Short phrases are
 * left alone: holding two of three words together just moves the break to the front.
 */
export function keepLastWords(text: string, minWords = 4) {
  return text.trim().split(/\s+/).length < minWords ? text : text.replace(/ (\S+)$/, "\u00a0$1");
}
