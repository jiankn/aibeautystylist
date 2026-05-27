import type { RuntimeEnv } from '../cloudflare/runtime';

export const LOOK_ANALYTICS_EVENTS = [
  'look_impression',
  'look_click',
  'selfie_upload_success',
  'tryon_result_view',
  'tutorial_continue',
  'register_success',
  'membership_click',
  'share_click',
  'save_click',
] as const;

export type LookAnalyticsEventName = typeof LOOK_ANALYTICS_EVENTS[number];

export interface RecordLookAnalyticsEventInput {
  env?: RuntimeEnv;
  eventName: LookAnalyticsEventName;
  anonymousId?: string | null;
  sessionId: string;
  userId?: string | null;
  source?: string | null;
  lookSlug?: string | null;
  styleSlug?: string | null;
  position?: number | null;
  route?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown>;
  now?: Date;
}

export interface LookConversionMetrics {
  impressions: number;
  clicks: number;
  uploads: number;
  resultViews: number;
  tutorialContinues: number;
  accountActions: number;
  shareSaves: number;
  clickRate: number;
  uploadRate: number;
  tutorialContinueRate: number;
  accountActionRate: number;
  shareSaveRate: number;
  conversionScore: number;
}

export interface LookConversionScore extends LookConversionMetrics {
  lookSlug: string;
  source: string;
  eligibleForBoth: boolean;
  recommendation: 'both' | 'get-inspired' | 'try-a-style' | 'collect-more-data';
  reasons: string[];
}

export interface LookScoreReport {
  days: number;
  generatedAt: string;
  baseline: LookConversionMetrics;
  minimums: {
    impressions: number;
    clicks: number;
  };
  scores: LookConversionScore[];
  bothCandidates: LookConversionScore[];
}

interface AggregatedEventRow {
  look_slug: string | null;
  source: string | null;
  impressions: number;
  clicks: number;
  uploads: number;
  result_views: number;
  tutorial_continues: number;
  account_actions: number;
  share_saves: number;
}

const MIN_BOTH_IMPRESSIONS = 500;
const MIN_BOTH_CLICKS = 30;

