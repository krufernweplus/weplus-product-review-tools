# Prompt Sender Guide

## Global Refs
Use:
- Add Product
- Add Face
- Add Outfit
- Add Style
- Clear Refs

Global refs are not copied into rows. They automatically apply to all still jobs at send time.

Still attachment rule:
```txt
if global refs exist:
    use global refs only
else:
    use row attachments
```

Motion attachment rule:
```txt
use first_frame_path first
fallback to old row attachments only when first_frame_path is empty
```

## Stop Behavior
Pressing Stop during countdown, file gap, upload wait, or delay is treated as normal. The active row returns to pending instead of failed, the worker exits cleanly, and no Python traceback should appear.

## Send Log
Before each send, `prompt-sender/sender-debug.log` records:
```txt
SHOT_ID phase=still refs=2 paths=...
```

Use this line to confirm that two global refs paste exactly two files.

## Multi-click
The final click step is the paste target. A profile can contain several click steps before the final composer click. The sender clicks each step, waits the configured step wait, then pastes images and prompt at the final target.
