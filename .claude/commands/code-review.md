---
description: Run code review on current changes
---

Use the `requesting-code-review` skill and dispatch the `code-reviewer` agent to review the current changes.

Focus areas:
1. Security vulnerabilities (OWASP top 10)
2. Code quality and patterns
3. Error handling
4. Type safety
5. Test coverage
6. Performance concerns

Review the git diff of staged and unstaged changes, then provide actionable feedback.

$ARGUMENTS
