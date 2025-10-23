'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search } from 'lucide-react';

interface City {
    name: string;
    country: string;
    state?: string;
}

interface CitySelectorProps {
    value?: string;
    onChange: (city: string) => void;
    placeholder?: string;
    className?: string;
}

// Popular cities list - you can expand this or use an API
const POPULAR_CITIES: City[] = [
    { name: 'New York', country: 'USA', state: 'NY' },
    { name: 'London', country: 'UK' },
    { name: 'Dubai', country: 'UAE' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Toronto', country: 'Canada' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Paris', country: 'France' },
    { name: 'Amsterdam', country: 'Netherlands' },
    { name: 'San Francisco', country: 'USA', state: 'CA' },
    { name: 'Los Angeles', country: 'USA', state: 'CA' },
    { name: 'Chicago', country: 'USA', state: 'IL' },
    { name: 'Boston', country: 'USA', state: 'MA' },
    { name: 'Seattle', country: 'USA', state: 'WA' },
    { name: 'Austin', country: 'USA', state: 'TX' },
    { name: 'Miami', country: 'USA', state: 'FL' },
    { name: 'Vancouver', country: 'Canada' },
    { name: 'Melbourne', country: 'Australia' },
    { name: 'Zurich', country: 'Switzerland' },
    { name: 'Stockholm', country: 'Sweden' },
    { name: 'Copenhagen', country: 'Denmark' },
    { name: 'Oslo', country: 'Norway' },
    { name: 'Helsinki', country: 'Finland' },
    { name: 'Dublin', country: 'Ireland' },
    { name: 'Barcelona', country: 'Spain' },
    { name: 'Madrid', country: 'Spain' },
    { name: 'Rome', country: 'Italy' },
    { name: 'Milan', country: 'Italy' },
    { name: 'Vienna', country: 'Austria' },
    { name: 'Prague', country: 'Czech Republic' },
    { name: 'Warsaw', country: 'Poland' },
    { name: 'Budapest', country: 'Hungary' },
    { name: 'Bucharest', country: 'Romania' },
    { name: 'Sofia', country: 'Bulgaria' },
    { name: 'Zagreb', country: 'Croatia' },
    { name: 'Ljubljana', country: 'Slovenia' },
    { name: 'Bratislava', country: 'Slovakia' },
    { name: 'Tallinn', country: 'Estonia' },
    { name: 'Riga', country: 'Latvia' },
    { name: 'Vilnius', country: 'Lithuania' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Delhi', country: 'India' },
    { name: 'Bangalore', country: 'India' },
    { name: 'Hyderabad', country: 'India' },
    { name: 'Chennai', country: 'India' },
    { name: 'Pune', country: 'India' },
    { name: 'Kolkata', country: 'India' },
    { name: 'Ahmedabad', country: 'India' },
    { name: 'Shanghai', country: 'China' },
    { name: 'Beijing', country: 'China' },
    { name: 'Shenzhen', country: 'China' },
    { name: 'Guangzhou', country: 'China' },
    { name: 'Hong Kong', country: 'Hong Kong' },
    { name: 'Seoul', country: 'South Korea' },
    { name: 'Bangkok', country: 'Thailand' },
    { name: 'Kuala Lumpur', country: 'Malaysia' },
    { name: 'Jakarta', country: 'Indonesia' },
    { name: 'Manila', country: 'Philippines' },
    { name: 'Ho Chi Minh City', country: 'Vietnam' },
    { name: 'Tel Aviv', country: 'Israel' },
    { name: 'Riyadh', country: 'Saudi Arabia' },
    { name: 'Doha', country: 'Qatar' },
    { name: 'Kuwait City', country: 'Kuwait' },
    { name: 'Manama', country: 'Bahrain' },
    { name: 'Muscat', country: 'Oman' },
    { name: 'Abu Dhabi', country: 'UAE' },
    { name: 'Sharjah', country: 'UAE' },
    { name: 'Cairo', country: 'Egypt' },
    { name: 'Casablanca', country: 'Morocco' },
    { name: 'Tunis', country: 'Tunisia' },
    { name: 'Algiers', country: 'Algeria' },
    { name: 'Lagos', country: 'Nigeria' },
    { name: 'Nairobi', country: 'Kenya' },
    { name: 'Cape Town', country: 'South Africa' },
    { name: 'Johannesburg', country: 'South Africa' },
    { name: 'São Paulo', country: 'Brazil' },
    { name: 'Rio de Janeiro', country: 'Brazil' },
    { name: 'Buenos Aires', country: 'Argentina' },
    { name: 'Santiago', country: 'Chile' },
    { name: 'Lima', country: 'Peru' },
    { name: 'Bogotá', country: 'Colombia' },
    { name: 'Mexico City', country: 'Mexico' },
    { name: 'Guadalajara', country: 'Mexico' },
    { name: 'Monterrey', country: 'Mexico' },
];

export function CitySelector({ value, onChange, placeholder = "Select your city", className = "" }: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCities, setFilteredCities] = useState<City[]>(POPULAR_CITIES);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCities(POPULAR_CITIES);
        } else {
            const filtered = POPULAR_CITIES.filter(city =>
                city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCities(filtered);
        }
    }, [searchTerm]);

    const handleCitySelect = (city: City) => {
        const cityString = city.state
            ? `${city.name}, ${city.state}, ${city.country}`
            : `${city.name}, ${city.country}`;
        onChange(cityString);
        setIsOpen(false);
        setSearchTerm('');
    };

    const formatCityDisplay = (city: City) => {
        return city.state
            ? `${city.name}, ${city.state}, ${city.country}`
            : `${city.name}, ${city.country}`;
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
            >
                <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                    {value || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search cities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleCitySelect(city)}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                    >
                                        {formatCityDisplay(city)}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    No cities found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
