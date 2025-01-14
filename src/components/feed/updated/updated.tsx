
import { Suspense } from "react";
import { cookies } from "next/headers";
import UpdatedContent from "./updatedContent";
import UpdatedSkeleton from "./updatedSkeleton";
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

async function fetchData(titles: string[]) {
  try {
    titles = titles.map((title: any) => {
      const regex = /-\d{6}/;
      const modifiedTitle = title.title.replace(regex, '');
      return { ...title, title: modifiedTitle };
    });

    const response = await fetch(
      `https://www.${process.env.site_name}.com/api/feed/updated?titles=${titles
        .map((title: any) => `${title.title}:${title.chapter}`)
        .join(",")}`
    )
    // const response = await fetch(
    //   `http://localhost:3000/api/feed/updated?titles=${titles
    //   .map((title: any) => `${title.title}:${title.chapter}`)
    //   .join(",")}`
    // );
    
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

  return (
    <div>
      {hasBookmark && data.length > 0 ? (
        <Suspense fallback={<UpdatedSkeleton />}>
          <UpdatedContent data={data} />
        </Suspense>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Continue;
