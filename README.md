# Donnar.Tech Photo Booth Kiosk

เว็บต้นแบบ Photo Booth สำหรับจอสัมผัส แนวนอน ใช้ HTML/CSS/JavaScript แบบไม่ต้องติดตั้ง dependency

## รันในเครื่อง

ต้องเปิดผ่าน `localhost` หรือ HTTPS เพื่อใช้กล้อง

```bash
python3 -m http.server 8765
```

เปิด `http://localhost:8765` แล้วใช้ปุ่ม “จำลองชำระเงิน” เพื่อดู flow แบบเดโม

## Flow ปัจจุบัน

1. เลือกเลย์เอาต์ 1×3 (3 ภาพ / ฿100) หรือ 2×3 (6 ภาพ / ฿120)
2. เลือกฟิลเตอร์, กรอบรูป และเวลานับถอยหลังต่อภาพ (10, 5 หรือ 3 วินาที)
3. ชำระเงินในโหมดเดโม
4. แสดง modal ยืนยัน 1.5 วินาที แล้วขอเปิดกล้องอัตโนมัติ
5. ผู้ใช้กด “เริ่มถ่าย” ครั้งเดียว ระบบนับถอยหลังและถ่ายต่อเนื่องจนครบจำนวน
6. แสดงภาพจริงใน Photo Strip ตามสัดส่วนที่เลือก และรีเซ็ต session หลัง 30 วินาที

## ไฟล์หลัก

- `index.html` — โครงสร้างหน้าจอและ flow
- `styles.css` — responsive kiosk layout, ล็อก viewport ไม่ให้เลื่อน และกรอบรูป
- `app.js` — state ของ session, กล้อง, countdown, filters และ capture sequence
- `public/donnar-tech-logo.png` — โลโก้

## สำหรับพัฒนาต่อ

- ปุ่มชำระเงินและ QR เป็นตัวอย่างเท่านั้น ต้องเชื่อม Payment Gateway/backend และยืนยัน webhook ก่อนอนุญาตถ่าย
- กล้องใช้ `getUserMedia`; อนุญาตสิทธิ์กล้องให้ origin ของ Kiosk ล่วงหน้าสำหรับการเปิดอัตโนมัติจริง
- ฟิลเตอร์เป็น CSS filters ยังไม่มี AI face landmarks
- กรอบปัจจุบันเป็นตัวอย่าง CSS; เปลี่ยนเป็น asset/เทมเพลตที่ออกแบบจริงได้
- ผลลัพธ์เก็บใน memory ของ browser ยังไม่มี silent print, QR ดาวน์โหลด, หรือ storage backend
- โค้ดนี้ยังไม่มี test suite หรือ build step
