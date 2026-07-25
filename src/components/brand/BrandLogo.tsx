"use client";

import { useState } from "react";

import { Monogram } from "./Monogram";
import { brand } from "@/content/site";

/**
 * Where the final logo files go. Drop replacements at these exact paths and
 * every usage across the site — nav, intro, footer, share image — updates.
 *
 *   /public/brand/industry-insider-mark.svg        the monogram alone
 *   /public/brand/industry-insider-logo.svg        stacked lockup, dark backgrounds
 *   /public/brand/industry-insider-logo-light.svg  stacked lockup, light backgrounds
 */
export const BRAND_FILES = {
  mark: "/brand/industry-insider-mark.svg",
  logo: "/brand/industry-insider-logo.svg",
  logoLight: "/brand/industry-insider-logo-light.svg",
} as const;

type BrandLogoProps = {
  variant?: keyof typeof BRAND_FILES;
  className?: string;
  /** Accessible name; omit when adjacent text already names the brand. */
  title?: string;
  width: number;
  height: number;
  priority?: boolean;
};

/**
 * Renders the supplied brand artwork, falling back to the inline monogram if
 * the file has not been added yet (or fails to load).
 *
 * Uses a plain <img> rather than next/image deliberately: these are SVGs, they
 * need no optimisation pipeline, and an unoptimised tag keeps the fallback
 * logic to a single onError handler. Explicit width/height on both branches
 * means the fallback swap causes no layout shift.
 */
export function BrandLogo({
  variant = "mark",
  className,
  title,
  width,
  height,
  priority = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const decorative = !title;

  if (failed) {
    return (
      <span
        className={className}
        style={{ display: "inline-block", aspectRatio: `${width} / ${height}` }}
      >
        <Monogram className="h-full w-full" title={title} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; no optimisation needed and next/image cannot express the onError fallback.
    <img
      src={BRAND_FILES[variant]}
      alt={decorative ? "" : (title ?? brand.name)}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      className={className}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
