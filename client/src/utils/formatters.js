export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning, Chef';
  if (hour < 18) return 'Good Afternoon, Chef';
  return 'Good Evening, Chef';
};
