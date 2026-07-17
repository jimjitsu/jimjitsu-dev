import Image, { type ImageProps } from "next/image";
import type { Asset } from "contentful";
import { resolveAssetUrl } from "@/lib/contentful";

type ContentfulImageProps = Omit<ImageProps, "src" | "width" | "height" | "alt"> & {
  /** A resolved Contentful Asset (call .resolveLink or use included assets). */
  asset: Asset<undefined> | undefined | null;
  /** Required alt text. Falls back to the asset's description if not given. */
  alt?: string;
  /** Override width/height if you need to scale. Defaults to the asset's natural size. */
  width?: number;
  height?: number;
};

/**
 * Render a Contentful Asset using next/image. Handles the protocol-less URL
 * Contentful returns and pulls width/height from the asset's image metadata.
 * Supports fill mode — pass fill={true} and omit width/height.
 */
export function ContentfulImage({ asset, alt, width, height, ...rest }: ContentfulImageProps) {
  if (!asset?.fields?.file) return null;

  const file = asset.fields.file;
  const url = resolveAssetUrl(typeof file.url === "string" ? file.url : "");

  if (!url) return null;

  const finalAlt = alt ?? asset.fields.description ?? asset.fields.title ?? "";

  if ("fill" in rest) {
    return <Image src={url} alt={finalAlt} {...rest} />;
  }

  const imageDetails =
    file.details && "image" in file.details && file.details.image ? file.details.image : undefined;

  const finalWidth = width ?? imageDetails?.width ?? 1200;
  const finalHeight = height ?? imageDetails?.height ?? 800;

  return <Image src={url} alt={finalAlt} width={finalWidth} height={finalHeight} {...rest} />;
}
