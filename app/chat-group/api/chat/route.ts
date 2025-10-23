import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { getCookie } from 'cookies-next';

import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
// import { createDocument } from '@/lib/ai/tools/create-document';
// import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
// import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      messages,
      selectedChatModel,
      systemPrompt: customSystemPrompt,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
      systemPrompt?: string;
    } = body;

    // Skip session logic or authentication checks entirely
    const session = await auth(); // If there's a session, we just get it, if not, it's null

    // Use 'anonymous' as user ID if no session is found
    const userId = session?.user?.id || '1a17769c-5827-4325-94da-71ddeb5b6279'; // Default to 'anonymous' if no session
    let questioned = ''; // Default empty string
    let linkedindata = '';
    const emaili = getCookie('userEmail') || 'ss@d.com';

    try {
      const res = await fetch('http://localhost:3000/profile/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emaili }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await res.json();
          console.log('Fetched LinkedIn Data:', data?.linkedinInfo);

          if (data?.linkedinInfo) {
            linkedindata = data.linkedinInfo;
          }
        } else {
          console.log('Profile API returned non-JSON response, skipping LinkedIn data');
        }
      } else {
        console.log('Profile API returned non-OK status, skipping LinkedIn data');
      }
    } catch (error) {
      console.log('Error fetching LinkedIn data (non-critical):', error);
      // Continue without LinkedIn data - this is not critical for chat functionality
    }

    // const emaili = getCookie('userEmail') || 'sachintest@gmail.com';
    // Extract the most recent user message
    const userMessage = getMostRecentUserMessage(messages);
    if (userMessage?.parts[0]?.type === "text") {
      questioned = JSON.stringify(userMessage.parts[0].text, null, 2);

      console.log("🔍 Most recent user message:", questioned);
    } else {
      console.log("🔍 No text found in the most recent user message.");
    }
    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    let apiData = 11; // Default to generic handler

    // Enhanced local classification when external API is down
    const personSearchKeywords = [
      'find me', 'find', 'search for', 'look for', 'get me', 'show me',
      'who is', 'contact info', 'email', 'phone', 'linkedin', 'profile',
      'person', 'individual', 'professional', 'expert'
    ];

    const vcInvestorKeywords = [
      'vc', 'venture capital', 'investor', 'angel investor', 'funding', 'capital',
      'global vc', 'international investor', 'startup funding', 'seed funding', 'series a', 'series b',
      'email', 'contact', 'phone', 'reach out', 'get in touch',
      'startup', 'startups', 'company', 'companies', 'business'
    ];

    const networkingKeywords = [
      'network', 'networking', 'connect', 'connection', 'professional network',
      'meet', 'introduction', 'referral', 'collaboration', 'partnership'
    ];

    const isPersonSearch = personSearchKeywords.some(keyword =>
      questioned.toLowerCase().includes(keyword.toLowerCase())
    );

    const isVCInvestorSearch = vcInvestorKeywords.some(keyword =>
      questioned.toLowerCase().includes(keyword.toLowerCase())
    );

    const isNetworkingSearch = networkingKeywords.some(keyword =>
      questioned.toLowerCase().includes(keyword.toLowerCase())
    );

    // Try external API first, fallback to local classification
    try {
      const apiResponse = await fetch('http://13.53.132.115:2000/classify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questioned }),
      });

      if (apiResponse.ok) {
        apiData = await apiResponse.json();
        console.log('✅ External classification API working, using response:', apiData);
      } else {
        throw new Error('External API returned non-OK status');
      }
    } catch (err) {
      console.log('⚠️ External classification API unavailable, using local classification');

      if (isVCInvestorSearch) {
        console.log('🔍 Detected VC/Investor search, using enhanced contact prompt');
        apiData = 12; // Use the enhanced VC/Investor prompt
      } else if (isPersonSearch) {
        console.log('🔍 Detected person search, using structured prompt');
        apiData = 7; // Use the professional spotlight prompt
      } else if (isNetworkingSearch) {
        console.log('🔍 Detected networking search, using networking prompt');
        apiData = 8; // Use networking-specific prompt
      } else {
        console.log('🔍 Using default generic prompt');
        apiData = 11; // Default generic handler
      }
    }

    let apiData2: any = {
      message: 'No relevant data found for this question. Please respond based solely on the user input.',
      source: 'system',
    };

    // Only proceed with the external retrieval API if apiData is not 11 and external API is available
    if (apiData !== 11) {
      try {
        const apiResponse2 = await fetch('http://13.53.132.115:5003/retrieve/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: Number(apiData),
            text: questioned,
          }),
        });

        if (apiResponse2.ok) {
          apiData2 = await apiResponse2.json();
          console.log('✅ External retrieval API working, using response');
        } else {
          console.log('⚠️ External retrieval API returned non-OK status, using fallback');
        }
      } catch (err) {
        console.log('⚠️ External retrieval API unavailable, using fallback data');
        // Provide better fallback data based on the classification
        if (apiData === 12) { // VC/Investor search
          apiData2 = {
            message: 'There is a growing global startup ecosystem with various VCs and investors. I can help you find relevant contacts and information about the international investment landscape.',
            source: 'local_fallback'
          };
        } else if (apiData === 7) { // Person search
          apiData2 = {
            message: `I can help you find information about "${questioned}" globally. Here are some suggestions:

1. **Professional Networks**: Check LinkedIn for professionals with this name worldwide
2. **Company Directories**: Search for this person in international business directories
3. **Industry Events**: Look for this person in global professional events and conferences
4. **Social Media**: Check professional social media platforms
5. **Business Registries**: Search global business registries if they own a company

To get more specific results, please provide:
- Their industry or company name
- Their role or position
- Any specific location or country
- What type of connection you're looking for

Would you like me to help you craft a professional outreach message once you have more details?`,
            source: 'local_fallback'
          };
        } else if (apiData === 8) { // Networking
          apiData2 = {
            message: 'There are excellent networking opportunities through various professional events, business groups, and industry associations worldwide.',
            source: 'local_fallback'
          };
        } else if (apiData === 11) { // Generic handler
          apiData2 = {
            message: `I can help you with "${questioned}" in the context of professional networking globally. Here are some general suggestions:

**For Professional Networking:**
- Join global professional groups and associations
- Attend industry events and conferences in your region
- Connect with professionals in your field through LinkedIn
- Participate in international business networking events

**For Business Development:**
- Explore the global business ecosystem
- Connect with potential partners and clients
- Research industry trends in international markets
- Find mentors and advisors in your field

**For Career Growth:**
- Network with professionals in your industry
- Find job opportunities in companies worldwide
- Connect with recruiters and HR professionals
- Build relationships with industry leaders

Please provide more specific details about what you're looking for, and I can give you more targeted advice!`,
            source: 'local_fallback'
          };
        }
      }
    } else {
      console.log('ℹ️ Using default generic response (no external API needed)');
    }

    console.log('API2 Response:', apiData2);

    // const promptq = "User's Question " + questioned + " Relevant Data: " + String(apiData2);

    // const promptq = `User's Question: ${questioned}\nRelevant Data:\n${JSON.stringify(apiData2, null, 2)}`;
    let promptq = "";

    if (apiData !== 11) {
      promptq = `User's Question: ${questioned}\n`;
      //    Relevant Data:\n${JSON.stringify(apiData2, null, 2)}\nUser's LinkedIn Info (only use if the user refers to themselves in their question):\n${linkedindata}`;
    }
    else {
      promptq = questioned;
    }

    console.log("Full Question: ", promptq);
    // Get the existing chat or create a new one
    const chat = await getChatById({ id });
    if (!chat) {
      // If no chat, create it with either the authenticated user ID or anonymous
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId, title });
    } else {
      // If chat exists, just continue without checking user ID (no auth check)
      // This step assumes you want anyone to access the chat
    }

    // Save the user's message (authenticated or anonymous)
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    return createDataStreamResponse({
      execute: (dataStream) => {
        // Transform all messages to include conversation history for memory
        const transformedMessages: UIMessage[] = messages.map((message) => ({
          id: message.id,
          role: message.role,
          parts: message.parts,
          content: message.content || (message.parts[0]?.type === 'text' ? message.parts[0].text : ''),
          createdAt: message.createdAt,
        }));

        // Add the current user message if it's not already in the history
        const currentMessageExists = transformedMessages.some(msg => msg.id === userMessage.id);
        if (!currentMessageExists) {
          transformedMessages.push({
            id: userMessage.id,
            role: 'user',
            parts: userMessage.parts,
            content: userMessage.content || (userMessage.parts[0]?.type === 'text' ? userMessage.parts[0].text : ''),
            createdAt: new Date(),
          });
        }

        console.log(`📝 Sending ${transformedMessages.length} messages to AI for conversation memory`);

        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: customSystemPrompt || systemPrompt({ selectedChatModel: Number(apiData) }), // Use custom prompt if provided
          messages: transformedMessages, // Now includes full conversation history
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'gemini-2.0-flash'
              ? []
              : [
                // 'getWeather',
                // 'createDocument',
                // 'updateDocument',
                // 'requestSuggestions',
              ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            // // getWeather,
            // // createDocument: createDocument({
            //   // Providing a full fallback session object
            //   session: session || { user: { id: '1a17769c-5827-4325-94da-71ddeb5b6279' }, expires: new Date().toISOString() },  // Adding expires
            //   dataStream,
            // }),
            // // updateDocument: updateDocument({
            //   // Providing a full fallback session object
            //   session: session || { user: { id: '1a17769c-5827-4325-94da-71ddeb5b6279' }, expires: new Date().toISOString() },  // Adding expires
            //   dataStream,
            // }),
            // requestSuggestions:requestSuggestions({
            //   // Providing a full fallback session object
            //   session: session || { user: { id: '1a17769c-5827-4325-94da-71ddeb5b6279' }, expires: new Date().toISOString() },  // Adding expires
            //   dataStream,
            // }),
          },
          onFinish: async ({ response }) => {
            try {
              const assistantId = getTrailingMessageId({
                messages: response.messages.filter(
                  (message) => message.role === 'assistant',
                ),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [userMessage],
                responseMessages: response.messages,
              });

              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chatId: id,
                    role: assistantMessage.role,
                    parts: assistantMessage.parts,
                    attachments:
                      assistantMessage.experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (_) {
              console.error('Failed to save chat');
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error); // Log the error
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}



export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
