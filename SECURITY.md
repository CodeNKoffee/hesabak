# Security

Hesabak has no server and stores everything in the user's own browser, so the main risks are in the
page itself: script injection through invoice fields or imported JSON, and anything that could send
data off the device.

## Reporting a vulnerability

Please don't open a public issue. Use **Security → Report a vulnerability** on GitHub to send a private
report. Include the steps to reproduce and, if relevant, a JSON file that triggers it (with made-up data).

We aim to reply within a week and to credit reporters in the fix unless they prefer not to be named.

## Supported versions

Only the latest version on the `main` branch, which is what the live site serves.
