import { cn } from "@/lib/utils";
import type { Experimental_GeneratedImage } from "ai";
import NextImage from "next/image";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  ...props
}: ImageProps) => {
  const width = props.width ?? 1024;
  const height = props.height ?? 1024;

  return (
    <NextImage
      {...props}
      alt={props.alt ?? "generated image"}
      className={cn(
        "h-auto max-w-full overflow-hidden rounded-md",
        props.className
      )}
      src={`data:${mediaType};base64,${base64}`}
      width={width}
      height={height}
      unoptimized
    />
  );
};
