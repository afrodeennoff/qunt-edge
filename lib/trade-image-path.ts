export function extractTradeImagePath(imageReference: string): string | null {
  if (!imageReference) return null;

  const publicMarker = "/storage/v1/object/public/trade-images/";
  const signedMarker = "/storage/v1/object/sign/trade-images/";

  if (imageReference.includes(publicMarker)) {
    return imageReference.split(publicMarker)[1]?.split("?")[0] ?? null;
  }

  if (imageReference.includes(signedMarker)) {
    return imageReference.split(signedMarker)[1]?.split("?")[0] ?? null;
  }

  if (imageReference.startsWith("http://") || imageReference.startsWith("https://")) {
    return null;
  }

  return imageReference.replace(/^\/+/, "");
}

export function ensureOwnedImagePath(
  imagePath: string | null,
  actorImagePrefix: string | null | undefined
): string {
  if (!imagePath) {
    throw new Error("Missing image path");
  }
  if (!actorImagePrefix) {
    throw new Error("Actor context is missing");
  }
  const normalizedPath = imagePath.replace(/\\/g, "/");
  if (normalizedPath.includes("..")) {
    throw new Error("Image path contains relative segments");
  }
  if (!normalizedPath.startsWith(actorImagePrefix)) {
    throw new Error("Image path does not belong to the current actor");
  }
  return normalizedPath;
}
