//ข้อ 4 — เลือก Combinator ให้ถูกงาน

// เครื่องมือจำลอง (ห้ามแก้)
const wait = (ms, value, willFail = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => (willFail ? reject(new Error(`${value} ล้มเหลว`)) : resolve(value)), ms);
  });

// timeoutPromise สำหรับสถานการณ์ 4 (reject เมื่อครบเวลาที่กำหนด)
const timeoutPromise = (ms) => {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(`หมดเวลา ${ms}ms`)), ms);
  });
};

//สถานการณ์ 1: เปิดหน้าแรก — ต้องครบทุกชิ้นถึงเปิดได้
// เลือกใช้ all เพราะหน้าแรกต้องมีทั้งโปรไฟล์ ตารางเรียน และประกาศ ครบทั้ง 3 อย่าง
// ถ้าขาดไปแม้แต่ชิ้นเดียวหน้าก็แสดงผลไม่สมบูรณ์ จึงต้อง "รอให้ครบทุกชิ้น หรือพังไปเลย"
const loadHomepage = async (announcementWillFail) => {
  try {
    const [profile, schedule, announcement] = await Promise.all([
      wait(300, "โปรไฟล์"),
      wait(400, "ตารางเรียน"),
      wait(500, "ประกาศ", announcementWillFail),
    ]);
    console.log(`เปิดหน้าแรก: ${profile}, ${schedule}, ${announcement}`);
  } catch (error) {
    console.log(`หน้าแรกเปิดไม่ได้: ${error.message}`);
  }
};

//สถานการณ์ 2: แจ้งเตือนผลสอบ — ต้องรู้ผลทุกช่องแม้บางช่องจะล้ม
// เลือกใช้ allSettled เพราะอยากได้รายงานครบทุกช่องทาง (อีเมล, SMS, แอป)
// ช่องไหนล้มก็แค่บันทึกว่าล้ม ไม่อยากให้ทั้งรายงานพังเพราะช่องเดียวที่ล้มเหลว
const notifyResult = async () => {
  const results = await Promise.allSettled([
    wait(300, "อีเมล"),
    wait(500, "SMS", true),
    wait(400, "แอป"),
  ]);

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log(`แจ้งเตือนสำเร็จ: ${result.value}`);
    } else {
      console.log(`แจ้งเตือนล้มเหลว: ${result.reason.message}`);
    }
  });
};

//สถานการณ์ 3: mirror server — เอาแค่ตัวแรกที่ "สำเร็จ"
// เลือกใช้ any เพราะไม่สนว่า mirror ตัวไหนล้มบ้าง ขอแค่มีสักตัวสำเร็จก็พอ
// mirror-A ล้มเร็วกว่า (300ms) แต่ any จะไม่สนใจ แล้วรอ mirror-B ที่สำเร็จต่อ (600ms)
const fetchFromMirror = async () => {
  try {
    const data = await Promise.any([wait(300, "mirror-A", true), wait(600, "mirror-B")]);
    console.log(`ใช้ข้อมูลจาก: ${data}`);
  } catch (error) {
    console.log("mirror ทุกตัวล้มเหลว:", error.message);
  }
};

//สถานการณ์ 4: ค้นหา — รอได้แค่ 800ms เอาตัวไหน "จบก่อน"
// เลือกใช้ race แข่งกับ timeoutPromise(800) เพราะอยากรู้ว่าตัวไหนถึงก่อนกัน
// ไม่สนว่าผลจะเป็นข้อมูลจริงหรือแค่หมดเวลา ฐานข้อมูลใช้ 1200ms ช้ากว่า 800ms
const searchWithTimeout = async () => {
  try {
    const data = await Promise.race([wait(1200, "ผลค้นหาจากฐานข้อมูล"), timeoutPromise(800)]);
    console.log(`ค้นหาสำเร็จ: ${data}`);
  } catch (error) {
    console.log(`เกิน 800ms เลิกรอ ใช้แคชแทน (${error.message})`);
  }
};

//เรียกทั้ง 4 สถานการณ์ใน main() เดียว
const main = async () => {
  console.log("--- สถานการณ์ 1 (ประกาศสำเร็จ) ---");
  await loadHomepage(false);

  console.log("--- สถานการณ์ 1 (ประกาศล้ม) ---");
  await loadHomepage(true);

  console.log("--- สถานการณ์ 2 ---");
  await notifyResult();

  console.log("--- สถานการณ์ 3 ---");
  await fetchFromMirror();

  console.log("--- สถานการณ์ 4 ---");
  await searchWithTimeout();
};

main().catch((error) => console.log("main() มีปัญหาที่ไม่คาดคิด:", error.message));