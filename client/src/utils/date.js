const pad = (value) => String(value).padStart(2, '0');

export const toLocalDateString = (date = new Date()) => {
  const next = new Date(date);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
};

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
