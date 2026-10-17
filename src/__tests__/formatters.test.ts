import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  formatChatId,
  formatDisplayPhone,
  formatMessageTime,
  getInitials,
} from '../utils/formatters';

describe('formatters utility', () => {
  it('normalizes phone numbers', () => {
    expect(normalizePhoneNumber('+7 (999) 123-45-67')).toBe('79991234567');
    expect(normalizePhoneNumber('8 (800) 555-35-35')).toBe('88005553535');
    expect(normalizePhoneNumber('79991234567@c.us')).toBe('79991234567');
  });

  it('formats chatId to GREEN-API standard', () => {
    expect(formatChatId('79991234567')).toBe('79991234567@c.us');
    expect(formatChatId('+7 (999) 123-45-67')).toBe('79991234567@c.us');
    expect(formatChatId('120363043968066561@g.us')).toBe('120363043968066561@g.us');
  });

  it('formats display phone number', () => {
    expect(formatDisplayPhone('79991234567')).toBe('+7 (999) 123-45-67');
    expect(formatDisplayPhone('79991234567@c.us')).toBe('+7 (999) 123-45-67');
  });

  it('formats message time', () => {
    const timestamp = new Date('2026-10-16T14:30:00').getTime();
    const formatted = formatMessageTime(timestamp);
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  it('extracts initials properly', () => {
    expect(getInitials('Иван')).toBe('ИВ');
    expect(getInitials('79991234567')).toBe('67');
  });
});
