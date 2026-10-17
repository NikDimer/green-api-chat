import type { Credentials, ReceiveNotificationResponse } from '../types';

export class GreenApiService {
  private credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = {
      ...credentials,
      apiUrl: credentials.apiUrl?.trim().replace(/\/+$/, '') || 'https://api.green-api.com',
    };
  }

  private getBaseUrl(): string {
    return `${this.credentials.apiUrl}/waInstance${this.credentials.idInstance}`;
  }

  /**
   * Send a text message to recipient chatId
   * Method: POST {{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}
   */
  async sendMessage(chatId: string, message: string): Promise<{ idMessage: string }> {
    const url = `${this.getBaseUrl()}/sendMessage/${this.credentials.apiTokenInstance}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Ошибка отправки (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errorMsg = errJson.message;
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  /**
   * Receive a notification from the queue using HTTP API
   * Method: GET {{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}?receiveTimeout={{receiveTimeout}}
   */
  async receiveNotification(receiveTimeout: number = 5): Promise<ReceiveNotificationResponse | null> {
    const url = `${this.getBaseUrl()}/receiveNotification/${this.credentials.apiTokenInstance}?receiveTimeout=${receiveTimeout}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMsg = `Ошибка получения (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errorMsg = errJson.message;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data || !data.receiptId) {
      return null;
    }

    return data as ReceiveNotificationResponse;
  }

  /**
   * Delete a notification from the queue after processing
   * Method: DELETE {{apiUrl}}/waInstance{{idInstance}}/deleteNotification/{{apiTokenInstance}}/{{receiptId}}
   */
  async deleteNotification(receiptId: number): Promise<{ result: boolean; reason?: string }> {
    const url = `${this.getBaseUrl()}/deleteNotification/${this.credentials.apiTokenInstance}/${receiptId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMsg = `Ошибка удаления уведомления #${receiptId} (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.message) errorMsg = errJson.message;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  /**
   * Check connection status of the instance
   * Method: GET {{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}
   */
  async getStateInstance(): Promise<{ stateInstance: string }> {
    const url = `${this.getBaseUrl()}/getStateInstance/${this.credentials.apiTokenInstance}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Не удалось получить статус инстанса: HTTP ${response.status}`);
    }

    return response.json();
  }
}
