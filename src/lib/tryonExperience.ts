import { getPlanDefinition, type PlanCode, type PlanFeatures } from "./plans";

export type TryOnAudience = "anonymous" | PlanCode;

export interface TryOnExperience {
  audience: TryOnAudience;
  planCode: PlanCode;
  planLabel: "Free" | "Pro" | "Premium";
  authenticated: boolean;
  features: PlanFeatures;
  showAdvisor: boolean;
  showMemberGuidance: boolean;
  showHistoryPreview: boolean;
}

export function resolveTryOnExperience(input: {
  authenticated: boolean;
  planCode: PlanCode;
}): TryOnExperience {
  const planCode = input.authenticated ? input.planCode : "free";
  const definition = getPlanDefinition(planCode);
  const showMemberGuidance =
    input.authenticated && definition.features.tutorials;

  return {
    audience: input.authenticated ? planCode : "anonymous",
    planCode,
    planLabel:
      planCode === "premium" ? "Premium" : planCode === "pro" ? "Pro" : "Free",
    authenticated: input.authenticated,
    features: { ...definition.features },
    showAdvisor: !showMemberGuidance,
    showMemberGuidance,
    showHistoryPreview: showMemberGuidance,
  };
}
