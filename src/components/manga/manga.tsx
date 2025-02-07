import dynamic from "next/dynamic";
const Bookmark = dynamic(() => import("../bookmark"));

const SeriesChat = dynamic(() => import("./seriesChat"));

const Share = dynamic(() => import("../share"));

const ChapterSearch = dynamic(() => import("./chapterSearch"));


const MainSeriesInfo = dynamic(() => import("./mainSeriesInfo"));
const Recommended = dynamic(() => import("../recommendations"));
export default async function Manga({
  params,
}: {
  params: { series: string };
}) {
  const title = params.series;
  const regex = /-\d{6}/;
  const modifiedTitle = title.replace(regex, "");
  const res = await fetch(
    `https://www.${process.env.site_name}.com/api/title?url=${modifiedTitle}`
    // `http://localhost:3000/api/title?url=${modifiedTitle}`
  );
  const data = await res.json();

  return (
    <div className="bg-backgroundmain min-h-screen overflow-y-auto">
      <MainSeriesInfo data={data} />
      <div className="mx-auto p-4 mt-6 flex justify-evenly items-center flex-wrap">
        <Bookmark title={title} />
        <Share
          url={`https://www.${process.env.site_name}.com/series/${title}`}
          title={data.title}
        />
      </div>
      <div className="container mx-auto p-4 mt-6 h-max-[450px]">
        <ChapterSearch data={data} title={title} />
      </div>
      <div className="container mx-auto p-4 mt-6">
        <Recommended genres={data.genre} seriesId={data.id} />
      </div>

      <div className="container mx-auto p-4 mt-6">
        <SeriesChat seriesId={data.id} />
      </div>
      <div className="container mx-auto p-4 mt-6"></div>
    </div>
  );
}


