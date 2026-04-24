# Security Rules

- Never hardcode credentials, API keys, or tokens
- Parameterized queries only — no string concatenation in SQL
- Sanitize all user input before rendering (prevent XSS)
- Validate file paths to prevent directory traversal
- Use CSRF tokens for state-changing requests
- Rate limit all public-facing endpoints
- Never log sensitive data (passwords, tokens, PII)
- Use HTTPS for all external API calls
- Validate and sanitize file uploads (type, size, content)
- Keep dependencies updated — audit regularly
