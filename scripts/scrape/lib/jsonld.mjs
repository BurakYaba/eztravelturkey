// The old site writes a rolling "priceValidUntil" (about a week ahead) into every tour's JSON-LD. Stored as it is, it
// would make every re-scrape look like a content change, so the key is dropped from the stored copy.
export function stripRollingDates(value) {
  if (Array.isArray(value)) {
    return value.map(stripRollingDates);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'priceValidUntil')
        .map(([key, child]) => [key, stripRollingDates(child)]),
    );
  }
  return value;
}
