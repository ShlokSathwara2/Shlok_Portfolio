"use client";

import { useState, useEffect } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: "https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1",
    poster: "https://cdn.21st.dev/assets/localized/5bb1be92440e920def3eb36ad5a610d609240616cd8b11c0effe6b92bcafe06e.jpg",
    background: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
    title: "Immersive Video Experience",
    date: "Cosmic Journey",
    scrollToExpand: "Scroll to Expand Demo",
    about: {
      overview: "This is a demonstration of the ScrollExpandMedia component with a video. As you scroll, the video expands to fill more of the screen, creating an immersive experience. This component is perfect for showcasing video content in a modern, interactive way.",
      conclusion: "The ScrollExpandMedia component provides a unique way to engage users with your content through interactive scrolling. Try switching between video and image modes to see different implementations.",
    },
  },
  image: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
    background: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080&fit=crop",
    title: "Dynamic Image Showcase",
    date: "Mountain Adventure",
    scrollToExpand: "Scroll to Expand Demo",
    about: {
      overview: "This is a demonstration of the ScrollExpandMedia component with an image. The same smooth expansion effect works beautifully with static images, allowing you to create engaging visual experiences without video content.",
      conclusion: "The ScrollExpandMedia component works equally well with images and videos. This flexibility allows you to choose the media type that best suits your content while maintaining the same engaging user experience.",
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: "video" | "image" }) => {
  const currentMedia = sampleMediaContent[mediaType];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
        About This Component
      </h2>
      <p className="text-lg mb-8 text-black dark:text-white">
        {currentMedia.about.overview}
      </p>
      <p className="text-lg mb-8 text-black dark:text-white">
        {currentMedia.about.conclusion}
      </p>
    </div>
  );
};

export default function ScrollDemoPage() {
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mediaType]);

  return (
    <div className="min-h-screen">
      {/* Back to portfolio link */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors border border-gray-200"
      >
        ← Back to Portfolio
      </a>

      {/* Media type toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setMediaType("video")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mediaType === "video"
              ? "bg-white text-black shadow-md"
              : "bg-black/50 text-white border border-white/30"
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setMediaType("image")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mediaType === "image"
              ? "bg-white text-black shadow-md"
              : "bg-black/50 text-white border border-white/30"
          }`}
        >
          Image
        </button>
      </div>

      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === "video" ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
}
