
import { Suspense } from "react";
import { cookies } from "next/headers";
import ContinueContent from "./continueContent";
import ContinueSkeleton from "./continueSkeleton";
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

async function fetchData(titles: string[]) {
  try {

    titles = titles.map((title: any) => {
      const regex = /-\d{6}/;
      const modifiedTitle = title.title.replace(regex, '');
      return { ...title, title: modifiedTitle };
    });
    
    const response = await fetch(
      `${getBaseUrl()}/api/feed/continue?titles=${titles
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
      if (title.chapter !== title.latest) {
        return { title: title.title, chapter: title.chapter };
      }
      return null;
    })
    .filter(Boolean);

  const hasBookmark = titles.length > 0;
  const data = hasBookmark ? await fetchData(titles) : [];
  return (
    <div>
      {hasBookmark && data ? (
        <Suspense fallback={<ContinueSkeleton />}>
          <ContinueContent data={data} />
        </Suspense>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Continue;
