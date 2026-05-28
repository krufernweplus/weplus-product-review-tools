# WePlus Prompt Sender

Local Windows desktop helper for supervised prompt sending. This app is not deployed to Netlify or Railway because it controls local file paths, the clipboard, mouse clicks, keyboard actions, and Windows file-paste behavior.

## Install
Double-click `install.bat`.

## Open
Double-click `Open WePlus Prompt Sender.cmd`.

## Supported Queue
Use one Project Queue CSV or Excel file:

```txt
1 row = 1 shot
still_prompt = first-frame image prompt
motion_prompt = image-to-video prompt
```

Key columns:

```txt
enabled
shot_id
profile_still
profile_motion
still_prompt
motion_prompt
attachments
first_frame_path
still_delay_sec
motion_delay_sec
still_status
motion_status
```

Legacy `profile,job_type,shot_id,prompt,attachments,delay_sec,status,output_name` CSV files are still imported.

## Global Refs
Use `Add Product`, `Add Face`, `Add Outfit`, and `Add Style` once per project. Global refs automatically apply to all still jobs at send time and are not copied into queue rows.

Still phase:

```txt
if global refs exist:
    use global refs only
else:
    use row attachments
```

Motion phase:

```txt
use first_frame_path first
fallback to legacy row attachments only when first_frame_path is empty
```

## Stop
Stop is treated as a normal user action. Pressing Stop during countdown, file gap, upload wait, or delay exits cleanly without a traceback.
