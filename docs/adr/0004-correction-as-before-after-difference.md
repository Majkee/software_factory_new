# ADR 0004: A correction is the difference of two computed invoices

- Status: accepted
- Date: 2026-11-02

## Context

We need corrections of an original invoice (issue #4). A correction could be modelled as (a) a
separate document of difference lines with negative amounts, or (b) a "before / after" pair for each
line of the original invoice. The two models round VAT differently and can disagree by one cent.

Example: original invoice 2 × 1.50 PLN at 23% VAT, after quantity 1.

- Before: line VAT 69 (300 × 0.23 = 69.0). After: line VAT 35 (150 × 0.23 = 34.5 → 35).
- Difference of the two rounded results: VAT −34.
- VAT computed on the difference line (−150 × 0.23): −35.

## Decision

Model (b). A correction refers to the original invoice and gives, for each line, the quantity after
the correction. We compute `computeInvoice` for the before state and for the after state, and every
correction amount (subtotal, discount, net, VAT, total) is "after minus before". Line VAT is never
computed on the difference.

Reason: the original invoice plus the correction must equal exactly an invoice issued for the after
state. As a side effect, no negative amount is ever rounded.

The first scope is narrow: quantities may only go down (integer, 0 to the original quantity); SKU,
unit price and VAT rate must match the original line; quantity 0 removes the line from the after
state, and an after state with no lines has all amounts 0. An original invoice with a discount code
is rejected with `InvoiceError`.

## Consequences

- Correction VAT can differ by one cent from "VAT of the difference"; that is intended.
- Changing this rule changes correction amounts for existing inputs: treat it as a one-way door.
- Price, VAT-rate and upward-quantity corrections, new lines and discount codes need a new decision.
