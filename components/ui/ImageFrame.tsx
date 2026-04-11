import { cn } from "@/lib/utils";

type ImageFrameProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  fit?: "cover" | "contain";
  frameClassName?: string;
  imageClassName?: string;
};

export default function ImageFrame({
  src,
  alt,
  loading = "lazy",
  fit = "cover",
  frameClassName,
  imageClassName,
}: ImageFrameProps) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div className={cn("ds-image-frame ds-image-studio", frameClassName)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn("ds-image-subject h-full w-full", fitClass, imageClassName)}
      />
    </div>
  );
}
