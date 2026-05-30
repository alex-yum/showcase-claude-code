# Engineering Journal: Agentic Autonomous Development

This journal chronicles my journey exploring an autonomous, agent-driven software development lifecycle—covering requirements, design, implementation, testing, deployment, and monitoring. This log captures key milestones, agent behaviors, and critical human-in-the-loop interventions. All identified areas for improvement, engineering gaps, and technical debt have been captured as actionable tasks in the **[Todo.md](./Todo.md)** file for followup.

---

## Progress Log

| ID | Phase | Milestone & Agent Behavior | Engineering Takeaway / Intervention |
| :--- | :--- | :--- | :--- |
| **1** | Requirements | Input a rough handwritten draft for an E-Commerce app. Agent expanded it into a full, structured BRD. Claude Code models: Sonnet 4.5, Opus 4.6, Haiku 4.5. | Agents excel at translating ambiguous baseline text into formal requirements. Did not spent too much energy to review it. |
| **2** | Tech Design | Generated a high-level system architecture directly from the new BRD. | A solid BRD provides a strong contextual anchor for logical system modeling. |
| **3** | Frontend Proto | Started `Auth-Service` UI. Initial prototype was plain and unappealing. Installed `"Frontend Design"` plugin to overhaul it. | UI-focused plugins dramatically improve the visual quality of agent outputs. |
| **4** | Tech Design (BE) | Installed `"Superpowers"` plugin to plan and structure the `Auth-Service` backend. | Advanced planning plugins help agents maintain state during complex architecture phases. |
| **5** | Implementation | Coded `Auth-Service` backend. Agent skipped testing validation and got stuck looping on a Java `Testcontainers` + Docker compatibility bug. | **Interventions Required:** <br>1. Enforced testing via strict instruction in CLAUDE.md and pre-commit hook guardrails.<br>2. Manually researched and found a v2 framework upgrade the agent didn't know about. |
| **6** | Login & Dashboard Impl (FE) | Coded `Login` frontend. Agent started to skip spec review and code quality review from task 11 to 22 to save time and token without user approval.<br>Test task was stuck, have to interrupt it and Sonnet was used to finish the task instead of Haiku.<br>Deprecation in tsconfig.json was not caught by code review | **Interventions Required:** <br>1. Stop subagent test task that was stuck.<br>2. Always run code review after implementation, and with subagent.<br>3. Installed Context7 plugin to help agent in getting latest library/api version and doc.<br>4. Agent struggled to fix the npm lightningcss platform dependency error in GHA despite connecting to GHA to view the errors. Had to manually copy the error to agent and asked to fan out a subagent to verify its recommended fix.<br>5.Agent lowered the coverage threshold after being unable to meet it. |
