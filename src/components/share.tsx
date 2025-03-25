"use client";

import React from "react";
import dynamic from "next/dynamic";


const FacebookShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.FacebookShareButton)
);
const InstapaperShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.InstapaperShareButton)
);
const RedditShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.RedditShareButton)
);
const TelegramShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.TelegramShareButton)
);
const TwitterShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.TwitterShareButton)
);
const WhatsappShareButton = dynamic(() =>
  import("react-share").then((mod) => mod.WhatsappShareButton)
);


const IconBrandFacebook = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandFacebook)
);
const IconBrandTwitter = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandTwitter)
);
const IconBrandInstagram = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandInstagram)
);
const IconBrandWhatsapp = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandWhatsapp)
);
const IconBrandTelegram = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandTelegram)
);
const IconBrandReddit = dynamic(() =>
  import("@tabler/icons-react").then((mod) => mod.IconBrandReddit)
);


type ShareButtonProps = {
  children: React.ReactNode;
  className?: string;
};


const ShareButton = ({ children, className, ...props }: ShareButtonProps) => (
  <div
    className={[
      "flex flex-wrap items-center justify-center w-10 h-10 rounded-full bg-background-300 text-text-800 hover:bg-background-400 transition-colors duration-200",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </div>
);

export default React.memo(function Share({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <FacebookShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandFacebook className="w-5 h-5" />
        </ShareButton>
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandTwitter className="w-5 h-5" />
        </ShareButton>
      </TwitterShareButton>
      <WhatsappShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandWhatsapp className="w-5 h-5" />
        </ShareButton>
      </WhatsappShareButton>
      <InstapaperShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandInstagram className="w-5 h-5" />
        </ShareButton>
      </InstapaperShareButton>
      <TelegramShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandTelegram className="w-5 h-5" />
        </ShareButton>
      </TelegramShareButton>
      <RedditShareButton url={url} title={title}>
        <ShareButton>
          <IconBrandReddit className="w-5 h-5" />
        </ShareButton>
      </RedditShareButton>
    </div>
  );
});