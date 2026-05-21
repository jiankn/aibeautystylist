import { buildTryOnPlan, findLookById, getAllLooks, type TryOnLook, type TryOnPlan } from '../../mockTryOn';

export interface TryOnProvider {
  readonly name: string;
  getPlan: (scenario?: string) => Promise<TryOnPlan>;
  getLookById: (id?: string | null) => Promise<TryOnLook | undefined>;
  listLooks: () => Promise<TryOnLook[]>;
}

export const mockTryOnProvider: TryOnProvider = {
  name: 'mock',
  async getPlan(scenario = 'office') {
    return buildTryOnPlan(scenario);
  },
  async getLookById(id) {
    return findLookById(id);
  },
  async listLooks() {
    return getAllLooks();
  },
};
