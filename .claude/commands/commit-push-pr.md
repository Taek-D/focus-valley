Commit, push, and create a PR for the current changes.

Steps:
1. Run `npx tsc -b` to verify no type errors
2. Run `npm run lint` to verify no lint errors
3. Stage all relevant changed files (never stage .env or secrets)
4. Create a commit with a descriptive message following conventional commits
5. Push to the current branch
6. Create a PR with a clear title and description using `gh pr create`

If type check or lint fails, fix the issues first before committing.
