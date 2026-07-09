export type PrivacyDisclosureStatus =
  | "Disclosed"
  | "Not stated"
  | "Not applicable";

export interface PrivacyIndexEntry {
  readonly service: string;
  readonly vendor: string;
  readonly category: string;
  readonly score: number;
  readonly photoFaceData: PrivacyDisclosureStatus;
  readonly retention: PrivacyDisclosureStatus;
  readonly deletion: PrivacyDisclosureStatus;
  readonly aiTraining: PrivacyDisclosureStatus;
  readonly thirdParties: PrivacyDisclosureStatus;
  readonly notableRetention: string;
  readonly sourceUrl: string;
  readonly secondarySourceUrl?: string;
  readonly notes: string;
}

export interface ResearchContextSource {
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
}

export const virtualMakeupPrivacyIndexReviewedAt = "2026-07-09";
export const virtualMakeupPrivacyIndexVersion = "2026.07";
export const virtualMakeupPrivacyIndexCsvPath =
  "/research/virtual-makeup-privacy-index-2026.csv";

export const privacyIndexChecks = [
  "Photo or face data processing is described",
  "Retention timing or on-device processing is stated",
  "A deletion or privacy request path is stated",
  "AI training, model improvement, or research use is stated or ruled out",
  "Third-party processing, sharing, or no-server processing is stated",
] as const;

export const privacyIndexEntries: readonly PrivacyIndexEntry[] = [
  {
    service: "AI Beauty Stylist",
    vendor: "AI Beauty Stylist",
    category: "AI makeup try-on",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "One-time original photos are deleted as soon as operationally practical and no later than 30 days.",
    sourceUrl: "https://aibeautystylist.com/privacy",
    notes:
      "Policy says selfies are processed only for requested diagnosis or try-on and are not used for identity recognition, medical decisions, or model training without separate authorization.",
  },
  {
    service: "Banuba Face AR SDK and Virtual Try-On Plugin",
    vendor: "Banuba",
    category: "SDK and merchant plugin",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Not applicable",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Banuba states that face AR products process camera frames on device and do not send user images or video frames to Banuba servers.",
    sourceUrl:
      "https://www.banuba.com/faq/what-user-data-is-transmitted-to-banuba-servers-1",
    secondarySourceUrl: "https://www.banuba.com/privacy-policy",
    notes:
      "Developer implementation can still add its own data handling, so this score applies to Banuba's public SDK and plugin claims.",
  },
  {
    service: "ModiFace Virtual Try-On",
    vendor: "L'Oreal ModiFace",
    category: "Enterprise virtual try-on",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "The policy says virtual try-on images are processed on device, while skin-analysis images are usually deleted within 5 minutes and no longer than 24 hours.",
    sourceUrl: "https://modiface.com/legal/privacy.htm",
    notes:
      "The policy separates virtual try-on from skin analysis and discloses AI technology improvement use elsewhere in the notice.",
  },
  {
    service: "Fotor AI Makeup and AI Avatar features",
    vendor: "Fotor",
    category: "AI photo editor",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Face data for avatar generation is described as temporary and deleted after generation. AIGC inputs and outputs can remain until user deletion or account deletion.",
    sourceUrl: "https://www.fotor.com/privacypolicy",
    notes:
      "Fotor discloses third-party AI providers and states specific limits for face-data use in avatar workflows.",
  },
  {
    service: "YouCam Makeup and YouCam Apps",
    vendor: "Perfect Corp",
    category: "Consumer and web makeup app",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Cloud virtual try-on photos are described as deleted after the service completes; some save-and-share or generative AI features have longer disclosed windows.",
    sourceUrl:
      "https://www.perfectcorp.com/youcamapps/youcam/privacy-policy.html",
    secondarySourceUrl: "https://www.makeupar.com/business/privacy",
    notes:
      "The policy has detailed tables for photo uploads, biometric information, sharing, and feature-specific retention.",
  },
  {
    service: "CyberLink PhotoDirector and Generative AI features",
    vendor: "CyberLink",
    category: "AI photo editor",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Generative AI submissions are described as deleted within 24 hours after use, while some outputs can be retained for longer feature-specific periods.",
    sourceUrl: "https://www.cyberlink.com/stat/policy/enu/tos.html",
    secondarySourceUrl:
      "https://www.cyberlink.com/stat/policy/enu/app/privacy.html",
    notes:
      "CyberLink also describes local-only biometric handling for certain PhotoDirector desktop features.",
  },
  {
    service: "AirBrush",
    vendor: "Pixocial",
    category: "AI beauty photo editor",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Image data is described as stored in server log files for a maximum of 21 days; face-recognition data is discarded after recommendation or app close.",
    sourceUrl: "https://airbrush.com/legal/privacy-policy",
    notes:
      "The policy discloses cloud editing, metadata, facial-feature processing, retention periods, and third-party providers.",
  },
  {
    service: "BeautyPlus",
    vendor: "Pixocial",
    category: "AI beauty photo editor",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "The policy follows a similar Pixocial retention model, including a maximum 21-day window for image data in server logs.",
    sourceUrl: "https://www.beautyplus.com/privacy-policy",
    notes:
      "Included because BeautyPlus is a distinct consumer app brand with a public policy relevant to face and beauty editing.",
  },
  {
    service: "MakeupPlus",
    vendor: "Meitu",
    category: "Virtual makeup and selfie app",
    score: 5,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Disclosed",
    thirdParties: "Disclosed",
    notableRetention:
      "Image data is described as stored in server log files for a maximum of 21 days; face-recognition data is discarded after recommendation or app close.",
    sourceUrl:
      "https://pro.meitu.com/makeup/agreements/privacy-policy/index.html?lang=en",
    notes:
      "The policy discloses image and facial-feature handling, retention, third-party SDKs, and internal research or improvement purposes.",
  },
  {
    service: "GlamAR",
    vendor: "GlamAR",
    category: "Enterprise virtual try-on",
    score: 4,
    photoFaceData: "Disclosed",
    retention: "Disclosed",
    deletion: "Disclosed",
    aiTraining: "Not stated",
    thirdParties: "Disclosed",
    notableRetention:
      "Facial data is described as retained for a maximum of 3 years unless deleted earlier by request or legal requirement.",
    sourceUrl: "https://www.glamar.io/privacy-policy",
    notes:
      "The policy clearly discloses facial data and third-party processing, but public wording reviewed for this index did not clearly answer AI training or model-improvement use.",
  },
] as const;

export const researchContextSources = [
  {
    title: "MAC lawsuit highlights privacy risks in AI beauty tools",
    publisher: "Personal Care Insights",
    url: "https://www.personalcareinsights.com/news/mac-ai-privacy-lawsuit.html",
  },
  {
    title: "Virtual try-on: data protection compliance considerations",
    publisher: "Lexology",
    url: "https://www.lexology.com/library/detail.aspx?g=52fbf356-2140-4900-aca3-c150c0249e89",
  },
  {
    title:
      "Privacy by design tech protects against identity leaking during AI photo editing",
    publisher: "Tech Xplore",
    url: "https://techxplore.com/news/2026-03-privacy-tech-identity-leaking-ai.html",
  },
  {
    title:
      "Outcry as Meta lets users make AI images from public Instagram profile pics",
    publisher: "BBC News",
    url: "https://www.bbc.co.uk/news/articles/cp9lee19y1yo",
  },
] as const satisfies readonly ResearchContextSource[];
