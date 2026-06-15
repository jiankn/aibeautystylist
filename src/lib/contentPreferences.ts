import type {
  MarketProfile,
  RepresentationGroup,
} from "../data/makeup/audienceTypes";
import {
  isValidMarketProfile,
  isValidRepresentationGroup,
} from "../data/makeup/audienceTypes";
import type { D1DatabaseLike } from "./runtime";

export interface UserContentPreferences {
  locale?: string;
  marketProfile?: MarketProfile;
  beautyPreferences?: string[];
  representationPreferences?: RepresentationGroup[] | ["diverse"];
  source?: string;
}

interface ContentPreferenceRow {
  locale: string;
  market_profile: string;
  beauty_preferences_json: string;
  representation_preferences_json: string;
  source: string;
}

export async function getUserContentPreferences(
  userId: string,
  DB?: D1DatabaseLike,
): Promise<UserContentPreferences | undefined> {
  if (!DB) return undefined;
  const row = await DB.prepare(
    `SELECT locale, market_profile, beauty_preferences_json,
      representation_preferences_json, source
     FROM user_content_preferences
     WHERE user_id = ?`,
  )
    .bind(userId)
    .first<ContentPreferenceRow>();

  if (!row || !isValidMarketProfile(row.market_profile)) return undefined;

  return {
    locale: row.locale,
    marketProfile: row.market_profile,
    beautyPreferences: parseStringArray(row.beauty_preferences_json),
    representationPreferences: normalizeRepresentationPreferences(
      parseStringArray(row.representation_preferences_json),
    ),
    source: row.source,
  };
}

export async function saveUserContentPreferences(
  userId: string,
  preferences: Required<UserContentPreferences>,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  await DB.prepare(
    `INSERT INTO user_content_preferences
      (user_id, locale, market_profile, beauty_preferences_json,
       representation_preferences_json, source, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       locale = excluded.locale,
       market_profile = excluded.market_profile,
       beauty_preferences_json = excluded.beauty_preferences_json,
       representation_preferences_json = excluded.representation_preferences_json,
       source = excluded.source,
       updated_at = excluded.updated_at`,
  )
    .bind(
      userId,
      preferences.locale,
      preferences.marketProfile,
      JSON.stringify(preferences.beautyPreferences),
      JSON.stringify(preferences.representationPreferences),
      preferences.source,
      now.toISOString(),
    )
    .run();
}

export function normalizeBeautyPreferences(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function normalizeRepresentationPreferences(
  value: unknown,
): RepresentationGroup[] | ["diverse"] {
  if (!Array.isArray(value) || value.length === 0) return ["diverse"];
  if (value.includes("diverse")) return ["diverse"];
  const valid = value.filter(
    (item): item is RepresentationGroup =>
      typeof item === "string" && isValidRepresentationGroup(item),
  );
  return valid.length > 0 ? [...new Set(valid)].slice(0, 4) : ["diverse"];
}

export function normalizeMarketProfile(
  value: unknown,
): MarketProfile | undefined {
  return typeof value === "string" && isValidMarketProfile(value)
    ? value
    : undefined;
}

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
