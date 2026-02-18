/**
 * Formats a timestamp to ensure consistent date format across the application.
 * Converts ISO strings ending with 'Z' to '+00:00' format for consistency.
 */
export function formatTimestamp(timestamp: string): string {
  // If the timestamp already has the correct format, return it
  if (timestamp.includes('+00:00')) {
    return timestamp
  }
  // If it ends with 'Z', convert to +00:00 format
  if (timestamp.endsWith('Z')) {
    return timestamp.replace('Z', '+00:00')
  }
  // Return as-is if it doesn't match either pattern
  return timestamp
}

/**
 * Formats a Date object to a consistent timestamp string.
 * This ensures all dates are stored in the same format in the database.
 */
export function formatDateToTimestamp(date: Date): string {
  return formatTimestamp(date.toISOString())
}

/**
 * Parse any date-like string and normalize it to a UTC timestamp.
 * Throws when the input cannot be parsed.
 */
export function normalizeToUtcTimestamp(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`)
  }
  return formatDateToTimestamp(parsed)
}

/**
 * Ensures an entry/exit pair is chronologically valid.
 */
export function isChronologicalRange(entryDate: string, closeDate: string): boolean {
  return new Date(closeDate).getTime() >= new Date(entryDate).getTime()
}

/**
 * Safely converts a value to a valid Date object.
 * Returns null if the value is null, undefined, or results in an invalid date.
 */
export function toValidDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
