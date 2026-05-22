import { buildTryOnPlan, findLookById, getAllLooks, type Locale, type TryOnLook, type TryOnPlan } from '../../mockTryOn';

export interface TryOnProvider {
  readonly name: string;
  getPlan: (scenario?: string, locale?: Locale) => Promise<TryOnPlan>;
  getLookById: (id?: string | null, locale?: Locale) => Promise<TryOnLook | undefined>;
  listLooks: (locale?: Locale) => Promise<TryOnLook[]>;
}

export const mockTryOnProvider: TryOnProvider = {
  name: 'mock',
  async getPlan(scenario = 'office', locale: Locale = 'en') {
    return buildTryOnPlan(scenario, locale);
  },
  async getLookById(id, locale: Locale = 'en') {
    return findLookById(id, locale);
  },
  async listLooks(locale: Locale = 'en') {
    return getAllLooks(locale);
  },
};
