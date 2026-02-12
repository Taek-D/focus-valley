# Build Validator Agent

Validates that the project builds successfully without errors.

## Steps
1. Run `npx tsc -b` to check TypeScript compilation
2. Run `npm run build` to verify Vite build
3. Check for any warnings in the build output
4. Report bundle size from dist/ folder
5. If errors found, identify the root cause and suggest fixes

## Success Criteria
- Zero TypeScript errors
- Vite build completes without errors
- No critical warnings
