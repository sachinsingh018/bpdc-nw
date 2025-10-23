'use client';
import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import { Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/toast';
import { getCookie } from 'cookies-next';
import type { Vote } from '@/lib/db/schema';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { MessageReasoning } from './message-reasoning';
import { UseChatHelpers } from '@ai-sdk/react';
import { EnhancedMessageActions } from './enhanced-message-actions';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';


const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [cardCount, setCardCount] = useState(4);
  const shouldShowArchiveButton = true;

  const emailid = getCookie('userEmail') || 'ss@d.com';
  useEffect(() => {
    const updateCount = () => {
      setCardCount(window.innerWidth < 768 ? 1 : 4);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);



  // Handle message parts
  return (
    <>
      <AnimatePresence>
        <motion.div
          data-testid={`message-${message.role}`}
          className="w-full mx-auto max-w-3xl px-4 group/message"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          data-role={message.role}
        >
          <div
            className={cn(
              'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
              {
                'w-full': mode === 'edit',
                'group-data-[role=user]/message:w-fit': mode !== 'edit',
              },
            )}
          >
            {message.role === 'assistant' && (
              <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                <div className="translate-y-px">
                  <SparklesIcon size={14} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              {message.experimental_attachments && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

              {message.parts?.map((part, index) => {
                const { type } = part;
                const key = `message-${message.id}-part-${index}`;
                const totalWordCount =
                  message.parts?.reduce((acc, part) => {
                    if (part.type === 'text') {
                      const wordCount = part.text.trim().split(/\s+/).length;
                      return acc + wordCount;
                    }
                    return acc;
                  }, 0) ?? 0;

                const shouldShowPremiumBlock = message.role === 'assistant' && totalWordCount > 100;

                if (type === 'reasoning') {
                  return (
                    <MessageReasoning
                      key={key}
                      isLoading={isLoading}
                      reasoning={part.reasoning}
                    />
                  );
                }

                if (type === 'text') {
                  if (mode === 'view') {
                    return (
                      <div key={key} className="flex flex-col gap-2 items-start">
                        <div className="flex flex-row gap-2 items-start">
                          {message.role === 'user' && !isReadonly && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  data-testid="message-edit-button"
                                  variant="ghost"
                                  className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                                  onClick={() => {
                                    setMode('edit');
                                  }}
                                >
                                  <PencilEditIcon />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit message</TooltipContent>
                            </Tooltip>
                          )}

                          <div
                            data-testid="message-content"
                            className={cn('flex flex-col gap-4', {
                              'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                                message.role === 'user',
                            })}
                          >
                            {/* <Markdown>{part.text}</Markdown> */}
                            {(() => {
                              // Always render the full text, don't truncate based on loading state
                              if (index !== message.parts.length - 1) {
                                return <Markdown>{part.text}</Markdown>;
                              }

                              try {
                                let text = part.text;
                                if (typeof text !== 'string') text = JSON.stringify(text);

                                // Only process JSON if the text looks like JSON
                                if (text.trim().startsWith('```json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
                                  text = text
                                    .replace(/^```json/, '')
                                    .replace(/^```/, '')
                                    .replace(/```$/, '')
                                    .trim();
                                }

                                const parsed = JSON.parse(text);
                                const isValidArray =
                                  Array.isArray(parsed) &&
                                  parsed.length > 0 &&
                                  parsed.every(
                                    (item) => item?.["contact details"] && item?.desc
                                  );

                                if (isValidArray) {
                                  function formatContactDetails(details: string) {
                                    const parts = details.split(/(https?:\/\/[^\s,]+|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g);
                                    return parts.map((part, i) => {
                                      if (/^https?:\/\//.test(part)) {
                                        return (
                                          <a
                                            key={i}
                                            href={part}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline hover:text-purple-400"
                                          >
                                            {part}
                                          </a>
                                        );
                                      } else if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(part)) {
                                        return (
                                          <a
                                            key={i}
                                            href={`mailto:${part}`}
                                            className="text-blue-400 underline hover:text-purple-400"
                                          >
                                            {part}
                                          </a>
                                        );
                                      }
                                      return <span key={i}>{part}</span>;
                                    });
                                  }
                                  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
                                    return (
                                      <div className="relative">
                                        {/* Enhanced Cards Container */}
                                        <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 shadow-lg"
                                        >
                                          <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                              {parsed.length} {parsed.length === 1 ? 'Result' : 'Results'} Found
                                            </h3>
                                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                              AI Generated
                                            </Badge>
                                          </div>
                                          <div className="space-y-4">
                                            {parsed.map((item, index) => (
                                              <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                              >
                                                <EnhancedMessageActions
                                                  personData={{
                                                    name: item.name,
                                                    email: item.email || undefined,
                                                    phone: item.phone,
                                                    contact_details: item['contact details'] || item.contact_details,
                                                    desc: item.desc,
                                                    match_percentage: item.match_percentage
                                                  }}
                                                  onActionComplete={() => {
                                                    console.log('Connection action completed for:', item.name);
                                                  }}
                                                />
                                              </motion.div>
                                            ))}
                                          </div>
                                        </motion.div>
                                      </div>
                                    );
                                  }
                                  if (Array.isArray(parsed) && parsed.length === 0) {
                                    return (
                                      <div className="text-center text-muted-foreground py-4">
                                        No relevant results found. Try a different question 💡
                                      </div>
                                    );
                                  }
                                }
                                // If not the array, fall back to Markdown
                                return <Markdown>{part.text}</Markdown>;
                              } catch (e) {
                                // If not valid JSON, fallback
                                return <Markdown>{part.text}</Markdown>;
                              }
                            })()}

                          </div>
                        </div>

                        {/* Blur Overlay with Premium Message */}
                        {shouldShowPremiumBlock && (
                          <div className="w-full mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 blur-sm opacity-60 select-none">
                              {Array.from({ length: cardCount }).map((_, index) => (
                                <div
                                  key={index}
                                  className="rounded-xl p-5 text-white shadow-lg shadow-purple-500/50 relative"
                                  style={{
                                    backgroundColor: '#0E0B1E',
                                    minHeight: '180px',
                                  }}
                                >
                                  <p className="font-bold text-lg mb-1 mt-6 bg-zinc-700 h-5 w-1/2 rounded" />
                                  <p className="text-sm text-green-400 mb-2 bg-zinc-800 h-4 w-1/4 rounded" />
                                  <p className="text-sm text-zinc-200 bg-zinc-900 h-16 w-full rounded" />
                                </div>
                              ))}
                            </div>
                            <p className="mt-3 text-center text-sm text-zinc-500">
                              🔒 This part of the response will be available with premium access.

                            </p>
                          </div>
                        )}

                      </div>
                    );
                  }

                  if (mode === 'edit') {
                    return (
                      <div key={key} className="flex flex-row gap-2 items-start">
                        <div className="size-8" />

                        <MessageEditor
                          key={message.id}
                          message={message}
                          setMode={setMode}
                          setMessages={setMessages}
                          reload={reload}
                        />
                      </div>
                    );
                  }
                }
              })}

              {/* {!isReadonly && (
                  <MessageActions
                    key={`action-${message.id}`}
                    chatId={chatId}
                    message={message}
                    vote={vote}
                    isLoading={isLoading}
                  />
                )} */}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
