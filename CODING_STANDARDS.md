# Coding standards

Judgement calls for the **standards reviewer**. Anything a machine can check belongs in lint, types,
tests or a ratchet instead — if you find yourself adding a mechanical rule here, add a check.

1. **Names come from GLOSSARY.md.** A function about "net" says `net`, not `afterDiscount`.
2. **Deep modules.** Prefer one function with a simple signature over several thin wrappers.
   Do not add a layer that only forwards calls.
3. **Errors are specific.** Throw the module's own error class (`MoneyError`, `DiscountError`,
   `InvoiceError`) with a message that names the bad input. No silent fallbacks.
4. **Tests describe behaviour.** Test names read as sentences about the domain. Assert on outcomes,
   not on internal calls. No mocks for pure functions.
5. **Smallest change that solves the issue.** No drive-by refactors, renames or new dependencies in a
   feature PR. Put ideas in a follow-up issue.
6. **Comments explain why.** Do not comment what the code obviously does. Link the ADR when a rule
   comes from one.
7. **Public behaviour changes are explicit.** If a change alters output for existing inputs, the PR
   says so under "Merge danger".
8. **The gate is shown, not claimed.** Evidence cites the `check` job of the PR's CI run or pastes the
   tail of `npm run check`. A reviewer who cannot run the gate reads the `check` status with
   `gh pr checks <n>`; it does not write "not verified" while that status is green.

The retro task may propose changes to this file. A human must approve every change.
