"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import poster from "@/public/videos/hero-nice-poster.jpg";

type Source = { src: string; type: string };

/**
 * Choix du flux selon l'appareil (analysé : 3 fichiers de 30 s, 24 i/s, sans audio, moov en tête) :
 * - mobile (< 768px)        → 720p H.264 (4,1 Mo, 1,1 Mb/s) : léger, décodage matériel partout.
 * - tablette / ordinateur   → 1080p VP9 WebM (6,4 Mo, 1,8 Mb/s), repli 1080p H.264 (7,4 Mo) pour Safari.
 * - économie de données, 2G ou « réduire les animations » → poster seul, aucune vidéo téléchargée.
 */
function pickSources(): Source[] | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return null;

  if (window.matchMedia("(max-width: 767px)").matches) {
    return [{ src: "/videos/hero-nice-720p.mp4", type: "video/mp4" }];
  }
  return [
    { src: "/videos/hero-nice-1080p.webm", type: 'video/webm; codecs="vp9"' },
    { src: "/videos/hero-nice-1080p.mp4", type: "video/mp4" },
  ];
}

/** Fond vidéo du hero : poster instantané (LCP), vidéo en fondu dès la première image lue. */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [playing, setPlaying] = useState(false);

  // Choix côté client uniquement : un seul fichier téléchargé, adapté à l'écran.
  useEffect(() => setSources(pickSources()), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sources) return;
    // `muted` doit être une propriété DOM (et non un simple attribut) pour l'autoplay iOS / Chrome.
    video.defaultMuted = true;
    video.muted = true;
    const play = () => video.play().catch(() => undefined);
    play();

    // Pause hors écran : économise batterie et CPU pendant la lecture du guide.
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : video.pause()), {
      threshold: 0.05,
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [sources]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#1b3a4b]">
      <Image
        src={poster}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        quality={80}
        className="object-cover"
      />
      {sources && (
        <motion.video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: playing ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 30 }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </motion.video>
      )}

      {/* Overlay de lisibilité : assombrit le bas (texte) et le haut (header), laisse respirer le ciel. */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/25" />
      <div className="absolute inset-0 bg-linear-to-r from-black/45 via-black/5 to-transparent" />
    </div>
  );
}
