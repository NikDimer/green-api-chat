import { useEffect, useRef, useState, useCallback } from 'react';
import type { ApiLog, Credentials, Message, ReceiveNotificationResponse } from '../types';
import { GreenApiService } from '../services/greenApi';

interface UseNotificationPollingOptions {
  credentials: Credentials | null;
  isEnabled: boolean;
  onMessageReceived: (message: Message, senderName?: string) => void;
}

export function useNotificationPolling({
  credentials,
  isEnabled,
  onMessageReceived,
}: UseNotificationPollingOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'listening' | 'received' | 'error'>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const isCancelledRef = useRef(false);
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const addLog = useCallback((log: Omit<ApiLog, 'id' | 'time'>) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...log,
    };
    setApiLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  const clearLogs = useCallback(() => {
    setApiLogs([]);
  }, []);

  useEffect(() => {
    if (!credentials || !credentials.idInstance || !credentials.apiTokenInstance || !isEnabled) {
      return;
    }

    isCancelledRef.current = false;
    const api = new GreenApiService(credentials);

    const pollLoop = async () => {
      setIsPolling(true);
      addLog({
        type: 'status',
        title: 'Запущен опрос очереди (HTTP API ReceiveNotification)',
      });

      while (!isCancelledRef.current) {
        try {
          setPollingStatus('listening');

          // 1. ReceiveNotification with 5 second timeout
          const notification: ReceiveNotificationResponse | null = await api.receiveNotification(5);

          if (isCancelledRef.current) break;

          if (notification && notification.receiptId) {
            setPollingStatus('received');
            const { receiptId, body } = notification;

            addLog({
              type: 'receive',
              title: `Получено уведомление #${receiptId} (${body?.typeWebhook || 'unknown'})`,
              details: body,
            });

            // Handle incoming text message
            if (body && body.typeWebhook === 'incomingMessageReceived') {
              const text =
                body.messageData?.textMessageData?.textMessage ||
                body.messageData?.extendedTextMessageData?.text ||
                '';
              const chatId = body.senderData?.chatId || '';
              const senderName = body.senderData?.senderName || body.senderData?.senderContactName;
              const msgTimestamp = body.timestamp ? body.timestamp * 1000 : Date.now();

              if (text && chatId) {
                const newMsg: Message = {
                  id: body.idMessage || Math.random().toString(36).substring(2, 9),
                  chatId,
                  sender: 'recipient',
                  text,
                  timestamp: msgTimestamp,
                  status: 'read',
                };
                onMessageReceivedRef.current(newMsg, senderName);
              }
            }

            // 2. DeleteNotification to acknowledge and remove from FIFO queue
            try {
              const delRes = await api.deleteNotification(receiptId);
              addLog({
                type: 'delete',
                title: `Удалено уведомление #${receiptId}`,
                details: delRes,
              });
            } catch (delErr: any) {
              console.error('DeleteNotification error:', delErr);
              addLog({
                type: 'error',
                title: `Ошибка удаления уведомления #${receiptId}`,
                details: delErr.message,
              });
            }
          }

          setLastError(null);
        } catch (err: any) {
          if (isCancelledRef.current) break;
          console.warn('Polling error:', err);
          setPollingStatus('error');
          setLastError(err.message || 'Ошибка сети');
          addLog({
            type: 'error',
            title: 'Ошибка ReceiveNotification',
            details: err.message,
          });

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      setIsPolling(false);
      setPollingStatus('idle');
    };

    pollLoop();

    return () => {
      isCancelledRef.current = true;
      setIsPolling(false);
      setPollingStatus('idle');
    };
  }, [credentials, isEnabled, addLog]);

  return {
    isPolling: !!credentials && isEnabled && isPolling,
    pollingStatus: !!credentials && isEnabled ? pollingStatus : 'idle',
    lastError,
    apiLogs,
    clearLogs,
  };
}
