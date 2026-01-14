
# Growth Mastery Workshop Application

แอปพลิเคชันสำหรับจัดทำ Workshop (Wheel of Life & IDP Roadmap) พร้อมระบบ AI ช่วยแนะนำแผนการเติบโต

## การติดตั้ง (Installation)

1. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

2. สร้างไฟล์ `.env` แล้วเพิ่ม API Key ของคุณ:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

3. เริ่มรันโปรเจกต์:
   ```bash
   npm run dev
   ```

## ฟีเจอร์หลัก
- **Wheel of Life**: ประเมินความพึงพอใจใน 8 ด้านของชีวิต
- **Growth Roadmap**: วางแผน IDP (90 Days Goal)
- **AI Support**: ใช้ Gemini AI ช่วยออกแบบ Action Steps ที่ทำได้จริง
- **PDF Export**: สั่งพิมพ์หรือบันทึกเป็น PDF ขนาด A4 ได้ทันที
