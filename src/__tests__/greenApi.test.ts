import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GreenApiService } from '../services/greenApi';

describe('GreenApiService', () => {
  const credentials = {
    idInstance: '1101823456',
    apiTokenInstance: 'test_token_abc123',
    apiUrl: 'https://api.green-api.com',
  };

  let api: GreenApiService;

  beforeEach(() => {
    api = new GreenApiService(credentials);
    vi.restoreAllMocks();
  });

  it('correctly constructs SendMessage request', async () => {
    const mockResponse = { idMessage: 'ABC123456789' };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await api.sendMessage('79991234567@c.us', 'Привет из MAX!');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/sendMessage/test_token_abc123',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: '79991234567@c.us',
          message: 'Привет из MAX!',
        }),
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('handles SendMessage error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid chatId' }),
    } as Response);

    await expect(api.sendMessage('invalid', 'Тест')).rejects.toThrow('Invalid chatId');
  });

  it('correctly calls ReceiveNotification with receiveTimeout', async () => {
    const mockNotification = {
      receiptId: 987654,
      body: {
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1697450000,
        idMessage: 'MSG_999',
        senderData: {
          chatId: '79991234567@c.us',
          sender: '79991234567@c.us',
          senderName: 'Тестовый Пользователь',
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: 'Ответ из мессенджера MAX!',
          },
        },
      },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockNotification,
    } as Response);

    const result = await api.receiveNotification(5);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/receiveNotification/test_token_abc123?receiveTimeout=5',
      { method: 'GET' }
    );
    expect(result).toEqual(mockNotification);
  });

  it('returns null if ReceiveNotification times out without messages', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    const result = await api.receiveNotification(5);
    expect(result).toBeNull();
  });

  it('correctly calls DeleteNotification with receiptId', async () => {
    const mockDeleteResponse = { result: true };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDeleteResponse,
    } as Response);

    const result = await api.deleteNotification(987654);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/deleteNotification/test_token_abc123/987654',
      { method: 'DELETE' }
    );
    expect(result).toEqual(mockDeleteResponse);
  });

  it('correctly checks getStateInstance', async () => {
    const mockState = { stateInstance: 'authorized' };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockState,
    } as Response);

    const result = await api.getStateInstance();

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/getStateInstance/test_token_abc123',
      { method: 'GET' }
    );
    expect(result).toEqual(mockState);
  });
});
