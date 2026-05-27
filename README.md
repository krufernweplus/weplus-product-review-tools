# WePlus Product Review Auto-Gen

MVP v4 สำหรับ workflow:

1. Product Review Prompt Studio สร้าง prompt + CSV
2. Prompt Sender import CSV แล้วช่วยแนบรูป วาง prompt และกด Enter
3. แพลตฟอร์มปลายทาง เช่น GPT Image / FLOW / Grok เป็นคนเจนภาพหรือวิดีโอเอง

## โครงสร้าง

```txt
frontend/        เว็บ Product Review Prompt Studio สำหรับ deploy บน Netlify
prompt-sender/   โปรแกรม Python local desktop helper สำหรับเครื่อง user
docs/            เอกสาร architecture
```

## Deploy

- Deploy เฉพาะ `frontend/` ไป Netlify
- `prompt-sender/` ไม่ต้อง deploy ใช้บนเครื่อง Windows ของ user
- GitHub ใช้เก็บ source code และทำ release/download

## MVP นี้ตัดออกแล้ว

- ไม่มี Image API
- ไม่มี API key ใน frontend
- ไม่มี backend/Railway ใน MVP

Railway จะใช้ภายหลังเมื่อทำ login, subscription verification, project history หรือ quota


## Update v4
- Removed the visible API note from the sidebar.
- Added category: ช่องปาก / ยาสีฟัน.
- Added custom category and custom scene fields.
- Auto category/scene is rule-based inside the browser, not API-based.
