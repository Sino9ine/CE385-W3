//ข้อ 2 — แปลง Callback เป็น Promise

// คัดลอกข้อมูลมาจากข้อ 1
const students = [
  { id: "6501", name: "สมชาย", major: "CE", score: 85 },
  { id: "6502", name: "สมหญิง", major: "IT", score: 72 },
  { id: "6503", name: "กิตติ", major: "CE", score: 48 },
  { id: "6504", name: "มานะ", major: "IT", score: 65 },
];

// เกณฑ์เกรด ใช้ชุดเดิมจาก Workshop 2
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

//ส่วนที่ 1: fetchStudentByIdAsync คืน Promise (ห้ามใช้ async)
// ย้าย logic ตรวจสอบจากข้อ 1 มาไว้ใน executor แค่เปลี่ยน callback(err, x) -> reject/resolve
const fetchStudentByIdAsync = (id) => {
  return new Promise((resolve, reject) => {
    if (typeof id !== "string" || id === "") {
      reject(new Error("รหัสนักศึกษาไม่ถูกต้อง"));
      return;
    }

    //หน่วงเวลาเหมือนเดิม 300ms
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

//ส่วนที่ 2: ทดสอบ 3 กรณีเดิม ด้วย then/catch/finally

fetchStudentByIdAsync("6501")
  .then((student) => console.log("กรณี ก (id มีจริง) -> สำเร็จ:", student))
  .catch((error) => console.log("กรณี ก (id มีจริง) -> error:", error.message))
  .finally(() => console.log("กรณี ก -> จบการทำงาน"));

fetchStudentByIdAsync("9999")
  .then((student) => console.log("กรณี ข (id ไม่มี) -> สำเร็จ:", student))
  .catch((error) => console.log("กรณี ข (id ไม่มี) -> error:", error.message))
  .finally(() => console.log("กรณี ข -> จบการทำงาน"));

fetchStudentByIdAsync(42)
  .then((student) => console.log("กรณี ค (id ผิดรูปแบบ) -> สำเร็จ:", student))
  .catch((error) => console.log("กรณี ค (id ผิดรูปแบบ) -> error:", error.message))
  .finally(() => console.log("กรณี ค -> จบการทำงาน"));

//ส่วนที่ 3: โซ่ 3 ขั้น ทุกขั้นต้อง return ส่งต่อค่าให้ขั้นถัดไป
fetchStudentByIdAsync("6501")
  .then((student) => {
    // ขั้น 1: แปลง student เต็มๆ ให้เหลือแค่ { name, grade }
    return { name: student.name, grade: toGrade(student.score) };
  })
  .then((info) => {
    // ขั้น 2: แปลง { name, grade } เป็นข้อความรายงาน 1 บรรทัด
    return `${info.name} ได้เกรด ${info.grade}`;
  })
  .then((report) => {
    // ขั้น 3: พิมพ์ออกทาง console
    console.log("รายงาน:", report);
  })
  .catch((error) => console.log("โซ่ล้มเหลว:", error.message));

//ส่วนที่ 4 (โบนัส): promisify(fn) อเนกประสงค์
// รับฟังก์ชันสไตล์ error-first ใดๆ คืนเวอร์ชัน Promise ให้เอง
const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  };
};

// ทดสอบ promisify กับฟังก์ชัน error-first ตัวอย่างอื่น (ไม่ใช่ของข้อ 1)
const readConfig = (name, callback) => {
  setTimeout(() => {
    if (name !== "app") {
      callback(new Error(`ไม่พบ config ชื่อ ${name}`));
      return;
    }
    callback(null, { name: "app", version: "1.0.0" });
  }, 300);
};

const readConfigAsync = promisify(readConfig);

readConfigAsync("app")
  .then((config) => console.log("promisify ทดสอบ (พบ) -> สำเร็จ:", config))
  .catch((error) => console.log("promisify ทดสอบ (พบ) -> error:", error.message));

readConfigAsync("missing")
  .then((config) => console.log("promisify ทดสอบ (ไม่พบ) -> สำเร็จ:", config))
  .catch((error) => console.log("promisify ทดสอบ (ไม่พบ) -> error:", error.message));