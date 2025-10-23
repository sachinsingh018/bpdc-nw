import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SmoothNavigationOptions {
    delay?: number;
    showLoadingBar?: boolean;
    buttonText?: string;
    loadingText?: string;
}

export function useSmoothNavigation() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const navigate = useCallback((
        path: string,
        options: SmoothNavigationOptions = {}
    ) => {
        const {
            delay = 100,
            showLoadingBar = true,
            buttonText = 'Loading...',
            loadingText = 'Opening...'
        } = options;

        if (showLoadingBar) {
            setIsNavigating(true);
        }

        // Reset navigation state after a reasonable timeout
        const resetTimer = setTimeout(() => {
            setIsNavigating(false);
        }, 3000);

        // Navigate after the specified delay
        setTimeout(() => {
            router.push(path);
        }, delay);

        return () => clearTimeout(resetTimer);
    }, [router]);

    const navigateWithButtonFeedback = useCallback((
        path: string,
        button: HTMLButtonElement,
        options: SmoothNavigationOptions = {}
    ) => {
        const {
            delay = 100,
            showLoadingBar = true,
            buttonText = 'Loading...',
            loadingText = 'Opening...'
        } = options;

        // Disable button and show loading state
        button.disabled = true;
        const originalContent = button.innerHTML;

        button.innerHTML = `
            <div class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>${loadingText}</span>
        `;

        // Navigate
        navigate(path, { delay, showLoadingBar });

        // Restore button after navigation (fallback)
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalContent;
        }, 2000);
    }, [navigate]);

    const navigateWithCardFeedback = useCallback((
        path: string,
        card: HTMLElement,
        options: SmoothNavigationOptions = {}
    ) => {
        const { delay = 150, showLoadingBar = true } = options;

        // Add visual feedback to card
        card.style.transform = 'scale(0.98)';
        card.style.opacity = '0.8';
        card.style.transition = 'all 0.15s ease-in-out';

        // Navigate
        navigate(path, { delay, showLoadingBar });
    }, [navigate]);

    return {
        isNavigating,
        setIsNavigating,
        navigate,
        navigateWithButtonFeedback,
        navigateWithCardFeedback
    };
} 