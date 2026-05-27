/**
 * Membership Service — 会员权益门控
 *
 * 基于 subscriptionRepository.getUserTier() 的高层封装，
 * 提供功能检查、配额检查和内容裁剪能力。
 */
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getUserTier, type PlanFeatures, type UserTier } from '../repositories/subscriptionRepository';

// ─── 功能标识 ───────────────────────────────────────────────
export type Feature =
  | 'ai_diagnosis'
  | 'makeup_preview'
  | 'makeup_preview_hd'
  | 'full_tutorial'
  | 'full_kit_recommend'
  | 'budget_recommend'
  | 'saved_looks'
  | 'look_history';

// ─── 权益检查 ───────────────────────────────────────────────
export interface MembershipInfo {
  tier: UserTier;
  features: PlanFeatures;
  canAccess: (feature: Feature) => boolean;
  quotaFor: (feature: 'diagnosis' | 'looks' | 'saved_looks') => { limit: number; isUnlimited: boolean };
}

export async function getMembershipInfo(
  env: RuntimeEnv | undefined,
  userId: string | null,
): Promise<MembershipInfo> {
  const defaultFeatures: PlanFeatures = {
    diagnosisLimit: 1,
    makeupRenderLimit: 0,
    looksLimit: 2,
    tutorialDetail: 'basic',
    makeupPreview: false,
    kitRecommend: 'basic',
    historyDays: 0,
    savedLooksLimit: 0,
  };

  if (!userId) {
    return buildMembershipInfo('free', defaultFeatures);
  }

  const { tier, features } = await getUserTier(env, userId);
  return buildMembershipInfo(tier, features);
}

function buildMembershipInfo(tier: UserTier, features: PlanFeatures): MembershipInfo {
  return {
    tier,
    features,
    canAccess: (feature: Feature) => checkFeatureAccess(features, feature),
    quotaFor: (feature) => getQuota(features, feature),
  };
}

function checkFeatureAccess(features: PlanFeatures, feature: Feature): boolean {
  switch (feature) {
    case 'ai_diagnosis':
      return features.diagnosisLimit !== 0;
    case 'makeup_preview':
      return features.makeupPreview === true;
    case 'makeup_preview_hd':
      return features.makeupPreviewQuality === 'hd';
    case 'full_tutorial':
      return features.tutorialDetail !== 'basic';
    case 'full_kit_recommend':
      return features.kitRecommend !== 'basic';
    case 'budget_recommend':
      return features.kitRecommend === 'full_budget';
    case 'saved_looks':
      return features.savedLooksLimit !== 0;
    case 'look_history':
      return features.historyDays !== 0;
    default:
      return false;
  }
}

function getQuota(features: PlanFeatures, feature: 'diagnosis' | 'looks' | 'saved_looks'): {
  limit: number;
  isUnlimited: boolean;
} {
  switch (feature) {
    case 'diagnosis':
      return { limit: features.diagnosisLimit, isUnlimited: features.diagnosisLimit === -1 };
    case 'looks':
      return { limit: features.looksLimit, isUnlimited: false };
    case 'saved_looks':
      return { limit: features.savedLooksLimit, isUnlimited: features.savedLooksLimit === -1 };
  }
}

// ─── 内容裁剪 ───────────────────────────────────────────────

/**
 * 根据会员等级裁剪 AI 诊断结果
 * Free: 仅返回 2 套方案，教程只显示前 3 步
 * Pro: 返回完整 3 套方案 + 完整教程
 * Premium: 返回 5 套方案 + 完整教程 + 视频指引
 */
export function trimResultByTier<T extends {
  looks?: Array<unknown>;
  diagnosis?: unknown;
}>(result: T, membership: MembershipInfo): T & { _gated?: GatedInfo } {
  const looksLimit = membership.features.looksLimit;
  const trimmedLooks = result.looks?.slice(0, looksLimit);

  // 免费用户：教程步骤限制前 3 步
  if (membership.tier === 'free' && trimmedLooks) {
    for (const look of trimmedLooks) {
      if (!look || typeof look !== 'object') continue;
      const mutableLook = look as Record<string, unknown>;
      const steps = mutableLook.tutorialSteps as Array<Record<string, unknown>> | undefined;
      if (steps && steps.length > 3) {
        mutableLook.tutorialSteps = steps.slice(0, 3);
        mutableLook._tutorialGated = true;
      }
    }
  }

  return {
    ...result,
    looks: trimmedLooks,
    _gated: buildGatedInfo(membership),
  };
}

export interface GatedInfo {
  tier: UserTier;
  isFreeTier: boolean;
  lockedFeatures: string[];
  upgradeMessage: string;
  upgradeCta: string;
  upgradeUrl: string;
}

function buildGatedInfo(membership: MembershipInfo): GatedInfo {
  const locked: string[] = [];

  if (!membership.canAccess('makeup_preview')) locked.push('makeup_preview');
  if (!membership.canAccess('full_tutorial')) locked.push('full_tutorial');
  if (!membership.canAccess('full_kit_recommend')) locked.push('product_recommendations');
  if (!membership.canAccess('saved_looks')) locked.push('saved_looks');
  if (!membership.canAccess('look_history')) locked.push('look_history');

  const isFreeTier = membership.tier === 'free';

  return {
    tier: membership.tier,
    isFreeTier,
    lockedFeatures: locked,
    upgradeMessage: isFreeTier
      ? 'Unlock 10 monthly diagnoses, 30 HD makeup previews, and full tutorials with Pro'
      : membership.tier === 'pro'
        ? 'Get unlimited diagnoses and seasonal updates with Premium'
        : '',
    upgradeCta: isFreeTier ? 'Upgrade to Pro — $19.99/mo' : 'Upgrade to Premium',
    upgradeUrl: '/membership',
  };
}
