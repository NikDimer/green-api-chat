import React from 'react';
import { MessageSquareDashed, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNewChat: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-4 shadow-sm">
        <MessageSquareDashed className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Выберите чат для общения
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        Отправляйте и получайте сообщения в MAX через GREEN-API. Выберите существующий диалог из списка слева или создайте новый.
      </p>
      <button
        onClick={onNewChat}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Создать новый чат</span>
      </button>
    </div>
  );
};
