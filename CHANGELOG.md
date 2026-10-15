# Changelog

All notable changes to Hesabak. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated checks in GitHub Actions (`scripts/smoke.mjs`), replacing the Datadog Synthetics workflow, which needed a Datadog account.
- A user guide in the GitHub wiki, kept in `docs/wiki/` and published with `scripts/publish-wiki.sh`.

## [1.0.0] - 2026-10-16

First public release.

### Added
- Invoices and receipts made in the browser, printed as one-page A4 PDFs.
- Billing by day rate from hours (rounded down to 0.1 day) or by line items.
- Tax: none, Egypt VAT 14%, or a custom label and rate, included or added on top.
- Currencies: EGP, USD, EUR and AED.
- Profiles for each identity you bill as, and saved clients with numbering such as `ACME-2026-01`.
- Four templates (Standard, Studio, Ledger, Bold), accent and text colours, reorderable blocks.
- Placeholders such as `{client}` and `{balance}` in notes.
- Receipts with payment history and a "Paid in full" stamp; optional delivery seal and payment link.
- Offline install as a PWA; JSON export and import.
- Search and sharing metadata: Open Graph, schema.org, robots.txt, sitemap.xml, llms.txt.
- Contributing guide, code of conduct, security policy, issue and pull request templates.

[Unreleased]: https://github.com/CodeNKoffee/hesabak/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/CodeNKoffee/hesabak/releases/tag/v1.0.0
