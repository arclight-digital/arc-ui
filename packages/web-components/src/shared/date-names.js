/**
 * Month and weekday names, from Intl rather than from four hardcoded English
 * arrays.
 *
 * date-picker, date-range-picker, calendar and event-calendar each carried their
 * own copy of `['January', …]` and `['Su', 'Mo', …]`. Beyond the duplication,
 * that hardcoded English into components whose entire job is displaying dates,
 * and it hardcoded Sunday as the first day of the week — which is wrong for most
 * of the world.
 *
 * `Intl.DateTimeFormat` already knows all of this and ships with the browser, so
 * this module is a thin, cached wrapper rather than a locale database.
 *
 * ## Scope
 *
 * Deliberately just dates. ARC ships no string table for its other UI text —
 * "No results found", "Close", and friends stay English — because a full locale
 * layer is a much larger surface than the calendars needed. Dates are here
 * because they were actively wrong, not because this is the start of an i18n
 * framework.
 */

/**
 * First day of the week per locale region, 1 = Monday … 7 = Sunday, matching
 * the CLDR/ISO numbering that `Intl.Locale.prototype.getWeekInfo` returns.
 *
 * Only the regions that differ from Monday are listed; Monday is the majority
 * default and the ISO-8601 answer. Used when the browser has no
 * `getWeekInfo` — Firefox still lacks it — so this table is the fallback, not
 * the primary source.
 */
const SUNDAY_FIRST = new Set([
  'US', 'CA', 'MX', 'BR', 'CO', 'PE', 'VE', 'AR', 'CL', 'DO', 'GT', 'HN', 'NI',
  'PA', 'PR', 'SV', 'BO', 'EC', 'PY', 'UY',
  'JP', 'KR', 'TW', 'HK', 'MO', 'PH', 'TH', 'ID', 'MY', 'SG', 'IL', 'CN',
  'ZA', 'KE', 'ZW', 'AU', 'NZ',
]);
const SATURDAY_FIRST = new Set([
  'AE', 'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM',
  'QA', 'SA', 'SD', 'SY', 'YE',
]);

/** Memoised formatters — constructing an Intl.DateTimeFormat is not cheap. */
const cache = new Map();

function formatter(locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

/** The locale a component should use when it has not been told one. */
export function defaultLocale() {
  // A document-level lang wins: it is the author's declared intent for the page,
  // and it is what assistive technology reads the content as.
  const declared = typeof document !== 'undefined'
    ? document.documentElement?.lang
    : '';
  return declared || (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
}

/**
 * Month names.
 *
 * @param {'long' | 'short' | 'narrow'} [style='long']
 * @param {string} [locale]
 * @returns {string[]} twelve names, January-first regardless of locale — callers
 *   index by month number, so the order is calendrical rather than presentational.
 */
export function monthNames(style = 'long', locale = defaultLocale()) {
  const f = formatter(locale, { month: style, timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, m) =>
    // Day 15 in UTC: far enough from either boundary that no time zone or
    // calendar rounding can push the date into an adjacent month.
    f.format(new Date(Date.UTC(2021, m, 15))));
}

/**
 * Weekday names, ordered from this locale's first day of the week.
 *
 * @param {'long' | 'short' | 'narrow'} [style='short']
 * @param {string} [locale]
 * @param {number} [firstDay] - 1 = Monday … 7 = Sunday. Defaults to the locale's.
 * @returns {string[]} seven names starting at `firstDay`.
 */
export function weekdayNames(style = 'short', locale = defaultLocale(), firstDay = firstDayOfWeek(locale)) {
  const f = formatter(locale, { weekday: style, timeZone: 'UTC' });
  // 2021-08-01 was a Sunday, so adding n gives a clean run through one week.
  const sundayFirst = Array.from({ length: 7 }, (_, d) =>
    f.format(new Date(Date.UTC(2021, 7, 1 + d))));
  // firstDay is 1..7 with Monday=1; the array above is Sunday-first (index 0).
  const offset = firstDay % 7;
  return [...sundayFirst.slice(offset), ...sundayFirst.slice(0, offset)];
}

/**
 * The locale's first day of the week, 1 = Monday … 7 = Sunday.
 *
 * @param {string} [locale]
 */
export function firstDayOfWeek(locale = defaultLocale()) {
  try {
    const l = new Intl.Locale(locale);
    // getWeekInfo is the standard answer where it exists; the property spelling
    // differed during standardisation, so accept either.
    const info = l.getWeekInfo?.() ?? l.weekInfo;
    if (info?.firstDay) return info.firstDay;
    const region = l.region ?? l.maximize?.().region;
    if (region) {
      if (SUNDAY_FIRST.has(region)) return 7;
      if (SATURDAY_FIRST.has(region)) return 6;
    }
  } catch {
    /* Unparseable locale — fall through to the ISO default. */
  }
  return 1;
}

/**
 * How far into the week a date sits, counting from `firstDay`.
 *
 * This is the number of blank cells a month grid needs before its first day.
 * Doing it here rather than in each calendar is the point: `date.getDay()` is
 * Sunday-based, and every component that mixed it with a non-Sunday first day
 * got the offset wrong.
 *
 * @param {Date} date
 * @param {number} firstDay - 1 = Monday … 7 = Sunday.
 * @returns {number} 0-6
 */
export function weekdayOffset(date, firstDay) {
  // getDay(): 0 = Sunday. firstDay: 7 = Sunday. Convert both to 0 = Monday.
  const mondayBased = (date.getDay() + 6) % 7;
  return (mondayBased - (firstDay - 1) + 7) % 7;
}
