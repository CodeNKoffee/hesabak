# Receipts

An **invoice** asks to be paid. A **receipt** confirms you were. Send the invoice when the work is delivered; send the receipt once the money arrives.

<img src="https://github.com/CodeNKoffee/hesabak/raw/main/docs/readme/receipt.gif" width="100%" alt="Pressing Make receipt, filling in two payments, and the Paid in full stamp appearing.">

## Making one

1. Open the invoice and press **Make receipt**. Hesabak saves the invoice first, then creates its receipt numbered `INVOICE-NUMBER-R`.
2. Any advance and the remaining balance are already listed as payments. Fill in each payment's **date**, **method** (bank transfer, InstaPay, cash) and **reference**.
3. When the payments add up to the total, a **Paid in full** stamp appears. If they don't, the receipt shows what is still outstanding.
4. **Save**, then **Save PDF**.

## Delivery receipt number

For audits and fixed-scope work you can print a **delivery receipt number**: for example the SHA-256 fingerprint of the files you delivered. It appears in a small box near the invoice number with a short plain-language note. Tick **Show in groups of 8** to make long fingerprints easier to read aloud or compare.
