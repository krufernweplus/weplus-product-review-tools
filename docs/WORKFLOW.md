# WePlus Product Review Tools Workflow

## Normal Flow
1. Open Product Review Prompt Studio from `frontend/index.html` or the Netlify deployment.
2. Enter product name, details, category, scene, style, presenter mode, profiles, shot count, and aspect ratio.
3. Click Generate.
4. Export `Project Queue CSV`. One row is one shot and contains both `still_prompt` and `motion_prompt`.
5. Open `prompt-sender/Open WePlus Prompt Sender.cmd` on the Windows machine.
6. Replace Project CSV with the exported queue.
7. Add global refs once: Product, Face, Outfit, and Style as needed.
8. Choose phase:
   - `still`: sends `still_prompt` with global refs, or row attachments if no global refs exist.
   - `motion`: sends `motion_prompt` with `first_frame_path`.
9. Start or Send Selected under human supervision.

## Local-only Sender
Prompt Sender should not be deployed to Netlify or Railway. It controls local file paths, the clipboard, mouse clicks, keyboard input, and Windows file-paste behavior. Those actions need the user's local Windows desktop session.
