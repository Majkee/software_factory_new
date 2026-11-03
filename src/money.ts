/**
 * Money is always an integer number of cents (see docs/adr/0002-money-as-integer-cents.md).
 * Never pass floating-point amounts between modules.
 */
export type Cents = number;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

const AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

/** Parses a decimal string such as "12.34" or "-5" into cents. */
export function toCents(amount: string): Cents {
  const trimmed = amount.trim();
  if (!AMOUNT_PATTERN.test(trimmed)) {
    throw new MoneyError(`Not a valid amount: "${amount}"`);
  }
  const negative = trimmed.startsWith("-");
  const [whole = "0", fraction = ""] = trimmed.replace("-", "").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return negative ? -cents : cents;
}

/** Formats cents as a decimal string with a currency code, e.g. "12.34 PLN". */
export function formatCents(cents: Cents, currency = "PLN"): string {
  assertCents(cents);
  // Sign is taken from `cents` itself: Math.trunc(-50 / 100) is -0, which String() prints as "0".
  const sign = cents < 0 ? "-" : "";
  const whole = Math.floor(Math.abs(cents) / 100);
  const fraction = String(Math.abs(cents) % 100).padStart(2, "0");
  return `${sign}${whole}.${fraction} ${currency}`;
}

/** Multiplies an amount by a rate (e.g. VAT 0.23) and rounds half away from zero. */
export function applyRate(cents: Cents, rate: number): Cents {
  assertCents(cents);
  const raw = cents * rate;
  return Math.sign(raw) * Math.round(Math.abs(raw));
}

export function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`Expected an integer number of cents, got ${value}`);
  }
}
