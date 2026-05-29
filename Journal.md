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
