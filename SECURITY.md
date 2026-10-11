# Security policy

CyberShield is an educational display and decision-simulation website. It is **not** a penetration-testing tool and does not process credentials or private visitor information.

## Responsible disclosure

Please report potential security problems privately using your repository's **Security → Report a vulnerability** feature if available. Repository maintainers should enable private vulnerability reporting and configure a trusted contact before publishing publicly.

Do not include exploit payloads, personal information, or live phishing infrastructure in a public issue.

## Threat model and limitations

- `config.json`, static JavaScript and images are public to all visitors. Never use `.env` for secrets or authorization tokens.
- Hiding the command bar is a user-experience affordance, **not security access control**. If presentation mode must be private, secure that deployment at the hosting/network layer.
- The QR code contains the publicly configured website URL. It does not transmit any visitor data to a QR service.
- The app does not perform malware scanning, device-security assessments, vulnerability exploits or phishing actions.
- Visitors should use a modern, updated browser over HTTPS for a real event.

## Supported releases

Security updates are applied to the latest `main` branch. Please update or redeploy older forks when relevant fixes become available.
