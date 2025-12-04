export function formatDate(date: Date) {
  const target = new Date(date);
  const withLeadingZero = (value: number) => value.toString().padStart(2, "0");

  const day = withLeadingZero(target.getDate());
  const month = withLeadingZero(target.getMonth() + 1);
  const year = target.getFullYear();
  const hours = withLeadingZero(target.getHours());
  const minutes = withLeadingZero(target.getMinutes());
  const seconds = withLeadingZero(target.getSeconds());

  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}
