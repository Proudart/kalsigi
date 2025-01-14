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
    const generateSEOTags = () => {
        const formattedDate = new Date(datePublished).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return [
            `Released: ${formattedDate}`,
            `Read at ${process.env.site_name}`,
        ];
    };

    const seoTags = generateSEOTags();

    return (
        <div className="p-6 rounded-lg shadow-lg w-full md:w-3/4 mx-auto mt-8 bg-background-600 transition-colors duration-300 min-w-full">
            <h3 className="mb-4 text-xl font-bold text-primary-800 dark:text-primary-200">
                Series Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {seoTags.map((tag: string, index: number) => (
                    <div 
                        key={tag + index} 
                        className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 text-text-700 dark:text-text-200 text-sm"
                    >
                        {tag}
                    </div>
                ))}
            </div>
            
            {summary?.keywords && (
                <div className="mt-4">
                    <h4 className="mb-3 text-lg font-semibold text-primary-800 dark:text-primary-200">
                        Chapter Themes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {(Array.isArray(summary.keywords) ? summary.keywords : summary.keywords.split(','))
                            .map((keyword: string, index: number) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100 rounded-full text-sm"
                                >
                                    {keyword.trim()}
                                </span>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}