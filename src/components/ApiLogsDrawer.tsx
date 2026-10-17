import React from 'react';
import type { ApiLog } from '../types';
import { X, Trash2, Activity, ArrowDownLeft, Trash, Radio } from 'lucide-react';

interface ApiLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ApiLog[];
  onClear: () => void;
  pollingStatus: 'idle' | 'listening' | 'received' | 'error';
}

export const ApiLogsDrawer: React.FC<ApiLogsDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
  pollingStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-800 text-xs">
            Логи очереди (HTTP API)
          </h3>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              pollingStatus === 'listening'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : pollingStatus === 'received'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : pollingStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pollingStatus === 'listening' && 'Ожидание (Receive)'}
            {pollingStatus === 'received' && 'Получено!'}
            {pollingStatus === 'error' && 'Ошибка'}
            {pollingStatus === 'idle' && 'Пауза'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            title="Очистить логи"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info notice */}
      <div className="px-3 py-2 bg-blue-50/50 border-b border-blue-100/60 text-[11px] text-blue-700 leading-tight">
        Запросы выполняются по технологии HTTP API (методы <code className="font-mono font-semibold">ReceiveNotification</code> и <code className="font-mono font-semibold">DeleteNotification</code>).
      </div>

      {/* Logs container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-center py-12">
            <div>
              <Radio className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-[11px]">Логи очереди пока пусты</p>
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const isReceive = log.type === 'receive';
            const isDelete = log.type === 'delete';
            const isError = log.type === 'error';
            const isStatus = log.type === 'status';

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                  isReceive
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : isDelete
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                    : isError
                    ? 'bg-red-50/60 border-red-200 text-red-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-sans font-semibold">
                    {isReceive && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />}
                    {isDelete && <Trash className="w-3.5 h-3.5 text-amber-600" />}
                    {isError && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    {isStatus && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span>{log.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
                {log.details && (
                  <pre className="mt-1 p-1.5 rounded-md bg-black/5 overflow-x-auto text-[10px] text-slate-600 whitespace-pre-wrap">
                    {typeof log.details === 'object'
                      ? JSON.stringify(log.details, null, 2)
                      : String(log.details)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
