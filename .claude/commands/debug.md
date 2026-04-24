---
description: Start systematic debugging workflow
---

Use the `systematic-debugging` skill. NEVER guess-fix. Follow the 4-phase methodology:

**Phase 1: Root Cause Investigation**
- Read error messages carefully
- Reproduce consistently
- Check recent changes (git diff)
- Trace data flow backward

**Phase 2: Pattern Analysis**
- Find working examples
- Compare against references
- Identify differences

**Phase 3: Hypothesis & Testing**
- Form single hypothesis (write it down)
- Test minimally (one variable at a time)

**Phase 4: Implementation**
- Create failing test
- Implement single fix
- Verify fix works

If 3+ fixes fail: question the architecture, not another fix.

$ARGUMENTS
