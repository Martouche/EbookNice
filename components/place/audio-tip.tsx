"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

const BARS = 28;

export function AudioTip({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-3 pr-5">
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        aria-label={playing ? "Mettre en pause" : "Écouter le conseil du local"}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-ocre text-[#14120f]"
      >
        {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
      </motion.button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Écouter le local</p>
        <div className="mt-1.5 flex h-5 items-center gap-[3px]" aria-hidden>
          {Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              className={i / BARS < progress ? "w-[3px] rounded-full bg-ocre" : "w-[3px] rounded-full bg-line-strong"}
              style={{ height: `${30 + Math.abs(Math.sin(i * 1.7)) * 70}%` }}
            />
          ))}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(e) => {
          const { currentTime, duration } = e.currentTarget;
          if (duration) setProgress(currentTime / duration);
        }}
      />
    </div>
  );
}
