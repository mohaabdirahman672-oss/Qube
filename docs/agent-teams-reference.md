# Agent Teams — Master Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams
> Last updated: 2026-05-18
> Requires: Claude Code v2.1.32+, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## What Are Agent Teams?

Agent teams let you coordinate multiple Claude Code instances working together. One session acts as the **team lead** — it coordinates work, assigns tasks, and synthesizes results. **Teammates** work independently, each in their own context window, and can communicate directly with each other.

Unlike subagents (which only report back to the main agent), teammates can message each other directly without going through the lead.

---

## Enable Agent Teams

In `settings.json` or `.claude/settings.local.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Or set as an environment variable in your shell: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## Agent Teams vs Subagents

| | Subagents | Agent Teams |
|---|---|---|
| **Context** | Own context window; results return to caller | Own context window; fully independent |
| **Communication** | Report results to main agent only | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Shared task list with self-coordination |
| **Best for** | Focused tasks where only the result matters | Complex work requiring discussion and collaboration |
| **Token cost** | Lower — results summarized back to main context | Higher — each teammate is a separate Claude instance |

**Use subagents when:** you need quick, focused workers that report back.
**Use agent teams when:** teammates need to share findings, challenge each other, and coordinate on their own.

---

## When to Use Agent Teams

### Strong use cases
- **Research and review** — multiple teammates investigate different aspects simultaneously, then share and challenge findings
- **New modules or features** — each teammate owns a separate piece without stepping on each other
- **Debugging with competing hypotheses** — teammates test different theories in parallel and converge faster
- **Cross-layer coordination** — changes spanning frontend, backend, and tests, each owned by a different teammate

### When NOT to use agent teams
- Sequential tasks with many dependencies
- Same-file edits (causes conflicts)
- Simple, routine work (single session is more cost-effective)
- Tasks where coordination overhead exceeds the benefit

---

## Architecture

| Component | Role |
|---|---|
| **Team lead** | The main Claude Code session — creates the team, spawns teammates, coordinates work |
| **Teammates** | Separate Claude Code instances, each working on assigned tasks |
| **Task list** | Shared list of work items that teammates claim and complete |
| **Mailbox** | Messaging system for communication between agents |

### Storage locations (auto-generated, do not edit by hand)
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

The team config holds runtime state (session IDs, tmux pane IDs) and is overwritten on every state update. Define reusable roles using **subagent definitions** instead.

---

## Starting a Team

Tell Claude in natural language:

```
Create an agent team to explore this CLI tool idea from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

Claude will:
1. Create a shared task list
2. Spawn teammates for each role
3. Have them explore the problem
4. Synthesize findings
5. Attempt team cleanup when finished

The lead's terminal lists all teammates and what they're working on. Use **Shift+Down** to cycle through teammates and message them directly.

---

## Display Modes

| Mode | Description | Requirement |
|---|---|---|
| `auto` (default) | Split panes if inside tmux, in-process otherwise | — |
| `in-process` | All teammates run inside your main terminal | Any terminal |
| `tmux` | Each teammate gets its own pane | tmux or iTerm2 |

Set in `~/.claude/settings.json`:
```json
{
  "teammateMode": "in-process"
}
```

Or override for a single session:
```bash
claude --teammate-mode in-process
```

> **Note:** Split-pane mode is NOT supported in VS Code integrated terminal, Windows Terminal, or Ghostty.

---

## Key Controls

| Action | How |
|---|---|
| Cycle through teammates | **Shift+Down** |
| Message a teammate directly | Shift+Down to select, then type |
| Interrupt a teammate's turn | Enter to view session, then **Escape** |
| Toggle task list | **Ctrl+T** |
| Click into a pane (split mode) | Click the pane |

---

## Task System

Tasks have three states: **pending → in progress → completed**

Tasks can have **dependencies** — a pending task with unresolved dependencies cannot be claimed until those dependencies are completed. The system unblocks tasks automatically when dependencies complete.

### Claiming tasks
- **Lead assigns**: tell the lead which task to give which teammate
- **Self-claim**: after finishing a task, a teammate picks up the next unassigned, unblocked task on its own

Task claiming uses **file locking** to prevent race conditions when multiple teammates try to claim the same task simultaneously.

---

## Specifying Teammates and Models

