# Contributing to Hesabak

Thanks for wanting to help. Hesabak is MIT-licensed: you can use it, fork it, sell services around it
or build something new from it. Contributions back are welcome too.

## Ground rules

- **Your data never leaves the browser.** No analytics, no trackers, no calls to outside services. Pull requests that add any will be closed.
- **No build step, no dependencies.** The app is `index.html`, `sw.js` and the manifest. Keep it that way unless we agree otherwise in an issue first.
- **One page of A4.** Every template must print an invoice and a receipt on a single A4 sheet.
- **Fictional data only.** Screenshots, tests and examples use the built-in sample (Layla Mansour, Nile Bakery Co.) or other made-up names. Never commit a real invoice.

## Ways to help

- **Report a bug:** open an issue with the bug template. Include your browser and, if you can, an exported JSON with the personal parts replaced.
- **Suggest a feature:** open an issue with the feature template and describe the invoice you're trying to make.
- **Translate:** Arabic and right-to-left invoices are on the roadmap. Native speakers who can check wording are especially welcome.
- **Add a template:** add its CSS under the existing templates in `index.html`, register it in `TEMPLATES`, and add a thumbnail in `thumb()`.

## Making a change

1. Fork the repository and create a branch: `git checkout -b fix/receipt-spacing`.
2. Serve the folder locally: `npx serve .`, then open the address it prints.
3. Make your change. Check it in Chrome and Safari or Firefox, light and dark mode, and at phone width.
4. Print to PDF in each template you touched and confirm it is still one page.
5. If the change is visible, re-record the README media: `cd scripts && npm install && npm run media`.
6. Bump `VERSION` in `sw.js` so installed copies update.
7. Open a pull request using the template, with a before and after screenshot.

## Style

- Plain JavaScript, no frameworks. Small functions, early returns, and names that say what things are.
- Colours and type in the sheet come from CSS custom properties. Don't hard-code a colour inside a template rule if a token exists.
- Interface copy is short and specific: buttons say what they do ("Make receipt"), and messages say what happened ("Saved NILE-2026-01.").
- Commit messages in the imperative mood: "Add Ledger thumbnail", not "Added".

## Code of conduct

Be kind and assume good faith. Harassment, discrimination or personal attacks aren't tolerated in
issues, pull requests or anywhere else in the project. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
