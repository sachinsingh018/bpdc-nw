import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { SidebarLeftIcon } from './icons';
import { Button } from './ui/button';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
  onClick={toggleSidebar}
  variant="outline"
  className={`md:px-2 md:h-fit bg-gray-800/20 hover:bg-gray-800 transition-colors ${className}`}
>
  <span className="text-gray-400">
    <SidebarLeftIcon size={16} />
  </span>
</Button>

      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
