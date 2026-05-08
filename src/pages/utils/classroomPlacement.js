async function findClassroomByAge(pool, age) {

  let classroomName;

  if (age < 3) {
    classroomName = "ห้องต่ำกว่า 3 ขวบ";
  } else {
    classroomName = "ห้อง 3 ขวบ";
  }

  const [rows] = await pool.query(
    "SELECT classroom_id FROM classrooms WHERE classroom_name = ? LIMIT 1",
    [classroomName]
  );

  if (!rows.length) {
    throw new Error("ไม่พบห้อง: " + classroomName);
  }

  return rows[0].classroom_id;
}

module.exports = { findClassroomByAge };
