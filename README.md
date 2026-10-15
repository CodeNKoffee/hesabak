# Invoice Desk

Invoices and receipts made in the browser. Nothing is sent anywhere: profiles, clients and invoices live in this browser's storage. Use **Saved → Export everything** now and then as a backup or to move to another computer.

## How it's organised

- **Profiles** are the identities you bill as: your name, role, email, phone, address, wordmark, colour, layout and default payment note. Make one per brand and switch with **Bill as** on the Details tab. Editing your details updates the profile, so the next invoice already has them. Saved invoices keep the details they were made with.
- **Design** has four templates (Standard, a billing-statement layout like the invoices payment platforms send; Studio; Ledger; Bold), an accent colour, a text colour, and blocks you drag to reorder or untick to hide. Click a template or drag it onto the page.
- **Placeholders** such as `{client}`, `{invoice}` and `{balance}` can be dragged or clicked into any note and fill in on the page.
- **Clients** are saved from the Details tab and picked from a list. A client code (e.g. `ACME`) gives numbers like `ACME-2026-01`; **Next** suggests the next free one.
- **Billing:** day rate from hours (hours ÷ hours per day, rounded down to 0.1 day), or line items. Tax: none, Egypt VAT 14%, or custom, either included or added on top.
- **Invoice vs receipt:** an invoice asks to be paid; a receipt confirms you were. **Make receipt** saves the invoice and creates its receipt.
- **Payment link:** an optional link (e.g. an InstaPay link) shows as "Pay online" under the amount in the Standard template.
- **PDF:** press **Save PDF**, then choose "Save as PDF". In the print dialog, turn off "Headers and footers".

The app opens with a fictional sample (Layla Mansour, Nile Bakery Co.) until you set up your own profile. No personal data is in this repository.

## Deploy (free)

Static files, no build step. In Vercel: **Add New → Project**, import the repo, keep the defaults, then add your domain under **Domains** and a CNAME record pointing to `cname.vercel-dns.com`.

After you change any file, bump `VERSION` in `sw.js` so installed copies pick up the update.
