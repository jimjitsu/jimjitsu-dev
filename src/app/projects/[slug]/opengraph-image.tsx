import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/contentful";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Jim Tierney — jimjitsu.dev";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return new ImageResponse(
    <OgCard
      eyebrow="Jim Tierney · Project"
      title={project?.fields.title ?? "Jim Tierney"}
      subtitle={project?.fields.summary}
    />,
    { ...OG_SIZE },
  );
}
