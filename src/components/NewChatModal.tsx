import React, { useState } from 'react';
import { X, UserPlus, Phone, AlertCircle } from 'lucide-react';
import { formatChatId, normalizePhoneNumber } from '../utils/formatters';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chatId: string, phone: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreateChat }) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = normalizePhoneNumber(phoneInput);
    if (!clean || clean.length < 5) {
      setError('Введите корректный номер телефона (минимум 5 цифр)');
      return;
    }

    const chatId = formatChatId(phoneInput);
    onCreateChat(chatId, clean);
    setPhoneInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Новый диалог</h3>
              <p className="text-[11px] text-slate-500">MAX / WhatsApp получатель</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Номер телефона получателя
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                autoFocus
                placeholder="например: 79991234567"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 text-sm font-mono placeholder:font-sans"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Номер с кодом страны без плюса или спецсимволов.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              Начать чат
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
