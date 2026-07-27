# IGCSEMYSG Website

A static, responsive website for IGCSEMYSG online tuition. It is designed for GitHub Pages and does not require a database, authentication system or build step.

## Pages

- `index.html` — main one-page website, including the approach, 15-question study diagnostic, subjects, FAQ and tuition enquiry.
- `careers.html` — separate tutor application page.

## Supporting files

- `styles.css` — all responsive styling.
- `script.js` — mobile navigation, diagnostic logic and WhatsApp forms.
- `CNAME` — custom-domain configuration.

## Publish on GitHub Pages

1. Upload these files to the root of the repository.
2. Keep `index.html` at the root; GitHub Pages uses it as the main page.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose the main branch and the root folder, then save.

The existing `logo.png`, `favicon.ico` and `og-preview.png` can remain in the repository. The old `about.html`, `apply.html`, `assessment.html`, `contact.html`, `enquiry.html`, `how-we-help.html` and `thankyou.html` pages are no longer needed because their useful content is consolidated into `index.html`.

## Contact destination

Forms open WhatsApp using the number declared at the top of `script.js`:

```js
const WHATSAPP_NUMBER = "60172731112";
```

Change that value if the business WhatsApp number changes. Use country code and digits only.

## Diagnostic scope

The diagnostic is an educational screening across:

- concept foundations;
- exam application;
- language and comprehension;
- study consistency;
- motivation and direction.

It does not make a psychological or medical diagnosis, and no responses are stored.
