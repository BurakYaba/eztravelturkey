/**
 * Addresses that are gone for good and answer 410 instead of 404, so search engines drop them sooner. Israel is not on
 * the new site (docs/project-plan.md D4). Which old Israel addresses get a 301 instead is decided in P7.9; those are
 * taken out of this check there.
 */
const gonePatterns: RegExp[] = [/israel/i];

export const isGone = (pathname: string) => gonePatterns.some((pattern) => pattern.test(pathname));
