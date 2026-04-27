import Image from "next/image";
import { cn } from "@/lib/utils";

type ImageFrameProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  fit?: "cover" | "contain";
  frameClassName?: string;
  imageClassName?: string;
  sizes?: string;
};

export default function ImageFrame({
  src,
  alt,
  loading = "lazy",
  fit = "cover",
  frameClassName,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: ImageFrameProps) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div className={cn("ds-image-frame ds-image-studio", frameClassName)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized
        priority={loading === "eager"}
        className={cn("ds-image-subject", fitClass, imageClassName)}
      />
    </div>
  );
}
