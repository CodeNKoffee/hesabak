# Your data and backups

Everything you make in Hesabak (profiles, clients, invoices and receipts) is stored in **your browser's local storage** on your own device. Nothing is sent anywhere: the app has no server, and its security policy blocks connections to other sites.

## What that means for you

- **Back up regularly.** On **Saved**, press **Export everything (JSON)** to download one file with all your data.
- **Restore or move** with **Import JSON** on the same or another computer. Imported profiles, clients and invoices are added to what's there.
- **Clearing site data erases it**, and so does closing a private window.
- **Each browser has its own copy.** Chrome and Safari on the same laptop don't share data.

## Starting over

**Saved → Erase all data in this browser** removes everything. You have to press it twice within a few seconds, so it can't happen by accident. Export first if you might want the data back.

## Keeping real data out of git

If you work on Hesabak's code, keep your own export outside the repository. Files named like `hesabak-*.json` and `*-my-data.json` are already in `.gitignore`.
