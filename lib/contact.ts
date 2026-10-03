/** Contact helpers: the admin stores numbers the way people write them ("011 433 4885"), the site derives the links. */

/** Sri Lankan numbers written with a leading 0 become +94; numbers already in international form pass through. */
function international(number: string) {
  const digits = number.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+94${digits.slice(1)}`;
  return digits;
}

/** "011 433 4885" → "tel:+94114334885". */
export function telHref(number: string) {
  return `tel:${international(number)}`;
}

/** "075 910 1276" → "https://wa.me/94759101276", optionally with a message ready to send. */
export function whatsappHref(number: string, text?: string) {
  const digits = international(number).replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** The address as lines, from the one multi-line string the admin edits. */
export function addressLines(address: string) {
  return address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