```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

- Teammates do **not** inherit the lead's `/model` by default
- Set **Default teammate model** in `/config` to have teammates follow the lead's model
- Pick **Default (leader's model)** to sync all teammates to the lead's current model

---

## Plan Approval Workflow

Require teammates to plan before implementing:

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

Flow:
1. Teammate works in **read-only plan mode**
2. Teammate submits plan to the lead for approval
3. Lead **approves** → teammate exits plan mode and implements
4. Lead **rejects with feedback** → teammate revises and resubmits

Shape the lead's judgment with criteria in your prompt:
- `"only approve plans that include test coverage"`
- `"reject plans that modify the database schema"`

---

## Communication Between Agents

- **Automatic message delivery** — messages are delivered automatically, the lead doesn't need to poll
- **Idle notifications** — teammates automatically notify the lead when they finish
- **Shared task list** — all agents can see task status and claim available work
- **Peer messaging** — send a message to one specific teammate by name

> To get predictable teammate names you can reference in prompts, tell the lead what to call each teammate in your spawn instruction.

---

## Shutdown and Cleanup

### Shut down a teammate
```
Ask the researcher teammate to shut down
```
The lead sends a shutdown request. The teammate can approve (exits gracefully) or reject with an explanation.

### Clean up the full team
```
Clean up the team
```
- Removes shared team resources
- **Fails if any teammates are still running** — shut them down first
- **Always use the lead to clean up**, never a teammate

---

## Hooks for Quality Gates

| Hook | When it runs | Exit code 2 effect |
|---|---|---|
| `TeammateIdle` | Teammate is about to go idle | Send feedback, keep teammate working |
| `TaskCreated` | A task is being created | Prevent creation, send feedback |
| `TaskCompleted` | A task is being marked complete | Prevent completion, send feedback |

---

## Subagent Definitions as Teammates

Reuse a subagent role (from any scope: project, user, plugin, CLI) as a teammate:

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

- Teammate honors that definition's `tools` allowlist and `model`
- Definition body is **appended** to the teammate's system prompt (not replacing it)
- Team coordination tools (`SendMessage`, task tools) are always available even when `tools` restricts others
- `skills` and `mcpServers` from the definition frontmatter are **NOT applied** — teammates load those from project/user settings

---

## Permissions

- Teammates start with the **lead's permission settings**
- If the lead runs `--dangerously-skip-permissions`, all teammates do too
- You can change individual teammate modes **after spawning**, but not at spawn time

---

## Context Each Teammate Gets

Teammates load on spawn:
- `CLAUDE.md` files from their working directory ✅
- MCP servers (from project/user settings) ✅
- Skills (from project/user settings) ✅
- Spawn prompt from the lead ✅
- Lead's conversation history ❌ (does NOT carry over)

**Always include task-specific details in the spawn prompt.**

Example:
```
Spawn a security reviewer teammate with the prompt: "Review the authentication
module at src/auth/ for security vulnerabilities. Focus on token handling,
session management, and input validation. The app uses JWT tokens stored in
httpOnly cookies. Report any issues with severity ratings."
```

---

## Token Usage

- Each teammate has its own context window — token costs **scale linearly** with team size
- Start with **3–5 teammates** for most workflows
- Target **5–6 tasks per teammate** to keep everyone productive without excessive context switching
- Scale up only when the work genuinely benefits from simultaneous parallel work

---

## Best Practices

### Team size
- **3–5 teammates** is the sweet spot for most tasks
- Coordination overhead increases with more teammates
- Three focused teammates often outperform five scattered ones

### Task sizing
- **Too small** → coordination overhead exceeds the benefit
- **Too large** → teammates work too long without check-ins, wasted effort risk
- **Just right** → self-contained units with a clear deliverable (a function, test file, review)

### Avoid file conflicts
Two teammates editing the same file leads to overwrites. **Break work so each teammate owns different files.**

### Give teammates enough context
They don't inherit the lead's conversation history. Be explicit in the spawn prompt.

### Keep the lead delegating
If the lead starts implementing tasks itself instead of waiting for teammates:
```
Wait for your teammates to complete their tasks before proceeding
```

### Monitor and steer
Check in on progress, redirect approaches that aren't working, synthesize findings as they come in. Don't let the team run unattended too long.

### Start simple
If new to agent teams, start with research/review tasks (not parallel implementation) — clear boundaries, no code conflicts, easy to see the value.

---

## Proven Prompt Patterns

### Parallel code review
```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

### Competing hypotheses debugging
```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific debate.
Update the findings doc with whatever consensus emerges.
```

### Multi-angle exploration
```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

### Parallel feature build
```
Create a team with 4 teammates to implement these independent modules in parallel.
Each teammate owns one module. Use Sonnet for each. Require plan approval before
any teammate begins implementation.
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Teammates not appearing | Press Shift+Down; check task complexity; verify tmux is in PATH |
| Too many permission prompts | Pre-approve common operations in permission settings before spawning |
| Teammate stops on error | Use Shift+Down to check output; give direct instructions or spawn replacement |
| Lead shuts down early | Tell the lead to keep going and wait for teammates |
| Orphaned tmux sessions | `tmux ls` then `tmux kill-session -t <session-name>` |
| Task status lagging | Check if work is actually done; update status manually or tell lead to nudge teammate |

---

## Limitations (Experimental)

| Limitation | Details |
|---|---|
| No session resumption | `/resume` and `/rewind` don't restore in-process teammates |
| Task status lag | Teammates sometimes fail to mark tasks complete, blocking dependents |
| Slow shutdown | Teammates finish their current request/tool call before shutting down |
| One team at a time | A lead can only manage one team; clean up before creating a new one |
| No nested teams | Teammates cannot spawn their own teams; only the lead can manage the team |
| Fixed lead | The session that creates the team is the lead for its lifetime; no promotion |
| Permissions set at spawn | Can change individual modes after spawning, but not at spawn time |
| Split panes limited | Only tmux or iTerm2; not VS Code, Windows Terminal, or Ghostty |

---

## Quick-Start Checklist

- [ ] Enable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings
- [ ] Claude Code v2.1.32 or later (`claude --version`)
- [ ] Define teammate roles and names upfront in your prompt
- [ ] Include task-specific context in each spawn prompt (no conversation history inheritance)
- [ ] Break work into file-separated units to avoid conflicts
- [ ] Start with 3–5 teammates, 5–6 tasks each
- [ ] Use plan approval for complex or risky changes
- [ ] Shut down teammates before running team cleanup
- [ ] Always clean up via the lead, not a teammate
