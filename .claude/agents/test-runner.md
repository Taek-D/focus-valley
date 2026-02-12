# Test Runner Agent

Runs project validation checks since no test framework is configured yet.

## Validation Steps
1. Run `npx tsc -b` for type checking
2. Run `npm run lint` for lint checks
3. Run `npm run build` to verify the build
4. Check for unused imports or dead code
5. Verify all components render without import errors

## If Test Framework Exists
- Run `npm test` or `npx vitest`
- Report pass/fail counts
- For failures, show the failing test name and error

## Output
- Summary of all checks (pass/fail)
- Details for any failures
