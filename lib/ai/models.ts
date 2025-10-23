export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'Gemini 2.5',
    name: 'Chat model with Gemini',
    description: 'Primary model for Gemini Chat',
  },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Reasoning model',
  //   description: 'Uses advanced reasoning',
  // },
];
