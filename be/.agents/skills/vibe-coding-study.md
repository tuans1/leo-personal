---
name: vibe-coding-study
description: 'Write friendly study code with clear structure, readable naming, simple flow, comments for complex blocks, and short explanations of why each approach is used. Use when learning, teaching, or building practice exercises.'
argument-hint: 'What do you want to build or refactor for study?'
user-invocable: true
disable-model-invocation: false
---

# Vibe Coding For Study

Use this skill to produce code that is easy to learn from, not just code that works.

## Outcomes

- Code is correct and easy to read.
- Complex blocks include short comments that explain the idea.
- Important design choices include a brief "why this" explanation.
- The final result helps a learner understand both how and why.

## When To Use

- Learning a new framework, library, or language feature.
- Refactoring confusing code into a teaching-friendly version.
- Building practice tasks, exercises, or study demos.
- Preparing code examples for classmates, workshops, or notes.

## Workflow

1. Clarify the learning target.

- Define what the learner should understand after this task.
- Keep scope small so each step teaches one main idea.

Gate: The learning objective can be stated in one sentence without jargon.

2. Design a beginner-first solution.

- Prefer straightforward control flow over clever shortcuts.
- Pick descriptive names that reveal purpose.
- Split logic into small functions when it improves readability.

Gate: A new learner can explain the planned flow in 30-60 seconds.

3. Implement with teaching-oriented structure.

- Write code in small, logical chunks.
- Add comments only where the reasoning is important to notice.
- For any non-trivial block, add one short comment that explains the mental model.

Gate: Every complex block has one concise reason-focused comment.

4. Explain key decisions.

- After each important implementation choice, include a brief reason.
- Example: "Use dependency injection here to keep code testable and decoupled."
- Example: "Use server-side fetching here to avoid exposing secrets in the browser."

Gate: Major choices include at least one clear "why this approach" note.

5. Validate learning quality.

- Check that a beginner can follow the flow top to bottom.
- Confirm comments explain why, not just what.

Gate: No step requires assumed prior context not present in the code or explanation.

6. Deliver with a short study recap.

- Summarize what was built.
- List the main concepts learned.
- Suggest one small next exercise.

Gate: Recap includes one extension exercise with clear expected outcome.

## Decision Rules

- If there are two valid solutions, choose the one that is easier to explain.
- If an optimization harms readability and performance is acceptable, keep the readable version.
- If a block can confuse a beginner in under 10 seconds, add a short comment.
- If a library feature is advanced, briefly explain why it is still worth using.

## Quality Checks

- Names are clear and intention-revealing.
- File/function size is reasonable for study.
- Complex logic has concise comments.
- At least one "why this approach" explanation is present for major decisions.
- No unnecessary patterns, abstractions, or one-liners that reduce clarity.

## Output Style

- Start with a short plain-language overview.
- Provide code with readable structure.
- Add brief inline comments for complex or non-obvious parts.
- End with a "What you learned" section and a "Try next" suggestion.

## Stack-Specific Study Examples

### Next.js (frontend)

- Prefer clear server/client boundaries and explain why each side is chosen.
- For Server Components, add a short reason comment when data fetching is done on the server.
- For Client Components, explain why interactivity is needed and what state is tracked.
- Keep hooks usage simple and avoid over-abstracting into custom hooks too early.

### NestJS (backend)

- Keep controller, service, and module responsibilities explicit and easy to trace.
- Add short comments for dependency injection and explain why DI helps testability.
- Prefer simple DTO/validation paths and explain why strict input boundaries matter.
- Use clear service methods with intention-revealing names before introducing advanced patterns.
