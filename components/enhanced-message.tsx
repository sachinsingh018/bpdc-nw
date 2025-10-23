'use client';

import { useState, useEffect } from 'react';
import { UIMessage } from 'ai';
import { EnhancedMessageActions } from './enhanced-message-actions';

interface PersonData {
    name: string;
    email?: string;
    phone?: string;
    contact_details?: string;
    desc: string;
    match_percentage: number;
}

interface EnhancedMessageProps {
    message: UIMessage;
}

export function EnhancedMessage({ message }: EnhancedMessageProps) {
    const [detectedPersons, setDetectedPersons] = useState<PersonData[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Function to extract person data from AI response
    const extractPersonData = (content: string): PersonData[] => {
        const persons: PersonData[] = [];

        try {
            // Look for JSON arrays in the response (common format for AI responses)
            const jsonMatches = content.match(/\[[\s\S]*?\]/g);

            if (jsonMatches) {
                for (const match of jsonMatches) {
                    try {
                        const parsed = JSON.parse(match);
                        if (Array.isArray(parsed)) {
                            for (const item of parsed) {
                                if (item.name && typeof item.name === 'string') {
                                    persons.push({
                                        name: item.name,
                                        email: item.email || undefined, // Use dedicated email field first
                                        phone: item.phone || undefined,
                                        contact_details: item['contact details'] || item.contact_details || undefined,
                                        desc: item.desc || item.description || '',
                                        match_percentage: typeof item.match_percentage === 'number' ? item.match_percentage : 85
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        // Continue if this JSON block doesn't parse
                        continue;
                    }
                }
            }

            // Also look for individual person mentions in text
            const personPatterns = [
                /([A-Z][a-z]+ [A-Z][a-z]+).*?(?:email|contact|reach|connect).*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
                /([A-Z][a-z]+ [A-Z][a-z]+).*?(?:phone|call|text).*?(\+?[\d\s\-\(\)]+)/gi,
            ];

            for (const pattern of personPatterns) {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    const name = match[1];
                    const contact = match[2];

                    // Check if we already have this person
                    if (!persons.some(p => p.name === name)) {
                        persons.push({
                            name,
                            email: contact.includes('@') ? contact : undefined,
                            phone: !contact.includes('@') ? contact : undefined,
                            desc: 'Mentioned in conversation',
                            match_percentage: 80
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error extracting person data:', error);
        }

        return persons;
    };

    // Analyze message content for person data
    useEffect(() => {
        if (message.role === 'assistant' && message.content) {
            setIsAnalyzing(true);

            // Use setTimeout to avoid blocking the UI
            setTimeout(() => {
                const persons = extractPersonData(message.content);
                setDetectedPersons(persons);
                setIsAnalyzing(false);
            }, 100);
        }
    }, [message.content, message.role]);

    // If no persons detected, just return the regular message content
    if (message.role !== 'assistant' || detectedPersons.length === 0) {
        return (
            <div className="whitespace-pre-wrap text-sm">
                {message.content}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Original message content */}
            <div className="whitespace-pre-wrap text-sm">
                {message.content}
            </div>

            {/* Enhanced actions for detected persons */}
            {isAnalyzing ? (
                <div className="text-sm text-gray-500 italic">
                    Analyzing for connection opportunities...
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-sm font-medium text-blue-600">
                        💡 Connection Opportunities Found:
                    </div>
                    {detectedPersons.map((person, index) => (
                        <EnhancedMessageActions
                            key={`${person.name}-${index}`}
                            personData={person}
                            onActionComplete={() => {
                                // Optionally refresh or update UI
                                console.log('Action completed for:', person.name);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 