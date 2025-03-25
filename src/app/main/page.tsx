"use client";

interface Chapter {
  chapter: string;
  update_time: string;
}

interface Manga {
  title: string;
  url: string;
  cover_image_url: string;
  last_update: string;
  chapterss: Chapter[];
}


export default function Home() {

  return (
    <div className="w-full p-4 bg-background-100  text-text-900 ">
      <button
        className="p-2 bg-primary-500  text-white rounded-sm"
      >
        hello
      </button>
    </div>
  );
}
    