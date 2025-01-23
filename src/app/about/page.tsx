
export const metadata = {
  title: "about",
  description: `The only manga sites you'll need are those that bring together your favourite or most popular translators into one place, such as Reaperscans and Asurascans, and that is what we do at ${process.env.site_name}.`, 
  icons: {
    icon: "/skaihua.webp",
  },
  keywords: ["Manga", "Read Manga", "Read Manga Online", "Manga Online", "Manga Reader", "Manga Scans", "English Manga", "Manga Sites", "Manga Website", "Manga Translation", "Manga Translated", "Manga Scans Online", "Manga Website", "Where Can I Read Manga", "Read Manga Free", "Manga Website"],

}

function Series() {

    return (
        <>
          <div className="min-h-screen mx-auto">
            <div className="flex flex-col items-center justify-center h-auto p-10 m-10 rounded-xl min-h-60 bg-silver">
              <span className="text-2xl font-bold text-center text-textmain ">
                About
              </span>
              <div className="flex flex-col text-textmain">
                <span className="">
                {process.env.site_name} is here to bring all of the best scans and series together
                  into one place from your favourite authors, artists, publishers,
                  and scanners. We are here to allow as many people to find and read
                  their favourite series in one place quickly and easily, with fast
                  loading speeds, quick updates, and with the possibility in the
                  future of going legit and revolutionising the manga/manhwa/manhua
                  industry.
                </span>
              </div>
            </div>
          </div>
        </>
      );

}

export default Series