export async function recordLookAnalyticsEvent(input: RecordLookAnalyticsEventInput): Promise<boolean> {
  const db = input.env?.DB;
  if (!db) return false;

  const lookSlug = cleanOptionalSlug(input.lookSlug);
  const styleSlug = cleanOptionalSlug(input.styleSlug);
  const source = cleanText(input.source, 'unknown', 64);
  const route = cleanText(input.route, null, 512);
  const referrer = cleanText(input.referrer, null, 512);
  const anonymousId = cleanText(input.anonymousId, null, 128);
  const sessionId = cleanText(input.sessionId, null, 128);
  const userId = cleanText(input.userId, null, 128);

  if (!sessionId) return false;

  const id = crypto.randomUUID();
  const now = input.now ?? new Date();

  await db
    .prepare(
      `INSERT INTO look_analytics_events (
        id,
        event_name,
        anonymous_id,
        session_id,
        user_id,
        source,
        look_slug,
        style_slug,
        position,
        route,
        referrer,
        metadata_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.eventName,
      anonymousId,
      sessionId,
      userId,
      source,
      lookSlug,
      styleSlug,
      typeof input.position === 'number' && Number.isFinite(input.position) ? Math.trunc(input.position) : null,
      route,
      referrer,
      JSON.stringify(input.metadata ?? {}),
      now.toISOString(),
    )
    .run();

  return true;
}

export async function getLookScoreReport(
  env: RuntimeEnv | undefined,
  options: { days?: number; source?: string | null } = {},
): Promise<LookScoreReport> {
  const db = env?.DB;
  const days = Math.min(Math.max(Math.trunc(options.days ?? 28), 1), 180);
  const source = cleanText(options.source, null, 64);

  if (!db) {
    return {
      days,
      generatedAt: new Date().toISOString(),
      baseline: emptyMetrics(),
      minimums: { impressions: MIN_BOTH_IMPRESSIONS, clicks: MIN_BOTH_CLICKS },
      scores: [],
      bothCandidates: [],
    };
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const rows = await (source
    ? db
        .prepare(buildAggregateSql('AND source = ?'))
        .bind(since, source)
        .all<AggregatedEventRow>()
    : db
        .prepare(buildAggregateSql(''))
        .bind(since)
        .all<AggregatedEventRow>())
    .catch((error) => {
      console.warn('[lookAnalytics] score query failed:', error);
      return { results: [] as AggregatedEventRow[] };
    });

  const rawScores = (rows.results ?? [])
    .filter((row) => Boolean(row.look_slug))
    .map((row) => ({
      lookSlug: row.look_slug ?? '',
      source: row.source ?? 'unknown',
      ...toMetrics({
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        uploads: Number(row.uploads ?? 0),
        resultViews: Number(row.result_views ?? 0),
        tutorialContinues: Number(row.tutorial_continues ?? 0),
        accountActions: Number(row.account_actions ?? 0),
        shareSaves: Number(row.share_saves ?? 0),
      }),
    }));

  const baseline = calculateBaseline(rawScores);
  const scores = rawScores
    .map((score) => applyRecommendation(score, baseline))
    .sort((a, b) => b.conversionScore - a.conversionScore || b.clicks - a.clicks);

  return {
    days,
    generatedAt: new Date().toISOString(),
    baseline,
    minimums: { impressions: MIN_BOTH_IMPRESSIONS, clicks: MIN_BOTH_CLICKS },
    scores,
    bothCandidates: scores.filter((score) => score.eligibleForBoth),
  };
}

function buildAggregateSql(extraWhere: string) {
  return `
    SELECT
      look_slug,
      source,
      COUNT(DISTINCT CASE WHEN event_name = 'look_impression' THEN session_id END) AS impressions,
      COUNT(DISTINCT CASE WHEN event_name = 'look_click' THEN session_id END) AS clicks,
      COUNT(DISTINCT CASE WHEN event_name = 'selfie_upload_success' THEN session_id END) AS uploads,
      COUNT(DISTINCT CASE WHEN event_name = 'tryon_result_view' THEN session_id END) AS result_views,
      COUNT(DISTINCT CASE WHEN event_name = 'tutorial_continue' THEN session_id END) AS tutorial_continues,
      COUNT(DISTINCT CASE WHEN event_name IN ('register_success', 'membership_click') THEN session_id END) AS account_actions,
      COUNT(DISTINCT CASE WHEN event_name IN ('share_click', 'save_click') THEN session_id END) AS share_saves
    FROM look_analytics_events
    WHERE created_at >= ?
      AND look_slug IS NOT NULL
      ${extraWhere}
    GROUP BY look_slug, source
  `;
}

function toMetrics(input: {
  impressions: number;
  clicks: number;
  uploads: number;
  resultViews: number;
  tutorialContinues: number;
  accountActions: number;
  shareSaves: number;
}): LookConversionMetrics {
  const clickRate = ratio(input.clicks, input.impressions);
  const uploadRate = ratio(input.uploads, input.clicks);
  const tutorialContinueRate = ratio(input.tutorialContinues, input.resultViews);
  const accountActionRate = ratio(input.accountActions, input.resultViews);
  const shareSaveRate = ratio(input.shareSaves, input.resultViews);

  return {
    ...input,
    clickRate,
    uploadRate,
    tutorialContinueRate,
    accountActionRate,
    shareSaveRate,
    conversionScore:
      clickRate * 0.2 +
      uploadRate * 0.3 +
      tutorialContinueRate * 0.2 +
      accountActionRate * 0.2 +
      shareSaveRate * 0.1,
  };
}

function calculateBaseline(scores: LookConversionMetrics[]): LookConversionMetrics {
  return toMetrics(scores.reduce(
    (acc, score) => ({
      impressions: acc.impressions + score.impressions,
      clicks: acc.clicks + score.clicks,
      uploads: acc.uploads + score.uploads,
      resultViews: acc.resultViews + score.resultViews,
      tutorialContinues: acc.tutorialContinues + score.tutorialContinues,
      accountActions: acc.accountActions + score.accountActions,
      shareSaves: acc.shareSaves + score.shareSaves,
    }),
    {
      impressions: 0,
      clicks: 0,
      uploads: 0,
      resultViews: 0,
      tutorialContinues: 0,
      accountActions: 0,
      shareSaves: 0,
    },
  ));
}

function applyRecommendation<T extends LookConversionMetrics & { lookSlug: string; source: string }>(
  score: T,
  baseline: LookConversionMetrics,
): LookConversionScore {
  const reasons: string[] = [];
  const hasEnoughData = score.impressions >= MIN_BOTH_IMPRESSIONS && score.clicks >= MIN_BOTH_CLICKS;

  if (!hasEnoughData) {
    reasons.push(`needs at least ${MIN_BOTH_IMPRESSIONS} impressions and ${MIN_BOTH_CLICKS} clicks`);
  }
  if (score.uploadRate >= baseline.uploadRate * 1.15) reasons.push('upload rate beats baseline by 15%+');
  if (score.tutorialContinueRate >= baseline.tutorialContinueRate) reasons.push('tutorial continuation meets baseline');
  if (score.accountActionRate >= baseline.accountActionRate) reasons.push('account or membership action meets baseline');

  const eligibleForBoth =
    hasEnoughData &&
    score.uploadRate >= baseline.uploadRate * 1.15 &&
    score.tutorialContinueRate >= baseline.tutorialContinueRate &&
    score.accountActionRate >= baseline.accountActionRate;

  let recommendation: LookConversionScore['recommendation'] = 'collect-more-data';
  if (eligibleForBoth) {
    recommendation = 'both';
  } else if (hasEnoughData && score.clickRate >= baseline.clickRate && score.uploadRate < baseline.uploadRate) {
    recommendation = 'get-inspired';
    reasons.push('good attention, weak upload intent');
  } else if (hasEnoughData && score.uploadRate >= baseline.uploadRate && score.clickRate < baseline.clickRate) {
    recommendation = 'try-a-style';
    reasons.push('strong intent after click, weaker visual pull');
  }

  return {
    lookSlug: score.lookSlug,
    source: score.source,
    ...score,
    eligibleForBoth,
    recommendation,
    reasons,
  };
}

function emptyMetrics(): LookConversionMetrics {
  return toMetrics({
    impressions: 0,
    clicks: 0,
    uploads: 0,
    resultViews: 0,
    tutorialContinues: 0,
    accountActions: 0,
    shareSaves: 0,
  });
}

function ratio(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(6));
}

function cleanOptionalSlug(value: string | null | undefined) {
  const cleaned = cleanText(value, null, 80);
  if (!cleaned) return null;
  return /^[a-z0-9][a-z0-9-]*$/.test(cleaned) ? cleaned : null;
}

function cleanText(value: unknown, fallback: string | null, maxLength: number) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}
