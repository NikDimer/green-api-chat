import React, { useState } from 'react';
import type { Credentials } from '../types';
import { GreenApiService } from '../services/greenApi';
import { ShieldCheck, Server, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  initialCredentials: Credentials | null;
  onSave: (creds: Credentials) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialCredentials, onSave }) => {
  const [idInstance, setIdInstance] = useState(initialCredentials?.idInstance || '');
  const [apiTokenInstance, setApiTokenInstance] = useState(initialCredentials?.apiTokenInstance || '');
  const [apiUrl, setApiUrl] = useState(initialCredentials?.apiUrl || 'https://api.green-api.com');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = idInstance.trim();
    const cleanToken = apiTokenInstance.trim();
    const cleanUrl = apiUrl.trim() || 'https://api.green-api.com';

    if (!cleanId) {
      setError('Введите idInstance (числовой идентификатор)');
      return;
    }
    if (!cleanToken) {
      setError('Введите apiTokenInstance');
      return;
    }

    setLoading(true);
    try {
      const api = new GreenApiService({
        idInstance: cleanId,
        apiTokenInstance: cleanToken,
        apiUrl: cleanUrl,
      });

      await api.getStateInstance();

      onSave({
        idInstance: cleanId,
        apiTokenInstance: cleanToken,
        apiUrl: cleanUrl,
      });
    } catch (err: any) {
      console.warn('Authentication check notice:', err);
      if (err.message && err.message.includes('401')) {
        setError('Неверные учетные данные (401 Unauthorized). Проверьте idInstance и apiTokenInstance.');
      } else {
        // Still allow to proceed with warning if user confirms credentials
        onSave({
          idInstance: cleanId,
          apiTokenInstance: cleanToken,
          apiUrl: cleanUrl,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Вход в MAX Chat</h2>
          <p className="text-blue-100 text-sm mt-1">Интеграция с GREEN-API</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              idInstance *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="например: 1101823456"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400 text-sm font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              apiTokenInstance *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="например: d75b3b44b8..."
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400 text-sm font-mono transition-all"
              />
            </div>
          </div>

          {/* Advanced options toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              {showAdvanced ? 'Скрыть параметры хоста' : 'Параметры API Host (опционально)'}
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  API Host URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.green-api.com"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  По умолчанию используется <code className="text-slate-700">https://api.green-api.com</code>
                </p>
              </div>
            )}
          </div>

          {/* Helper info */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              Учетные данные можно скопировать в личном кабинете{' '}
              <a
                href="https://console.green-api.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline hover:text-blue-900"
              >
                GREEN-API Console
              </a>.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Проверка подключения...</span>
              </>
            ) : (
              <>
                <span>Войти в чат</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
