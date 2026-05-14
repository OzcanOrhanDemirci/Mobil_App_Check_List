# Security Policy

The Mobile App Quality Checklist is a static, client-side PWA. We take security seriously even though the attack surface is intentionally small.

## Supported versions

Security fixes are issued for the current `1.2.x` line. Earlier `1.1.x` and
`1.0.x` lines are no longer maintained; please update to the latest `1.2.x`
release before reporting a vulnerability. The current version is tracked in
[`package.json`](../package.json) and on the
[Releases page](https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/releases).

| Version | Supported |
| ------- | --------- |
| 1.2.x   | Yes       |
| 1.1.x   | No        |
| 1.0.x   | No        |
| < 1.0   | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security reports.**

Email the maintainer privately:

- ozcanorhandem@gmail.com

Please include:

1. A clear description of the issue and its potential impact.
2. Steps to reproduce, ideally with a minimal proof of concept.
3. The browser and version you observed it on, plus the URL or commit hash.
4. Any suggested remediation, if you have one.

You can expect an acknowledgment within **7 days**. The fix timeline depends on severity: critical issues are typically addressed within 14 days; lower-severity issues within the next minor release.

## Coordinated disclosure

Please give the maintainer a reasonable window to ship a fix before publishing details, proof-of-concept code, or write-ups. A credit line in the release notes is offered to reporters who request it.

## Scope and threat model

This is a fully static, client-side Progressive Web App:

- No backend, no server-side code.
- No authentication, no user accounts.
- No telemetry, no analytics, no third-party trackers.
- No personally identifiable information (PII) is collected or transmitted. All user data (marks, notes, projects) lives only in the browser's `localStorage` on the user's own device.

### Realistic concerns in scope

- **Cross-site scripting (XSS)** in translation strings, item content, How-To steps, or user-entered notes / project names that bypass sanitization.
- **Content Security Policy (CSP) gaps** that would permit script injection or data exfiltration.
- **Service Worker cache poisoning** scenarios that could persist a malicious response across reloads.
- **Supply-chain risks in the development tooling.** Runtime ships with zero npm dependencies, but the post-1.0 development tooling (ESLint, Prettier, the Node test runner) is npm-based. Reports about dev tooling are welcome and triaged at lower severity than runtime issues.

### Out of scope

- Self-hosted forks or modified deployments. Report those to the operator of the fork.
- Issues that require physical access to an unlocked device.
- Issues only reachable through deprecated browsers (anything older than the support matrix in [README.md](../README.md#browser-support)).
