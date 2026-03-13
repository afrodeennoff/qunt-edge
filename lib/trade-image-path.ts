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

const ENCODED_RELATIVE_SEGMENT_PATTERN = /(?:%(?:2e|2E)){2}/;
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F]/;

function normalizeRelativePath(value: string): string {
  const sanitized = value.replace(/\\/g, "/");
  if (CONTROL_CHAR_PATTERN.test(sanitized)) {
    throw new Error("Image path contains invalid characters");
  }
  if (ENCODED_RELATIVE_SEGMENT_PATTERN.test(sanitized)) {
    throw new Error("Image path contains relative segments");
  }

  const segments: string[] = [];

  for (const rawSegment of sanitized.split("/")) {
    if (!rawSegment || rawSegment === ".") {
      continue;
    }

    if (rawSegment === "..") {
      throw new Error("Image path contains relative segments");
    }

    segments.push(rawSegment);
  }

  if (segments.length === 0) {
    throw new Error("Image path contains relative segments");
  }

  return segments.join("/");
}

function normalizeActorPrefix(prefix: string): string {
  const normalizedPrefix = normalizeRelativePath(prefix);
  return `${normalizedPrefix}/`;
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
  const trimmedPath = imagePath.trim();
  if (!trimmedPath) {
    throw new Error("Missing image path");
  }

  const trimmedPrefix = actorImagePrefix.trim();
  if (!trimmedPrefix) {
    throw new Error("Actor context is missing");
  }

  const normalizedPath = normalizeRelativePath(trimmedPath);
  const normalizedPrefix = normalizeActorPrefix(trimmedPrefix);

  if (!normalizedPath.startsWith(normalizedPrefix)) {
    throw new Error("Image path does not belong to the current actor");
  }

  return normalizedPath;
}
