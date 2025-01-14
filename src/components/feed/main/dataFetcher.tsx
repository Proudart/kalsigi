
type Manga = {
  title: string;
  url: string;
  cover_image_url: string;
  chapterss: [
    {
      chapter: string;
      update_time: string;
    },
    {
      chapter: string;
      update_time: string;
    }
  ];
};

export const revalidate = 600;

export const fetchMangaData = async (sort: string, offset: number) => {
  const url = `/api/feed/series?offset=${offset}&sort=${sort}`;
  const res = await fetch(url);
  const data = (await res.json()) as Manga[];
  return data;
};
