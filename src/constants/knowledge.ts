import { TreatmentType } from "@/enums";

export const TREATMENT_METHOD = {
	[TreatmentType.CHEMICAL]: "化学防治",
	[TreatmentType.BIOLOGICAL]: "生物防治",
	[TreatmentType.PHYSICAL]: "物理防治",
	[TreatmentType.CULTURAL]: "农业防治"
} as const;

export type TreatmentMethod = (typeof TREATMENT_METHOD)[keyof typeof TREATMENT_METHOD];
