// app/components/RecommendedManga.tsx
import { Suspense } from "react";
import { cookies } from "next/headers";
import UpdatedContent from "./recommendedContent";
import UpdatedSkeleton from "./recommendedSkeleton";
import pako from "pako";

function decompressData(input: string): any {
  try {
    const compressed = Buffer.from(input, 'base64');
    const decompressed = pako.inflate(compressed);
    const jsonString = new TextDecoder().decode(decompressed);
    return JSON.parse(jsonString);
  } catch (error) {
    // If decompression fails, assume the input is not compressed
    return JSON.parse(input);
  }
}


async function getRecommendedSeries(titles: any[]) {
  try {

    titles = titles.map((title: any) => {
      const regex = /-\d{6}/;
      const modifiedTitle = title.title.replace(regex, '');
      return { ...title, title: modifiedTitle };
    });
    const response = await fetch(`https://www.${process.env.site_name}.com/api/feed/recommended?titles=${titles
        .map((title: any) => `${title.title}`)
        .join(",")}`
    );
    // const response = await fetch(`http://localhost:3000/api/feed/recommended?titles=${titles
    //   .map((title: any) => `${title.title}`)
    //   .join(",")}`
    // );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseBody = await response.text();
    if (responseBody.length === 0) {
      throw new Error('Response body is empty');
    }
    return JSON.parse(responseBody);
  } catch (error) {
    console.error('Error fetching recommended series:', error);
    return [];
  }
}

async function RecommendedMangaContent() {
  let seriesHistory = [];

  if ((await cookies()).has("seriesHistory")) {
    const compressedData = (await cookies()).get("seriesHistory")?.value;
    seriesHistory = decompressData(compressedData as string);
  }


  

  const data = await getRecommendedSeries(seriesHistory);

  const hasRecommendations = data.length > 0;

  return (
    <div>
      {hasRecommendations ? (
        <UpdatedContent data={data} />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default function RecommendedManga() {
  return (
    <Suspense fallback={<UpdatedSkeleton />}>
      <RecommendedMangaContent />
    </Suspense>
  );
}