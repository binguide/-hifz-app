export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0));
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayName(date: string): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[new Date(date).getDay()];
}
