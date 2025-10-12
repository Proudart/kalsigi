import { cache } from "react";
import { getBaseUrl } from "../utils";

export interface ChapterSummary {
  tldr?: string;
  synopsis?: string;
  keywords?: string | string[] | null;
}

export interface ChapterData {
  id: string;
  chapter_number: number | string;
  title?: string | null;
  content: string[] | null;
  views?: number;
  publisher: string;
  published_at?: string;
  updated_at?: string;
  update_time?: string;
  striked?: boolean;
  summary?: ChapterSummary | null;
}

export interface SeriesData {
  id: string;
  series_id?: string;
  title: string;
  url: string;
  description: string | null;
  cover_image_url: string | null;
  type?: string[] | null;
  total_chapters: number | null;
  author: string | null;
  artist: string | null;
  status: string | null;
  publisher: string;
  url_code: string;
  genre?: string[] | string | null;
  chapters: ChapterData[];
}

export const fetchChapterData = cache(async (seriesUrl: string): Promise<SeriesData> => {
  const trimmedSeriesUrl = seriesUrl?.trim();

  if (!trimmedSeriesUrl) {
    throw new Error("Series URL is required to fetch chapter data");
  }

  const response = await fetch(
    `${getBaseUrl()}/api/chapter?series=${encodeURIComponent(trimmedSeriesUrl)}`,
    {
      method: "GET",
      next: {
        revalidate: 60 * 60 * 6, // 6 hours
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter data: ${response.status} ${response.statusText}`);
  }

  return response.json();
});
