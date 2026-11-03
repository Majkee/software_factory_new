import { describe, expect, it } from "vitest";
import { applyRate, formatCents, MoneyError, toCents } from "../src/money.ts";

describe("toCents", () => {
  it("parses whole and decimal amounts", () => {
    expect(toCents("12")).toBe(1200);
    expect(toCents("12.3")).toBe(1230);
    expect(toCents("12.34")).toBe(1234);
  });

  it("parses negative amounts", () => {
    expect(toCents("-5.50")).toBe(-550);
  });

  it("rejects amounts with more than two decimals", () => {
    expect(() => toCents("1.234")).toThrow(MoneyError);
  });

  it("rejects text that is not a number", () => {
    expect(() => toCents("abc")).toThrow(MoneyError);
  });
});

describe("formatCents", () => {
  it("formats positive amounts with two decimals and a currency", () => {
    expect(formatCents(123456)).toBe("1234.56 PLN");
    expect(formatCents(5, "EUR")).toBe("0.05 EUR");
  });

  it("keeps the minus sign for negative amounts under one unit", () => {
    expect(formatCents(-50)).toBe("-0.50 PLN");
    expect(formatCents(-1)).toBe("-0.01 PLN");
    expect(formatCents(-99)).toBe("-0.99 PLN");
  });

  it("formats negative amounts of one unit or more with a minus sign", () => {
    expect(formatCents(-100)).toBe("-1.00 PLN");
    expect(formatCents(-150)).toBe("-1.50 PLN");
  });

  it("formats zero and small positive amounts without a minus sign", () => {
    expect(formatCents(0)).toBe("0.00 PLN");
    expect(formatCents(50)).toBe("0.50 PLN");
  });

  it("rejects fractional cents", () => {
    expect(() => formatCents(1.5)).toThrow(MoneyError);
  });
});

describe("applyRate", () => {
  it("rounds half away from zero", () => {
    expect(applyRate(250, 0.23)).toBe(58); // 57.5 -> 58
    expect(applyRate(-250, 0.23)).toBe(-58);
  });
});
