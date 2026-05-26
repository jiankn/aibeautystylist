-- ============================================================
-- Migration 0004: 重新设计配额体系（基于成本/利润率分析）
-- ────────────────────────────────────────────────────────────
-- Free:    1 次诊断/天 + 0 张妆效图（保持现状）
-- Pro:     10 次诊断/月 + 30 张妆效图/月 (单月成本 $1.33, 毛利 93%)
-- Premium: -1 软上限无限 + 100 次诊断/月硬上限保护 + 200 张图硬上限
-- Single:  3 次诊断 + 3 张妆效图（一次性包，7 天内有效）
-- ============================================================

UPDATE plans
SET features_json = '{"diagnosisLimit":1,"makeupRenderLimit":0,"looksLimit":2,"tutorialDetail":"basic","makeupPreview":false,"kitRecommend":"basic","historyDays":0,"savedLooksLimit":0}'
WHERE id = 'free';

UPDATE plans
SET features_json = '{"diagnosisLimit":10,"makeupRenderLimit":30,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":30,"savedLooksLimit":10}'
WHERE id = 'pro_monthly';

UPDATE plans
SET features_json = '{"diagnosisLimit":10,"makeupRenderLimit":30,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":30,"savedLooksLimit":10}'
WHERE id = 'pro_yearly';

-- Premium：对外宣传"无限"，内部硬上限防滥用
UPDATE plans
SET features_json = '{"diagnosisLimit":-1,"makeupRenderLimit":-1,"diagnosisHardCap":100,"makeupRenderHardCap":200,"looksLimit":5,"tutorialDetail":"full_video","makeupPreview":true,"makeupPreviewQuality":"hd","kitRecommend":"full_budget","historyDays":-1,"savedLooksLimit":-1}'
WHERE id = 'premium_monthly';

UPDATE plans
SET features_json = '{"diagnosisLimit":-1,"makeupRenderLimit":-1,"diagnosisHardCap":100,"makeupRenderHardCap":200,"looksLimit":5,"tutorialDetail":"full_video","makeupPreview":true,"makeupPreviewQuality":"hd","kitRecommend":"full_budget","historyDays":-1,"savedLooksLimit":-1}'
WHERE id = 'premium_yearly';

UPDATE plans
SET features_json = '{"diagnosisLimit":3,"makeupRenderLimit":3,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":7,"savedLooksLimit":1}'
WHERE id = 'single_occasion';
