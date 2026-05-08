function calcAge(birthdate) {
  const today = new Date();
  const b = new Date(birthdate);

  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
    age--;
  }

  return age;
}

module.exports = { calcAge };
