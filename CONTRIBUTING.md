# Contributing to CyberShield

Thank you for improving CyberShield. The project aims to teach safe, practical cybersecurity habits through accessible interactive experiences.

## Before opening a pull request

1. Create a focused branch from `main`.
2. Keep user-facing copy available in **both Arabic (Modern Standard Arabic)** and **English**. Add additional languages as opt-in translations.
3. Preserve scenario safety: **do not add functioning exploits, real credential-entry fields, malware loaders, or links to working phishing sites**.
4. Keep all fictional sample domains under `.example`.
5. Use accessible controls with visible focus states and meaningful text; test on mobile and kiosk-sized viewports.
6. Run `npm run check`.
7. Explain the change and, for factual security claims, link to official advisories or respected research.

## Development

```bash
cp .env.example .env
npm run dev
npm run check
```

The project deliberately uses native web APIs with no package dependencies so that contributors can run it easily on low-maintenance event machines.

## Reporting bugs

Open a GitHub issue with reproduction steps, screen resolution, browser/version, relevant public feature flags, expected behavior, and actual behavior. Do not include secrets or personal information.

## License

By submitting a contribution, you agree it may be redistributed under the project's MIT license. Third-party licensed code must retain its attribution and notices.
