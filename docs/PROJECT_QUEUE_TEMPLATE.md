# Project Queue Template

Recommended columns:
```txt
enabled
shot_order
shot_id
shot_type
category_th
scene_preset
scene_custom
style_preset
aspect_ratio
profile_still
profile_motion
still_prompt
motion_prompt
attachments
product_ref_names
face_ref_names
outfit_ref_names
style_ref_names
still_delay_sec
motion_delay_sec
still_output_name
first_frame_path
motion_output_name
still_status
motion_status
notes
```

`Replace Project CSV` imports queue rows as fresh pending work. Runtime status is saved separately to `*.autosave.csv` when autosave is enabled, and the source CSV is not overwritten automatically.

Use `first_frame_path` after the still image is created. Motion phase uses that file as the main attachment.
