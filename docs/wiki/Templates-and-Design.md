# Templates and design

<img src="https://github.com/CodeNKoffee/hesabak/raw/main/docs/readme/templates.gif" width="100%" alt="Clicking through the four templates and changing the accent colour.">

## The four templates

| Template | Looks like |
|---|---|
| **Standard** | The invoices and receipts payment platforms send: title and details top left, wordmark top right, the amount as a headline, quantity and unit price columns, totals on the right |
| **Studio** | Wordmark top left, a large title, labels in your accent colour, a clean item list |
| **Ledger** | Heavy rules, a spaced uppercase title, monospace amounts |
| **Bold** | A dark masthead with your wordmark in white and an extra-large title |

Click a template on **Design**, or drag it onto the page. The choice is saved to your profile.

## Colours

**Accent colour** is used for the wordmark ending, labels and the amount due. **Text colour** is used for everything else. Type a hex code or use the picker.

## Blocks

The page is made of blocks: header, title and date, from and to, items and totals, payment history, notes and footer. On **Design**, drag a block to move it, use the arrows on a phone, or untick it to hide it. **Reset order** puts them back.

## Placeholders

On **Details → Notes**, drag a placeholder into a note or click it to insert it at the cursor. It fills in on the page.

| Placeholder | Becomes |
|---|---|
| `{client}` | The client's name |
| `{project}` | The project |
| `{invoice}` | The invoice number |
| `{date}` / `{due}` | The issue date / due date |
| `{total}` / `{balance}` | The total / balance due, with currency |
| `{name}` / `{email}` / `{phone}` | Your details |

Example: `Bank transfer to {name}. Please quote {invoice}.`
