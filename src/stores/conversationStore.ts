import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  source: 'chat' | 'voice';
  status?: 'sending' | 'success' | 'error';
}

interface ConversationStore {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  appendChunk: (id: string, chunk: string) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  messages: [
    {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Hello. I am SHRAVA. How can I assist you today?',
      timestamp: new Date(),
      source: 'chat',
      status: 'success'
    }
  ],
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: message.id || (Date.now().toString() + Math.random().toString(36).substring(7)),
        timestamp: new Date(),
      }
    ]
  })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),
  appendChunk: (id, chunk) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, content: msg.content + chunk } : msg
    )
  })),
  clearConversation: () => set({ messages: [] })
}));
