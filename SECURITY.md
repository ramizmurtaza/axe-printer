
## `SECURITY.md`
```markdown
# Security Policy

## Supported Versions
The latest release is supported for security updates on a best-effort basis.

## Reporting a Vulnerability
Please open a private issue or contact the maintainer by email. Do not post sensitive details publicly.

## Deployment Hardening
- Bind to localhost or restrict ingress with firewall rules.
- Put behind an API gateway/reverse proxy with auth.
- Limit request size and rate.
- Do not run as Administrator; use a low-privilege user.
