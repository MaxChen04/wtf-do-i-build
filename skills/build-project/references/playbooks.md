# Semantic playbooks

| Situation | Required sequence |
| --- | --- |
| Feature | name behavior and data → test/prototype the smallest vertical slice → implement → prove real surface → update PRD |
| Bug fix | reproduce → minimize → form a falsifiable cause → regression test → fix → prove original surface |
| Refactor | baseline behavior → specify invariant → change structure → run full relevant proof → update decision trail |
| Prototype | state learning question → build disposable proof → record result → decide preserve, replace, or discard |
| Investigation | state observation → collect evidence → separate facts from hypotheses → recommend next decision; do not silently implement |
| Resume | read full PRD and evidence → locate first unfinished step → verify current reality → use the matching playbook |

Every playbook returns to the PRD after one completed unit. None requires a named model, sticky mode, or subagent.
