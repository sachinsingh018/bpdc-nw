import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

import { groq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createPerplexity } from '@ai-sdk/perplexity';

import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// 🧠 Create instance of Perplexity model
const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY ?? '',
});

// export const google = createGoogleGenerativeAI({
//   apiKey: 'AIzaSyAijKl9aM804QmSVYV1H0DYTkimtkG4KPQ'
// });

export const myProvider = isTestEnvironment
  ? customProvider({
    languageModels: {
      'chat-model': chatModel,
      'chat-model-reasoning': reasoningModel,
      // 'title-model': titleModel,
      // 'artifact-model': artifactModel,
    },
  })
  : customProvider({
    languageModels: {
      // 🧠 Replace chat-model with Perplexity here if preferred
      'chat-model': perplexity('sonar'), // or 'sonar-medium-online'

      // 🧠 Optional: wrap Perplexity with reasoning middleware
      'chat-model-reasoning': wrapLanguageModel({
        model: perplexity('sonar'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),

      // 'title-model': google('gemini-2.0-flash'),
      // 'artifact-model': google('gemini-2.0-flash'),
    },
    imageModels: {
      'small-model': xai.image('grok-2-image'),
    },
  });
