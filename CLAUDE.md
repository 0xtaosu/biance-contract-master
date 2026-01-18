# Claude Code – Project Rules

Goal:
Implement tasks from TODO.md or GitHub Issues using feature branches and PRs.

Hard rules:
- Never push to main or master directly.
- Always create a new feature branch.
- Work on one TODO / Issue at a time.
- Before coding: write a short plan.
- Keep diffs minimal and focused.
- Do not change architecture unless an ADR is proposed.

Workflow:
1. Read TODO.md or the linked Issue
2. Write a plan
3. Implement code + tests
4. Commit to feature branch
5. Open a PR with summary, tests, risks, rollback

Commands:
- Tests: npm test
- Lint: npm run lint
