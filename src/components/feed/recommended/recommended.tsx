// app/components/RecommendedManga.tsx
import { cookies } from "next/headers";
import UpdatedContent from "./recommendedContent";
import pako from "pako";
import { getBaseUrl } from "../../../lib/utils";

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
    const response = await fetch(`${getBaseUrl()}/api/feed/recommended?titles=${titles
        .map((title: any) => `${title.title}`)
        .join(",")}`
    );
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

export default async function RecommendedManga() {
  let seriesHistory = [];

  if ((await cookies()).has("seriesHistory")) {
    const compressedData = (await cookies()).get("seriesHistory")?.value;
    seriesHistory = decompressData(compressedData as string);
  }

  const data = await getRecommendedSeries(seriesHistory);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
      <UpdatedContent data={data} />
    </div>
  );
}