const TRUE_VALUES = new Set(["1", "true", "yes", "on"])

function parseFlag(raw: string | undefined): boolean {
  if (!raw) return false
  return TRUE_VALUES.has(raw.trim().toLowerCase())
}

export function isUiV2Enabled(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_UI_V2_ENABLED)
}

export function getUiVariant(): "v1" | "v2" {
  return isUiV2Enabled() ? "v2" : "v1"
}
