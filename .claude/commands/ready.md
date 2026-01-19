List all GitHub Project items with Status = Ready, then let me pick one.

Rules:
- Use GitHub MCP tools (Project/Projects v2) to query the current repo's Project.
- If multiple Projects exist, list them and ask me to choose by index.
- Find the "Status" field and the "Ready" option, then filter items by Status=Ready.
- Output a numbered list (max 20): [Issue#] Title — Status — Labels (if any).
- Ask me to choose by list index (e.g., "2").
- After I choose:
  1) Fetch the full Issue title+body.
  2) Extract What / Done When / Constraints.
  3) Write a concise implementation plan (steps, files to touch, commands to run).
  4) Do NOT write code. Stop and wait for approval.
