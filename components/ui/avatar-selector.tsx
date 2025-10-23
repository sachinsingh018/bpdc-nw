'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvatarSelectorProps {
    selectedAvatar: string;
    onAvatarChange: (avatar: string) => void;
}

const avatarStyles = [
    'adventurer',
    'adventurer-neutral',
    'avataaars',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'initials',
    'micah',
    'miniavs',
    'personas',
    'pixel-art',
    'pixel-art-neutral',
];

const colors = [
    'b6e3f4', 'c0aede', 'ffdfbf', 'ffd5dc', 'ffcbc4',
    'a8e6cf', 'dcedc1', 'ffd3b6', 'ffaaa5', 'ff8b94',
    'ff6b6b', '4ecdc4', '45b7d1', '96ceb4', 'ffeaa7',
    'dda0dd', '98d8c8', 'f7dc6f', 'bb8fce', '85c1e9'
];

export function AvatarSelector({ selectedAvatar, onAvatarChange }: AvatarSelectorProps) {
    const [currentStyle, setCurrentStyle] = useState(0);
    const [currentColor, setCurrentColor] = useState(0);

    const generateAvatarUrl = (style: string, color: string) => {
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${style}&backgroundColor=${color}`;
    };

    const nextStyle = () => {
        setCurrentStyle((prev) => (prev + 1) % avatarStyles.length);
    };

    const prevStyle = () => {
        setCurrentStyle((prev) => (prev - 1 + avatarStyles.length) % avatarStyles.length);
    };

    const nextColor = () => {
        setCurrentColor((prev) => (prev + 1) % colors.length);
    };

    const prevColor = () => {
        setCurrentColor((prev) => (prev - 1 + colors.length) % colors.length);
    };

    const currentAvatarUrl = generateAvatarUrl(avatarStyles[currentStyle], colors[currentColor]);

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose Your Anonymous Avatar</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will be your anonymous identity in the chat feed
                </p>
            </div>

            {/* Current Avatar Display */}
            <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-purple-200 dark:border-purple-800 overflow-hidden">
                    <img
                        src={currentAvatarUrl}
                        alt="Selected avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Style: {avatarStyles[currentStyle]}</span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevStyle}
                            className="p-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextStyle}
                            className="p-1"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Background Color</span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevColor}
                            className="p-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextColor}
                            className="p-1"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div
                    className="w-full h-8 rounded-md border-2 border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: `#${colors[currentColor]}` }}
                />
            </div>

            {/* Apply Button */}
            <Button
                onClick={() => onAvatarChange(currentAvatarUrl)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
                Use This Avatar
            </Button>

            {/* Quick Selection Grid */}
            <div className="space-y-2">
                <span className="text-sm font-medium">Quick Selection</span>
                <div className="grid grid-cols-6 gap-2">
                    {avatarStyles.slice(0, 12).map((style, index) => (
                        <button
                            key={style}
                            onClick={() => {
                                setCurrentStyle(index);
                                setCurrentColor(Math.floor(Math.random() * colors.length));
                            }}
                            className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 overflow-hidden transition-colors"
                        >
                            <img
                                src={generateAvatarUrl(style, colors[Math.floor(Math.random() * colors.length)])}
                                alt={style}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 