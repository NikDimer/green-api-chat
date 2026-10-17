import React, { useState, useEffect, useCallback } from 'react';
import type { Credentials, Chat, Message } from './types';
import { GreenApiService } from './services/greenApi';
import { useNotificationPolling } from './hooks/useNotificationPolling';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { EmptyState } from './components/EmptyState';
import { AuthModal } from './components/AuthModal';
import { NewChatModal } from './components/NewChatModal';
import { ApiLogsDrawer } from './components/ApiLogsDrawer';
import { getAvatarColor } from './utils/formatters';

const STORAGE_KEY_CREDS = 'green_api_credentials';
const STORAGE_KEY_CHATS = 'green_api_chats';
const STORAGE_KEY_MESSAGES = 'green_api_messages';

export const App: React.FC = () => {
  // 1. Credentials
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(!credentials);

  // 2. Chats & Active Chat
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHATS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // 3. Messages dictionary { [chatId]: Message[] }
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // UI state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    if (credentials) {
      localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(STORAGE_KEY_CREDS);
    }
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesByChat));
  }, [messagesByChat]);

  // Handle incoming message from polling
  const handleIncomingMessage = useCallback((msg: Message, senderName?: string) => {
    setMessagesByChat((prev) => {
      const existing = prev[msg.chatId] || [];
      if (existing.some((m) => m.id === msg.id)) {
        return prev;
      }
      return {
        ...prev,
        [msg.chatId]: [...existing, msg],
      };
    });

    setChats((prev) => {
      const chatIndex = prev.findIndex((c) => c.id === msg.chatId);
      const lastMessage = {
        text: msg.text,
        timestamp: msg.timestamp,
        sender: 'recipient' as const,
      };

      if (chatIndex !== -1) {
        const updated = [...prev];
        updated[chatIndex] = {
          ...updated[chatIndex],
          name: senderName || updated[chatIndex].name,
          lastMessage,
        };
        const [moved] = updated.splice(chatIndex, 1);
        return [moved, ...updated];
      } else {
        const phone = msg.chatId.split('@')[0];
        const newChat: Chat = {
          id: msg.chatId,
          phoneNumber: phone,
          name: senderName,
          avatarColor: getAvatarColor(msg.chatId),
          lastMessage,
        };
        return [newChat, ...prev];
      }
    });
  }, []);

  // Polling Hook for HTTP API ReceiveNotification / DeleteNotification
  const { isPolling, pollingStatus, apiLogs, clearLogs } = useNotificationPolling({
    credentials,
    isEnabled: !!credentials,
    onMessageReceived: handleIncomingMessage,
  });

  // Handle Send Message
  const handleSendMessage = async (text: string) => {
    if (!credentials || !activeChatId) return;

    setIsSending(true);
    setErrorToast(null);

    const tempId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now();

    const optimisticMsg: Message = {
      id: tempId,
      chatId: activeChatId,
      sender: 'user',
      text,
      timestamp,
      status: 'pending',
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), optimisticMsg],
    }));

    setChats((prev) => {
      const index = prev.findIndex((c) => c.id === activeChatId);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        lastMessage: {
          text,
          timestamp,
          sender: 'user',
        },
      };
      const [moved] = updated.splice(index, 1);
      return [moved, ...updated];
    });

    try {
      const api = new GreenApiService(credentials);
      const res = await api.sendMessage(activeChatId, text);

      setMessagesByChat((prev) => {
        const list = prev[activeChatId] || [];
        return {
          ...prev,
          [activeChatId]: list.map((m) =>
            m.id === tempId ? { ...m, id: res.idMessage || tempId, status: 'sent' } : m
          ),
        };
      });
    } catch (err: any) {
      console.error('Send message failed:', err);
      setErrorToast(err.message || 'Ошибка отправки сообщения');

      setMessagesByChat((prev) => {
        const list = prev[activeChatId] || [];
        return {
          ...prev,
          [activeChatId]: list.map((m) =>
            m.id === tempId ? { ...m, status: 'error' } : m
          ),
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateChat = (chatId: string, phone: string) => {
    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId);
      if (existing) {
        return prev;
      }
      const newChat: Chat = {
        id: chatId,
        phoneNumber: phone,
        avatarColor: getAvatarColor(chatId),
      };
      return [newChat, ...prev];
    });
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessagesByChat((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleClearHistory = (chatId: string) => {
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [],
    }));
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, lastMessage: undefined } : c))
    );
  };

  const handleLogout = () => {
    if (confirm('Выйти из текущего аккаунта GREEN-API?')) {
      setCredentials(null);
      setIsAuthOpen(true);
    }
  };

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeMessages = activeChatId ? messagesByChat[activeChatId] || [] : [];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-100 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        credentials={credentials}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={() => setIsNewChatOpen(true)}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
        isPolling={isPolling}
        onToggleLogs={() => setIsLogsOpen(!isLogsOpen)}
        isLogsOpen={isLogsOpen}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {errorToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <span>{errorToast}</span>
            <button
              onClick={() => setErrorToast(null)}
              className="ml-2 font-bold opacity-80 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {activeChat ? (
          <ChatArea
            chat={activeChat}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            isSending={isSending}
          />
        ) : (
          <EmptyState onNewChat={() => setIsNewChatOpen(true)} />
        )}
      </main>

      {/* Queue / HTTP API Logs Drawer */}
      <ApiLogsDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={apiLogs}
        onClear={clearLogs}
        pollingStatus={pollingStatus}
      />

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          initialCredentials={credentials}
          onSave={(creds) => {
            setCredentials(creds);
            setIsAuthOpen(false);
          }}
        />
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

export default App;
