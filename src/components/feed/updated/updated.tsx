
import { cookies } from "next/headers";
import UpdatedContent from "./updatedContent";
import { getBaseUrl } from "../../../lib/utils";

export function decompressData(compressed: string): any {
  try {
    // Decode from base64
    const jsonString = decodeURIComponent(atob(compressed));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return [];
  }
}

async function fetchData(titles: string[]) {
  try {
    titles = titles.map((title: any) => {
      const regex = /-\d{6}/;
      const modifiedTitle = title.title.replace(regex, '');
      return { ...title, title: modifiedTitle };
    });

    const response = await fetch(
      `${getBaseUrl()}/api/feed/updated?titles=${titles
        .map((title: any) => `${title.title}:${title.chapter}`)
        .join(",")}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseBody = await response.text();

    if (responseBody.length === 0) {
      throw new Error('Response body is empty');
    }

    const jsonData = JSON.parse(responseBody);
    return jsonData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

const Continue = async () => {
  let seriesHistory = [];

  if ((await cookies()).has("seriesHistory")) {
    const compressedData = (await cookies()).get("seriesHistory")?.value;
    seriesHistory = decompressData(compressedData as string);
  }

  seriesHistory.sort(
    (
      a: { timestamp: string | number | Date },
      b: { timestamp: string | number | Date }
    ) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let titles = seriesHistory
    .map((title: any) => {
      if (title.chapter == title.latest) {
        return { title: title.title, chapter: title.chapter };
      }
      return null;
    })
    .filter(Boolean);


  const hasBookmark = titles.length > 0;
  const data = hasBookmark ? await fetchData(titles) : [];

  if (!hasBookmark || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-primary-100 rounded-lg shadow-md border p-4 sm:p-6">
      <UpdatedContent data={data} />
    </div>
  );
};

export default Continue;
