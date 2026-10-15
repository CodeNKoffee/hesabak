# Self-hosting

Hesabak is plain static files: no build step, no server, no environment variables. Anything that serves files works.

## Run it on your computer

```bash
git clone https://github.com/CodeNKoffee/hesabak.git
cd hesabak
npx serve .
```

Open the address it prints. Opening `index.html` directly also works, but installing and offline use need a real `http://` address.

## Deploy for free

1. [Fork the repository](https://github.com/CodeNKoffee/hesabak/fork).
2. **Vercel**: Add New → Project, import your fork, keep the defaults, Deploy. Netlify, Cloudflare Pages and GitHub Pages work the same way.
3. Optional: add your own domain and the CNAME record your host asks for.

Your copy keeps the security headers in `vercel.json`. On other hosts, set an equivalent content security policy.

## Updating your copy

When you change any app file, bump `VERSION` in `sw.js` so installed copies fetch the new version.
