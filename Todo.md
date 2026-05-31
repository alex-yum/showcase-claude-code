## Core Infrastructure

- [x] Agent to run test always and not skipped silently because infrastructure is not ready.
  - Instruction added to CLAUDE.md.
- [x] Hard gate (pre-commit hook and GHA CI) to enforce testing is passed for every new and changed code.
- [ ] Validate test coverage
- [ ] Add Test Architect and/or Skill to plan and write comprehensive test cases like boundary value, invalid data element, failure injection and so on.
- [ ] Evaluate the need to annotate test as unit, integration, functional, smoke, sanity and regression test.
- [ ] Automate agent to update pre-commit hook and GHA for testing & lint.
- [ ] Automate agent to monitor GHA run after update. Get agent to test locally for GHA CI changes to prevent multiple attempts (e.g. npm ci).

---

## Agent Architecture & Workflow

- [ ] Ralph-loop or Flow-Next skill as execution engine.
- [ ] Context7 skill for documentation grounding.
- [ ] Episodic-memory or Claude-Mem skil for project memory across sessions.
- [ ] Mutli-agent code review.
- [ ] Multi-model: Claude to plan, Codex to execute.
- [ ] Orchestration agent for full autonomous agentic workflow, pull for task from Issue Dashboard, just like Codex Symphony.

---

## Observability

- [ ] Integration to logs and traces for integration testing to validate SLO.

---

## Backlog

- [ ] Caveman for token efficiency.
- [ ] Permanently grant read permission to avoid being asked numerous times to run compound bash commands like source, npm, ls, etc and so on during implementation by subagents. Explore /fewer-permission-prompts.
- [ ] Increase frontend test coverage.
- [ ] Frontend module issues:
     - [ ] CI coverage failed.
     - [ ] CI node api deprecation warning.
     - [ ] http://localhost:3000 page not redirecting to login page.
     - [ ] Reload dashboard resulted in error.
       
