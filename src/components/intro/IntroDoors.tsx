"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * The opening doors behind the intro.
 *
 * Where the files go — drop them in and this switches itself on:
 *
 *   /public/brand/doors.mp4        required — H.264/MP4, muted, no audio track
 *   /public/brand/doors.webm       optional — smaller, served first where supported
 *   /public/brand/doors-poster.jpg optional — first frame, shown while loading
 *
 * If none of them exist, nothing renders and the intro plays exactly as it
 * does today: the dust drifts, converges, and hands off to the mark. The video
 * is an enhancement, never a dependency.
 *
 * The clip is decorative and silent by design. It is muted and `playsInline`
 * so mobile browsers will actually autoplay it, and if a browser refuses
 * autoplay anyway we simply drop it rather than showing a frozen frame.
 *
 * Timing: the doors open across the dust's drift phase, so the sequence gains
 * a beat without getting any longer — the gold gathers as the doors part, and
 * the clip fades out as the crisp mark takes over.
 */

export const DOOR_ASSETS = {
  webm: "/brand/doors.webm",
  mp4: "/brand/doors.mp4",
  poster: "/brand/doors-poster.jpg",
} as const;

export function IntroDoors({ fadeOut }: { fadeOut: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay can still be refused (data saver, low power mode). Treat a
    // rejected play() the same as a missing file.
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setFailed(true));
    }
  }, []);

  if (failed) return null;

  return (
    <motion.video
      ref={videoRef}
      aria-hidden
      muted
      playsInline
      autoPlay
      preload="auto"
      poster={DOOR_ASSETS.poster}
      onError={() => setFailed(true)}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 0.85 }}
      transition={{ duration: fadeOut ? 0.9 : 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <source src={DOOR_ASSETS.webm} type="video/webm" />
      <source src={DOOR_ASSETS.mp4} type="video/mp4" />
    </motion.video>
  );
}
