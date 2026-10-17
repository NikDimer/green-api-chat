/**
 * Clean phone number: removes spaces, dashes, brackets, leading plus
 */
export function normalizePhoneNumber(input: string): string {
  const cleaned = input.trim();
  // If already contains @c.us or other domain suffix, strip it for phone extraction
  if (cleaned.includes('@')) {
    return cleaned.split('@')[0].replace(/\D/g, '');
  }
  return cleaned.replace(/\D/g, '');
}

/**
 * Format to GREEN-API chatId: e.g. 79991234567@c.us
 */
export function formatChatId(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  return `${digits}@c.us`;
}

/**
 * Pretty print phone number: e.g. +7 999 123-45-67 if Russian format
 */
export function formatDisplayPhone(chatIdOrPhone: string): string {
  const digits = normalizePhoneNumber(chatIdOrPhone);
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const code = digits.startsWith('7') ? '+7' : '+7';
    return `${code} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  if (digits.length > 0) {
    return `+${digits}`;
  }
  return chatIdOrPhone;
}

/**
 * Format timestamp to HH:mm
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format chat list timestamp (e.g. Today 14:20 or Yesterday or DD.MM)
 */
export function formatChatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

/**
 * Deterministic color from string for avatar background
 */
const AVATAR_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#16a34a', // Green
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0284c7', // Sky
];

export function getAvatarColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Initials from phone or name
 */
export function getInitials(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return '?';
  const clean = trimmed.replace(/\D/g, '');
  if (clean.length >= 2) {
    return clean.slice(-2);
  }
  return trimmed.slice(0, 2).toUpperCase();
}
