# Architecture

## Production Flow

```txt
Wix / Sales Page / Subscription
        |
Netlify: Product Review Prompt Studio
        |
        | Project Queue CSV / Excel
        |
User Windows PC: WePlus Prompt Sender
        |
GPT Image / FLOW / Grok / Kling / Runway
```

## GitHub

GitHub stores source code, docs, and release-ready local helper files.

## Netlify

Deploy only `frontend/` because it is a browser-based static app for generating prompts and exporting a Project Queue.

Recommended Netlify settings:

```txt
Base directory: frontend
Build command: none
Publish directory: frontend
```

## Prompt Sender

`prompt-sender/` is a local Windows desktop app. It should not be deployed because it needs:

- local file paths
- Windows clipboard file paste
- mouse click positions
- keyboard Enter
- local timing and delay behavior

## Railway

Railway is not needed for the MVP. It may be useful later for login, Wix subscription verification, user project history, quota, or server-side AI API calls.

## Project Queue Schema

The current workflow uses one Project Queue file:

```txt
1 row = 1 shot
still_prompt = first-frame image prompt
motion_prompt = image-to-video prompt
```

See `docs/PROJECT_QUEUE_TEMPLATE.md` for the full column list.
