"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useRef, useState } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  // Fetch image metadata from API
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`, {
    priority: "low",
  });

  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }

  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

// Track which images have already been seen/prefetched
const seen = new Set<string>();

// Prefetch a single image
function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }

  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;

  let done = false;
  img.onload = img.onerror = () => {
    done = true;
  };

  return () => {
    if (done) return;
    img.src = img.srcset = "";
    seen.delete(image.srcset);
  };
}

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(({ children, ...props }, ref) => {
  const [images, setImages] = useState<PrefetchImage[]>([]);
  const [preloading, setPreloading] = useState<(() => void)[]>([]);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  let prefetchTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (props.prefetch === false) {
      return;
    }

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Set a timeout to trigger prefetch after 300ms
          prefetchTimeout = setTimeout(async () => {
            router.prefetch(String(props.href));
            await sleep(0); // Let doc prefetches happen first
            void prefetchImages(String(props.href)).then((images) => {
              setImages(images);
            }, console.error);
            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }, [props.href, props.prefetch]);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={() => {
        router.prefetch(String(props.href));
        if (preloading.length) return;
        const p: (() => void)[] = [];
        for (const image of images) {
          const remove = prefetchImage(image);
          if (remove) p.push(remove);
        }
        setPreloading(p);
      }}
      onMouseLeave={() => {
        for (const remove of preloading) {
          remove();
        }
        setPreloading([]);
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
      }}
      className={`${props.className || ''} cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 rounded`}
      role={props.role || 'link'}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

Link.displayName = "Link";