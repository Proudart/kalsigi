import { Link } from "../link";
import Loader from "../load";
import dynamic from "next/dynamic";

// Lazy load components for better performance
const EnhancedManga = dynamic(() => import("./enhancedManga"), {
  loading: () => <Loader />,
  ssr: true,
});

export default async function Manga({
  params,
}: {
  params: { series: string };
}) {
  const title = params.series;
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");
  
  try {
    // Fetch data with a 15-second timeout to prevent long loading times
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(
      `http://localhost:3000/api/title?url=${modifiedTitle}`

    );
    
    clearTimeout(timeoutId);

    
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }
    
    const data = await res.json();
    return (
      <EnhancedManga 
        data={data} 
        title={title} 
      />
    );
  } catch (error) {
    // Enhanced error handling with fallback UI
    console.error("Error fetching series data:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-background-800 p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-50 mb-4">Series Not Found</h1>
          <p className="text-text-300 mb-6">
            We couldnt find the series youre looking for. This might be due to:
          </p>
          <ul className="text-text-300 list-disc text-left mb-6 pl-8">
            <li>The series has been removed</li>
            <li>The URL is incorrect</li>
            <li>Our servers are experiencing issues</li>
          </ul>
          <Link
            href="/"
            prefetch={true}
            className="bg-primary-600 text-text-50 px-6 py-2 rounded-lg inline-flex items-center hover:bg-primary-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
}