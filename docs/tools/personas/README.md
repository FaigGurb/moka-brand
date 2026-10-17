# Synthetic users ("süni bazar")

AI personas browse the live site and report what a real visitor would struggle with. A heuristic, not
real users: good at missing information, unclear copy, dead ends, inconsistent design; blind to how
smooth scrolling feels on a real iPhone (that stays with `docs/QA.md` and real devices).

1. `personas.json` — who visits (language, phone/desktop, goals, tasks) and the report schema.
2. `look.mjs` — one visit with Playwright: steps (`scroll:`, `click:`, `to:`, `goto:`, `text`, `links`, …),
   a screenshot after every step, the text a visitor sees. Phones scroll with touch swipes.
3. Run one agent per persona (Claude Code subagents in parallel). Each one browses only through
   `look.mjs`, looks at its screenshots, and writes `<out>/<id>.json` in the schema. Evidence must be
   a screenshot path or quoted page text; anything not checked is marked as such, never guessed.
4. Aggregate the reports into one dashboard (scores, task success, findings by severity), fix the
   top findings, deploy, run again and compare scores.

Real analytics (PostHog) can replace guesses with data once MOKA approves tracking.
