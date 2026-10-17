export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'user' | 'recipient';
  text: string;
  timestamp: number; // Unix ms
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
}

export interface Chat {
  id: string; // e.g. 79991234567@c.us
  phoneNumber: string; // e.g. 79991234567
  name?: string;
  avatarColor: string;
  unreadCount?: number;
  lastMessage?: {
    text: string;
    timestamp: number;
    sender: 'user' | 'recipient';
  };
}

export interface ApiLog {
  id: string;
  time: string;
  type: 'send' | 'receive' | 'delete' | 'status' | 'error';
  title: string;
  details?: any;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData?: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData?: {
      chatId: string;
      sender: string;
      senderName?: string;
      senderContactName?: string;
    };
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
      extendedTextMessageData?: {
        text: string;
      };
    };
  };
}
