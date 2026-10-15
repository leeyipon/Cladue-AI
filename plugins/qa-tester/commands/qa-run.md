---
description: Run a full QA job from a brief (Notion link or pasted text) using the qa-tester agent
argument-hint: <Notion brief link or short description> [Google Sheet link] [Drive evidence folder link]
---

Run a complete QA job for: $ARGUMENTS

Use the `qa-tester` agent's process and the `qa-web-testing` skill. Start with intake: read the
brief, list the systems and deliverables you found, and ask me one grouped question for the
permissions and anything missing (Sheet link, Drive evidence folder). Then work through
discover → test → HD evidence → bugs → Drive links → Sheet → summary, keeping a task list.
