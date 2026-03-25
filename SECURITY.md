# Security Policy

## Supported Versions

Security fixes are applied to the current production branch.

## Reporting a Vulnerability

- Do not include secrets, private keys, or production credentials in reports.
- Use the Security report issue template for initial reporting.
- Include impact, affected routes/components, and clear reproduction steps.
- For critical issues, notify maintainers immediately and request coordinated disclosure.

## Response Targets

- Initial triage: within 2 business days
- Severity assignment: within 3 business days
- Patch target:
  - Critical/High: as soon as possible
  - Medium/Low: next planned release cycle

## Scope Guidance

In-scope examples:
- Auth bypass or role escalation
- Firestore rule/data exposure regressions
- CSP/header misconfiguration enabling injection
- Sensitive data leakage in logs/events

Out-of-scope examples:
- Missing best-practice headers without exploit path
- Generic library advisories with no reachable code path
