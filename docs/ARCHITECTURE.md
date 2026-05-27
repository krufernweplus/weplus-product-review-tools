# Architecture MVP v3

## Production Flow

```txt
Wix / Sales Page / Subscription
        ↓
Netlify: Product Review Prompt Studio
        ↓ CSV
User Windows PC: WePlus Prompt Sender
        ↓
GPT Image / FLOW / Grok / Kling / Runway
```

## GitHub

เก็บ source code ทั้งหมด:
- frontend app
- prompt sender source
- docs
- release package

## Netlify

ใช้ deploy เฉพาะ `frontend/` เพราะเป็น static app สำหรับสร้าง prompt และ export CSV

## Prompt Sender

เป็น Python local desktop app ไม่ต้อง deploy เพราะต้องใช้:
- local file path
- Windows clipboard file paste
- mouse click point
- keyboard Enter
- timing/delay เฉพาะเครื่อง user

## Railway

ยังไม่ใช้ใน MVP นี้
ใช้ภายหลังเมื่อมี:
- user login
- subscription check จาก Wix
- database/project history
- quota/credit
- server-side AI API

## CSV Schema

```csv
profile,job_type,shot_id,prompt,attachments,delay_sec,status,output_name
```

- `profile`: GPT Image / FLOW / Grok / Custom
- `job_type`: first_frame / motion
- `attachments`: local paths คั่นด้วย `|`
- `status`: pending / sending / sent / failed
