import Head from "next/head";

export const metadata = {
  title: "privacy",
  description: `The only manga sites you'll need are those that bring together your favourite or most popular translators into one place, such as Reaperscans and Asurascans, and that is what we do at ${process.env.site_name}.`,
  icons: {
    icon: "/manhwacall.webp",
  },
  keywords: ["Manga", "Read Manga", "Read Manga Online", "Manga Online", "Manga Reader", "Manga Scans", "English Manga", "Manga Sites", "Manga Website", "Manga Translation", "Manga Translated", "Manga Scans Online", "Manga Website", "Where Can I Read Manga", "Read Manga", `${process.env.site_name} Website`],

}

function Series() {

    return (
        <>
          <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Privacy</title>
          <link rel="icon" href="/manhwacall.webp" /> 
          </Head>
          <div className="min-h-screen mx-auto">
            <div className="flex flex-col items-center justify-center h-auto p-10 m-10 rounded-xl min-h-60 bg-silver">
              <h1 className="text-2xl font-bold text-center text-textmain">
                Privacy
              </h1>
              <div className="flex flex-col text-textmain">
                <p className="">
                  {process.env.site_name} is not collecting any data yet except the info about how
                  you spend your time on the website. 
                </p>
              </div>
            </div>
          </div>
        </>
      );

}

export default Series