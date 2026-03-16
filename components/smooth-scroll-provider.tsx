"use client";

import dynamic from "next/dynamic";

const SmoothScroll = dynamic(
  () =>
    import("@/components/smooth-scroll").then((mod) => mod.SmoothScroll),
  { ssr: false }
);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SmoothScroll />
    </>
  );
}
