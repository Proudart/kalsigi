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
    last_update: string;
    averageRating: number;
    description: string;
}

interface MainSeriesInfoProps {
    data: MangaData;
}

const MainSeriesInfo: React.FC<MainSeriesInfoProps> = ({ data }) => {
    return (
        <div className="container mx-auto p-4">
            <div className="relative">
                <Image
                    src={data.cover_image_url}
                    alt={data.title}
                    className="w-full h-96 object-cover shadow-lg object-position-center rounded-xl"
                    width={800}
                    height={600}
                    quality={100}
                    loading="lazy"
                    unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary-500 p-6 shadow-xl rounded-b-xl">
                    <div>
                    <h1 className="text-3xl font-bold text-textmain">{data.title}</h1>
                    <p className="text-sm text-textmain">
                        Genres: {data.genre.filter(g => g !== "Null").join(", ") ?? ""}
                    </p>
                    </div>
                    <div>
                        <p className="text-textmain">
                            Description: {data.description}
                        </p>
                    </div>

                </div>
                
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="bg-primary-500 p-4 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                    <h2 className="font-semibold text-lg text-textmain">Chapters</h2>
                    <p className="text-textmain">
                        {data.total_chapters} chapters published
                    </p>
                </div>
                <div className="bg-primary-500 p-4 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                    <h2 className="font-semibold text-lg text-textmain">
                        Author and Artist
                    </h2>
                    <p className="text-textmain">Author: {data.author || "N/A"}</p>
                    <p className="text-textmain">Artist: {data.artist || "N/A"}</p>
                </div>
                <div className="bg-primary-500 p-4 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                    <h2 className="font-semibold text-lg text-textmain">
                        Publication Details
                    </h2>
                    <p className="text-textmain">Status: {data.status}</p>
                    <p className="text-textmain">
                        Last Updated: {new Date(data.updated_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="bg-primary-500 p-4 shadow-md hover:shadow-lg transition-shadow rounded-xl">
                    <h2 className="font-semibold text-lg text-textmain">Rating</h2>
                    <p className="text-textmain">
                        Average Rating: {data.averageRating}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MainSeriesInfo;