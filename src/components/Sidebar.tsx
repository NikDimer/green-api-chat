import React, { useState } from 'react';
import type { Chat, Credentials } from '../types';
import {
  MessageSquarePlus,
  Search,
  LogOut,
  Radio,
  Trash2,
} from 'lucide-react';
import { formatChatDate, formatDisplayPhone, getInitials } from '../utils/formatters';

interface SidebarProps {
  credentials: Credentials | null;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onLogout: () => void;
  isPolling: boolean;
  onToggleLogs: () => void;
  isLogsOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  credentials,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLogout,
  isPolling,
  onToggleLogs,
  isLogsOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.phoneNumber.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.lastMessage?.text && c.lastMessage.text.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-80 md:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-slate-900 text-sm leading-tight">MAX Web</h1>
              <span
                className={`w-2 h-2 rounded-full ${
                  isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
                title={isPolling ? 'HTTP API опрос активен' : 'Опрос остановлен'}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              id: {credentials?.idInstance || '—'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-600">
          <button
            onClick={onToggleLogs}
            title="Логи очереди HTTP API"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLogsOpen
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            <Radio className="w-4 h-4" />
          </button>
          <button
            onClick={onNewChat}
            title="Новый диалог"
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            title="Сменить аккаунт / Выйти"
            className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {searchQuery ? (
              <p>Ничего не найдено</p>
            ) : (
              <div className="space-y-2">
                <p>Список диалогов пуст</p>
                <button
                  onClick={onNewChat}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  + Начать первый диалог
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const displayName = chat.name || formatDisplayPhone(chat.phoneNumber);

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-blue-50/70 border-r-2 border-blue-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar */}
                <div
                  style={{ backgroundColor: chat.avatarColor }}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm"
                >
                  {getInitials(chat.name || chat.phoneNumber)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-semibold text-slate-900 text-xs truncate">
                      {displayName}
                    </h4>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                        {formatChatDate(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <p className="truncate text-[11px] leading-tight">
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.sender === 'user' && (
                            <span className="text-slate-400 mr-1">Вы:</span>
                          )}
                          {chat.lastMessage.text}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Нет сообщений</span>
                      )}
                    </p>

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      title="Удалить чат"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity ml-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
