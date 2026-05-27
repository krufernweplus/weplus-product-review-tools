# WePlus Prompt Sender

โปรแกรมนี้เป็น **local desktop helper** สำหรับ Windows ไม่ต้อง deploy ขึ้น Netlify/Railway

หน้าที่:
- import CSV/Excel จาก Product Review Prompt Studio
- แนบรูปจาก `attachments`
- วาง prompt
- กด Enter
- รอ delay ระหว่างงาน
- จำพฤติกรรมคลิ๊กเป็น Profile เช่น GPT Image / FLOW / Grok

## ติดตั้ง

ดับเบิลคลิก `install.bat`

## เปิดโปรแกรม

ดับเบิลคลิก `Open WePlus Prompt Sender.cmd`

## CSV ที่รองรับ

แนะนำ:

```csv
profile,job_type,shot_id,prompt,attachments,delay_sec,status,output_name
GPT Image,first_frame,SHOT_01_FIRST,"prompt...","C:\refs\product.png|C:\refs\model.png",150,pending,SHOT_01_FIRST.png
FLOW,motion,SHOT_01_MOTION,"motion prompt...","C:\outputs\SHOT_01_FIRST.png",420,pending,SHOT_01_MOTION.mp4
```

ยังรองรับ format เดิม:

```csv
shot_id,prompt,attachments,delay_sec,status
```

## วิธีใช้

1. เปิด GPT / FLOW / Grok ใน browser
2. เลือก Profile ให้ตรงแพลตฟอร์ม
3. กด Set Point แล้วชี้เมาส์ที่ช่อง prompt/composer
4. Import CSV
5. กด Test Paste Prompt ก่อน
6. กด Start และเฝ้าหน้าจอระหว่างทำงาน

## หมายเหตุ

- โปรแกรมนี้ควรใช้แบบ supervised ไม่ควรปล่อยทิ้งยาว
- ถ้าเปลี่ยนแพลตฟอร์มหรือย้ายตำแหน่งหน้าจอ ให้ Set Point ใหม่
- Profile ถูกบันทึกใน `sender_profiles.json`
- สถานะ queue จะ autosave กลับลงไฟล์ CSV ที่ import ถ้าเปิด Autosave status
