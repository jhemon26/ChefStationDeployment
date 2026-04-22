const pad = (value) => String(value).padStart(2, '0');

const toLocalDateString = (date = new Date()) => {
  const next = new Date(date);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

module.exports = { toLocalDateString, addDays };
