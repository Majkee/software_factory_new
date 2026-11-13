import { describe, expect, it } from "vitest";
import { computeCorrection, computeInvoice, InvoiceError, type InvoiceLine } from "../src/invoice.ts";

const book: InvoiceLine = { sku: "BOOK", quantity: 2, unitPrice: 4999, vatRate: 0.05 };
const laptop: InvoiceLine = { sku: "LAPTOP", quantity: 1, unitPrice: 350000, vatRate: 0.23 };

describe("computeInvoice", () => {
  it("adds up lines and per-line VAT", () => {
    expect(computeInvoice([book, laptop])).toEqual({
      subtotal: 359998,
      discount: 0,
      net: 359998,
      vat: 81000, // 500 (5% of 99.98, rounded) + 80500
      total: 440998,
    });
  });

  it("spreads a percentage discount across lines before VAT", () => {
    const totals = computeInvoice([book, laptop], "SAVE10");
    expect(totals.discount).toBe(36000);
    expect(totals.net).toBe(323998);
    expect(totals.total).toBe(totals.net + totals.vat);
  });

  it("caps a fixed discount at the subtotal", () => {
    const cheap: InvoiceLine = { sku: "PEN", quantity: 1, unitPrice: 500, vatRate: 0.23 };
    expect(computeInvoice([cheap], "MINUS20")).toMatchObject({ discount: 500, net: 0, vat: 0, total: 0 });
  });

  it("rejects an empty invoice", () => {
    expect(() => computeInvoice([])).toThrow(InvoiceError);
  });

  it("rejects a zero quantity", () => {
    expect(() => computeInvoice([{ ...book, quantity: 0 }])).toThrow(InvoiceError);
  });

  it("rejects a VAT rate given as a percentage", () => {
    expect(() => computeInvoice([{ ...book, vatRate: 23 }])).toThrow(InvoiceError);
  });
});

describe("computeCorrection", () => {
  const cup: InvoiceLine = { sku: "CUP", quantity: 2, unitPrice: 150, vatRate: 0.23 };

  it("lowers one line to a smaller quantity as after minus before", () => {
    // before: 300 net, VAT 69, total 369. after: 150 net, VAT 35 (34.5 rounds away from zero), total 185.
    expect(computeCorrection([cup], [{ ...cup, quantity: 1 }])).toEqual({
      subtotal: -150,
      discount: 0,
      net: -150,
      vat: -34,
      total: -184,
    });
  });

  it("cancels the whole original invoice when every line drops to quantity zero", () => {
    expect(computeCorrection([cup], [{ ...cup, quantity: 0 }])).toEqual({
      subtotal: -300,
      discount: 0,
      net: -300,
      vat: -69,
      total: -369,
    });
  });

  it("is all zeros when no quantity changes", () => {
    expect(computeCorrection([book, laptop], [book, laptop])).toEqual({
      subtotal: 0,
      discount: 0,
      net: 0,
      vat: 0,
      total: 0,
    });
  });

  it("rejects a quantity above the original quantity", () => {
    expect(() => computeCorrection([cup], [{ ...cup, quantity: 3 }])).toThrow(InvoiceError);
  });

  it("rejects a negative or fractional quantity", () => {
    expect(() => computeCorrection([cup], [{ ...cup, quantity: -1 }])).toThrow(InvoiceError);
    expect(() => computeCorrection([cup], [{ ...cup, quantity: 1.5 }])).toThrow(InvoiceError);
  });

  it("rejects a changed SKU, unit price or VAT rate", () => {
    expect(() => computeCorrection([cup], [{ ...cup, sku: "MUG" }])).toThrow(InvoiceError);
    expect(() => computeCorrection([cup], [{ ...cup, unitPrice: 200 }])).toThrow(InvoiceError);
    expect(() => computeCorrection([cup], [{ ...cup, vatRate: 0.08 }])).toThrow(InvoiceError);
  });

  it("rejects a different number of lines than the original invoice", () => {
    expect(() => computeCorrection([book, laptop], [book])).toThrow(InvoiceError);
    expect(() => computeCorrection([book], [book, laptop])).toThrow(InvoiceError);
  });

  it("rejects an original invoice that has a discount code", () => {
    expect(() => computeCorrection([cup], [{ ...cup, quantity: 1 }], "SAVE10")).toThrow(InvoiceError);
  });

  it("makes the original invoice plus the correction equal the invoice for the after state, on every amount", () => {
    const after = [{ ...book, quantity: 1 }, laptop];
    const before = computeInvoice([book, laptop]);
    const correction = computeCorrection([book, laptop], after);
    const expected = computeInvoice(after);
    expect(before.subtotal + correction.subtotal).toBe(expected.subtotal);
    expect(before.discount + correction.discount).toBe(expected.discount);
    expect(before.net + correction.net).toBe(expected.net);
    expect(before.vat + correction.vat).toBe(expected.vat);
    expect(before.total + correction.total).toBe(expected.total);
  });

  it("drops a line that goes to quantity zero from the after state", () => {
    const after = [{ ...book, quantity: 0 }, laptop];
    const before = computeInvoice([book, laptop]);
    const correction = computeCorrection([book, laptop], after);
    const expected = computeInvoice([laptop]);
    expect(before.total + correction.total).toBe(expected.total);
    expect(before.vat + correction.vat).toBe(expected.vat);
  });
});
