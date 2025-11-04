'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { Search, Users, Sparkles, Globe } from 'lucide-react';

interface SuggestedActionsProps {
  chatId?: string;
  append: (message: any) => void;
}

const SUGGESTED_ACTIONS = [
  {
    title: 'Find Startups',
    label: 'Global',
    action: 'Find Startups Worldwide',
    icon: <Globe size={18} className="text-black" />,
  },
  {
    title: 'Connect with',
    label: 'Tech Professionals',
    action: 'Connect with Tech Professionals',
    icon: <Users size={18} className="text-black" />,
  },
  {
    title: 'Find',
    label: 'Finance Experts',
    action: 'Find Finance Experts',
    icon: <Search size={18} className="text-black" />,
  },
  {
    title: 'Find',
    label: 'Remote Work',
    action: 'Find Remote Work Opportunities',
    icon: <Sparkles size={18} className="text-black" />,
  },
];

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  return (<div
    data-testid="suggested-actions"
    className="grid grid-cols-2 gap-2 w-full"
  >
    {SUGGESTED_ACTIONS.map((suggestedAction, index) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.05 * index }}
        key={`suggested-action-${suggestedAction.title}-${index}`}
      >
        <Button
          variant="ghost"
          onClick={async () => {
            window.history.replaceState({}, '', `/chat/${chatId}`);
            append({
              role: 'user',
              content: suggestedAction.action,
            });
          }}
          className="text-left border rounded-xl px-4 py-3.5 text-sm flex flex-col items-start justify-start w-full h-auto gap-1"
        >
          <div className="flex items-center gap-2 w-full">
            {suggestedAction.icon}
            <span className="font-medium text-black truncate w-full">{suggestedAction.title}</span>
          </div>
          <span className="text-black text-sm truncate w-full">
            {suggestedAction.label}
          </span>
        </Button>

      </motion.div>
    ))}
  </div>

  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
