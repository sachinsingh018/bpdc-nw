'use client';
import { neon } from "@neondatabase/serverless";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useState } from 'react';
import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilityType, VisibilitySelector } from './visibility-selector';
import Image from 'next/image';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  // State for LinkedIn URL, personal info, and modal visibility
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<string | null>(null); // New state for personal info
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Function to handle LinkedIn URL input
  const handleLinkedinClick = () => {
    setIsModalOpen(true); // Open modal when button is clicked
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior (reload)

    // Extract the data from the form
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get('linkedinUrl') as string;
    const personalInfoValue = formData.get('personalInfo') as string;

    // Validate the data before proceeding
    if (!url) {
      console.error('LinkedIn URL is required');
      return;
    }

    setLinkedinUrl(url);
    setPersonalInfo(personalInfoValue); // Save personal info

    // Log the data to confirm it's captured correctly
    console.log('LinkedIn URL saved:', url);
    console.log('Personal Info saved:', personalInfoValue);

    // Make the API call to ProxyCurl
    try {
      const apiKey = 'hZ7JOTaOzvR-2KuXhW51ew'; // Replace this with your actual API key
      const response = await fetch(`/api/proxycurl?url=${encodeURIComponent(url)}`);


      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      console.log('LinkedIn Data:', result); // Log the result

    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
    }

    setIsModalOpen(false); // Close the modal after submission
  };

  return (
    <header className="flex sticky top-0 z-10 backdrop-blur-xl bg-transparent dark:bg-transparent py-1.5 items-center px-2 md:px-2 gap-2">
      {/* <SidebarToggle /> */}


      <div className="absolute left-1/2 transform -translate-x-1/2 text-lg md:text-xl font-bold text-black dark:text-white pointer-events-none">
        🤖 Networkqy Copilot
      </div>

      {/* {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )} */}

      {/* LinkedIn URL button */}
      {/* <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        onClick={handleLinkedinClick}
      >
        Add info for personalized answers
      </Button> */}

      {/* Modal for LinkedIn URL and Personal Info input */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-96 transform -translate-y-16">
            <h3 className="text-xl text-black dark:text-white mb-4">LinkedIn or Personal Info</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="url"
                name="linkedinUrl"
                placeholder="https://www.linkedin.com/in/your-profile"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-zinc-700 text-black dark:text-white"
                required
              />
              <textarea
                name="personalInfo"
                placeholder="Enter any personal information (optional)"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-zinc-700 text-black dark:text-white"
                rows={2}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  className="bg-gray-300 dark:bg-zinc-600 text-black dark:text-white px-4 py-2 rounded-lg"
                  onClick={() => setIsModalOpen(false)} // Close modal
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
