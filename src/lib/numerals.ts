/**
 * Converts a number to Chinese numerals (financial or standard).
 * For this app, we'll use standard high-level characters.
 */
export function toChineseNumerals(num: number): string {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const units = ["", "十", "百", "千"];
  
  if (num === 0) return digits[0];
  if (num === 10) return "十";
  if (num > 10 && num < 20) return "十" + digits[num % 10];
  
  let str = "";
  let n = num;
  let unitIndex = 0;
  
  while (n > 0) {
    const d = n % 10;
    if (d > 0) {
      str = digits[d] + units[unitIndex] + str;
    } else if (str.length > 0 && !str.startsWith(digits[0])) {
      str = digits[0] + str;
    }
    n = Math.floor(n / 10);
    unitIndex++;
  }
  
  // Clean up trailing zeros or leading zeros if any (not expected with this logic)
  return str.replace(/零+$/, "").replace(/零+/g, "零");
}
