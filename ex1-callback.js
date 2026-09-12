//ข้อ 1 — ระบบตรวจทะเบียน

//ส่วนที่ 1: ข้อมูลตั้งต้น (ไม่ export ออกไปข้างนอกไฟล์)
const students = [
  { id: "6501", name: "สมชาย", major: "CE", score: 85 },
  { id: "6502", name: "สมหญิง", major: "IT", score: 72 },
  { id: "6503", name: "กิตติ", major: "CE", score: 48 },
  { id: "6504", name: "มานะ", major: "IT", score: 65 },
];
 
//ส่วนที่ 2: fetchStudentById ตามธรรมเนียม error-first
//รูปแบบ callback(error, student) — error เป็น null แปลว่าสำเร็จ
const fetchStudentById = (id, callback) => {
  //เช็คก่อนเลยว่า id เป็น string ที่ไม่ว่างไหม ถ้าไม่ใช่ ผิดรูปแบบ
  if (typeof id !== "string" || id === "") {
    callback(new Error("รหัสนักศึกษาไม่ถูกต้อง"));
    return; //ต้อง return กันไม่ให้โค้ดข้างล่างทำงานต่อ
  }
 
  //จำลองฐานข้อมูลทะเบียนที่ตอบช้า หน่วงไว้ 300ms
  setTimeout(() => {
    const found = students.find((s) => s.id === id);
 
    if (!found) {
      callback(new Error(`ไม่พบรหัสนักศึกษา ${id}`));
      return;
    }
 
    //ส่งสำเนา { ...found } กลับไป ไม่ส่ง object ต้นฉบับ กันคนเอาไปแก้ทีหลัง
    callback(null, { ...found });
  }, 300);
};
 
//ส่วนที่ 3: ทดสอบให้ครบ 3 กรณี
 
// กรณี ก) id ที่มีอยู่จริง
fetchStudentById("6501", (error, student) => {
  if (error) {
    console.log("กรณี ก (id มีจริง) -> error:", error.message);
    return;
  }
  console.log("กรณี ก (id มีจริง) -> สำเร็จ:", student);
});
 
// กรณี ข) id ที่ไม่มีอยู่จริง
fetchStudentById("9999", (error, student) => {
  if (error) {
    console.log("กรณี ข (id ไม่มี) -> error:", error.message);
    return;
  }
  console.log("กรณี ข (id ไม่มี) -> สำเร็จ:", student);
});
 
// กรณี ค) id ผิดรูปแบบ (ส่งเลขไปแทน string)
fetchStudentById(42, (error, student) => {
  if (error) {
    console.log("กรณี ค (id ผิดรูปแบบ) -> error:", error.message);
    return;
  }
  console.log("กรณี ค (id ผิดรูปแบบ) -> สำเร็จ:", student);
});
 
//ส่วนที่ 4: ตอบคำถามท้ายไฟล์

// 1) ถ้าลืมเช็ค error แล้วรีบอ่าน student.name เลย จะเกิดอะไร?
// พัง เพราะตอน error มีค่า (ไม่ใช่ null) student จะเป็น undefined
// พออ่าน .name จาก undefined มันก็ throw TypeError ทันที เพราะเราไม่ได้
// ดักไว้ที่ไหนเลย โปรแกรมก็ crash ทั้งไฟล์ คนที่เห็น error นี้ก็คือ Node
// ที่ปาดขึ้นจอ terminal ให้เราเห็นเอง ไม่ใช่เราตั้งใจจัดการมันแต่แรก

// 2) ทำไมต้อง return หลัง callback(error)?
// เพราะถ้าไม่ return โค้ดข้างล่างจะทำงานต่อทันที เดี๋ยวมันจะเรียก callback
// ซ้ำอีกรอบ (เช่นเรียก callback(null, student) ตามมาอีกที) ซึ่งผิดกติกา
// error-first callback ที่ต้องเรียกแค่ครั้งเดียวจบ ใส่ return ไว้กันเหนียว