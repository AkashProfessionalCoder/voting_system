/**
 * Normalizes a Gmail address to prevent aliasing attacks.
 * It removes all dots from the local part and removes any plus aliases (e.g. "+test").
 */
const canonicalizeEmail = (email) => {
  if (!email) return "";
  const normalized = email.trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  
  if (domain === "gmail.com") {
    // Remove everything after the first '+' and remove all '.'
    const cleanLocal = local.split("+")[0].replace(/\./g, "");
    return `${cleanLocal}@${domain}`;
  }
  
  return normalized;
};

module.exports = { canonicalizeEmail };
