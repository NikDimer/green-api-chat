import React, { useState, useRef, useEffect } from 'react';
import type { Chat, Message } from '../types';
import { Send, CheckCheck, Loader2, Phone, MoreVertical, Trash2 } from 'lucide-react';
import { formatDisplayPhone, formatMessageTime, getInitials } from '../utils/formatters';

interface ChatAreaProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: (chatId: string) => void;
  isSending: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  onSendMessage,
  onClearHistory,
  isSending,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chat.id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setInputText('');
    await onSendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = chat.name || formatDisplayPhone(chat.phoneNumber);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f6f8] relative overflow-hidden">
      {/* Chat Top Bar */}
      <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: chat.avatarColor }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
          >
            {getInitials(chat.name || chat.phoneNumber)}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm leading-tight">
              {displayName}
            </h2>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MAX Мессенджер ({chat.phoneNumber})
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm('Очистить историю сообщений этого чата?')) {
                    onClearHistory(chat.id);
                  }
                }}
                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить переписку</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16 select-none">
            <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-slate-600 font-medium">История сообщений пуста</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Напишите первое сообщение пользователю в MAX, и ответ появится прямо здесь.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs relative group break-words whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {!isUser && (
                    <div className="text-[10px] font-semibold text-blue-600 mb-0.5">
                      {displayName}
                    </div>
                  )}

                  <div>{msg.text}</div>

                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isUser && (
                      <span>
                        {msg.status === 'pending' ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : msg.status === 'error' ? (
                          <span className="text-red-300">!</span>
                        ) : (
                          <CheckCheck className="w-3 h-3 text-blue-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-5xl mx-auto">
          <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Напишите сообщение в MAX (Enter для отправки)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none max-h-32"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 -ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
