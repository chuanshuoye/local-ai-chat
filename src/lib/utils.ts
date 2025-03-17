export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date);
  const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  
  if (inputDay.getTime() === today.getTime()) {
    return '今天';
  } else if (inputDay.getTime() === yesterday.getTime()) {
    return '昨天';
  } else {
    return `${inputDate.getMonth() + 1}月${inputDate.getDate()}日`;
  }
} 

/** 身份证 */

