// src/components/chapter/generateTags.tsx
"use client";

import React from 'react';
import { Calendar, BookOpen, Tag, Info } from 'lucide-react';

interface GenerateTagsProps {
    title: string;
    chapter: string;
    datePublished: string;
    publisher: string;
    summary?: {
        tldr?: string;
        synopsis?: string;
        keywords?: string[] | string;
    };
}

export default function GenerateTags({
    summary,
    title,
    chapter,
    datePublished,
    publisher,
}: GenerateTagsProps) {
    // Format the date for display
    const formattedDate = new Date(datePublished).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Extract chapter number
    const chapterNumber = chapter.replace(/^chapter-/i, "");
    
    // Parse keywords into an array
    const keywordsArray = summary?.keywords 
        ? (Array.isArray(summary.keywords) 
            ? summary.keywords 
            : summary.keywords.split(',').map(k => k.trim()))
        : [];

    return (
        <div className="bg-background-100 dark:bg-background-800 rounded-lg shadow-sm border border-background-200 dark:border-background-700 transition-colors duration-300">
            <div className="p-6">
                <h3 className="text-xl font-bold text-text-900 dark:text-text-100 mb-6 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                    Chapter Information
                </h3>
                
                <div className="space-y-6">
                    {/* Publication details */}
                    <div>
                        <h4 className="text-sm font-medium text-text-700 dark:text-text-300 mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-secondary-600 dark:text-secondary-400" />
                            Publication Details
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-background-50 dark:bg-background-900 p-4 rounded-lg border border-background-200 dark:border-background-700">
                                <div className="flex items-center text-text-900 dark:text-text-100">
                                    <Calendar className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span className="font-medium">Published:</span>
                                </div>
                                <p className="mt-1 text-text-700 dark:text-text-300 pl-6">{formattedDate}</p>
                            </div>
                            
                            <div className="bg-background-50 dark:bg-background-900 p-4 rounded-lg border border-background-200 dark:border-background-700">
                                <div className="flex items-center text-text-900 dark:text-text-100">
                                    <BookOpen className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span className="font-medium">Publisher:</span>
                                </div>
                                <p className="mt-1 text-text-700 dark:text-text-300 pl-6">{publisher || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Chapter tags */}
                    {keywordsArray.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-text-700 dark:text-text-300 mb-3 flex items-center">
                                <Tag className="w-4 h-4 mr-2 text-secondary-600 dark:text-secondary-400" />
                                Chapter Themes
                            </h4>
                            
                            <div className="flex flex-wrap gap-2">
                                {keywordsArray.map((keyword, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Read info */}
                    <div className="text-center pt-2">
                        <p className="text-sm text-text-600 dark:text-text-400">
                            You are reading <span className="font-medium text-text-900 dark:text-text-100">{title}</span> - Chapter {chapterNumber} on <span className="text-primary-600 dark:text-primary-400">skaihua</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}