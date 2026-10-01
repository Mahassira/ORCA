# ORCA Shipping & Agencies — Website

Bilingual (English / Arabic) corporate website, hosted on GitHub Pages.

## Structure

```
/                       Pages (GitHub Pages serves index.html from the root)
├── index.html          Home
├── services.html       Services & Logistics
├── digital-solutions.html
├── our-company.html    Our Company (our company.html only redirects here)
├── locations.html      Our Locations (interactive map)
├── contact.html        Contact form
├── portal-*.html       ORCA Connect customer portal (demo prototype)
├── css/
│   └── style.css       All site styles
├── js/
│   ├── i18n.js         English / Arabic text for every page
│   ├── main.js         Home page (cinematic hero, quote form)
│   ├── mobile-menu.js  Shared mobile menu behaviour
│   ├── assistant.js    Virtual assistant widget
│   └── …               One script per page, plus portal demo data
└── assets/
    ├── images/         Photos, posters and backgrounds
    │   └── team/       Leadership portraits
    ├── videos/         Hero and section videos
    └── logo/           ORCA logos
```

## Editing text

All visible text lives in `js/i18n.js` (an `en` block and an `ar` block).
Change the text there — the HTML only holds fallback copies.

## Naming

File names use lowercase and hyphens, no spaces (e.g. `mohamed-aly.jpg`).
