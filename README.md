# WePlus Product Review Auto-Gen v11-stabilized

Two-part workflow for product review prompt generation and supervised local sending.

## Tools
- `frontend/`: Product Review Prompt Studio for generating one Project Queue CSV.
- `prompt-sender/`: local Windows helper for sending still or motion prompts into external platforms.

## v11 stabilization
- Still phase sends either global refs or per-row refs, never both.
- Global refs are session-level. Add Product / Face / Outfit / Style once, then still jobs use them automatically.
- Apply All / Apply Selected were removed from the main Global Refs workflow.
- Motion phase uses `first_frame_path` first, with old row attachments only as a legacy fallback.
- Replace Project CSV clears old global refs to avoid carrying images into a new project.
- Stop is handled as a normal user action without a worker traceback.
- Logs exact final attachment count before sending.

See `docs/WORKFLOW.md`, `docs/PROMPT_SENDER.md`, and `docs/PROJECT_QUEUE_TEMPLATE.md`.
