# Coding Style Rules

## General
- Immutability preferred — never mutate objects/arrays directly
- No console.log in production code
- No hardcoded secrets — use environment variables
- Input validation at system boundaries (user input, external APIs)
- Proper error handling with try/catch — never swallow errors silently

## Naming
- Variables/functions: camelCase
- Classes/types: PascalCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case (e.g., `user-service.ts`)
- Boolean variables: prefix with is/has/should/can

## Functions
- Single responsibility — one function does one thing
- Max 50 lines per function
- Max 3 parameters — use an options object for more
- Pure functions where possible

## TypeScript
- Strict mode always
- No `any` types — use `unknown` if truly needed
- Prefer interfaces for objects, types for unions/primitives
- Use discriminated unions over type assertions

## React
- Functional components only
- Custom hooks for shared logic
- Memoize expensive computations (useMemo, useCallback)
- Keep components under 200 lines

## Testing
- AAA pattern: Arrange, Act, Assert
- Test behavior, not implementation details
- Target 80%+ coverage
- Name tests descriptively: "should [expected behavior] when [condition]"

## Git
- Conventional commits: feat/fix/refactor/docs/test/chore
- One logical change per commit
- Never commit to main directly
