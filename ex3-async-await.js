//ข้อ 3 — async/await และลำดับ vs ขนาน

// คัดลอกเวอร์ชัน Promise มาจากข้อ 2
const students = [
  { id: "6501", name: "สมชาย", major: "CE", score: 85 },
  { id: "6502", name: "สมหญิง", major: "IT", score: 72 },
  { id: "6503", name: "กิตติ", major: "CE", score: 48 },
  { id: "6504", name: "มานะ", major: "IT", score: 65 },
];

const GRADE_TABLE = [
  { min: 80, grade: "A" },
  { min: 75, grade: "B+" },
  { min: 70, grade: "B" },
  { min: 65, grade: "C+" },
  { min: 60, grade: "C" },
  { min: 55, grade: "D+" },
  { min: 50, grade: "D" },
  { min: 0, grade: "F" },
];
const toGrade = (score) => GRADE_TABLE.find((g) => score >= g.min).grade;

const fetchStudentByIdAsync = (id) => {
  return new Promise((resolve, reject) => {
    if (typeof id !== "string" || id === "") {
      reject(new Error("รหัสนักศึกษาไม่ถูกต้อง"));
      return;
    }
    setTimeout(() => {
      const found = students.find((s) => s.id === id);
      if (!found) {
        reject(new Error(`ไม่พบรหัสนักศึกษา ${id}`));
        return;
      }
      resolve({ ...found });
    }, 300);
  });
};

//ส่วนที่ 1: ดึงทีละคน ด้วย await ใน for...of
const reportSequential = async () => {
  const ids = ["6501", "6502", "6503"];
  const start = Date.now();

  for (const id of ids) {
    const student = await fetchStudentByIdAsync(id);
    console.log("ทีละคน พบ:", student.name);
  }

  const usedMs = Date.now() - start;
  console.log(`reportSequential ใช้เวลา ${usedMs} ms`);
  return usedMs;
};

//ส่วนที่ 2: ดึงพร้อมกัน ด้วย Promise.all + map
const reportParallel = async () => {
  const ids = ["6501", "6502", "6503"];
  const start = Date.now();

  const foundStudents = await Promise.all(ids.map((id) => fetchStudentByIdAsync(id)));
  foundStudents.forEach((student) => console.log("พร้อมกัน พบ:", student.name));

  const usedMs = Date.now() - start;
  console.log(`reportParallel ใช้เวลา ${usedMs} ms`);
  return usedMs;
};

//ส่วนที่ 3: safeReport ครบ try-catch-finally ห้าม crash
const safeReport = async (id) => {
  try {
    const student = await fetchStudentByIdAsync(id);
    console.log(`พบข้อมูล: ${student.name} (เกรด ${toGrade(student.score)})`);
  } catch (error) {
    console.log(`ตรวจไม่พบ: ${error.message}`);
  } finally {
    console.log(`-- จบการตรวจสอบ ${id} --`);
  }
};

//เรียกทุกฟังก์ชันจาก main() เดียว ตามลำดับที่กำหนด
const main = async () => {
  const sequentialMs = await reportSequential();
  const parallelMs = await reportParallel();

  const speedUp = (sequentialMs / parallelMs).toFixed(2);
  console.log(`ขนานเร็วกว่าลำดับประมาณ ${speedUp} เท่า`);

  await safeReport("6501"); // id ที่พบ
  await safeReport("9999"); // id ที่ไม่พบ
};

main().catch((error) => console.log("main() มีปัญหาที่ไม่คาดคิด:", error.message));

//ส่วนที่ 4: ตอบคำถามท้ายไฟล์

// 1) ทำไม try-catch ครอบ await จับ reject ได้ แต่ครอบ callback ธรรมดาไม่ได้?
// เพราะ await พอเจอ Promise ที่ reject มันจะโยน error ออกมาทันทีตรงจุดนั้นเลย
// ซึ่งยังอยู่ใน try-catch เดิมพอดี เลยจับได้ชัวร์ แต่ callback ใน setTimeout
// มันทำงาน ทีหลัง ตอนที่ try-catch จบไปแล้ว รอบ event loop มันคนละรอบกัน
// เลยไม่มี try-catch ไหนอยู่ครอบมันไว้ทัน

// 2) ถ้าลืม await หน้า Promise.all แล้วเอาไปใช้ต่อเลย จะเป็นไง?
// ได้ Promise object เปล่าๆ มา ไม่ใช่ array ของนักศึกษา พอเอาไปเรียก .forEach
// หรืออ่าน .name ต่อ มัน error ทันที (เช่น "forEach is not a function")
// เพราะยังไม่ได้รอให้มันทำงานเสร็จ ดันเอาตัว Promise ไปใช้แทน array เลย