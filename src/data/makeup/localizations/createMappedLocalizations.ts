import type { LocalizedAdvisor, LookLocalization } from "../audienceTypes";
import { enLocalizations } from "./en";

interface MappedLocalizationConfig {
  locale: string;
  scenarioMap: Record<string, string>;
  finishMap: Record<string, string>;
  experienceMap: Record<string, string>;
  titleMap?: Record<string, string>;
  summary: (title: string, scenarios: string[], finishes: string[]) => string;
  imageAlt: (title: string) => string;
  advisor: (
    title: string,
    scenarios: string[],
    finishes: string[],
  ) => LocalizedAdvisor;
}

function mapValues(values: string[], map: Record<string, string>): string[] {
  return values.map((value) => map[value] ?? value);
}

export function createMappedLocalizations({
  locale,
  scenarioMap,
  finishMap,
  experienceMap,
  titleMap = {},
  summary,
  imageAlt,
  advisor,
}: MappedLocalizationConfig): LookLocalization[] {
  return enLocalizations.map((item) => {
    const title = titleMap[item.title] ?? item.title;
    const scenarios = mapValues(item.scenarios, scenarioMap);
    const finishLabels = mapValues(item.finishLabels, finishMap);
    return {
      ...item,
      locale,
      title,
      scenarios,
      finishLabels,
      experienceLabel:
        experienceMap[item.experienceLabel] ?? item.experienceLabel,
      summary: summary(title, scenarios, finishLabels),
      imageAltTemplate: imageAlt(title),
      advisor: advisor(title, scenarios, finishLabels),
    };
  });
}
