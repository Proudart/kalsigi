import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

interface SitemapEntry {
  url: string;
  lastModified: string | Date;
}

interface SitemapState {
  lastUpdate: string;
  addedUrls: string[];
  startDate: string;
  backdatedEntries: {
    [key: string]: string[];
  };
}

// Configure your dates here
const SITEMAP_CONFIG = {
  START_DATE: process.env.SITEMAP_START_DATE || '2025-01-14',    // When to start adding new URLs
  BACKDATE_FROM: process.env.SITEMAP_BACKDATE_FROM || '2025-01-12', // Earliest date for backdated entries
  URLS_PER_DAY: {
    MIN: 50,
    MAX: 100
  }
};

function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const statePath = path.join(process.cwd(), 'sitemap-state.json');
    const fetchUrl = `https://www.${process.env.site_name}.com/api/chaptersxml`;
    const response = await fetch(fetchUrl);
    const chapters = await response.json();

    // Initialize default state
    const defaultState: SitemapState = {
      lastUpdate: new Date(0).toISOString(),
      addedUrls: [],
      startDate: SITEMAP_CONFIG.START_DATE,
      backdatedEntries: {} // Initialize empty object for backdated entries
    };

    // Load or use default state
    let state: SitemapState;
    try {
      if (fs.existsSync(statePath)) {
        const savedState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        // Ensure all required properties exist
        state = {
          ...defaultState,
          ...savedState,
          backdatedEntries: savedState.backdatedEntries || {}
        };
      } else {
        state = defaultState;
      }
    } catch (error) {
      console.warn('Error loading sitemap state, starting fresh');
      state = defaultState;
    }

    // Collect all possible URLs
    const allUrls: SitemapEntry[] = chapters.flatMap((series: any) => {
      const urls = [];
      
      const seriesUrl = `https://www.${process.env.site_name}.com/series/${series.url}-${series.url_code}`;
      if (!state.addedUrls.includes(seriesUrl)) {
        urls.push({
          url: seriesUrl,
          lastModified: new Date(series.updated_at),
        });
      }

      series.chapters.forEach((chapter: any) => {
        const chapterUrl = `https://www.${process.env.site_name}.com/series/${series.url}-${series.url_code}/chapter-${chapter.chapter_number}`;
        if (!state.addedUrls.includes(chapterUrl)) {
          urls.push({
            url: chapterUrl,
            lastModified: new Date(chapter.published_at),
          });
        }
      });

      return urls;
    });

    // Sort URLs by lastModified date
    allUrls.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(state.startDate);
    startDate.setHours(0, 0, 0, 0);
    const backDate = new Date(SITEMAP_CONFIG.BACKDATE_FROM);
    backDate.setHours(0, 0, 0, 0);

    // Create array of remaining URLs to process
    let remainingUrls = [...allUrls];

    // Handle backdating
    const backdateDates = getDatesInRange(backDate, startDate);
    for (const date of backdateDates) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip if we already have entries for this date
      if (!state.backdatedEntries[dateStr] && remainingUrls.length > 0) {
        const numUrls = Math.min(
          SITEMAP_CONFIG.URLS_PER_DAY.MAX,
          Math.max(SITEMAP_CONFIG.URLS_PER_DAY.MIN, remainingUrls.length)
        );
        
        const dateUrls = remainingUrls.splice(0, numUrls);
        state.backdatedEntries[dateStr] = dateUrls.map(entry => entry.url);
        state.addedUrls.push(...state.backdatedEntries[dateStr]);
      }
    }

    // Initialize sitemap URLs array with homepage
    let sitemapUrls: SitemapEntry[] = [
      {
        url: `https://www.${process.env.site_name}.com`,
        lastModified: new Date(),
      }
    ];

    // Add backdated entries to sitemap
    Object.entries(state.backdatedEntries).forEach(([date, urls]) => {
      urls.forEach(url => {
        sitemapUrls.push({
          url,
          lastModified: new Date(date)
        });
      });
    });

    // Handle new URLs if we're past the start date
    const lastUpdateDate = new Date(state.lastUpdate);
    lastUpdateDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today.getTime() > lastUpdateDate.getTime() && remainingUrls.length > 0) {
      const numNewUrls = Math.min(
        SITEMAP_CONFIG.URLS_PER_DAY.MAX,
        Math.max(SITEMAP_CONFIG.URLS_PER_DAY.MIN, remainingUrls.length)
      );
      
      const newUrls = remainingUrls.splice(0, numNewUrls);
      state.lastUpdate = new Date().toISOString();
      
      // Add new URLs to both state and sitemap
      const newUrlStrings = newUrls.map(entry => entry.url);
      state.addedUrls.push(...newUrlStrings);
      sitemapUrls.push(...newUrls);
    }

    // Save updated state
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    return sitemapUrls;

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: `https://www.${process.env.site_name}.com`,
        lastModified: new Date(),
      }
    ];
  }
}