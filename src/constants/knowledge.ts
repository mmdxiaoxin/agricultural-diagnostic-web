import { TreatmentType } from "@/enums";

export const TREATMENT_METHOD = {
	[TreatmentType.CHEMICAL]: "化学防治",
	[TreatmentType.BIOLOGICAL]: "生物防治",
	[TreatmentType.PHYSICAL]: "物理防治",
	[TreatmentType.CULTURAL]: "农业防治"
} as const;

export type TreatmentMethod = (typeof TREATMENT_METHOD)[keyof typeof TREATMENT_METHOD];

export const MATCH_RULE_TYPE = {
	exact: "精确匹配",
	fuzzy: "模糊匹配",
	regex: "正则表达式",
	contains: "包含匹配"
} as const;

export type MatchRuleType = (typeof MATCH_RULE_TYPE)[keyof typeof MATCH_RULE_TYPE];
