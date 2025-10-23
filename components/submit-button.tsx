'use client';

import { useFormStatus } from 'react-dom';
import { LoaderIcon } from '@/components/icons';
import { Button } from './ui/button';

export function SubmitButton({
  children,
  isSuccessful,
  isLoading = false,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
  isLoading?: boolean;
}) {
  const { pending } = useFormStatus();

  const loading = pending || isLoading;

  return (
    <Button
      type={loading ? 'button' : 'submit'}
      aria-disabled={loading || isSuccessful}
      disabled={loading || isSuccessful}
      className="w-full bg-[#0E0B1E] hover:bg-[#1c1735] text-white font-semibold py-3 rounded-lg text-lg mb-4 transition shadow-lg shadow-purple-500/50 relative flex items-center justify-center"
    >
      {children}

      {(loading || isSuccessful) && (
        <span className="absolute right-4 animate-spin">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {loading || isSuccessful ? 'Loading' : 'Submit form'}
      </output>
    </Button>
  );
}
