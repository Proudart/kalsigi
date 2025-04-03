import React from 'react';
import Image from 'next/image';

interface MangaData {
    total_chapters: number;
    updated_at: string | number | Date;
    cover_image_url: string;
    title: string;
    genre: string[];
    chapter_number: number;
    author: string;
    artist?: string;
    status: string;
    averageRating: number;
    description: string;
}

interface MainSeriesInfoProps {
    data: MangaData;
}

const MainSeriesInfo: React.FC<MainSeriesInfoProps> = ({ data }) => {
    return (
        <div className="w-full pt-2">
            <div className="container px-4 py-6 mx-auto bg-background-500 rounded-lg">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                    {/* Cover Image Section */}
                    <div className="w-full md:w-[300px] lg:w-[400px] shrink-0">
                        <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg 
                            shadow-lg bg-background-100 ">
                            <Image
                                src={data.cover_image_url}
                                alt={data.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 300px, 400px"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-6">
                        {/* Title and Rating */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold 
                                text-text-950  mb-3">
                                {data.title}
                            </h1>
                            <div className="flex items-center gap-2 text-text-800 ">
                                <span className="text-lg font-semibold">
                                    {data.averageRating.toFixed(1)}
                                </span>
                                <span className="text-sm">Rating</span>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {data.genre.filter(g => g !== "Null").map((genre, index) => (
                                <span 
                                    key={index} 
                                    className="px-3 py-1.5 text-sm rounded-full
                                    bg-primary-100 
                                    text-primary-900 
                                    hover:bg-primary-200 
                                    transition-colors duration-200"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="prose  max-w-none">
                            <p className="text-text-800  leading-relaxed">
                                {data.description}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-background-100 ">
                                <dt className="text-sm text-text-700 ">Chapters</dt>
                                <dd className="mt-1 text-lg font-semibold text-text-900 ">
                                    {data.total_chapters}
                                </dd>
                            </div>
                            <div className="p-4 rounded-lg bg-background-100 ">
                                <dt className="text-sm text-text-700 ">Status</dt>
                                <dd className="mt-1 text-lg font-semibold text-text-900 ">
                                    {data.status}
                                </dd>
                            </div>
                            <div className="p-4 rounded-lg bg-background-100 ">
                                <dt className="text-sm text-text-700 ">Author</dt>
                                <dd className="mt-1 text-lg font-semibold text-text-900 ">
                                    {data.author || "N/A"}
                                </dd>
                            </div>
                            {data.artist && (
                                <div className="p-4 rounded-lg bg-background-100 ">
                                    <dt className="text-sm text-text-700 ">Artist</dt>
                                    <dd className="mt-1 text-lg font-semibold text-text-900 ">
                                        {data.artist}
                                    </dd>
                                </div>
                            )}
                        </div>

                        {/* Last Updated */}
                        <div className="text-sm text-text-700 ">
                            Last Updated: {new Date(data.updated_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainSeriesInfo;