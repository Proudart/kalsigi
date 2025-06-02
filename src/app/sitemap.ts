import { MetadataRoute } from 'next';

interface SitemapEntry {
  url: string;
  lastModified: string | Date;
}

const SITEMAP_CONFIG = {
  START_DATE: process.env.SITEMAP_START_DATE || '2024-01-14',
  BACKDATE_FROM: process.env.SITEMAP_BACKDATE_FROM || '2024-01-11',
  URLS_PER_DAY: {
    MIN: 500,
    MAX: 1000
  }
};

function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  const endTime = endDate.getTime();

  while (currentDate.getTime() <= endTime) {
    dates.push(new Date(currentDate));
    // Create a new Date object for the next day
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  return dates;
}

function getAssignedUrlsForDate(
  allUrls: SitemapEntry[],
  date: Date,
  urlsPerDay: { MIN: number; MAX: number },
  usedUrls: Set<string>
): SitemapEntry[] {
  const dateStr = date.toISOString().split('T')[0];
  const availableUrls = allUrls.filter(entry => !usedUrls.has(entry.url));
  
  if (availableUrls.length === 0) return [];

  // Ensure we're getting new URLs each day
  const numUrls = Math.min(
    urlsPerDay.MAX,
    Math.max(urlsPerDay.MIN, Math.ceil(availableUrls.length / 7)) // Distribute remaining URLs over a week
  );

  const assignedUrls = availableUrls.slice(0, numUrls);
  assignedUrls.forEach(entry => {
    usedUrls.add(entry.url);
    entry.lastModified = new Date(dateStr);
  });

  return assignedUrls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const fetchUrl = `https://www.${process.env.site_name}.com/api/chaptersxml`;
    const response = await fetch(fetchUrl);
    const chapters = await response.json();

    // Collect all possible URLs
    const allUrls: SitemapEntry[] = chapters.flatMap((series: any) => {
      const urls = [];
      
      urls.push({
        url: `https://www.${process.env.site_name}.com/series/${series.url}-${series.url_code}`,
        lastModified: new Date(series.updated_at),
      });

      series.chapters.forEach((chapter: any) => {
        // Normalize publisher name for URL
        const publisherSlug = chapter.publisher.toLowerCase().replace(/\s+/g, '-');

        urls.push({
          url: `https://www.${process.env.site_name}.com/series/${series.url}-${series.url_code}/${publisherSlug}/chapter-${chapter.chapter_number}`,
          lastModified: new Date(chapter.published_at),
        });
      });

      return urls;
    });

    // Sort URLs by lastModified date
    allUrls.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(SITEMAP_CONFIG.START_DATE);
    startDate.setHours(0, 0, 0, 0);
    
    const backDate = new Date(SITEMAP_CONFIG.BACKDATE_FROM);
    backDate.setHours(0, 0, 0, 0);

    // Track used URLs
    const usedUrls = new Set<string>();

    // Initialize sitemap URLs array with homepage
    let sitemapUrls: SitemapEntry[] = [
      {
        url: `https://www.${process.env.site_name}.com`,
        lastModified: new Date(),
      }
    ];

    // Handle backdating
    const backdateDates = getDatesInRange(backDate, startDate);
    for (const date of backdateDates) {
      const assignedUrls = getAssignedUrlsForDate(
        allUrls,
        date,
        SITEMAP_CONFIG.URLS_PER_DAY,
        usedUrls
      );
      sitemapUrls.push(...assignedUrls);
    }

    // Handle dates from start date to today
    if (today >= startDate) {
      const currentDates = getDatesInRange(startDate, today);
      for (const date of currentDates) {
        const assignedUrls = getAssignedUrlsForDate(
          allUrls,
          date,
          SITEMAP_CONFIG.URLS_PER_DAY,
          usedUrls
        );
        sitemapUrls.push(...assignedUrls);
      }
    }

    // Add debug logging
    console.log('Sitemap stats:', {
      totalUrls: sitemapUrls.length,
      uniqueUrls: new Set(sitemapUrls.map(entry => entry.url)).size,
      dateRange: {
        from: sitemapUrls[0].lastModified,
        to: sitemapUrls[sitemapUrls.length - 1].lastModified
      }
    });

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